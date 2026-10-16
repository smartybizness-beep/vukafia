'use strict';

const crypto = require('crypto');
const db = require('../db');

const CODE_TTL_MS = 30 * 60 * 1000;
const VERIFY_RE = /\bVERIFY\s+(VK\d{6})\b/i;

const digits = p => String(p || '').replace(/\D/g, '');

// WhatsApp sends senders as international digits ("2348012345678"); listings mostly store
// "+234 801 234 5678" but a few use local "0801…" numbers, so fall back to the last 9 digits.
function samePhone(a, b) {
  const da = digits(a);
  const dbb = digits(b);
  if (!da || !dbb) return false;
  if (da === dbb) return true;
  if ((da.startsWith('0') || dbb.startsWith('0')) && da.length >= 9 && dbb.length >= 9) {
    return da.slice(-9) === dbb.slice(-9);
  }
  return false;
}

function maskPhone(p) {
  const d = digits(p);
  return d.length >= 4 ? `ending in ${d.slice(-3)}` : '';
}

function vukafiaWhatsApp() {
  return digits(process.env.WA_PHONE_NUMBER || '2348101477935');
}

async function startVerification(listingId, userId) {
  const k = db.query();
  const listing = await k('listings').where({ id: listingId, active: true }).first('id', 'name', 'phone', 'user_id');
  if (!listing) return { error: 'Business not found.', status: 404 };
  if (listing.user_id && listing.user_id !== userId) return { error: 'This business has already been claimed.', status: 409 };
  if (listing.user_id === userId) return { error: 'You already own this business.', status: 409 };

  const now = new Date();
  let record = await k('claim_verifications')
    .where({ listing_id: listingId, user_id: userId })
    .whereIn('status', ['pending', 'verified'])
    .where(q => q.where('status', 'verified').orWhere('expires_at', '>', now))
    .orderBy('id', 'desc')
    .first();

  if (!record) {
    const [{ id }] = await k('claim_verifications').returning('id').insert({
      listing_id: listingId,
      user_id: userId,
      code: `VK${crypto.randomInt(100000, 1000000)}`,
      status: 'pending',
      expires_at: new Date(now.getTime() + CODE_TTL_MS),
    });
    record = await k('claim_verifications').where('id', id).first();
  }

  const message = `VERIFY ${record.code}`;
  return {
    id: record.id,
    status: record.status,
    code: record.code,
    message,
    expires_at: record.expires_at,
    has_phone: !!digits(listing.phone),
    business_phone_hint: maskPhone(listing.phone),
    whatsapp_number: vukafiaWhatsApp(),
    whatsapp_link: `https://wa.me/${vukafiaWhatsApp()}?text=${encodeURIComponent(message)}`,
  };
}

async function getVerificationStatus(listingId, userId) {
  const record = await db.query()('claim_verifications')
    .where({ listing_id: listingId, user_id: userId })
    .orderBy('id', 'desc')
    .first('status', 'expires_at', 'verified_at');
  if (!record) return { status: 'none' };
  const expired = record.status === 'pending' && new Date(record.expires_at) < new Date();
  return { status: expired ? 'expired' : record.status, verified_at: record.verified_at };
}

/**
 * Handle an incoming WhatsApp message that may be an ownership code.
 * Returns { handled: false } when the text isn't a VERIFY message.
 */
async function handleVerificationMessage(from, text) {
  const match = String(text || '').match(VERIFY_RE);
  if (!match) return { handled: false };

  const code = match[1].toUpperCase();
  const k = db.query();
  const record = await k('claim_verifications')
    .join('listings', 'listings.id', 'claim_verifications.listing_id')
    .where('claim_verifications.code', code)
    .where('claim_verifications.status', 'pending')
    .where('claim_verifications.expires_at', '>', new Date())
    .first('claim_verifications.id', 'listings.name', 'listings.phone');

  if (!record) {
    return { handled: true, verified: false, reply: 'That code is invalid or has expired. Please start again from the Claim Business screen on vukafia.com.' };
  }
  if (!samePhone(from, record.phone)) {
    return {
      handled: true,
      verified: false,
      reply: `This WhatsApp number doesn't match the phone number we have for ${record.name}. Please send the code from the business's own WhatsApp number (${maskPhone(record.phone)}), or reply HELP and our team will verify you another way.`,
    };
  }

  await k('claim_verifications').where('id', record.id).update({
    status: 'verified',
    verified_phone: digits(from),
    verified_at: new Date(),
    updated_at: new Date(),
  });
  return {
    handled: true,
    verified: true,
    reply: `✅ Ownership of ${record.name} confirmed. Go back to vukafia.com to finish your claim.`,
  };
}

async function isOwnershipVerified(listingId, userId) {
  const record = await db.query()('claim_verifications')
    .where({ listing_id: listingId, user_id: userId, status: 'verified' })
    .first('id');
  return !!record;
}

module.exports = { startVerification, getVerificationStatus, handleVerificationMessage, isOwnershipVerified, samePhone, maskPhone };
