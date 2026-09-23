/**
 * jobs/crawlBusinessesJob.js
 * Background job to crawl and expand business listings to 1000+
 *
 * Runs during quiet hours (2-6 AM UTC) to avoid impacting user traffic
 */

'use strict';

const db = require('../db');
const { crawlGoogleMaps } = require('../services/googleMapsCrawler');

/**
 * Main job handler
 */
async function crawlBusinessesJob() {
  const startTime = Date.now();
  console.log(`[CRAWLER JOB] Started at ${new Date().toISOString()}`);

  try {
    // Get current count
    const k = db.query();
    const current = await k('listings').where('active', true).count('* as count').first();
    const currentCount = parseInt(current.count);
    console.log(`[CRAWLER JOB] Current listings: ${currentCount}`);

    // If we already have 1000+, skip
    if (currentCount >= 1000) {
      console.log(`[CRAWLER JOB] Target reached (${currentCount}/1000). Skipping crawl.`);
      return { status: 'completed', message: 'Target already reached', count: currentCount };
    }

    // Calculate how many more we need
    const needed = 1000 - currentCount;
    console.log(`[CRAWLER JOB] Need ${needed} more businesses to reach 1000`);

    // Crawl Google Maps
    console.log(`[CRAWLER JOB] Starting Google Maps crawl...`);
    const businesses = await crawlGoogleMaps();
    console.log(`[CRAWLER JOB] Crawled ${businesses.length} businesses`);

    if (businesses.length === 0) {
      console.log(`[CRAWLER JOB] No new businesses found`);
      return { status: 'no_results', count: 0, total: currentCount };
    }

    // Deduplicate against existing listings
    const existingNames = await k('listings')
      .where('active', true)
      .select('name')
      .then(rows => new Set(rows.map(r => r.name)));

    const newBusinesses = businesses.filter(b => !existingNames.has(b.name));
    console.log(`[CRAWLER JOB] ${newBusinesses.length} are new (after deduplication)`);

    if (newBusinesses.length === 0) {
      console.log(`[CRAWLER JOB] All crawled businesses already exist`);
      return { status: 'all_duplicates', count: 0, total: currentCount };
    }

    // Insert into database
    console.log(`[CRAWLER JOB] Inserting ${newBusinesses.length} new businesses...`);
    const inserted = await k('listings').insert(
      newBusinesses.map(b => ({
        type: b.type || 'product',
        region: b.region || 'Africa',
        country: b.country || 'Unknown',
        state: b.state || null,
        city: b.city || null,
        town: b.town || null,
        name: b.name,
        category: b.category || 'General Retail',
        products_services: b.category || null,
        description: `${b.category} in ${b.city}, ${b.country}`,
        phone: b.phone || null,
        email: b.email || null,
        website: b.website || null,
        instagram: b.instagram || null,
        latitude: b.latitude || null,
        longitude: b.longitude || null,
        rating: parseFloat(b.rating) || 0,
        review_count: parseInt(b.review_count) || 0,
        verified: true,
        featured: false,
        is_new: true,
        active: true,
        cover_photo: b.cover_photo || null,
        emoji: getEmojiForCategory(b.category),
        verified_source: 'Google Maps',
        verified_at: new Date(),
        verification_score: b.verification_score || 75,
        created_at: new Date(),
        updated_at: new Date()
      }))
    );

    const newCount = currentCount + inserted;
    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log(`[CRAWLER JOB] ✅ SUCCESS`);
    console.log(`[CRAWLER JOB] Inserted: ${inserted}`);
    console.log(`[CRAWLER JOB] New total: ${newCount}/1000`);
    console.log(`[CRAWLER JOB] Duration: ${duration}s`);

    return {
      status: 'success',
      inserted,
      total: newCount,
      target: 1000,
      progress: Math.round((newCount / 1000) * 100),
      duration
    };

  } catch (err) {
    console.error(`[CRAWLER JOB] ❌ ERROR:`, err.message);
    console.error(err.stack);

    return {
      status: 'error',
      error: err.message,
      duration: Math.round((Date.now() - startTime) / 1000)
    };
  }
}

/**
 * Get emoji for business category
 */
function getEmojiForCategory(category) {
  const emojis = {
    'Electronics': '⚡',
    'Fashion & Textiles': '👕',
    'Food & Groceries': '🛒',
    'Tourism': '✈️',
    'Accommodations': '🏨',
    'Technology & IT': '💻',
    'Agriculture': '🌾',
    'Medical': '🏥',
    'General Retail': '🏢'
  };
  return emojis[category] || '🏢';
}

module.exports = { crawlBusinessesJob };
