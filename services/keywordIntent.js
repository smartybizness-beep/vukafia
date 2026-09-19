/**
 * services/keywordIntent.js
 * Rule-based language detection + intent extraction.
 * Used as the fallback when AI search is disabled or unavailable.
 */

'use strict';

// ─── LANGUAGE DETECTION (simple keyword-based) ────────────────────────────
function detectLanguage(text) {
  const t = text.toLowerCase();
  if (/\b(je veux|bonjour|trouver|vendeur|produit|service)\b/.test(t)) return 'fr';
  if (/[\u0600-\u06FF]/.test(t)) return 'ar';
  if (/\b(nataka|ninahitaji|habari|bei|bidhaa)\b/.test(t)) return 'sw';
  if (/\b(nawa|kayayyaki|kasuwanci|nemi)\b/.test(t)) return 'ha';
  if (/\b(how much|abeg|make|wey|i wan|find am)\b/.test(t)) return 'pidgin';
  return 'en';
}

// ─── INTENT EXTRACTION ────────────────────────────────────────────────────
function extractIntent(text) {
  const t = text.toLowerCase();

  // Type
  const isService = /\b(service|lawyer|doctor|hospital|clinic|school|repair|plumber|electrician|accountant|consultant|legal|tech|it|software|logistics|freight|catering|event)\b/.test(t);

  // Category
  let category = null;
  const catMap = {
    'Electronics':        ['phone', 'laptop', 'computer', 'tv', 'electronics', 'solar', 'inverter', 'gadget'],
    'Agriculture':        ['cocoa', 'coffee', 'farm', 'agro', 'fertilizer', 'crop', 'seed', 'maize', 'rice', 'shea', 'cashew'],
    'Fashion & Textiles': ['fabric', 'cloth', 'ankara', 'kente', 'fashion', 'shoe', 'bag', 'leather', 'dress', 'tailor'],
    'Food & Groceries':   ['food', 'spice', 'oil', 'fish', 'meat', 'vegetable', 'fruit', 'grocery', 'market', 'palm'],
    'Health & Beauty':    ['herbal', 'beauty', 'cosmetic', 'shea butter', 'argan', 'skin', 'health', 'cream'],
    'Building Materials': ['cement', 'iron', 'timber', 'wood', 'roofing', 'tile', 'building', 'construction material'],
    'Healthcare':         ['hospital', 'clinic', 'doctor', 'medical', 'health', 'surgery', 'pharmacy', 'nurse'],
    'Legal Services':     ['lawyer', 'legal', 'law', 'attorney', 'advocate', 'court', 'contract'],
    'Technology & IT':    ['software', 'website', 'app', 'tech', 'it support', 'digital', 'coding'],
    'Logistics & Freight':['shipping', 'freight', 'cargo', 'logistics', 'customs', 'delivery', 'transport'],
  };

  for (const [cat, keywords] of Object.entries(catMap)) {
    if (keywords.some(kw => t.includes(kw))) { category = cat; break; }
  }

  // Country / Region
  const countryMap = {
    'Nigeria':       ['nigeria', 'lagos', 'abuja', 'kano', 'naija', 'enugu', 'ph', 'port harcourt'],
    'Ghana':         ['ghana', 'accra', 'kumasi', 'takoradi', 'ghanaian'],
    'Kenya':         ['kenya', 'nairobi', 'mombasa', 'kisumu', 'kenyan'],
    'Egypt':         ['egypt', 'cairo', 'giza', 'egyptian'],
    'South Africa':  ['south africa', 'johannesburg', 'cape town', 'durban', 'sa ', 'joburg'],
    'Ethiopia':      ['ethiopia', 'addis ababa', 'ethiopian'],
    'Tanzania':      ['tanzania', 'dar es salaam', 'zanzibar', 'tanzanian'],
    'Morocco':       ['morocco', 'marrakech', 'casablanca', 'moroccan'],
    "Côte d'Ivoire": ['ivory coast', 'abidjan', "cote d'ivoire", 'ivorian'],
    'Senegal':       ['senegal', 'dakar', 'senegalese'],
    'Cameroon':      ['cameroon', 'douala', 'yaounde', 'cameroonian'],
  };

  const regionMap = {
    'West Africa':    ['west africa', 'west african'],
    'East Africa':    ['east africa', 'east african'],
    'North Africa':   ['north africa', 'north african'],
    'Central Africa': ['central africa'],
    'Southern Africa':['southern africa', 'south africa', 'sadc'],
  };

  let country = null;
  for (const [c, keywords] of Object.entries(countryMap)) {
    if (keywords.some(kw => t.includes(kw))) { country = c; break; }
  }

  let region = null;
  for (const [r, keywords] of Object.entries(regionMap)) {
    if (keywords.some(kw => t.includes(kw))) { region = r; break; }
  }

  return {
    type:     isService ? 'service' : null,
    category,
    country,
    region,
    raw:      text,
  };
}

module.exports = { detectLanguage, extractIntent };
