/**
 * services/googleMapsCrawler.js
 * Crawl REAL African businesses from Google Maps API
 *
 * This replaces generated data with verified real businesses
 */

'use strict';

const axios = require('axios');
const db = require('../db');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Country names for the original 15 countries must stay as-is: existing listings are deduped by name + country + city.
const REGIONS = {
  'West Africa': {
    'Nigeria': ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan'],
    'Ghana': ['Accra', 'Kumasi', 'Tema', 'Takoradi'],
    'Côte d\'Ivoire': ['Abidjan', 'San-Pédro', 'Bouaké'],
    'Senegal': ['Dakar', 'Thiès'],
    'Benin': ['Cotonou', 'Porto-Novo'],
    'Togo': ['Lomé'],
    'Burkina Faso': ['Ouagadougou', 'Bobo-Dioulasso'],
    'Mali': ['Bamako'],
    'Niger': ['Niamey'],
    'Guinea': ['Conakry'],
    'Guinea-Bissau': ['Bissau'],
    'Sierra Leone': ['Freetown'],
    'Liberia': ['Monrovia'],
    'Gambia': ['Banjul', 'Serrekunda'],
    'Cape Verde': ['Praia'],
    'Mauritania': ['Nouakchott'],
  },
  'Central Africa': {
    'Cameroon': ['Douala', 'Yaoundé'],
    'DRC': ['Kinshasa', 'Lubumbashi'],
    'Republic of the Congo': ['Brazzaville', 'Pointe-Noire'],
    'Gabon': ['Libreville'],
    'Equatorial Guinea': ['Malabo'],
    'Chad': ['N\'Djamena'],
    'Central African Republic': ['Bangui'],
    'São Tomé and Príncipe': ['São Tomé'],
  },
  'East Africa': {
    'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'],
    'Tanzania': ['Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza'],
    'Uganda': ['Kampala', 'Entebbe'],
    'Rwanda': ['Kigali'],
    'Burundi': ['Bujumbura'],
    'Ethiopia': ['Addis Ababa', 'Dire Dawa'],
    'Somalia': ['Mogadishu', 'Hargeisa'],
    'Djibouti': ['Djibouti'],
    'Eritrea': ['Asmara'],
    'South Sudan': ['Juba'],
    'Sudan': ['Khartoum', 'Port Sudan'],
    'Madagascar': ['Antananarivo', 'Toamasina'],
    'Mauritius': ['Port Louis'],
    'Seychelles': ['Victoria'],
    'Comoros': ['Moroni'],
  },
  'North Africa': {
    'Egypt': ['Cairo', 'Alexandria', 'Giza'],
    'Morocco': ['Casablanca', 'Rabat', 'Marrakech', 'Tangier'],
    'Algeria': ['Algiers', 'Oran'],
    'Tunisia': ['Tunis', 'Sfax'],
    'Libya': ['Tripoli', 'Benghazi'],
  },
  'Southern Africa': {
    'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'],
    'Botswana': ['Gaborone', 'Francistown'],
    'Zambia': ['Lusaka', 'Kitwe'],
    'Zimbabwe': ['Harare', 'Bulawayo'],
    'Mozambique': ['Maputo', 'Beira'],
    'Angola': ['Luanda'],
    'Namibia': ['Windhoek', 'Walvis Bay'],
    'Malawi': ['Lilongwe', 'Blantyre'],
    'Lesotho': ['Maseru'],
    'Eswatini': ['Mbabane', 'Manzini'],
  },
};

// Searched in every city
const COMMON_QUERIES = [
  'hospital', 'clinic', 'pharmacy', 'hotel', 'restaurant', 'supermarket',
  'logistics company', 'freight forwarder', 'construction company',
  'real estate agency', 'tech company', 'fashion designer',
];

