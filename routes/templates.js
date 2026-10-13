/**
 * Trade Templates & Docs API Routes
 * - Download templates (invoices, packing lists, customs docs)
 * - Track 7-day free access, then premium
 * - Expert directory
 * - Trade compliance checklists
 */

const express = require('express');
const router = express.Router();
const { getKnex } = require('../db');
const { requireAuth } = require('../middleware/auth');

// ─── GET ALL TEMPLATES ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { country, category, trade_route } = req.query;
    const knex = getKnex();

    let query = knex('templates').where('active', true);

    if (country) query = query.where('country_code', country);
    if (category) query = query.where('category', category);
    if (trade_route) query = query.where('trade_route', trade_route);

    const templates = await query.select('*');

    res.json({
      total: templates.length,
      templates,
      countries: ['NG', 'KE', 'GH', 'BJ']
    });
  } catch (err) {
    console.error('[TEMPLATES]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET SINGLE TEMPLATE ──────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const knex = getKnex();

    const template = await knex('templates').where('id', id).first();
    if (!template) return res.status(404).json({ error: 'Template not found' });

    res.json(template);
  } catch (err) {
    console.error('[TEMPLATE GET]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── DOWNLOAD TEMPLATE (Track Free 7-Day Access) ────────────────────────────
router.post('/:id/download', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const knex = getKnex();

    const template = await knex('templates').where('id', id).first();
    if (!template) return res.status(404).json({ error: 'Template not found' });

    // Check user's access
    const access = await knex('template_access')
      .where('user_id', req.user.id)
      .where('template_id', id)
      .first();

    if (access) {
      // User has accessed before
      if (access.has_paid) {
        // Already paid, allow download
        return res.json({
          file_url: template.file_url,
          access_type: 'paid',
          message: 'Download link ready'
        });
      }

      // Check if free access expired
      const now = new Date();
      if (new Date(access.free_access_expires_at) < now) {
        // Free access expired, need to pay
        return res.status(402).json({
          error: 'Free access expired',
          message: 'Please upgrade to premium access',
          access_expired: true,
          template_id: id
        });
      }

      // Still within free period
      return res.json({
        file_url: template.file_url,
        access_type: 'free',
        days_remaining: Math.ceil((new Date(access.free_access_expires_at) - now) / (1000 * 60 * 60 * 24)),
        message: 'Downloaded successfully (free access)'
      });
    }

    // First time accessing - grant 7-day free access
    const firstAccess = new Date();
    const expiresAt = new Date(firstAccess.getTime() + 7 * 24 * 60 * 60 * 1000);

    await knex('template_access').insert({
      user_id: req.user.id,
      template_id: id,
      first_access_at: firstAccess,
      free_access_expires_at: expiresAt
    });

    res.status(201).json({
      file_url: template.file_url,
      access_type: 'free_trial',
      days_remaining: 7,
      expires_at: expiresAt,
      message: 'First-time download! Free access for 7 days'
    });
  } catch (err) {
    console.error('[TEMPLATE DOWNLOAD]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET EXPERT DIRECTORY ──────────────────────────────────────────────────
router.get('/experts', async (req, res) => {
  try {
    const { country, expertise } = req.query;
    const knex = getKnex();

    let query = knex('experts').where('status', 'active');

    if (country) query = query.where('country_code', country);
    if (expertise) query = query.where('expertise', expertise);

    const experts = await query
      .orderBy('rating', 'desc')
      .orderBy('years_experience', 'desc');

    res.json({
      total: experts.length,
      experts,
      countries: ['NG', 'KE', 'GH', 'BJ']
    });
  } catch (err) {
    console.error('[EXPERTS]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET SINGLE EXPERT ────────────────────────────────────────────────────
router.get('/experts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const knex = getKnex();

    const expert = await knex('experts').where('id', id).first();
    if (!expert) return res.status(404).json({ error: 'Expert not found' });

    res.json(expert);
  } catch (err) {
    console.error('[EXPERT GET]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET TRADE COMPLIANCE CHECKLIST ───────────────────────────────────────
router.get('/checklists/:from_country/:to_country', async (req, res) => {
  try {
    const { from_country, to_country } = req.params;
    const knex = getKnex();

    // Get checklist
    const checklist = await knex('checklists')
      .where('from_country_code', from_country.toUpperCase())
      .where('to_country_code', to_country.toUpperCase())
      .where('active', true)
      .first();

    if (!checklist) {
      return res.status(404).json({
        error: 'Checklist not found',
        message: `No checklist available for ${from_country} → ${to_country} yet`,
        suggestion: 'Contact our team to add this trade route'
      });
    }

    // Get steps
    const steps = await knex('checklist_steps')
      .where('checklist_id', checklist.id)
      .orderBy('step_number', 'asc');

    res.json({
      ...checklist,
      steps,
      step_count: steps.length
    });
  } catch (err) {
    console.error('[CHECKLIST]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── LIST ALL AVAILABLE CHECKLISTS ─────────────────────────────────────────
router.get('/checklists', async (req, res) => {
  try {
    const knex = getKnex();

    const checklists = await knex('checklists')
      .where('active', true)
      .select('id', 'title', 'from_country', 'to_country', 'from_country_code', 'to_country_code', 'step_count');

    res.json({
      total: checklists.length,
      checklists,
      available_routes: {
        'NG-KE': 'Nigeria → Kenya',
        'KE-GH': 'Kenya → Ghana',
        'NG-GH': 'Nigeria → Ghana',
        'GH-BJ': 'Ghana → Benin'
      }
    });
  } catch (err) {
    console.error('[CHECKLISTS LIST]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
