/**
 * jobs/crawlBusinessesJob.js
 * Background job to crawl and expand business listings up to TARGET_LISTINGS
 *
 * Runs during quiet hours (2-6 AM UTC) to avoid impacting user traffic
 */

'use strict';

const db = require('../db');
const { crawlGoogleMaps } = require('../services/googleMapsCrawler');

const TARGET_LISTINGS = 10000;

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

    // Stop crawling once the target is reached
    if (currentCount >= TARGET_LISTINGS) {
      console.log(`[CRAWLER JOB] Target reached (${currentCount}/${TARGET_LISTINGS}). Skipping crawl.`);
      return { status: 'completed', message: 'Target already reached', count: currentCount };
    }

    // Calculate how many more we need
    const needed = TARGET_LISTINGS - currentCount;
    console.log(`[CRAWLER JOB] Need ${needed} more businesses to reach ${TARGET_LISTINGS}`);

    // crawlGoogleMaps saves (inserts new, updates existing) and returns a summary
    console.log(`[CRAWLER JOB] Starting Google Maps crawl...`);
    const { total: crawled, saveResult } = await crawlGoogleMaps();
    if (saveResult.error) throw new Error(`Saving businesses failed: ${saveResult.error}`);

    const after = await k('listings').where('active', true).count('* as count').first();
    const newCount = parseInt(after.count);
    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log(`[CRAWLER JOB] ✅ Crawled ${crawled}: ${saveResult.inserted} new, ${saveResult.updated} updated, ${saveResult.failed} failed`);
    console.log(`[CRAWLER JOB] New total: ${newCount}/${TARGET_LISTINGS}, duration ${duration}s`);

    return {
      status: 'success',
      crawled,
      inserted: saveResult.inserted,
      updated: saveResult.updated,
      failed: saveResult.failed,
      total: newCount,
      target: TARGET_LISTINGS,
      progress: Math.round((newCount / TARGET_LISTINGS) * 100),
      duration
    };

  } catch (err) {
    console.error(`[CRAWLER JOB] ❌ ERROR:`, err.message);
    console.error(err.stack);

    throw err;
  }
}

module.exports = { crawlBusinessesJob };
