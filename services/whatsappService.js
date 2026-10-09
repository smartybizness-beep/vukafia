/**
 * services/whatsappService.js
 * WhatsApp Cloud API integration for Vukafia
 * Sends and receives messages via Meta's WhatsApp Business API
 */

'use strict';

const axios = require('axios');
const db = require('../db');

const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID;
const WA_API_TOKEN = process.env.WA_API_TOKEN;
const WA_API_URL = `https://graph.instagram.com/v18.0/${WA_PHONE_NUMBER_ID}/messages`;

/**
 * Send a message via WhatsApp API
 */
async function sendMessage(recipientPhone, messageText) {
  try {
    if (!WA_API_TOKEN || !WA_PHONE_NUMBER_ID) {
      console.error('❌ WhatsApp API credentials not configured');
      return false;
    }

    const response = await axios.post(
      WA_API_URL,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'text',
        text: { body: messageText },
      },
      {
        headers: {
          Authorization: `Bearer ${WA_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ WhatsApp message sent to ${recipientPhone}`, response.data.messages?.[0]?.id);
    return true;
  } catch (err) {
    console.error('❌ WhatsApp send failed:', err.response?.data || err.message);
    return false;
  }
}

/**
 * Send a message template (for payment confirmations, etc.)
 * Template must be created in Meta Business Manager first
 */
async function sendTemplate(recipientPhone, templateName, templateLanguage = 'en_US', parameters = []) {
  try {
    if (!WA_API_TOKEN || !WA_PHONE_NUMBER_ID) {
      console.error('❌ WhatsApp API credentials not configured');
      return false;
    }

    const response = await axios.post(
      WA_API_URL,
      {
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: templateLanguage,
          },
          ...(parameters.length > 0 && {
            parameters: {
              body: {
                parameters: parameters.map(p => ({ type: 'text', text: p })),
              },
            },
          }),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WA_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ WhatsApp template sent to ${recipientPhone}`);
    return true;
  } catch (err) {
    console.error('❌ WhatsApp template send failed:', err.response?.data || err.message);
    return false;
  }
}

/**
 * Send payment confirmation message
 */
async function sendPaymentConfirmation(recipientPhone, businessName, claimFee) {
  const message = `
✅ *Payment Received!*

Thanks for claiming *${businessName}* on Vukafia!

💰 *Amount:* $${claimFee.toFixed(2)} USD
📅 *Status:* Verified ✓
🎉 *Your business is now live!*

👉 [View Your Listing](https://vukafia.com)

Questions? Contact us via WhatsApp: +2348101477935
  `.trim();

  return sendMessage(recipientPhone, message);
}

/**
 * Send verification link message
 */
async function sendVerificationLink(recipientPhone, businessName, verificationLink) {
  const message = `
🔗 *Complete Your Business Claim*

Hi there! We found your business on Vukafia:

📍 *${businessName}*

Click below to verify and claim it (pay $14.99 USD):
${verificationLink}

Questions? Reply here or contact support! 📞
  `.trim();

  return sendMessage(recipientPhone, message);
}

/**
 * Process incoming WhatsApp message
 * Route messages to appropriate handlers
 */
async function handleIncomingMessage(senderPhone, messageText, messageId) {
  try {
    const k = db.query();

    // Log the message
    await k('wa_messages').insert({
      from_number: senderPhone,
      to_number: process.env.WA_PHONE_NUMBER || '2348101477935',
      message: messageText,
      message_id: messageId,
      direction: 'inbound',
      created_at: new Date(),
    }).catch(() => {}); // Table may not exist

    // Parse the message for common intents
    const lowerText = messageText.toLowerCase().trim();

    let reply = '';

    // Greeting / Help
    if (['hi', 'hello', 'hey', 'help', 'start', 'info'].some(w => lowerText.includes(w))) {
      reply = `
👋 *Welcome to Vukafia!*

We help African businesses grow through smart visibility and connections.

📌 *What can I help you with?*
1️⃣ *Claim* - Claim and verify your business ($14.99 USD)
2️⃣ *Search* - Find businesses in your category/location
3️⃣ *Support* - Get help with your account

Just reply with your choice or describe what you need! 💬
      `.trim();
    }
    // Claim keyword
    else if (lowerText.includes('claim')) {
      reply = `
✅ *Claim Your Business*

To claim your business on Vukafia:

1️⃣ Go to https://vukafia.com
2️⃣ Search for your business
3️⃣ Click "Claim This Business"
4️⃣ Pay $14.99 USD via Bachs (card) or WhatsApp transfer

Once verified, you'll get:
✓ Verified badge
✓ Full business profile control
✓ Customer inquiry replies
✓ Premium features

Need help? Reply here or call +2348101477935 📞
      `.trim();
    }
    // Payment keyword
    else if (lowerText.includes('pay') || lowerText.includes('payment')) {
      reply = `
💳 *Payment for Business Claim*

We accept:
✅ *Bachs* - Global card payments (fastest)
💬 *WhatsApp* - Bank transfer or mobile money

Both options available during the claim process at https://vukafia.com

Any issues? Message us here! 📱
      `.trim();
    }
    // Default
    else {
      reply = `
Thanks for your message! 👋

I'm Vukafia's assistant bot. I can help with:
• *Claim* - Claim your business
• *Search* - Find businesses
• *Support* - Get help

For other questions, our team will respond soon! 📧
      `.trim();
    }

    // Send reply
    if (reply) {
      await sendMessage(senderPhone, reply);
    }

    return true;
  } catch (err) {
    console.error('[WhatsApp Handler Error]', err.message);
    return false;
  }
}

module.exports = {
  sendMessage,
  sendTemplate,
  sendPaymentConfirmation,
  sendVerificationLink,
  handleIncomingMessage,
};
