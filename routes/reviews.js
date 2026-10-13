/**
 * Reviews API Routes
 * - Verified reviews with bidirectional rating (buyers review sellers, sellers review buyers)
 * - Evidence/attachment support (screenshots, receipts)
 * - Seller responses to reviews
 * - Dispute escalation for bad reviews
 */

const express = require('express');
const router = express.Router();
const { getKnex } = require('../db');
const { requireAuth } = require('../middleware/auth');

// ─── CREATE REVIEW ─────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const { listing_id, rating, comment, reviewer_type, evidence_urls } = req.body;
    const knex = getKnex();

    // Validate
    if (!listing_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating (1-5 required)' });
    }

    // Insert review
    const [reviewId] = await knex('reviews').insert({
      listing_id,
      reviewer_user_id: req.user.id,
      reviewer_name: req.user.name,
      reviewer_phone: req.user.phone,
      rating,
      comment,
      reviewer_type: reviewer_type || 'buyer',  // 'buyer' or 'seller'
      status: evidence_urls && evidence_urls.length > 0 ? 'pending' : 'approved',
      evidence_required: evidence_urls && evidence_urls.length > 0,
      approved: !evidence_urls || evidence_urls.length === 0
    });

    // Add evidence if provided
    if (evidence_urls && Array.isArray(evidence_urls)) {
      const evidenceRecords = evidence_urls.map(url => ({
        review_id: reviewId,
        file_url: url.file_url,
        file_type: url.file_type || 'image',
        mime_type: url.mime_type,
        file_size: url.file_size,
        description: url.description
      }));
      await knex('review_evidence').insert(evidenceRecords);
    }

    // Auto-flag if rating <= 2 (bad review)
    if (rating <= 2) {
      await knex('review_disputes').insert({
        review_id: reviewId,
        listing_id,
        dispute_reason: 'low_rating',
        status: 'flagged'
      });
    }

    // Update listing rating average
    const ratings = await knex('reviews')
      .where('listing_id', listing_id)
      .where('approved', true)
      .select('rating');

    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : 0;

    await knex('listings')
      .where('id', listing_id)
      .update({
        rating: parseFloat(avgRating),
        review_count: ratings.length
      });

    res.status(201).json({
      id: reviewId,
      status: evidence_urls ? 'pending_approval' : 'published',
      message: evidence_urls ? 'Review submitted with evidence, pending approval' : 'Review published'
    });
  } catch (err) {
    console.error('[REVIEWS]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET REVIEWS FOR LISTING ────────────────────────────────────────────────
router.get('/listing/:listing_id', async (req, res) => {
  try {
    const { listing_id } = req.params;
    const knex = getKnex();

    const reviews = await knex('reviews')
      .where('listing_id', listing_id)
      .where('status', '!=', 'disputed')  // Don't show disputed reviews
      .orderBy('created_at', 'desc');

    // Fetch evidence and responses for each review
    for (let review of reviews) {
      review.evidence = await knex('review_evidence').where('review_id', review.id);
      review.responses = await knex('review_responses')
        .where('review_id', review.id)
        .join('users', 'review_responses.respondent_user_id', 'users.id')
        .select('review_responses.*', 'users.name as responder_name');
    }

    res.json({
      listing_id,
      total_reviews: reviews.length,
      reviews
    });
  } catch (err) {
    console.error('[REVIEWS GET]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── SELLER RESPONSE TO REVIEW ──────────────────────────────────────────────
router.post('/:review_id/response', requireAuth, async (req, res) => {
  try {
    const { review_id } = req.params;
    const { response_text, response_type, dispute_resolution } = req.body;
    const knex = getKnex();

    // Verify review exists
    const review = await knex('reviews').where('id', review_id).first();
    if (!review) return res.status(404).json({ error: 'Review not found' });

    // Verify user is seller of the listing
    const listing = await knex('listings').where('id', review.listing_id).first();
    if (listing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only listing owner can respond' });
    }

    // Insert response
    const [responseId] = await knex('review_responses').insert({
      review_id,
      respondent_user_id: req.user.id,
      response_text,
      response_type: response_type || 'explanation',
      dispute_resolution: dispute_resolution || false
    });

    // If this resolves the dispute, update status
    if (dispute_resolution) {
      await knex('reviews').where('id', review_id).update({ status: 'resolved' });
    }

    res.status(201).json({
      id: responseId,
      message: 'Response posted successfully'
    });
  } catch (err) {
    console.error('[REVIEW RESPONSE]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── FLAG REVIEW AS DISPUTED ───────────────────────────────────────────────
router.post('/:review_id/dispute', requireAuth, async (req, res) => {
  try {
    const { review_id } = req.params;
    const { dispute_reason } = req.body;
    const knex = getKnex();

    const review = await knex('reviews').where('id', review_id).first();
    if (!review) return res.status(404).json({ error: 'Review not found' });

    // Check if dispute already exists
    const existing = await knex('review_disputes').where('review_id', review_id).first();
    if (existing) return res.status(400).json({ error: 'Dispute already flagged' });

    // Create dispute
    const [disputeId] = await knex('review_disputes').insert({
      review_id,
      listing_id: review.listing_id,
      dispute_reason: dispute_reason || 'inappropriate_content',
      status: 'flagged'
    });

    // Update review status
    await knex('reviews').where('id', review_id).update({ status: 'disputed' });

    res.status(201).json({
      id: disputeId,
      message: 'Review flagged for review. Our team will investigate within 24-48 hours.'
    });
  } catch (err) {
    console.error('[DISPUTE FLAG]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET USER REVIEWS (PROFILE) ────────────────────────────────────────────
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const knex = getKnex();

    const reviews = await knex('reviews')
      .where('reviewer_user_id', user_id)
      .where('status', '!=', 'disputed')
      .orderBy('created_at', 'desc')
      .limit(20);

    const avgRating = await knex('reviews')
      .where('reviewer_user_id', user_id)
      .where('approved', true)
      .avg('rating')
      .first();

    res.json({
      user_id,
      total_reviews: reviews.length,
      average_rating: avgRating?.avg || 0,
      reviews
    });
  } catch (err) {
    console.error('[USER REVIEWS]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
