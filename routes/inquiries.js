const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/inquiries - Submit an inquiry
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, country, message, type } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const k = db.query();
    const inquiry = await k('inquiries').insert({
      name,
      email,
      phone: phone || null,
      country: country || null,
      message,
      type: type || 'general',
      status: 'new'
    });

    res.json({
      success: true,
      id: inquiry[0],
      message: 'Your inquiry has been submitted. We will respond within 24 hours.'
    });
  } catch (err) {
    console.error('Inquiry error:', err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
});

// GET /api/inquiries/:id - Get inquiry status
router.get('/:id', async (req, res) => {
  try {
    const k = db.query();
    const inquiry = await k('inquiries').where('id', req.params.id).first();

    if (!inquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }

    res.json(inquiry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inquiry' });
  }
});

module.exports = router;
