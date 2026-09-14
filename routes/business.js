/**
 * routes/business.js
 * Seller-facing endpoints: register business, manage listing
 */

'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { requireAuth } = require('../middleware/auth');

// ─── POST /api/business/register ─────────────────────────────────────────
// Register a new business listing (must be logged in as seller)
router.post('/register', requireAuth, async (req, res, next) => {
  try {
    const k = db.query();
    const user = req.user;

    const {
      type, region, country, country_code, flag,
      state, city, town, name, category,
      products_services, description,
      phone, whatsapp, email, website, instagram,
      latitude, longitude, cover_photo, emoji, photos,
    } = req.body;

    // ── VALIDATION ───────────────────────────────────────────────────────
    const required = { type, region, country, name, category, phone };
    const missing  = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
    }

    const validTypes = ['product', 'service'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'type must be product or service' });
    }

    const validRegions = ['West Africa','East Africa','North Africa','Central Africa','Southern Africa'];
    if (!validRegions.includes(region)) {
      return res.status(400).json({ error: `region must be one of: ${validRegions.join(', ')}` });
    }

    // ── CHECK PLAN LIMITS ────────────────────────────────────────────────
    const existingCount = await k('listings')
      .where({ user_id: user.id, active: true })
      .count('id as c')
      .first();

    const planLimits = { free: 1, growth: 5, pro: 20, enterprise: 999 };
    const limit      = planLimits[user.plan] || 1;

    if (parseInt(existingCount.c) >= limit) {
      return res.status(403).json({
        error: `Your ${user.plan} plan allows ${limit} listing(s). Upgrade to add more.`,
        upgrade_url: 'https://vukafia.com/pricing',
      });
    }

    // ── INSERT ────────────────────────────────────────────────────────────
    const [id] = await k('listings').insert({
      user_id: user.id,
      type, region, country, country_code, flag,
      state, city, town, name, category,
      products_services, description,
      phone, whatsapp: whatsapp || phone, email, website, instagram,
      latitude:    latitude  ? parseFloat(latitude)  : null,
      longitude:   longitude ? parseFloat(longitude) : null,
      cover_photo, emoji,
      photos:  photos ? JSON.stringify(photos) : null,
      verified:    false,
      featured:    user.plan === 'enterprise',
      is_new:      true,
      active:      true,
      rating:      0,
      review_count: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Business registered! Our team will verify it within 24 hours.',
      listing_id: id,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/business/my-listings ────────────────────────────────────────
router.get('/my-listings', requireAuth, async (req, res, next) => {
  try {
    const k = db.query();
    const listings = await k('listings')
      .where({ user_id: req.user.id })
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      data:    listings.map(l => ({ ...l, photos: l.photos ? JSON.parse(l.photos) : [] })),
      count:   listings.length,
    });
  } catch (err) {
    next(err);
  }
});

// ─── PUT /api/business/listing/:id ────────────────────────────────────────
router.put('/listing/:id', requireAuth, async (req, res, next) => {
  try {
    const k = db.query();
    const listing = await k('listings').where({ id: req.params.id, user_id: req.user.id }).first();
    if (!listing) return res.status(404).json({ error: 'Listing not found or not yours' });

    const allowed = [
      'name','category','products_services','description',
      'phone','whatsapp','email','website','instagram',
      'state','city','town','latitude','longitude',
      'cover_photo','emoji','photos',
    ];
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = field === 'photos' ? JSON.stringify(req.body[field]) : req.body[field];
      }
    });
    updates.updated_at = new Date().toISOString();
    // Re-trigger verification if key fields changed
    if (updates.name || updates.phone) updates.verified = false;

    await k('listings').where('id', req.params.id).update(updates);
    res.json({ success: true, message: 'Listing updated successfully.' });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/business/listing/:id ─────────────────────────────────────
router.delete('/listing/:id', requireAuth, async (req, res, next) => {
  try {
    const k = db.query();
    const listing = await k('listings').where({ id: req.params.id, user_id: req.user.id }).first();
    if (!listing) return res.status(404).json({ error: 'Listing not found or not yours' });
    // Soft delete
    await k('listings').where('id', req.params.id).update({ active: false });
    res.json({ success: true, message: 'Listing deactivated.' });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/business/stats ──────────────────────────────────────────────
router.get('/stats', requireAuth, async (req, res, next) => {
  try {
    const k = db.query();
    const listings = await k('listings')
      .where({ user_id: req.user.id, active: true })
      .select('id', 'name', 'view_count', 'contact_count', 'rating', 'review_count', 'verified');

    const totals = listings.reduce((acc, l) => ({
      views:    acc.views    + (l.view_count    || 0),
      contacts: acc.contacts + (l.contact_count || 0),
    }), { views: 0, contacts: 0 });

    res.json({
      success: true,
      data: {
        listings_count: listings.length,
        total_views:    totals.views,
        total_contacts: totals.contacts,
        plan:           req.user.plan,
        listings,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
