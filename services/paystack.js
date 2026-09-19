/**
 * services/paystack.js
 * Paystack payment integration for claim fees
 */

'use strict';

const axios = require('axios');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC = process.env.PAYSTACK_PUBLIC_KEY;
const CLAIM_FEE_NGN = parseInt(process.env.CLAIM_FEE_NGN || '6000');
const CLAIM_FEE_USD = parseInt(process.env.CLAIM_FEE_USD || '15');

const paystackAPI = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    'Content-Type': 'application/json'
  }
});

/**
 * Initialize a Paystack payment for claiming a business
 * @param {Object} options - { email, amount, listing_id, user_id, currency }
 * @returns {Object} - { success, authorization_url, access_code, reference }
 */
async function initializePayment(options) {
  try {
    const { email, listing_id, user_id, currency = 'NGN' } = options;

    if (!PAYSTACK_SECRET || PAYSTACK_SECRET.includes('your_secret')) {
      return {
        success: false,
        error: 'Paystack not configured. Add PAYSTACK_SECRET_KEY to .env'
      };
    }

    const amount = currency === 'USD' ? CLAIM_FEE_USD * 100 : CLAIM_FEE_NGN * 100; // Paystack uses cents
    const reference = `CLAIM_${listing_id}_${Date.now()}`;

    const response = await paystackAPI.post('/transaction/initialize', {
      email,
      amount,
      reference,
      currency,
      metadata: {
        listing_id,
        user_id,
        type: 'business_claim'
      }
    });

    if (response.data.status) {
      return {
        success: true,
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference,
        amount
      };
    }

    return { success: false, error: 'Failed to initialize payment' };
  } catch (err) {
    console.error('Paystack init error:', err.response?.data || err.message);
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
}

/**
 * Verify a Paystack payment
 * @param {string} reference - Payment reference from Paystack
 * @returns {Object} - { success, status, amount, customer_email }
 */
async function verifyPayment(reference) {
  try {
    if (!PAYSTACK_SECRET || PAYSTACK_SECRET.includes('your_secret')) {
      return {
        success: false,
        error: 'Paystack not configured'
      };
    }

    const response = await paystackAPI.get(`/transaction/verify/${reference}`);

    if (response.data.status && response.data.data.status === 'success') {
      return {
        success: true,
        status: 'success',
        amount: response.data.data.amount,
        customer_email: response.data.data.customer.email,
        reference: response.data.data.reference,
        paid_at: response.data.data.paid_at,
        metadata: response.data.data.metadata
      };
    }

    return {
      success: false,
      status: response.data.data?.status || 'failed',
      error: 'Payment not completed'
    };
  } catch (err) {
    console.error('Paystack verify error:', err.response?.data || err.message);
    return {
      success: false,
      error: err.response?.data?.message || err.message
    };
  }
}

/**
 * Get claim fee in specified currency
 * @param {string} currency - 'NGN' or 'USD'
 * @returns {number} - Fee amount
 */
function getClaimFee(currency = 'NGN') {
  return currency === 'USD' ? CLAIM_FEE_USD : CLAIM_FEE_NGN;
}

module.exports = {
  initializePayment,
  verifyPayment,
  getClaimFee,
  PAYSTACK_PUBLIC
};
