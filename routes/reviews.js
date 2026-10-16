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
const { sendReviewPendingEmail } = require('../services/mailer');

// ─── CREATE REVIEW ─────────────────────────────────────────────────────────
// Every review waits for admin approval before it is shown. listings.rating/review_count
// hold the Google rating and are never overwritten by Vukafia reviews.
router.post('/', requireAuth, async (req, res) => {
  try {
    const knex = getKnex();
    const listingId = parseInt(req.body.listing_id, 10);
    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim();

    if (!listingId) return res.status(400).json({ error: 'Missing business.' });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Please choose a rating from 1 to 5 stars.' });
    }
    if (comment.length < 10 || comment.length > 1000) {
      return res.status(400).json({ error: 'Your review must be between 10 and 1,000 characters.' });
    }

    const listing = await knex('listings').where({ id: listingId, active: true }).first('id', 'name', 'user_id');
    if (!listing) return res.status(404).json({ error: 'Business not found.' });

    const user = await knex('users').where({ id: req.user.id, active: true }).first('id', 'name', 'email', 'phone');
    if (!user) return res.status(401).json({ error: 'Please log in again.' });

    if (listing.user_id && listing.user_id === user.id) {
      return res.status(403).json({ error: "You can't review your own business." });
    }

    const existing = await knex('reviews')
      .where({ listing_id: listingId, reviewer_user_id: user.id })
      .where(q => q.whereNull('status').orWhereNot('status', 'rejected'))
      .first('id');
    if (existing) return res.status(409).json({ error: "You've already reviewed this business." });

    const [{ id: reviewId }] = await knex('reviews')
      .insert({
        listing_id: listingId,
        reviewer_user_id: user.id,
        reviewer_name: user.name,
        reviewer_phone: user.phone,
        rating,
        comment,
        reviewer_type: 'buyer',
        status: 'pending',
        evidence_required: false,
        approved: false,
      })
      .returning('id');

    if (rating <= 2) {
      await knex('review_disputes').insert({
        review_id: reviewId,
        listing_id: listingId,
        dispute_reason: 'low_rating',
        status: 'flagged',
      });
    }

    sendReviewPendingEmail({ id: reviewId, rating, comment, reviewer: user, listing })
      .catch(err => console.error('[REVIEWS] notify email failed:', err.message));

    res.status(201).json({
      id: reviewId,
      status: 'pending',
      message: 'Thanks! Your review will appear once our team approves it.',
    });
  } catch (err) {
    console.error('[REVIEWS]', err.message);
    res.status(500).json({ error: 'Could not submit your review. Please try again.' });
  }
});

// ─── GET REVIEWS FOR LISTING ────────────────────────────────────────────────
router.get('/listing/:listing_id', async (req, res) => {
  try {
    const { listing_id } = req.params;
    const knex = getKnex();

    const reviews = await knex('reviews')
      .where({ listing_id, approved: true })
      .select('id', 'listing_id', 'reviewer_name', 'rating', 'comment', 'reviewer_type', 'status', 'created_at')
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
    const [{ id: responseId }] = await knex('review_responses').returning('id').insert({
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
    const [{ id: disputeId }] = await knex('review_disputes').returning('id').insert({
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
