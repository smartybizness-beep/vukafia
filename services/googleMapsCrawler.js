/**
 * services/googleMapsCrawler.js
 * Crawl REAL African businesses from Google Maps API
 *
 * This replaces generated data with verified real businesses
 */

'use strict';

const axios = require('axios');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Map of African countries to major cities and search queries
const REGIONS = {
  'West Africa': {
    'Nigeria': {
      cities: ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan'],
      queries: [
        'electronics store',
        'fashion boutique',
        'grocery store',
        'restaurant',
        'tech company',
        'agriculture supplier',
        'beauty salon',
        'phone repair'
      ]
    },
    'Ghana': {
      cities: ['Accra', 'Kumasi', 'Sekondi-Takoradi'],
      queries: ['electronics store', 'restaurant', 'hotel', 'shop', 'supermarket']
    },
    'Côte d\'Ivoire': {
      cities: ['Abidjan', 'Yamoussoukro'],
      queries: ['electronics', 'restaurant', 'hotel']
    }
  },
  'East Africa': {
    'Kenya': {
      cities: ['Nairobi', 'Mombasa', 'Kisumu'],
      queries: ['electronics store', 'restaurant', 'hotel', 'shop', 'tech startup']
    },
    'Tanzania': {
      cities: ['Dar es Salaam', 'Dodoma'],
      queries: ['restaurant', 'hotel', 'shop', 'electronics']
    },
    'Uganda': {
      cities: ['Kampala', 'Gulu'],
      queries: ['restaurant', 'hotel', 'shop', 'tech company']
    }
  },
  'North Africa': {
    'Egypt': {
      cities: ['Cairo', 'Alexandria', 'Giza'],
      queries: ['electronics store', 'restaurant', 'hotel', 'shop']
    },
    'Morocco': {
      cities: ['Casablanca', 'Fez', 'Marrakech'],
      queries: ['restaurant', 'hotel', 'shop', 'electronics']
    }
  }
};

// Category mapping for Vukafia
const CATEGORY_MAP = {
  'electronics store': 'Electronics',
  'electronics repair': 'Electronics',
  'fashion boutique': 'Fashion & Textiles',
  'clothing store': 'Fashion & Textiles',
  'grocery store': 'Food & Groceries',
  'supermarket': 'Food & Groceries',
  'restaurant': 'Food & Groceries',
  'cafe': 'Food & Groceries',
  'hotel': 'Tourism',
  'guest house': 'Tourism',
  'tech company': 'Technology & IT',
  'tech startup': 'Technology & IT',
  'agriculture supplier': 'Agriculture',
  'farm': 'Agriculture',
  'beauty salon': 'Fashion & Textiles',
  'shop': 'General Retail',
  'store': 'General Retail',
  'phone repair': 'Technology & IT'
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Search for businesses on Google Maps
 */
async function searchPlaces(query, location) {
  try {
    const url = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

    const response = await axios.get(url, {
      params: {
        query: `${query} in ${location}`,
        key: GOOGLE_MAPS_API_KEY,
        language: 'en'
      }
    });

    return response.data.results || [];
  } catch (err) {
    console.error(`Error searching "${query}" in ${location}:`, err.message);
    return [];
  }
}

/**
 * Get place details (phone, website, etc)
 */
async function getPlaceDetails(placeId) {
  try {
    const url = 'https://maps.googleapis.com/maps/api/place/details/json';

    const response = await axios.get(url, {
      params: {
        place_id: placeId,
        fields: 'name,formatted_phone_number,website,formatted_address,rating,user_ratings_total,business_status,geometry',
        key: GOOGLE_MAPS_API_KEY,
        language: 'en'
      }
    });

    return response.data.result || null;
  } catch (err) {
    console.error(`Error getting details for ${placeId}:`, err.message);
    return null;
  }
}

/**
 * Extract city from address
 */
function extractCity(address) {
  // "123 Main St, Lagos, Lagos State, Nigeria"
  const parts = address.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    return parts[parts.length - 3] || parts[0]; // Usually second-to-last
  }
  return 'Unknown';
}

/**
 * Determine business type (product vs service)
 */
function determineType(query) {
  const serviceQueries = ['restaurant', 'cafe', 'hotel', 'salon', 'repair', 'tech company'];
  return serviceQueries.some(q => query.toLowerCase().includes(q)) ? 'service' : 'product';
}

/**
 * Get region from country
 */
function getRegion(country) {
  for (const [region, countries] of Object.entries(REGIONS)) {
    if (Object.keys(countries).includes(country)) {
      return region;
    }
  }
  return 'Africa';
}

/**
 * Crawl Google Maps for all regions
 */
async function crawlGoogleMaps() {
  const businesses = [];
  let total = 0;
  let skipped = 0;

  console.log('🌐 Starting Google Maps crawl...\n');

  for (const [region, countries] of Object.entries(REGIONS)) {
    console.log(`📍 ${region}:`);

    for (const [country, data] of Object.entries(countries)) {
      console.log(`  🇳🇬 ${country}:`);

      // Pick 1-2 cities to keep requests reasonable
      const citiesToSearch = data.cities.slice(0, 2);

      for (const city of citiesToSearch) {
        // Only search 2-3 top categories per city to stay within free tier
        const queriesToSearch = data.queries.slice(0, 3);

        for (const query of queriesToSearch) {
          console.log(`    Searching: "${query}" in ${city}...`);

          const places = await searchPlaces(query, city);

          if (places.length === 0) {
            console.log(`      No results`);
            await sleep(500); // Rate limit
            continue;
          }

          // Get details for top 3 results
          for (const place of places.slice(0, 3)) {
            const details = await getPlaceDetails(place.place_id);

            if (!details || details.business_status !== 'OPERATIONAL') {
              skipped++;
              await sleep(200);
              continue;
            }

            const city_name = extractCity(details.formatted_address);
            const category = CATEGORY_MAP[query.toLowerCase()] || 'General Retail';

            businesses.push({
              name: details.name,
              phone: details.formatted_phone_number || null,
              website: details.website || null,
              address: details.formatted_address,
              city: city_name,
              country,
              region: getRegion(country),
              category,
              type: determineType(query),
              rating: details.rating || 0,
              review_count: details.user_ratings_total || 0,
              latitude: details.geometry?.location?.lat || null,
              longitude: details.geometry?.location?.lng || null,
              verified_source: 'Google Maps',
              verified_at: new Date(),
              verification_score: calculateScore(details)
            });

            total++;
            console.log(`      ✅ ${details.name} (${details.rating || 'N/A'} stars)`);

            // Rate limiting: Google allows 50 requests/sec, we'll be conservative
            await sleep(300);
          }
        }

        await sleep(500);
      }

      console.log();
    }
  }

  console.log(`\n✅ Crawl complete!`);
  console.log(`📊 Found: ${total} businesses`);
  console.log(`⏭️  Skipped: ${skipped} (closed/inactive)`);

  return businesses;
}

/**
 * Calculate verification score based on data quality
 */
function calculateScore(place) {
  let score = 80; // Start with Google Maps = 80 base

  if (place.user_ratings_total > 50) score += 10;
  if (place.user_ratings_total > 200) score += 5;
  if (place.rating >= 4.5) score += 5;
  if (place.website) score += 5;

  return Math.min(score, 100);
}

module.exports = { crawlGoogleMaps };
