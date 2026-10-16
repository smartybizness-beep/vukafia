/**
 * routes/admin.js
 * Admin-only endpoints: verify listings, manage users, view stats
 */

'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Skip auth for crawler endpoints (they use x-admin-token instead)
router.use((req, res, next) => {
  if (req.path.startsWith('/crawler/')) {
    return next();
  }
  requireAuth(req, res, () => {
    requireAdmin(req, res, next);
  });
});

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────
router.get('/dashboard', async (req, res, next) => {
  try {
    const k = db.query();

    const [
      totalListings, totalUsers, pendingVerification,
      totalContacts, featuredListings, recentListings,
    ] = await Promise.all([
      k('listings').where('active', true).count('id as c').first(),
      k('users').count('id as c').first(),
      k('listings').where({ active: true, verified: false }).count('id as c').first(),
      k('contact_leads').count('id as c').first(),
      k('listings').where({ active: true, featured: true }).count('id as c').first(),
      k('listings').where('active', true).orderBy('created_at', 'desc').limit(10)
        .select('id', 'name', 'country', 'category', 'verified', 'featured', 'created_at'),
    ]);

    const byRegion = await k('listings')
      .where('active', true)
      .select('region')
      .count('id as count')
      .groupBy('region');

    const byType = await k('listings')
      .where('active', true)
      .select('type')
      .count('id as count')
      .groupBy('type');

    const byPlan = await k('users')
      .select('plan')
      .count('id as count')
      .groupBy('plan');

    res.json({
      success: true,
      data: {
        stats: {
          total_listings:       parseInt(totalListings.c),
          total_users:          parseInt(totalUsers.c),
          pending_verification: parseInt(pendingVerification.c),
          total_contacts:       parseInt(totalContacts.c),
          featured_listings:    parseInt(featuredListings.c),
        },
        by_region:      byRegion,
        by_type:        byType,
        by_plan:        byPlan,
        recent_listings: recentListings,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/listings/pending ─────────────────────────────────────
router.get('/listings/pending', async (req, res, next) => {
  try {
    const k = db.query();
    const pending = await k('listings')
      .where({ active: true, verified: false })
      .join('users', 'users.id', 'listings.user_id')
      .select(
        'listings.id', 'listings.name', 'listings.type', 'listings.country',
        'listings.region', 'listings.category', 'listings.phone',
        'listings.description', 'listings.created_at',
        'users.name as seller_name', 'users.email as seller_email',
        'users.phone as seller_phone',
      )
      .orderBy('listings.created_at', 'asc');

    res.json({ success: true, data: pending, count: pending.length });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/admin/listings/:id/verify ─────────────────────────────────
router.post('/listings/:id/verify', async (req, res, next) => {
  try {
    const k = db.query();
    await k('listings').where('id', req.params.id).update({ verified: true });
    res.json({ success: true, message: 'Listing verified.' });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/admin/listings/:id/feature ────────────────────────────────
router.post('/listings/:id/feature', async (req, res, next) => {
  try {
    const k = db.query();
    const { featured } = req.body;
    await k('listings').where('id', req.params.id).update({ featured: !!featured });
    res.json({ success: true, message: `Listing ${featured ? 'featured' : 'unfeatured'}.` });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /api/admin/listings/:id ──────────────────────────────────────
router.delete('/listings/:id', async (req, res, next) => {
  try {
    const k = db.query();
    await k('listings').where('id', req.params.id).update({ active: false });
    res.json({ success: true, message: 'Listing removed.' });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────
router.get('/users', async (req, res, next) => {
  try {
    const k = db.query();
    const { page = 1, limit = 50, plan, role } = req.query;
    let query = k('users').select('id', 'name', 'email', 'phone', 'role', 'plan', 'active', 'created_at');
    if (plan) query = query.where('plan', plan);
    if (role) query = query.where('role', role);
    const users = await query
      .orderBy('created_at', 'desc')
      .limit(parseInt(limit))
      .offset((parseInt(page) - 1) * parseInt(limit));
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

// ─── PATCH /api/admin/users/:id/plan ─────────────────────────────────────
router.patch('/users/:id/plan', async (req, res, next) => {
  try {
    const k = db.query();
    const validPlans = ['free', 'growth', 'pro', 'enterprise'];
    const { plan, expires_at } = req.body;
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: `plan must be one of: ${validPlans.join(', ')}` });
    }
    await k('users').where('id', req.params.id).update({
      plan,
      plan_expires_at: expires_at || null,
    });
    // Set featured on all their listings if enterprise
    if (plan === 'enterprise') {
      await k('listings').where('user_id', req.params.id).update({ featured: true });
    }
    res.json({ success: true, message: `User plan updated to ${plan}.` });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/admin/reviews/pending ──────────────────────────────────────
router.get('/reviews/pending', async (req, res, next) => {
  try {
    const k = db.query();
    const reviews = await k('reviews')
      .where('reviews.approved', false)
      .where(q => q.whereNull('reviews.status').orWhereNot('reviews.status', 'rejected'))
      .join('listings', 'listings.id', 'reviews.listing_id')
      .leftJoin('users', 'users.id', 'reviews.reviewer_user_id')
      .select(
        'reviews.id', 'reviews.listing_id', 'reviews.reviewer_name', 'reviews.rating', 'reviews.comment', 'reviews.created_at',
        'users.email as reviewer_email', 'listings.name as listing_name', 'listings.country'
      )
      .orderBy('reviews.created_at', 'asc');
    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/admin/reviews/:id/approve ─────────────────────────────────
router.post('/reviews/:id/approve', async (req, res, next) => {
  try {
    const k = db.query();
    const review = await k('reviews').where('id', req.params.id).first();
    if (!review) return res.status(404).json({ error: 'Review not found' });

    // listings.rating/review_count hold the Google rating; the Vukafia average is computed from approved reviews on read.
    await k('reviews').where('id', req.params.id).update({ approved: true, status: 'approved', updated_at: new Date() });

    res.json({ success: true, message: 'Review approved and now visible on the business page.' });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/admin/reviews/:id/reject ──────────────────────────────────
router.post('/reviews/:id/reject', async (req, res, next) => {
  try {
    const k = db.query();
    const updated = await k('reviews')
      .where('id', req.params.id)
      .update({ approved: false, status: 'rejected', admin_notes: req.body?.reason || null, updated_at: new Date() });
    if (!updated) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true, message: 'Review rejected.' });
  } catch (err) {
    next(err);
  }
});

// ─── CLAIMS ───────────────────────────────────────────────────────────────
// GET /api/admin/claims — ownership checks waiting for payment confirmation
router.get('/claims', async (req, res, next) => {
  try {
    const k = db.query();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const claims = await k('claim_verifications as cv')
      .join('listings as l', 'l.id', 'cv.listing_id')
      .join('users as u', 'u.id', 'cv.user_id')
      .where(q => q.where('cv.status', 'verified').orWhere(q2 => q2.where('cv.status', 'pending').where('cv.created_at', '>', weekAgo)))
      .select(
        'cv.id', 'cv.status', 'cv.code', 'cv.verified_phone', 'cv.verified_at', 'cv.created_at',
        'l.id as listing_id', 'l.name as listing_name', 'l.country', 'l.phone as listing_phone', 'l.user_id as listing_owner',
        'u.name as user_name', 'u.email as user_email', 'u.phone as user_phone'
      )
      .orderByRaw("CASE WHEN cv.status = 'verified' THEN 0 ELSE 1 END, cv.created_at DESC");
    res.json({ success: true, data: claims });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/claims/:id/complete — after confirming payment: give the user ownership and the badge.
// Pending (not WhatsApp-verified) claims can be completed only after the admin checked ownership another way.
router.post('/claims/:id/complete', async (req, res, next) => {
  try {
    const k = db.query();
    const claim = await k('claim_verifications').where('id', req.params.id).first();
    if (!claim) return res.status(404).json({ error: 'Claim not found' });
    if (!['pending', 'verified'].includes(claim.status)) return res.status(409).json({ error: `Claim is already ${claim.status}` });

    const listing = await k('listings').where('id', claim.listing_id).first('id', 'user_id');
    if (listing.user_id && listing.user_id !== claim.user_id) {
      return res.status(409).json({ error: 'This business is already owned by another account' });
    }

    const note = String(req.body?.note || '').slice(0, 500) || null;
    const source = claim.status === 'verified' ? 'WhatsApp ownership check' : 'Manual ownership check';
    await k.transaction(async trx => {
      await trx('listings').where('id', claim.listing_id).update({ user_id: claim.user_id, verified: true, verified_source: source });
      await trx('listing_claims').insert({
        listing_id: claim.listing_id,
        user_id: claim.user_id,
        payment_ref: `admin-confirmed:${claim.id}`,
        status: 'completed',
        claimed_at: new Date(),
      });
      await trx('claim_verifications').where('id', claim.id)
        .update({ status: 'completed', completed_at: new Date(), admin_notes: note, updated_at: new Date() });
      await trx('claim_verifications')
        .where('listing_id', claim.listing_id).whereNot('id', claim.id).whereIn('status', ['pending', 'verified'])
        .update({ status: 'cancelled', admin_notes: 'Business claimed by another request', updated_at: new Date() });
    });

    res.json({ success: true, message: 'Claim completed. The user now owns this listing and it shows the verified badge.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/claims/:id/cancel
router.post('/claims/:id/cancel', async (req, res, next) => {
  try {
    const updated = await db.query()('claim_verifications')
      .where('id', req.params.id).whereIn('status', ['pending', 'verified'])
      .update({ status: 'cancelled', admin_notes: String(req.body?.note || '').slice(0, 500) || null, updated_at: new Date() });
    if (!updated) return res.status(404).json({ error: 'Open claim not found' });
    res.json({ success: true, message: 'Claim cancelled.' });
  } catch (err) {
    next(err);
  }
});

// ─── SEARCH QUERIES (AI discovery log) ────────────────────────────────────
// 'YYYY-MM-DD HH:MM:SS' in UTC — comparable as a string on both SQLite and Postgres
function daysAgo(days) {
  return new Date(Date.now() - days * 86400000).toISOString().slice(0, 19).replace('T', ' ');
}
const parseJson = v => (typeof v === 'string' ? JSON.parse(v) : v);

// GET /api/admin/searches
// Query: source=web|whatsapp  ai=true|false  zero_results=true  days=30  q=text  page  limit (max 100)
router.get('/searches', async (req, res, next) => {
  try {
    const k = db.query();
    const { source, ai, zero_results, days, q } = req.query;
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));

    let query = k('search_queries');
    if (source === 'web' || source === 'whatsapp') query = query.where('source', source);
    if (ai === 'true' || ai === 'false')           query = query.where('used_ai', ai === 'true');
    if (zero_results === 'true')                   query = query.where('result_count', 0);
    if (parseInt(days) > 0)                        query = query.where('created_at', '>=', daysAgo(parseInt(days)));
    if (q)                                         query = query.whereILike('query', `%${q}%`);

    const { total } = await query.clone().count('id as total').first();
    const rows = await query.orderBy('id', 'desc').limit(limit).offset((page - 1) * limit);

    res.json({
      success: true,
      data: rows.map(r => ({ ...r, filters: r.filters ? parseJson(r.filters) : null })),
      pagination: { total: parseInt(total), page, limit, pages: Math.ceil(parseInt(total) / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/searches/summary?days=30
// Headline numbers plus what people search for and what they can't find.
router.get('/searches/summary', async (req, res, next) => {
  try {
    const k    = db.query();
    const days = Math.min(365, Math.max(1, parseInt(req.query.days) || 30));
    const since = () => k('search_queries').where('created_at', '>=', daysAgo(days));
    const top = (extra) => {
      let qb = since();
      if (extra) qb = extra(qb);
      return qb.select(k.raw('lower(query) as query')).count('id as count')
        .groupByRaw('lower(query)').orderBy('count', 'desc').limit(10);
    };

    const [totals, bySource, byLanguage, topQueries, notFound] = await Promise.all([
      since().select(
        k.raw('COUNT(id) as searches'),
        k.raw('SUM(CASE WHEN used_ai THEN 1 ELSE 0 END) as ai_searches'),
        k.raw('SUM(CASE WHEN result_count = 0 THEN 1 ELSE 0 END) as zero_results'),
        k.raw('SUM(CASE WHEN relaxed IS NOT NULL THEN 1 ELSE 0 END) as relaxed'),
        k.raw('AVG(latency_ms) as avg_latency_ms'),
        k.raw('SUM(input_tokens) as input_tokens'),
        k.raw('SUM(output_tokens) as output_tokens'),
      ).first(),
      since().select('source').count('id as count').groupBy('source'),
      since().select('language').count('id as count').groupBy('language').orderBy('count', 'desc'),
      top(),
      top(qb => qb.where('result_count', 0)),
    ]);

    const n = v => parseInt(v || 0);
    const searches = n(totals.searches);
    res.json({
      success: true,
      data: {
        days,
        searches,
        ai_searches:      n(totals.ai_searches),
        keyword_fallback: searches - n(totals.ai_searches),
        zero_results:     n(totals.zero_results),
        zero_result_rate: searches ? +(n(totals.zero_results) / searches).toFixed(3) : 0,
        relaxed:          n(totals.relaxed),
        avg_latency_ms:   Math.round(totals.avg_latency_ms || 0),
        input_tokens:     n(totals.input_tokens),
        output_tokens:    n(totals.output_tokens),
        by_source:        bySource,
        by_language:      byLanguage,
        top_queries:      topQueries,
        top_not_found:    notFound,   // demand the directory can't serve yet
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
