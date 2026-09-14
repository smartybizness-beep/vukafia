/**
 * routes/listings.js
 * Public endpoints for browsing all African business listings
 */

'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { optionalAuth } = require('../middleware/auth');

// ─── GET /api/listings ────────────────────────────────────────────────────
// Query params:
//   type       product | service
//   region     West Africa | East Africa | North Africa | Central Africa | Southern Africa
//   country    Nigeria | Kenya | Egypt ...
//   category   Electronics | Agriculture | Fashion & Textiles | Healthcare ...
//   state      Lagos | Nairobi ...
//   city       Ikeja | CBD ...
//   q          full-text search
//   verified   true | false
//   featured   true | false
//   min_rating 3 | 4 | 4.5
//   sort       featured | rating | newest | name
//   page       1
//   limit      20 (max 50)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const k = db.query();
    const {
      type, region, country, category, state, city,
      q, verified, featured, min_rating,
      sort = 'featured', page = 1, limit = 20,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
    const offset   = (pageNum - 1) * pageSize;

    let query = k('listings')
      .where('active', true)
      .select([
        'id', 'type', 'region', 'country', 'country_code', 'flag',
        'state', 'city', 'town', 'name', 'category', 'products_services',
        'description', 'phone', 'whatsapp', 'email', 'website',
        'latitude', 'longitude', 'rating', 'review_count',
        'verified', 'featured', 'is_new', 'cover_photo', 'emoji',
        'view_count', 'contact_count', 'created_at',
      ]);

    // ── FILTERS ──────────────────────────────────────────────────────────
    if (type)       query = query.where('type', type);
    if (region)     query = query.where('region', region);
    if (country)    query = query.where('country', country);
    if (category)   query = query.where('category', category);
    if (state)      query = query.whereILike('state', `%${state}%`);
    if (city)       query = query.whereILike('city', `%${city}%`);
    if (verified === 'true')  query = query.where('verified', true);
    if (featured === 'true')  query = query.where('featured', true);
    if (min_rating) query = query.where('rating', '>=', parseFloat(min_rating));

    if (q) {
      const term = `%${q}%`;
      query = query.where(function () {
        this.whereILike('name', term)
          .orWhereILike('products_services', term)
          .orWhereILike('category', term)
          .orWhereILike('country', term)
          .orWhereILike('city', term)
          .orWhereILike('state', term)
          .orWhereILike('description', term);
      });
    }

    // ── COUNT (for pagination) ────────────────────────────────────────────
    const countQuery = query.clone().count('id as total').first();
    const { total }  = await countQuery;

    // ── SORT ──────────────────────────────────────────────────────────────
    switch (sort) {
      case 'rating':   query = query.orderBy('rating', 'desc').orderBy('review_count', 'desc'); break;
      case 'newest':   query = query.orderBy('created_at', 'desc'); break;
      case 'name':     query = query.orderBy('name', 'asc'); break;
      case 'featured':
      default:
        query = query
          .orderBy('featured', 'desc')
          .orderBy('verified', 'desc')
          .orderBy('rating', 'desc');
        break;
    }

    const rows = await query.limit(pageSize).offset(offset);

    // Parse JSON photos field
    const listings = rows.map(r => ({
      ...r,
      photos: r.photos ? JSON.parse(r.photos) : [],
    }));

    res.json({
      success: true,
      data: listings,
      pagination: {
        total: parseInt(total),
        page: pageNum,
        limit: pageSize,
        pages: Math.ceil(parseInt(total) / pageSize),
        has_next: offset + pageSize < parseInt(total),
        has_prev: pageNum > 1,
      },
      filters: { type, region, country, category, state, city, q, verified, featured, min_rating, sort },
    });

    // Log view counts asynchronously (don't block response)
    // Could also do this with a queue
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/listings/:id ────────────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const k = db.query();
    const listing = await k('listings').where({ id: req.params.id, active: true }).first();
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    // Increment view count
    await k('listings').where('id', req.params.id).increment('view_count', 1);

    // Get reviews
    const reviews = await k('reviews')
      .where({ listing_id: req.params.id, approved: true })
      .orderBy('created_at', 'desc')
      .limit(20);

    res.json({
      success: true,
      data: {
        ...listing,
        photos: listing.photos ? JSON.parse(listing.photos) : [],
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/listings/regions/summary ────────────────────────────────────
router.get('/meta/regions', async (req, res, next) => {
  try {
    const k = db.query();
    const regions = await k('listings')
      .where('active', true)
      .select('region')
      .count('id as count')
      .groupBy('region')
      .orderBy('count', 'desc');

    const countries = await k('listings')
      .where('active', true)
      .select('country', 'country_code', 'flag', 'region')
      .count('id as count')
      .groupBy('country', 'country_code', 'flag', 'region')
      .orderBy('count', 'desc');

    const categories = await k('listings')
      .where('active', true)
      .select('category', 'type')
      .count('id as count')
      .groupBy('category', 'type')
      .orderBy('count', 'desc');

    res.json({ success: true, data: { regions, countries, categories } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/listings/:id/contact ───────────────────────────────────────
// Track when someone taps Call / WhatsApp / Email on a listing
router.post('/:id/contact', async (req, res, next) => {
  try {
    const k = db.query();
    const { contact_type = 'whatsapp' } = req.body;
    const validTypes = ['call', 'whatsapp', 'email', 'website'];
    if (!validTypes.includes(contact_type)) {
      return res.status(400).json({ error: 'Invalid contact_type' });
    }
    await k('contact_leads').insert({
      listing_id:      req.params.id,
      contact_type,
      visitor_ip:      req.ip,
      visitor_country: req.headers['cf-ipcountry'] || null, // Cloudflare header
    });
    await k('listings').where('id', req.params.id).increment('contact_count', 1);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/listings/:id/review ────────────────────────────────────────
router.post('/:id/review', async (req, res, next) => {
  try {
    const k = db.query();
    const { reviewer_name, reviewer_phone, rating, comment } = req.body;
    if (!reviewer_name || !rating) {
      return res.status(400).json({ error: 'reviewer_name and rating are required' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }
    await k('reviews').insert({
      listing_id:    req.params.id,
      reviewer_name,
      reviewer_phone,
      rating:        parseInt(rating),
      comment,
      approved:      false, // requires admin approval
    });
    res.status(201).json({ success: true, message: 'Review submitted. Pending approval.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
