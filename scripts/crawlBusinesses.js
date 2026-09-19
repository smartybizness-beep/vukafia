#!/usr/bin/env node

/**
 * scripts/crawlBusinesses.js
 * Crawl real African businesses and seed the database
 *
 * Usage: node scripts/crawlBusinesses.js
 */

'use strict';

require('dotenv').config();

const db = require('../db');
const { generateBusinesses, enrichBusiness } = require('../services/businessCrawler');

async function main() {
  try {
    console.log('🌍 Vukafia Business Crawler\n');
    console.log('Initializing database...');
    const k = await db.init();

    console.log('✨ Generating real African businesses...');
    let businesses = await generateBusinesses();
    console.log(`Generated ${businesses.length} businesses`);

    if (businesses.length === 0) {
      console.log('⚠️  Claude API returned no businesses. Checking API key...');
      if (!process.env.ANTHROPIC_API_KEY) {
        console.log('❌ ANTHROPIC_API_KEY not set in .env');
      }
      console.log('\n');
    }

    console.log('📸 Enriching businesses with details...');
    const enriched = [];
    for (const biz of businesses) {
      const enrichedBiz = await enrichBusiness(biz);
      enriched.push(enrichedBiz);
      process.stdout.write('.');
    }
    console.log('\n');

    console.log('💾 Saving to database...');
    let saved = 0;
    for (const biz of enriched) {
      try {
        // Check if business already exists (by name + country)
        const existing = await k('listings')
          .where('name', biz.name)
          .where('country', biz.country)
          .first();

        if (!existing) {
          await k('listings').insert({
            user_id: null, // Leave unclaimed for business owners to claim
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
            is_new: false, // Seed data is historical
            active: true,
          });
          saved++;
        }
      } catch (err) {
        console.error(`Failed to save ${biz.name}:`, err.message);
      }
    }

    console.log(`\n✅ Saved ${saved} new businesses to the database`);

    // Show summary
    const total = await k('listings').count('id as count').first();
    console.log(`\n📊 Total listings: ${total.count}`);

    const byCountry = await k('listings')
      .select('country')
      .count('id as count')
      .groupBy('country')
      .orderBy('count', 'desc');

    console.log('\n🗺️  Businesses by country:');
    for (const row of byCountry) {
      console.log(`  ${row.country}: ${row.count}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Crawler failed:', err);
    process.exit(1);
  }
}

main();
