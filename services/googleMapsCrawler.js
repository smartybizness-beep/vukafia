/**
 * services/googleMapsCrawler.js
 * Crawl REAL African businesses from Google Maps API
 *
 * This replaces generated data with verified real businesses
 */

'use strict';

const axios = require('axios');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Agricultural products, commodities, minerals & services by country
// Target specific B2B products for cross-border trade under AfCFTA
const PRODUCTS_AND_SERVICES = {
  'Nigeria': {
    'Lagos': ['cocoa exporter', 'cashew supplier', 'shea butter producer', 'textile manufacturer', 'cement producer', 'fintech startup', 'fashion designer', 'beauty cosmetics', 'pharmaceutical company', 'oil and gas'],
    'Abuja': ['agriculture cooperative', 'food processor', 'spice producer', 'tech company', 'logistics company', 'payment processor']
  },
  'Ghana': {
    'Accra': ['cocoa exporter', 'gold mining', 'shea butter processor', 'textile manufacturer', 'food processor', 'tourism', 'tech startup', 'fintech'],
    'Kumasi': ['cocoa buying station', 'artisan crafts', 'agriculture cooperative', 'food processing']
  },
  'Côte d\'Ivoire': {
    'Abidjan': ['cocoa exporter', 'cashew processor', 'agricultural cooperative', 'food processor', 'textile company', 'shipping and logistics']
  },
  'Kenya': {
    'Nairobi': ['coffee exporter', 'cut flower supplier', 'tech startup', 'fintech', 'logistics company', 'fashion designer', 'tourism agency', 'agri-tech', 'telecom', 'pharmaceutical'],
    'Mombasa': ['coffee exporter', 'spice trader', 'shipping port', 'tourism']
  },
  'Ethiopia': {
    'Addis Ababa': ['coffee exporter', 'cut flower supplier', 'textile manufacturer', 'pharmaceutical company', 'leather goods', 'tech startup']
  },
  'Uganda': {
    'Kampala': ['coffee exporter', 'agricultural cooperative', 'tech startup', 'fintech', 'textile company', 'food processor']
  },
  'Tanzania': {
    'Dar es Salaam': ['coffee exporter', 'tea producer', 'cashew processor', 'mining company', 'logistics', 'tourism agency', 'fintech']
  },
  'Rwanda': {
    'Kigali': ['coffee exporter', 'tea producer', 'tech startup', 'fintech', 'pharmaceutical', 'tourism']
  },
  'Egypt': {
    'Cairo': ['cotton exporter', 'date exporter', 'citrus exporter', 'pharmaceutical company', 'textile manufacturer', 'cement producer', 'fintech', 'tourism']
  },
  'Morocco': {
    'Casablanca': ['phosphate exporter', 'leather goods', 'argan oil producer', 'textile manufacturer', 'car assembly', 'fintech', 'tourism']
  },
  'South Africa': {
    'Johannesburg': ['gold mining', 'diamond mining', 'platinum mining', 'car assembly', 'pharmaceutical company', 'textile manufacturer', 'fintech', 'logistics']
  },
  'Botswana': {
    'Gaborone': ['diamond mining', 'beef exporter', 'tourism agency']
  },
  'DRC': {
    'Kinshasa': ['copper mining', 'cobalt mining', 'timber exporter', 'agricultural cooperative']
  },
  'Zambia': {
    'Lusaka': ['copper mining', 'cobalt mining', 'agriculture', 'food processor']
  },
  'Madagascar': {
    'Antananarivo': ['vanilla exporter', 'spice trader', 'textile company', 'mining']
  }
};

// Category mapping for Vukafia - now focused on B2B commodities & services
const CATEGORY_MAP = {
  // Agricultural Products & Commodities
  'cocoa exporter': 'Agricultural Products',
  'cocoa buying station': 'Agricultural Products',
  'coffee exporter': 'Agricultural Products',
  'tea producer': 'Agricultural Products',
  'cashew supplier': 'Agricultural Products',
  'cashew processor': 'Agricultural Products',
  'shea butter producer': 'Agricultural Products',
  'shea butter processor': 'Agricultural Products',
  'spice producer': 'Agricultural Products',
  'spice trader': 'Agricultural Products',
  'vanilla exporter': 'Agricultural Products',
  'date exporter': 'Agricultural Products',
  'citrus exporter': 'Agricultural Products',
  'cut flower supplier': 'Agricultural Products',
  'beef exporter': 'Agricultural Products',
  'agriculture cooperative': 'Agricultural Products',
  'agricultural cooperative': 'Agricultural Products',
  'agri-tech': 'Agricultural Products',

  // Minerals & Mining
  'gold mining': 'Minerals & Mining',
  'diamond mining': 'Minerals & Mining',
  'copper mining': 'Minerals & Mining',
  'cobalt mining': 'Minerals & Mining',
  'platinum mining': 'Minerals & Mining',
  'phosphate exporter': 'Minerals & Mining',
  'mining company': 'Minerals & Mining',
  'oil and gas': 'Minerals & Mining',

  // Manufacturing
  'textile manufacturer': 'Manufacturing',
  'textile company': 'Manufacturing',
  'cement producer': 'Manufacturing',
  'food processor': 'Manufacturing',
  'fashion designer': 'Manufacturing',
  'leather goods': 'Manufacturing',
  'pharmaceutical company': 'Manufacturing',
  'pharmaceutical': 'Manufacturing',
  'car assembly': 'Manufacturing',

  // Services
  'fintech startup': 'Services',
  'fintech': 'Services',
  'payment processor': 'Services',
  'tech startup': 'Services',
  'tech company': 'Services',
  'logistics company': 'Services',
  'logistics': 'Services',
  'shipping and logistics': 'Services',
  'telecom': 'Services',
  'tourism agency': 'Services',
  'tourism': 'Services',
  'restaurant': 'Restaurant',
  'cafe': 'Restaurant',

  // Fallbacks
  'shop': 'General Retail',
  'store': 'General Retail',
  'beauty cosmetics': 'Beauty & Personal Care',
  'argan oil producer': 'Beauty & Personal Care',
  'hotel': 'Accommodations',
  'guest house': 'Accommodations',
  'shipping port': 'Services'
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
        'X-Goog-FieldMask': 'places.displayName,places.name,places.internationalPhoneNumber,places.websiteUri,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.photos'
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
  const q = query.toLowerCase();

  // Services
  const serviceKeywords = ['exporter', 'tech', 'fintech', 'logistics', 'startup', 'processor', 'producer', 'company', 'supplier', 'agency', 'cooperative'];
  if (serviceKeywords.some(kw => q.includes(kw))) {
    return 'service';
  }

  // Products
  return 'product';
}

