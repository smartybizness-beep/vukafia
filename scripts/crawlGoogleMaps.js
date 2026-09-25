#!/usr/bin/env node

/**
 * scripts/crawlGoogleMaps.js
 * Import REAL businesses from Google Maps
 *
 * Usage: npm run crawl:google-maps
 */

'use strict';

require('dotenv').config();

const db = require('../db');
const { crawlGoogleMaps } = require('../services/googleMapsCrawler');

async function main() {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.error('❌ GOOGLE_MAPS_API_KEY not set in .env');
      console.error('See SETUP_GOOGLE_MAPS.md for instructions');
      process.exit(1);
    }

    console.log('🌍 Vukafia Google Maps Business Crawler\n');
    console.log('Initializing database...');
    const k = await db.init();

    console.log('🌐 Crawling Google Maps for real African businesses...\n');
    const businesses = await crawlGoogleMaps();

    if (businesses.length === 0) {
      console.log('\n❌ No businesses found. Check your API key.');
      process.exit(1);
    }

    console.log('\n💾 Saving to database...');
    let saved = 0;
    let duplicates = 0;

    for (const biz of businesses) {
      try {
        // Check if already exists (by name + country)
        const existing = await k('listings')
          .where('name', biz.name)
          .where('country', biz.country)
          .first();

        if (existing) {
          // Update existing record with new photo and Instagram handle
          await k('listings')
            .where('id', existing.id)
            .update({
              cover_photo: getPhotoForCategory(biz.category),
              instagram: biz.instagram,
              website: biz.website
            });
          duplicates++;
          continue;
        }

        await k('listings').insert({
          user_id: null, // Unclaimed - ready for business owner to claim
          type: biz.type,
          region: biz.region,
          country: biz.country,
          state: biz.city, // Use city as state
          city: biz.city,
          name: biz.name,
          category: biz.category,
          products_services: biz.category, // Will be updated by owner
          description: `${biz.category} in ${biz.city}, ${biz.country}`,
          phone: biz.phone,
          website: biz.website,
          instagram: biz.instagram,
          rating: parseFloat(biz.rating) || 0,
          review_count: biz.review_count || 0,
          verified: true, // Google Maps verified
          featured: biz.review_count > 100, // High review count = featured
          cover_photo: getPhotoForCategory(biz.category),
          emoji: generateEmoji(biz.category),
          latitude: biz.latitude,
          longitude: biz.longitude,
          is_new: false,
          active: true,
          verified_source: 'Google Maps',
          verified_at: biz.verified_at
        });
        saved++;
      } catch (err) {
        console.error(`⚠️  Failed to save ${biz.name}:`, err.message);
      }
    }

    console.log(`\n✅ Saved ${saved} new businesses`);
    console.log(`⏭️  Skipped ${duplicates} duplicates`);

    // Show summary
    const total = await k('listings').count('id as count').first();
    console.log(`\n📊 Total listings in database: ${total.count}`);

    const byCountry = await k('listings')
      .select('country')
      .count('id as count')
      .where('verified_source', 'Google Maps')
      .groupBy('country')
      .orderBy('count', 'desc');

    console.log('\n🗺️  Real businesses by country (from Google Maps):');
    for (const row of byCountry) {
      console.log(`  ${row.country}: ${row.count}`);
    }

    const sources = await k('listings')
      .select('verified_source')
      .count('id as count')
      .groupBy('verified_source');

    console.log('\n📋 All listings by source:');
    for (const row of sources) {
      const source = row.verified_source || 'Generated';
      console.log(`  ${source}: ${row.count}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Crawler failed:', err.message || err);
    console.error(err.stack);
    process.exit(1);
  }
}

function generateCoverPhoto(category) {
  const photos = {
    'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=75',
    'Fashion & Textiles': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&q=75',
    'Food & Groceries': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&q=75',
    'Tourism': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&q=75',
    'Technology & IT': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=75',
    'Agriculture': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&q=75'
  };
  return photos[category] || 'https://images.unsplash.com/photo-1553729783-c91953dec042?w=500&q=75';
}

function generateEmoji(category) {
  const emojis = {
    'Electronics': '⚡',
    'Fashion & Textiles': '👗',
    'Food & Groceries': '🍕',
    'Tourism': '🏨',
    'Technology & IT': '💻',
    'Agriculture': '🌾',
    'General Retail': '🏪'
  };
  return emojis[category] || '🏢';
}

main();
