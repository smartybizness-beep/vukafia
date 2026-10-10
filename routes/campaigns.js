/**
 * routes/campaigns.js
 * Admin endpoints for marketing campaigns (WhatsApp claim invitations)
 *
 * ⚠️ Requires admin authentication
 * Only ADMIN_TOKEN holders can trigger campaigns
 */

'use strict';

const express = require('express');
const router = express.Router();
const {
  getCampaignStats,
  sendClaimInvitations,
  getUnclaimedBusinesses
} = require('../services/claimCampaign');

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'vukafia_admin_2025';

// Admin auth middleware — check for ADMIN_TOKEN
const requireAdminAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : req.query.admin_token;

  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Admin token required' });
  }
  next();
};

// ─── GET /api/campaigns/stats ─────────────────────────────────────────────
// Get campaign statistics (preview before running)
router.get('/stats', requireAdminAuth, async (req, res, next) => {
  try {
    const { country, category } = req.query;

    const stats = await getCampaignStats({
      country: country || undefined,
      category: category || undefined,
    });

    res.json({
      success: true,
      data: stats,
      message: `Found ${stats.totalUnclaimed} unclaimed businesses. Run with ?dryRun=true to preview before sending.`
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/campaigns/send-claim-invites ──────────────────────────────
// Send WhatsApp claim invitations to unclaimed businesses
// Query params:
//   - dryRun=true : Test run (preview messages, don't send)
//   - batchSize=50 : Max messages to send per run
//   - country=NG : Filter by country
//   - category=Restaurant : Filter by category
//   - delayMs=2000 : Delay between messages (rate limit)
router.post('/send-claim-invites', requireAdminAuth, async (req, res, next) => {
  try {
    const {
      dryRun = req.query.dryRun === 'true',
      batchSize = parseInt(req.query.batchSize) || 50,
      country = req.query.country,
      category = req.query.category,
      delayMs = parseInt(req.query.delayMs) || 2000,
    } = { ...req.query, ...req.body };

    // Safety check: require explicit approval for large campaigns
    if (batchSize > 500 && req.body.confirmed !== true) {
      return res.status(400).json({
        success: false,
        error: 'Large campaign requires confirmation',
        message: `You're about to send to ${batchSize} businesses. Pass "confirmed": true to proceed.`,
      });
    }

    // Get businesses to message
    const businesses = await getUnclaimedBusinesses({
      country,
      category,
      limit: batchSize,
    });

    if (businesses.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No unclaimed businesses found',
        message: 'Try different filters or check your database.',
      });
    }

    // Send campaign
    const results = await sendClaimInvitations(businesses, {
      dryRun,
      batchSize,
      delayMs,
    });

    res.json({
      success: true,
      campaign: {
        type: 'claim_invitation',
        dryRun,
        results,
      },
      message: dryRun
        ? `DRY RUN: Would send ${results.sent} messages`
        : `Campaign complete! Sent ${results.sent}/${results.total} messages`,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/campaigns/history ───────────────────────────────────────────
// View campaign history (optional: log campaigns to DB)
router.get('/history', requireAdminAuth, async (req, res, next) => {
  try {
    // TODO: Implement campaign logging in DB
    res.json({
      success: true,
      message: 'Campaign history tracking coming soon',
      data: []
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
