/**
 * routes/admin-crawler.js
 * Admin endpoints for background crawler management
 */

'use strict';

const express = require('express');
const router = express.Router();
const { crawlBusinessesJob } = require('../services/googleMapsCrawler');
const { triggerJob, getSchedulerStatus } = require('../jobs/scheduler');

// Middleware to verify admin (optional - add proper auth in production)
function requireAdmin(req, res, next) {
  // TODO: Add proper JWT verification
  // For now, just check if admin token is provided
  const token = req.headers['x-admin-token'];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

/**
 * GET /api/admin/crawler/status
 * Get current crawler job status
 */
router.get('/crawler/status', requireAdmin, (req, res) => {
  try {
    const status = getSchedulerStatus();
    res.json({
      success: true,
      scheduler: status,
      message: 'Crawler runs daily at 2 AM UTC'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/admin/crawler/trigger
 * Manually trigger crawler job
 */
router.post('/crawler/trigger', requireAdmin, async (req, res) => {
  try {
    console.log('[ADMIN API] Triggering crawler job...');
    const result = await crawlBusinessesJob();

    res.json({
      success: true,
      result,
      message: `Crawler completed. Status: ${result.status}`
    });
  } catch (err) {
    console.error('[ADMIN API] Crawler error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
