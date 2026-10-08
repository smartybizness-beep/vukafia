/**
 * services/bachsPayment.js
 * Bachs payment integration for business claims
 *
 * Handles checkout session creation and payment verification
 */

'use strict';

const axios = require('axios');

const BACHS_API_KEY = process.env.BACHS_API_KEY;
const BACHS_API_URL = process.env.BACHS_API_URL || 'https://api.bachs.io/v1';

/**
 * Create a Bachs checkout session for claim fee
 */
async function createCheckoutSession(claimId, email, currency = 'USD') {
  if (!BACHS_API_KEY) {
    throw new Error('Bachs API key not configured');
  }

  try {
    // Determine amount based on currency
    const amount = currency === 'NGN' ? '6000.00' : '14.99';
    const callbackUrl = process.env.BACHS_CALLBACK_URL || 'https://vukafia.com/api/claims/bachs-callback';

    const payload = {
      amount,
      currency,
      customer_email: email,
      metadata: {
        claim_id: claimId,
        type: 'business_claim'
      },
      success_url: `${callbackUrl}?session_id={checkout_id}&claim_id=${claimId}`,
      cancel_url: `https://vukafia.com/claim?error=cancelled&claim_id=${claimId}`
    };

    const response = await axios.post(`${BACHS_API_URL}/checkout-sessions`, payload, {
      headers: {
        'Authorization': `Bearer ${BACHS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data || !response.data.id) {
      throw new Error('Invalid Bachs response: missing checkout session ID');
    }

    console.log(`[BACHS] ✅ Checkout session created: ${response.data.id}`);

    return {
      success: true,
      sessionId: response.data.id,
      checkoutUrl: response.data.url || `https://bachs.io/checkout/${response.data.id}`,
      amount,
      currency,
      claimId
    };
  } catch (err) {
    console.error('[BACHS] ❌ Error creating checkout session:', err.message);
    return {
      success: false,
      error: err.message,
      details: err.response?.data || {}
    };
  }
}

/**
 * Verify a Bachs payment by session/payment ID
 */
async function verifyPayment(checkoutId) {
  if (!BACHS_API_KEY) {
    throw new Error('Bachs API key not configured');
  }

  try {
    const response = await axios.get(`${BACHS_API_URL}/checkout-sessions/${checkoutId}`, {
      headers: {
        'Authorization': `Bearer ${BACHS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const checkoutSession = response.data;

    // Check if payment was successful
    const isPaymentSuccessful = checkoutSession.status === 'completed' &&
                               checkoutSession.payment_id;

    console.log(`[BACHS] Payment status for ${checkoutId}: ${checkoutSession.status}`);

    return {
      success: isPaymentSuccessful,
      status: checkoutSession.status,
      paymentId: checkoutSession.payment_id,
      amount: checkoutSession.amount,
      currency: checkoutSession.currency,
      customerEmail: checkoutSession.customer_email,
      metadata: checkoutSession.metadata,
      createdAt: checkoutSession.created_at
    };
  } catch (err) {
    console.error('[BACHS] ❌ Error verifying payment:', err.message);
    return {
      success: false,
      error: err.message,
      status: 'error'
    };
  }
}

/**
 * Get payment details by payment ID
 */
async function getPayment(paymentId) {
  if (!BACHS_API_KEY) {
    throw new Error('Bachs API key not configured');
  }

  try {
    const response = await axios.get(`${BACHS_API_URL}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${BACHS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const payment = response.data;

    return {
      success: true,
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      customerEmail: payment.customer_email,
      createdAt: payment.created_at
    };
  } catch (err) {
    console.error('[BACHS] ❌ Error getting payment:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Process webhook event from Bachs
 */
function processWebhookEvent(event) {
  try {
    const eventType = event.type;
    const eventData = event.data;

    console.log(`[BACHS WEBHOOK] Processing event: ${eventType}`);

    switch (eventType) {
      case 'collection.succeeded':
        return {
          success: true,
          action: 'payment_completed',
          paymentId: eventData.id,
          metadata: eventData.metadata,
          claimId: eventData.metadata?.claim_id
        };

      case 'collection.failed':
        return {
          success: false,
          action: 'payment_failed',
          paymentId: eventData.id,
          error: eventData.failure_reason || 'Payment failed',
          metadata: eventData.metadata,
          claimId: eventData.metadata?.claim_id
        };

      case 'checkout.completed':
        return {
          success: true,
          action: 'checkout_completed',
          checkoutId: eventData.id,
          metadata: eventData.metadata,
          claimId: eventData.metadata?.claim_id
        };

      case 'checkout.expired':
        return {
          success: false,
          action: 'checkout_expired',
          checkoutId: eventData.id,
          metadata: eventData.metadata,
          claimId: eventData.metadata?.claim_id
        };

      default:
        console.log(`[BACHS WEBHOOK] Unhandled event type: ${eventType}`);
        return {
          success: true,
          action: 'event_logged',
          eventType
        };
    }
  } catch (err) {
    console.error('[BACHS WEBHOOK] Error processing event:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

module.exports = {
  createCheckoutSession,
  verifyPayment,
  getPayment,
  processWebhookEvent
};
