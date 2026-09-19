/**
 * routes/search.js
 * Natural-language search: "cheap solar panels in Kenya", "avocat au Caire" ...
 */

'use strict';

const express   = require('express');
const rateLimit = require('express-rate-limit');
const router    = express.Router();
const db        = require('../db');
const { runSearch, aiEnabled } = require('../services/aiSearch');

const MAX_QUERY_LENGTH = 300;

// Each request can cost an LLM call, so limit tighter than the global API limiter
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many searches. Please try again shortly.' },
});

const COLUMNS = [
  'id', 'type', 'region', 'country', 'country_code', 'flag',
  'state', 'city', 'town', 'name', 'category', 'products_services',
  'description', 'phone', 'whatsapp', 'email', 'website',
  'latitude', 'longitude', 'rating', 'review_count',
  'verified', 'featured', 'is_new', 'cover_photo', 'emoji',
  'view_count', 'contact_count', 'created_at', 'photos',
];

// ─── POST /api/search/ai ──────────────────────────────────────────────────
// Body: { query: string, page?: number, limit?: number (max 50) }
router.post('/ai', aiLimiter, async (req, res, next) => {
  try {
    const query = typeof req.body.query === 'string' ? req.body.query.trim() : '';
    if (!query) return res.status(400).json({ error: 'query is required' });
    if (query.length > MAX_QUERY_LENGTH) {
      return res.status(400).json({ error: `query must be at most ${MAX_QUERY_LENGTH} characters` });
    }

    const page   = Math.max(1, parseInt(req.body.page) || 1);
    const limit  = Math.min(50, Math.max(1, parseInt(req.body.limit) || 20));
    const offset = (page - 1) * limit;

    const found = await runSearch(query, db.query(), {
      source: 'web', clientRef: req.ip, limit, offset, select: COLUMNS,
    });

    res.json({
      success: true,
      data: found.rows.map(r => ({ ...r, photos: r.photos ? JSON.parse(r.photos) : [] })),
      interpreted: {
        language: found.language,
        filters:  found.filters,
        ai:       found.used_ai,
        // set when nothing matched exactly and a constraint was dropped
        relaxed:  found.relaxed,
      },
      pagination: {
        total: found.total,
        page,
        limit,
        pages: Math.ceil(found.total / limit),
        has_next: offset + limit < found.total,
        has_prev: page > 1,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/search/status ───────────────────────────────────────────────
router.get('/status', (req, res) => {
  res.json({ success: true, ai_enabled: aiEnabled() });
});

module.exports = router;