// Each country's key export and industry searches, added to every city in that country
const COUNTRY_SPECIALTIES = {
  'Nigeria': ['cocoa exporter', 'cashew supplier', 'shea butter producer', 'textile manufacturer', 'cement producer', 'fintech', 'oil and gas', 'pharmaceutical company', 'beauty cosmetics', 'spice producer', 'payment processor'],
  'Ghana': ['cocoa exporter', 'gold mining', 'shea butter processor', 'textile manufacturer', 'food processor', 'fintech', 'artisan crafts'],
  'Côte d\'Ivoire': ['cocoa exporter', 'cashew processor', 'agricultural cooperative', 'textile company', 'shipping and logistics'],
  'Senegal': ['fish exporter', 'groundnut exporter', 'fintech'],
  'Benin': ['cotton exporter', 'cashew processor'],
  'Togo': ['phosphate exporter', 'shipping and logistics'],
  'Burkina Faso': ['cotton exporter', 'gold mining', 'shea butter producer'],
  'Mali': ['gold mining', 'cotton exporter'],
  'Niger': ['mining company', 'livestock exporter'],
  'Guinea': ['bauxite mining'],
  'Guinea-Bissau': ['cashew processor'],
  'Sierra Leone': ['diamond mining'],
  'Liberia': ['rubber exporter'],
  'Gambia': ['groundnut exporter', 'tourism agency'],
  'Cape Verde': ['fish exporter', 'tourism agency'],
  'Mauritania': ['fish exporter', 'iron ore mining'],
  'Cameroon': ['cocoa exporter', 'coffee exporter', 'timber exporter'],
  'DRC': ['copper mining', 'cobalt mining', 'timber exporter', 'agricultural cooperative'],
  'Republic of the Congo': ['timber exporter', 'oil and gas'],
  'Gabon': ['timber exporter', 'manganese mining'],
  'Equatorial Guinea': ['oil and gas'],
  'Chad': ['oil and gas', 'livestock exporter'],
  'Central African Republic': ['timber exporter', 'diamond mining'],
  'São Tomé and Príncipe': ['cocoa exporter'],
  'Kenya': ['coffee exporter', 'cut flower supplier', 'tea producer', 'fintech', 'agri-tech', 'telecom', 'tourism agency', 'pharmaceutical'],
  'Tanzania': ['coffee exporter', 'cashew processor', 'tea producer', 'mining company', 'tourism agency', 'fintech'],
  'Uganda': ['coffee exporter', 'agricultural cooperative', 'fintech', 'food processor'],
  'Rwanda': ['coffee exporter', 'tea producer', 'fintech', 'tourism agency'],
  'Burundi': ['coffee exporter', 'tea producer'],
  'Ethiopia': ['coffee exporter', 'cut flower supplier', 'leather goods', 'textile manufacturer', 'pharmaceutical company'],
  'Somalia': ['livestock exporter'],
  'Djibouti': ['shipping and logistics'],
  'Eritrea': ['mining company'],
  'South Sudan': ['oil and gas'],
  'Sudan': ['gum arabic exporter', 'livestock exporter'],
  'Madagascar': ['vanilla exporter', 'spice trader', 'textile company'],
  'Mauritius': ['textile manufacturer', 'sugar producer', 'fintech'],
  'Seychelles': ['fish exporter', 'tourism agency'],
  'Comoros': ['vanilla exporter'],
  'Egypt': ['cotton exporter', 'date exporter', 'citrus exporter', 'pharmaceutical company', 'textile manufacturer', 'cement producer', 'fintech'],
  'Morocco': ['phosphate exporter', 'argan oil producer', 'leather goods', 'car assembly', 'textile manufacturer', 'fintech'],
  'Algeria': ['oil and gas', 'date exporter'],
  'Tunisia': ['olive oil exporter', 'date exporter', 'textile manufacturer'],
  'Libya': ['oil and gas'],
  'South Africa': ['gold mining', 'platinum mining', 'car assembly', 'wine exporter', 'fintech', 'pharmaceutical company'],
  'Botswana': ['diamond mining', 'beef exporter', 'tourism agency'],
  'Zambia': ['copper mining', 'cobalt mining', 'agricultural cooperative'],
  'Zimbabwe': ['tobacco exporter', 'gold mining'],
  'Mozambique': ['cashew processor', 'coal mining'],
  'Angola': ['oil and gas', 'diamond mining'],
  'Namibia': ['diamond mining', 'fish exporter', 'uranium mining'],
  'Malawi': ['tobacco exporter', 'tea producer'],
  'Lesotho': ['textile manufacturer', 'diamond mining'],
  'Eswatini': ['sugar producer', 'textile manufacturer'],
};

const COUNTRY_REGION = Object.fromEntries(
  Object.entries(REGIONS).flatMap(([region, countries]) => Object.keys(countries).map(c => [c, region]))
);

