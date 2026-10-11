/**
 * routes/admin-crawler.js
 * Admin endpoints for background crawler management
 */

'use strict';

const express = require('express');
const router = express.Router();
const { crawlGoogleMaps } = require('../services/googleMapsCrawler');
const { triggerJob, getSchedulerStatus } = require('../jobs/scheduler');
const { testEmailConfig, testEmailConfigDetailed, sendSuccessEmail, sendFailureEmail } = require('../services/mailer');

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'vukafia_admin_2025';

// Middleware to verify admin token
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  const tokenFromBearer = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  const tokenFromHeader = req.headers['x-admin-token'];
  const token = tokenFromBearer || tokenFromHeader;

  if (!token || token !== ADMIN_TOKEN) {
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
    const startTime = Date.now();
    const result = await crawlGoogleMaps();
    const duration = Math.round((Date.now() - startTime) / 1000);

    // Send success email
    await sendSuccessEmail({
      ...result,
      duration,
      timestamp: new Date()
    });

    res.json({
      success: true,
      result,
      duration,
      message: `Crawler completed. Status: ${result.status}. Email sent to admin.`
    });
  } catch (err) {
    console.error('[ADMIN API] Crawler error:', err.message);
    const duration = Math.round((Date.now() - startTime) / 1000);

    // Send failure email
    await sendFailureEmail(err, duration);

    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Crawler failed. Error email sent to admin.'
    });
  }
});

/**
 * GET /api/admin/crawler/test-email-debug
 * Test email with detailed debug output (no auth required)
 */
router.get('/crawler/test-email-debug', async (req, res) => {
  try {
    console.log('[EMAIL DEBUG] Starting email test...');

    // Check environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const adminEmail = process.env.ADMIN_EMAIL || 'smartybizness@gmail.com';

    const config = {
      emailUser: emailUser ? '✅ SET' : '❌ MISSING',
      emailPassword: emailPassword ? '✅ SET' : '❌ MISSING',
      adminEmail: adminEmail
    };

    console.log('[EMAIL DEBUG] Config:', config);

    // Test email configuration with detailed error info
    const testResult = await testEmailConfigDetailed();
    console.log('[EMAIL DEBUG] Test result:', testResult);

    if (!testResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Email configuration failed.',
        error: testResult.error,
        code: testResult.code,
        debug: config
      });
    }

    // Send test email
    console.log('[EMAIL DEBUG] Sending test email to', adminEmail);
    await sendSuccessEmail({
      inserted: 42,
      updated: 8,
      total: 487,
      progress: 48,
      duration: 127,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Test email sent successfully!',
      sentTo: adminEmail,
      debug: config
    });
  } catch (err) {
    console.error('[EMAIL DEBUG] Error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      stack: err.stack
    });
  }
});

/**
 * POST /api/admin/crawler/test-email
 * Test email configuration
 */
router.post('/crawler/test-email', requireAdmin, async (req, res) => {
  try {
    console.log('[ADMIN API] Testing email configuration...');
    const isValid = await testEmailConfig();

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Email configuration failed. Check logs for details.'
      });
    }

    // Send test email
    await sendSuccessEmail({
      inserted: 42,
      updated: 8,
      total: 487,
      progress: 48,
      duration: 127,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Email configuration verified! Test email sent to admin.'
    });
  } catch (err) {
    console.error('[ADMIN API] Email test error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      message: 'Email test failed. Check your configuration and logs.'
    });
  }
});

module.exports = router;
