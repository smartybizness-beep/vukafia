/**
 * routes/webhook.js
 * WhatsApp Bot webhook
 * Handles business onboarding through Twilio WhatsApp
 *
 * Flow: Greeting → Register/Claim/Search → Collect details → Payment → Auto-register
 */

'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { handleIncomingMessage } = require('../services/whatsappService');

const WA_VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || 'vukafia_webhook_verify_2025';

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
// Receives messages from WhatsApp Cloud API (Meta)
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
    const messageId = message.id;       // unique message ID

    if (!text) return;                  // ignore non-text (images, etc.)

    console.log(`📨 WhatsApp msg from ${from}: ${text}`);

    // ── PROCESS MESSAGE ───────────────────────────────────────────────────
    await handleIncomingMessage(from, text, messageId);

  } catch (err) {
    console.error('[WEBHOOK ERROR]', err.message);
    // Don't propagate — response already sent
  }
});

// ─── POST /api/webhook/twilio ─────────────────────────────────────────────
// Twilio WhatsApp chatbot webhook
// Handles onboarding: greeting → register/claim/search → auto-create listing
router.post('/twilio', async (req, res, next) => {
  try {
    // Verify Twilio signature (optional, for security)
    // const twilioSignature = req.get('X-Twilio-Signature');
    // if (!twilio.validateRequest(TWILIO_AUTH_TOKEN, twilioSignature, ...))
    //   return res.sendStatus(403);

    const from = req.body.From?.replace('whatsapp:', '');
    const text = req.body.Body;
    const mediaUrl = req.body.MediaUrl0; // Photo upload

    if (!from) return res.sendStatus(200);

    // Log incoming message
    const k = db.query();
    await k('wa_messages').insert({
      from_number: from,
      to_number:   process.env.WA_PHONE_NUMBER || '2348101477935',
      message:     text,
      media_url:   mediaUrl,
      direction:   'inbound',
    }).catch(() => {}); // Table may not exist yet

    // Process message through bot
    const botReply = await handleWhatsAppMessage(from, text || '', mediaUrl);

    // Log outgoing message
    await k('wa_messages').insert({
      from_number: process.env.WA_PHONE_NUMBER || '2348101477935',
      to_number:   from,
      message:     botReply,
      direction:   'outbound',
    }).catch(() => {});

    // Send Twilio TwiML response
    res.type('text/xml').send(`
      <Response>
        <Message><Body>${botReply}</Body></Message>
      </Response>
    `);
  } catch (err) {
    console.error('[TWILIO WEBHOOK ERROR]', err.message);
    res.type('text/xml').send(`
      <Response>
        <Message><Body>❌ Sorry, something went wrong. Please try again.</Body></Message>
      </Response>
    `);
  }
});

module.exports = router;