// Ordered query-major so any slice of the list spreads across many cities and countries.
function buildCrawlTasks() {
  const cityLists = Object.values(REGIONS).flatMap(countries =>
    Object.entries(countries).flatMap(([country, cities]) =>
      cities.map(city => ({ country, city, queries: [...COMMON_QUERIES, ...(COUNTRY_SPECIALTIES[country] || [])] }))
    )
  );
  const longest = Math.max(...cityLists.map(c => c.queries.length));
  const tasks = [];
  for (let i = 0; i < longest; i++) {
    for (const c of cityLists) {
      if (c.queries[i]) tasks.push({ country: c.country, city: c.city, query: c.queries[i] });
    }
  }
  return tasks;
}

const CRAWL_TASKS = buildCrawlTasks();

// Max Google Places searches per nightly run; this sets the API bill.
const SEARCHES_PER_RUN = parseInt(process.env.CRAWL_SEARCHES_PER_RUN, 10) || 60;

function tasksForToday() {
  const day = Math.floor(Date.now() / 86400000);
  const count = Math.min(SEARCHES_PER_RUN, CRAWL_TASKS.length);
  const start = (day * count) % CRAWL_TASKS.length;
  return Array.from({ length: count }, (_, i) => CRAWL_TASKS[(start + i) % CRAWL_TASKS.length]);
}

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

  // Medical
  'hospital': 'Medical',
  'clinic': 'Medical',
  'medical center': 'Medical',
  'pharmacy': 'Medical',
  'dental clinic': 'Medical',
  'doctor': 'Medical',
  'health center': 'Medical',
  'medical clinic': 'Medical',

  // Fallbacks
  'shop': 'General Retail',
  'store': 'General Retail',
  'beauty cosmetics': 'Beauty & Personal Care',
  'argan oil producer': 'Beauty & Personal Care',
  'hotel': 'Accommodations',
  'guest house': 'Accommodations',
  'shipping port': 'Services',

  // Added with 54-country coverage
  'cotton exporter': 'Agricultural Products',
  'groundnut exporter': 'Agricultural Products',
  'fish exporter': 'Agricultural Products',
  'rubber exporter': 'Agricultural Products',
  'livestock exporter': 'Agricultural Products',
  'gum arabic exporter': 'Agricultural Products',
  'olive oil exporter': 'Agricultural Products',
  'tobacco exporter': 'Agricultural Products',
  'wine exporter': 'Agricultural Products',
  'sugar producer': 'Agricultural Products',
  'timber exporter': 'Agricultural Products',
  'bauxite mining': 'Minerals & Mining',
  'iron ore mining': 'Minerals & Mining',
  'manganese mining': 'Minerals & Mining',
  'uranium mining': 'Minerals & Mining',
  'coal mining': 'Minerals & Mining',
  'artisan crafts': 'Manufacturing',
  'supermarket': 'General Retail',
  'freight forwarder': 'Services',
  'construction company': 'Services',
  'real estate agency': 'Services'
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
      maxResultCount: 20
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
 * Determine business type (product, service, restaurant, medical, etc.)
 */
function determineType(query, category) {
  // If category is Medical, type is medical
  if (category === 'Medical') {
    return 'medical';
  }

  // If category is Restaurant, type is restaurant
  if (category === 'Restaurant') {
    return 'restaurant';
  }

  if (category === 'Accommodations') {
    return 'tourism';
  }

  const q = query.toLowerCase();

  // Medical
  const medicalKeywords = ['hospital', 'clinic', 'pharmacy', 'dental', 'health', 'doctor', 'medical'];
  if (medicalKeywords.some(kw => q.includes(kw))) {
    return 'medical';
  }

  // Services
  const serviceKeywords = ['exporter', 'tech', 'fintech', 'logistics', 'startup', 'processor', 'producer', 'company', 'supplier', 'agency', 'cooperative', 'mining', 'processor', 'manufacturing'];
  if (serviceKeywords.some(kw => q.includes(kw))) {
    return 'service';
  }

  // Products (agricultural, minerals, manufacturing, etc.)
  return 'product';
}

/**
 * Get region from country
 */
function getRegion(country) {
  return COUNTRY_REGION[country] || 'Africa';
}