/**
 * Get region from country
 */
function getRegion(country) {
  const regionMap = {
    'Nigeria': 'West Africa',
    'Ghana': 'West Africa',
    'Côte d\'Ivoire': 'West Africa',
    'Cameroon': 'West Africa',
    'Senegal': 'West Africa',
    'Kenya': 'East Africa',
    'Tanzania': 'East Africa',
    'Uganda': 'East Africa',
    'Rwanda': 'East Africa',
    'Ethiopia': 'East Africa',
    'Egypt': 'North Africa',
    'Morocco': 'North Africa',
    'Algeria': 'North Africa',
    'South Africa': 'Southern Africa',
    'Botswana': 'Southern Africa',
    'Zambia': 'Southern Africa',
    'DRC': 'Central Africa',
    'Madagascar': 'East Africa'
  };
  return regionMap[country] || 'Africa';
}

/**
 * Crawl Google Maps for B2B commodities and services across Africa
 */
async function crawlGoogleMaps() {
  const businesses = [];
  let total = 0;
  let skipped = 0;

  console.log('🌐 Crawling African B2B commodities & services from Google Maps...\n');

  for (const [country, cities] of Object.entries(PRODUCTS_AND_SERVICES)) {
    console.log(`🇳🇬 ${country}:`);

    for (const [city, queries] of Object.entries(cities)) {
      console.log(`  📍 ${city}:`);

      // Search top 2-3 products per city
      const queriesToSearch = queries.slice(0, 3);

      for (const query of queriesToSearch) {
        console.log(`    Searching: "${query}" in ${city}...`);
        const places = await searchPlaces(query, city);

        if (places.length === 0) {
          console.log(`      No results`);
          await sleep(500);
          continue;
        }

        for (const place of places.slice(0, 3)) {
          const businessName = place.displayName?.text || place.name || null;
          if (!businessName) {
            skipped++;
            continue;
          }

          const city_name = extractCity(place.formattedAddress || businessName);
          const category = CATEGORY_MAP[query.toLowerCase()] || 'General Retail';

          let coverPhoto = generateCoverPhoto(category);
          if (place.photos && place.photos.length > 0) {
            const photo = place.photos[0];
            if (photo.name) {
              coverPhoto = `https://places.googleapis.com/v1/${photo.name}/media?key=${GOOGLE_MAPS_API_KEY}&maxHeightPx=500`;
            }
          }

          let instagramHandle = null;
          if (place.websiteUri) {
            const instagramMatch = place.websiteUri.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
            if (instagramMatch) {
              instagramHandle = `@${instagramMatch[1]}`;
            }
          }

          businesses.push({
            name: businessName,
            phone: place.internationalPhoneNumber || null,
            website: place.websiteUri || null,
            instagram: instagramHandle,
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
            cover_photo: coverPhoto,
            verified_source: 'Google Maps',
            verified_at: new Date(),
            verification_score: calculateScore(place)
          });

          total++;
          console.log(`      ✅ ${businessName}`);
          await sleep(200);
        }
      }
      await sleep(500);
    }
  }

  console.log(`\n✅ Crawl complete! Found: ${total} businesses, Skipped: ${skipped}`);
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

/**
 * Generate fallback cover photo by category
 */
function generateCoverPhoto(category) {
  const photos = {
    'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=75',
    'Fashion & Textiles': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&q=75',
    'Food & Groceries': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&q=75',
    'Tourism': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&q=75',
    'Accommodations': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&q=75',
    'Technology & IT': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=75',
    'Agriculture': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&q=75',
    'Medical': 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=500&q=75'
  };
  return photos[category] || 'https://images.unsplash.com/photo-1553729783-c91953dec042?w=500&q=75';
}

module.exports = { crawlGoogleMaps };
