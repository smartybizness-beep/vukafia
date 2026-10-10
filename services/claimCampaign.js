/**
 * services/claimCampaign.js
 * Batch WhatsApp campaign for business claim invitations
 *
 * ⚠️ IMPORTANT: Only message businesses that have opted-in or have clear consent
 * WhatsApp Business API ToS require opt-in for marketing messages
 */

'use strict';

const db = require('../db');
const { sendMessage, sendClaimInvitationTemplate } = require('./whatsappService');

/**
 * Get all Google-verified businesses with WhatsApp numbers
 * Filter by criteria (optional)
 */
async function getUnclaimedBusinesses(filters = {}) {
  try {
    const k = db.query();

    let query = k('listings')
      .where('is_verified', true)
      .whereNotNull('phone');

    // Optional filters
    if (filters.country) {
      query = query.where('country', filters.country);
    }
    if (filters.category) {
      query = query.where('category', filters.category);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const businesses = await query.select('id', 'name', 'phone', 'country', 'category', 'email');

    console.log(`📊 Found ${businesses.length} unclaimed Google-verified businesses`);
    return businesses;
  } catch (err) {
    console.error('❌ Error fetching businesses:', err.message);
    return [];
  }
}

/**
 * Create claim invitation message with link
 */
function createClaimMessage(businessName, claimLink) {
  return `
🎉 *Hello! Your business is on Vukafia!*

We found *${businessName}* in our directory (verified from Google Maps).

*Claim it now for $15 to:*
✅ Get a verified badge
✅ Manage your business profile
✅ Respond to customer inquiries
✅ Boost your visibility across Africa

👉 **[Claim Your Business](${claimLink})**

Questions? Reply here or contact us! 📞
  `.trim();
}

/**
 * Send batch messages to businesses
 * Includes rate limiting & error handling
 */
async function sendClaimInvitations(businesses, options = {}) {
  const {
    delayMs = 2000,           // Delay between messages (avoid rate limit)
    dryRun = false,           // Test run (don't actually send)
    batchSize = 50,           // Max messages per run
    baseClaimUrl = 'https://vukafia.com/claim'
  } = options;

  console.log(`\n📤 Starting campaign...`);
  console.log(`   Dry run: ${dryRun ? '✅ YES (no messages sent)' : '❌ NO (messages will be sent)'}`);
  console.log(`   Batch size: ${batchSize}`);
  console.log(`   Delay between messages: ${delayMs}ms`);

  const results = {
    total: Math.min(businesses.length, batchSize),
    sent: 0,
    failed: 0,
    errors: [],
  };

  const batch = businesses.slice(0, batchSize);

  for (let i = 0; i < batch.length; i++) {
    const business = batch[i];
    const progress = `[${i + 1}/${batch.length}]`;

    try {
      // Clean phone number (remove spaces, ensure it's just digits + country code)
      const phone = business.phone.replace(/\s+/g, '').replace(/^0+/, '');

      if (!phone || phone.length < 10) {
        console.log(`${progress} ⚠️  ${business.name} - Invalid phone: ${business.phone}`);
        results.failed++;
        continue;
      }

      if (dryRun) {
        console.log(`${progress} 🧪 [DRY RUN] ${business.name} (${phone})`);
        console.log(`    Template: claim_invitation with business name: ${business.name}`);
      } else {
        // Send via WhatsApp template
        const sent = await sendClaimInvitationTemplate(phone, business.name, business.id);
        if (sent) {
          console.log(`${progress} ✅ ${business.name} (${phone})`);
          results.sent++;
        } else {
          console.log(`${progress} ❌ ${business.name} (${phone}) - Send failed`);
          results.failed++;
          results.errors.push({
            business: business.name,
            phone,
            error: 'Template send failed'
          });
        }
      }

      // Rate limit delay
      if (i < batch.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (err) {
      console.error(`${progress} ❌ Error:`, err.message);
      results.failed++;
      results.errors.push({
        business: business.name,
        error: err.message
      });
    }
  }

  // Summary
  console.log(`\n📊 Campaign Summary:`);
  console.log(`   Total: ${results.total}`);
  console.log(`   Sent: ${results.sent}`);
  console.log(`   Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log(`\n⚠️  Failed messages:`);
    results.errors.forEach(e => {
      console.log(`   - ${e.business}: ${e.error}`);
    });
  }

  return results;
}

/**
 * Get campaign statistics (before running)
 */
async function getCampaignStats(filters = {}) {
  const businesses = await getUnclaimedBusinesses(filters);

  return {
    totalUnclaimed: businesses.length,
    byCountry: groupBy(businesses, 'country'),
    byCategory: groupBy(businesses, 'category'),
    sample: businesses.slice(0, 3),
  };
}

/**
 * Helper: Group array by property
 */
function groupBy(arr, prop) {
  return arr.reduce((acc, obj) => {
    const key = obj[prop] || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

module.exports = {
  getUnclaimedBusinesses,
  sendClaimInvitations,
  getCampaignStats,
  createClaimMessage,
};