/**
 * Crawl Google Maps for B2B commodities and services across Africa
 */
async function crawlGoogleMaps() {
  const businesses = [];
  let total = 0;
  let skipped = 0;

  console.log('🌐 Crawling African B2B commodities & services from Google Maps...\n');

  const tasks = tasksForToday();
  console.log(`Running ${tasks.length} of ${CRAWL_TASKS.length} searches across 54 countries\n`);

  for (const { country, city, query } of tasks) {
    console.log(`  Searching: "${query}" in ${city}, ${country}...`);
    const places = await searchPlaces(query, `${city}, ${country}`);

    if (places.length === 0) {
      console.log('    No results');
      await sleep(500);
      continue;
    }

    for (const place of places) {
      const businessName = place.displayName?.text || place.name || null;
      if (!businessName) {
        skipped++;
        continue;
      }

      const city_name = extractCity(place.formattedAddress || businessName);
      const category = CATEGORY_MAP[query.toLowerCase()] || 'General Retail';

      const coverPhoto = generateCoverPhoto(category);
      const googlePhotoName = place.photos?.[0]?.name || null;

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
        type: determineType(query, category),
        rating: place.rating || 0,
        review_count: place.userRatingCount || 0,
        latitude: place.location?.latitude || null,
        longitude: place.location?.longitude || null,
        cover_photo: coverPhoto,
        google_photo_name: googlePhotoName,
        verified_source: 'Google Maps',
        verified_at: new Date(),
        verification_score: calculateScore(place)
      });

      total++;
      console.log(`      ✅ ${businessName}`);
    }
    await sleep(500);
  }

  console.log(`\n✅ Crawl complete! Found: ${total} businesses, Skipped: ${skipped}`);

  // Save businesses to database
  const saveResult = await saveBusinessesToDatabase(businesses);

  return { businesses, saveResult, total, skipped };
}

/**
 * Save crawled businesses to database
 */
async function saveBusinessesToDatabase(businesses) {
  try {
    const k = db.query();
    let inserted = 0;
    let updated = 0;
    let failed = 0;

    for (const biz of businesses) {
      try {
        // Check if business already exists (by name + country + city)
        const existing = await k('listings')
          .where({
            name: biz.name,
            country: biz.country,
            city: biz.city
          })
          .first();

        if (existing) {
          // Update existing
          await k('listings')
            .where({ id: existing.id })
            .update({
              category: biz.category,
              type: biz.type,
              phone: biz.phone,
              website: biz.website,
              instagram: biz.instagram,
              rating: biz.rating,
              review_count: biz.review_count,
              latitude: biz.latitude,
              longitude: biz.longitude,
              cover_photo: biz.google_photo_name ? `/photos/${existing.id}` : biz.cover_photo,
              google_photo_name: biz.google_photo_name,
              verified: true,
              verified_source: biz.verified_source,
              updated_at: new Date().toISOString()
            });
          updated++;
        } else {
          // Insert new
          const [row] = await k('listings').returning('id').insert({
            name: biz.name,
            type: biz.type,
            region: biz.region,
            country: biz.country,
            city: biz.city,
            category: biz.category,
            phone: biz.phone,
            website: biz.website,
            instagram: biz.instagram,
            rating: biz.rating,
            review_count: biz.review_count,
            latitude: biz.latitude,
            longitude: biz.longitude,
            cover_photo: biz.cover_photo,
            google_photo_name: biz.google_photo_name,
            verified: true,
            verified_source: biz.verified_source,
            active: true,
            is_new: true,
            products_services: biz.category,
            description: biz.category
          });
          if (biz.google_photo_name) {
            const newId = typeof row === 'object' ? row.id : row;
            await k('listings').where({ id: newId }).update({ cover_photo: `/photos/${newId}` });
          }
          inserted++;
        }
      } catch (err) {
        console.error(`Error saving ${biz.name}:`, err.message);
        failed++;
      }
    }

    console.log(`\n💾 Database save: ${inserted} inserted, ${updated} updated, ${failed} failed`);
    return { inserted, updated, failed, total: inserted + updated };
  } catch (err) {
    console.error('Error saving businesses to database:', err.message);
    return { error: err.message, inserted: 0, updated: 0, failed: 0 };
  }
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

module.exports = { crawlGoogleMaps, generateCoverPhoto };
