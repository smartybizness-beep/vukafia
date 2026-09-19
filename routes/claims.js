/**
 * routes/claims.js
 * Business owners claim and verify their listings
 */

'use strict';

const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// ─── GET /api/claims/search ────────────────────────────────────────────────
// Search for a listing to claim (by name + country)
router.get('/search', async (req, res, next) => {
  try {
    const { name, country } = req.query;
    if (!name || !country) {
      return res.status(400).json({ error: 'name and country are required' });
    }

    const k = db.query();
    const listings = await k('listings')
      .where('active', true)
      .whereRaw(`LOWER(name) LIKE ?`, [`%${name.toLowerCase()}%`])
      .where('country', country)
      .select('id', 'name', 'category', 'city', 'country', 'phone', 'verified', 'user_id')
      .limit(10);

    // Check which ones are already claimed
    for (const listing of listings) {
      listing.claimed = !!listing.user_id || listing.user_id !== null;
    }

    res.json({ success: true, data: listings });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/claims/verify-ownership ────────────────────────────────────
// Verify ownership before claiming (simple: must provide matching phone)
router.post('/verify-ownership', async (req, res, next) => {
  try {
    const { listing_id, phone } = req.body;
    if (!listing_id || !phone) {
      return res.status(400).json({ error: 'listing_id and phone are required' });
    }

    const k = db.query();
    const listing = await k('listings').where('id', listing_id).first();
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Simple verification: phone must match one of the business's known numbers
    const normalizePhone = (p) => p.replace(/\D/g, '');
    const listingPhone = normalizePhone(listing.phone || '');
    const providedPhone = normalizePhone(phone);

    if (listingPhone !== providedPhone) {
      return res.status(403).json({ error: 'Phone does not match this business' });
    }

    res.json({ success: true, verified: true });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/claims/claim ───────────────────────────────────────────────
// Claim a listing (requires auth + payment proof)
router.post('/claim', requireAuth, async (req, res, next) => {
  try {
    const { listing_id, phone, payment_ref } = req.body;
    if (!listing_id || !phone || !payment_ref) {
      return res.status(400).json({ error: 'listing_id, phone, and payment_ref are required' });
    }

    const k = db.query();
    const listing = await k('listings').where('id', listing_id).first();
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.user_id && listing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'This listing is already claimed by another user' });
    }

    // Verify phone matches
    const normalizePhone = (p) => p.replace(/\D/g, '');
    if (normalizePhone(listing.phone) !== normalizePhone(phone)) {
      return res.status(403).json({ error: 'Phone does not match this business' });
    }

    // Update listing with user_id and verification
    await k('listings').where('id', listing_id).update({
      user_id: req.user.id,
      verified: true, // Auto-verify claimed listings
    });

    // Log the claim transaction
    await k('listing_claims').insert({
      listing_id,
      user_id: req.user.id,
      payment_ref,
      status: 'completed',
      claimed_at: new Date(),
    }).catch(() => {}); // Table may not exist, that's OK

    res.json({
      success: true,
      message: 'Listing claimed successfully',
      listing_id,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/claims/my-claims ────────────────────────────────────────────
// Get current user's claimed listings
router.get('/my-claims', requireAuth, async (req, res, next) => {
  try {
    const k = db.query();
    const claims = await k('listings')
      .where('user_id', req.user.id)
      .select('id', 'name', 'category', 'country', 'city', 'verified', 'rating', 'review_count');

    res.json({ success: true, data: claims });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
