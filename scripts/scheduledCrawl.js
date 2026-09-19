#!/usr/bin/env node

/**
 * scripts/scheduledCrawl.js
 * Scheduled crawler for nightly business discovery
 *
 * Usage (cron):
 *   0 2 * * * cd /app && node scripts/scheduledCrawl.js
 *
 * Usage (Railway):
 *   Set CRON schedule in Railway dashboard
 *   Command: node scripts/scheduledCrawl.js
 */

'use strict';

require('dotenv').config();

const db = require('../db');
const { generateBusinesses, enrichBusiness } = require('../services/businessCrawler');
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');

async function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

async function log(message) {
  const timestamp = new Date().toISOString();
  const logFile = path.join(LOG_DIR, `crawler-${new Date().toISOString().split('T')[0]}.log`);
  const logLine = `[${timestamp}] ${message}\n`;
  fs.appendFileSync(logFile, logLine);
  console.log(logLine);
}

async function main() {
  try {
    await ensureLogDir();
    await log('🌙 Starting nightly business crawler...');

    const k = await db.init();

    // Get current business count
    const before = await k('listings').count('id as count').first();
    await log(`📊 Current listings: ${before.count}`);

    // Check if we've crawled recently (within last 6 hours)
    const recentCrawl = await k('listings')
      .max('created_at as last_created')
      .first();

    const lastCreated = new Date(recentCrawl.last_created || 0);
    const timeSinceLastCrawl = (Date.now() - lastCreated.getTime()) / (1000 * 60 * 60);

    if (timeSinceLastCrawl < 6) {
      await log(`⏭️  Skipped: crawled ${Math.round(timeSinceLastCrawl)} hours ago`);
      process.exit(0);
    }

    // Generate businesses
    await log('✨ Generating businesses...');
    let businesses = await generateBusinesses();
    await log(`Generated ${businesses.length} businesses`);

    // Enrich each business
    await log('📸 Enriching businesses...');
    const enriched = [];
    for (const biz of businesses) {
      const enrichedBiz = await enrichBusiness(biz);
      enriched.push(enrichedBiz);
    }

    // Save to database
    await log('💾 Saving to database...');
    let saved = 0;
    let skipped = 0;

    for (const biz of enriched) {
      try {
        const existing = await k('listings')
          .where('name', biz.name)
          .where('country', biz.country)
          .first();

        if (!existing) {
          await k('listings').insert({
            user_id: 1,
            type: biz.type,
            region: biz.region,
            country: biz.country,
            state: biz.state,
            city: biz.city,
            name: biz.name,
            category: biz.category,
            products_services: biz.products_services,
            description: biz.description,
            phone: biz.phone,
            website: biz.website,
            instagram: biz.instagram,
            rating: parseFloat(biz.rating),
            review_count: biz.review_count,
            verified: biz.verified,
            featured: biz.featured,
            cover_photo: biz.cover_photo,
            emoji: biz.emoji,
            is_new: false,
            active: true,
          });
          saved++;
        } else {
          skipped++;
        }
      } catch (err) {
        await log(`⚠️  Failed to save ${biz.name}: ${err.message}`);
      }
    }

    // Final summary
    const after = await k('listings').count('id as count').first();
    await log(`\n✅ Crawler completed`);
    await log(`  Saved: ${saved}`);
    await log(`  Skipped (duplicates): ${skipped}`);
    await log(`  Total listings: ${before.count} → ${after.count}`);

    process.exit(0);
  } catch (err) {
    await ensureLogDir();
    const timestamp = new Date().toISOString();
    const logFile = path.join(LOG_DIR, `crawler-${new Date().toISOString().split('T')[0]}.log`);
    const logLine = `[${timestamp}] ❌ ERROR: ${err.message}\n${err.stack}\n`;
    fs.appendFileSync(logFile, logLine);
    console.error(logLine);
    process.exit(1);
  }
}

main();
