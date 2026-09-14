/**
 * routes/webhook.js
 * WhatsApp Business API webhook
 * Receives inbound messages → AI parses intent → returns listings
 *
 * Compatible with: WhatsApp Cloud API (Meta) / Twilio / Africa's Talking
 */

'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const waService = require('../services/whatsapp');

const WA_VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || 'vukafia_webhook_token';

// ─── GET /api/webhook/whatsapp ────────────────────────────────────────────
// Meta webhook verification (called once during setup)
router.get('/whatsapp', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WA_VERIFY_TOKEN) {
    console.log('✅ WhatsApp webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// ─── POST /api/webhook/whatsapp ───────────────────────────────────────────
// Receives messages from WhatsApp Cloud API
router.post('/whatsapp', async (req, res, next) => {
  try {
    // Acknowledge immediately (Meta requires < 5s response)
    res.sendStatus(200);

    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    const entry   = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value   = changes?.value;
    const message = value?.messages?.[0];

    if (!message) return;

    const from = message.from;          // sender's phone number
    const text = message.text?.body;    // message text
    if (!text) return;                  // ignore non-text (images, etc.)

    console.log(`📨 WA msg from ${from}: ${text}`);

    // ── SAVE to DB ────────────────────────────────────────────────────────
    const k = db.query();
    await k('wa_messages').insert({
      from_number: from,
      to_number:   process.env.WA_PHONE_NUMBER || '2348101477935',
      message:     text,
      direction:   'inbound',
    });

    // ── PROCESS MESSAGE ───────────────────────────────────────────────────
    await waService.handleMessage(from, text, k);

  } catch (err) {
    console.error('[WEBHOOK ERROR]', err.message);
    // Don't propagate — response already sent
  }
});

// ─── POST /api/webhook/twilio ─────────────────────────────────────────────
// Alternative: Twilio WhatsApp webhook
router.post('/twilio', async (req, res, next) => {
  try {
    const from = req.body.From?.replace('whatsapp:', '');
    const text = req.body.Body;
    if (!from || !text) return res.sendStatus(200);

    const k = db.query();
    await k('wa_messages').insert({
      from_number: from,
      to_number:   process.env.WA_PHONE_NUMBER || '2348101477935',
      message:     text,
      direction:   'inbound',
    });

    const reply = await waService.buildReply(from, text, k);
    // Twilio TwiML response
    res.type('text/xml').send(`
      <Response>
        <Message><Body>${reply}</Body></Message>
      </Response>
    `);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
