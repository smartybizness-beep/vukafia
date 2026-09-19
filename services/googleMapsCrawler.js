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
    const url = 'https://places.googleapis.com/v1/places:searchText';

    const payload = {
      textQuery: `${query} in ${location}`,
      languageCode: 'en',
      maxResultCount: 5
    };

    const response = await axios.post(url, payload, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'places.displayName,places.name,places.internationalPhoneNumber,places.websiteUri,places.formattedAddress,places.rating,places.userRatingCount,places.location'
      }
    });

    return response.data.places || [];
  } catch (err) {
    if (err.response) {
      console.error(`Error searching "${query}" in ${location}:`, err.response.status, err.response.data);
    } else {
      console.error(`Error searching "${query}" in ${location}:`, err.message);
    }
    return [];
  }
}

/**
 * Get place details (phone, website, etc)
 */
async function getPlaceDetails(placeName) {
  try {
    const url = `https://places.googleapis.com/v1/places/${placeName}`;

    const response = await axios.get(url, {
      params: {
        fields: 'name,internationalPhoneNumber,websiteUri,formattedAddress,rating,userRatingCount,businessStatus,location'
      },
      headers: {
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY
      }
    });

    return response.data || null;
  } catch (err) {
    console.error(`Error getting details for ${placeName}:`, err.message);
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
            // New Places API returns display name in different format
            const businessName = place.displayName?.text || place.name || null;

            if (!businessName) {
              skipped++;
              continue;
            }

            const city_name = extractCity(place.formattedAddress || businessName);
            const category = CATEGORY_MAP[query.toLowerCase()] || 'General Retail';

            businesses.push({
              name: businessName,
              phone: place.internationalPhoneNumber || null,
              website: place.websiteUri || null,
              address: place.formattedAddress || businessName,
              city: city_name,
              country,
              region: getRegion(country),
              category,
              type: determineType(query),
              rating: place.rating || 0,
              review_count: place.userRatingCount || 0,
              latitude: place.location?.latitude || null,
              longitude: place.location?.longitude || null,
              verified_source: 'Google Maps',
              verified_at: new Date(),
              verification_score: calculateScore(place)
            });

            total++;
            console.log(`      ✅ ${businessName} (${place.rating || 'N/A'} stars)`);

            // Rate limiting
            await sleep(200);
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
