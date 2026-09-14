/**
 * services/whatsapp.js
 * WhatsApp AI service
 *
 * Parses incoming WhatsApp messages, detects intent & language,
 * queries listings DB, and replies with results.
 *
 * Supports: English, French, Arabic, Swahili, Hausa, Nigerian Pidgin
 */

'use strict';

const axios = require('axios');

const WA_TOKEN      = process.env.WA_API_TOKEN;       // Meta Cloud API token
const WA_PHONE_ID   = process.env.WA_PHONE_NUMBER_ID; // Meta phone number ID
const WA_NUMBER     = process.env.WA_PHONE_NUMBER || '2348101477935';

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

// ─── QUERY LISTINGS ───────────────────────────────────────────────────────
async function queryListings(intent, k) {
  let query = k('listings').where('active', true);

  if (intent.type)     query = query.where('type', intent.type);
  if (intent.category) query = query.where('category', intent.category);
  if (intent.country)  query = query.where('country', intent.country);
  if (intent.region)   query = query.where('region',  intent.region);

  if (!intent.category && !intent.country && !intent.region && intent.raw) {
    const term = `%${intent.raw.slice(0, 40)}%`;
    query = query.where(function() {
      this.whereILike('name', term)
        .orWhereILike('products_services', term)
        .orWhereILike('category', term);
    });
  }

  return query
    .orderBy('featured', 'desc')
    .orderBy('rating', 'desc')
    .limit(3)
    .select('name', 'category', 'country', 'city', 'phone', 'whatsapp', 'rating', 'products_services');
}

// ─── BUILD REPLY TEXT ─────────────────────────────────────────────────────
function buildListingsReply(listings, lang, intent) {
  const greetings = {
    en:     '🌍 *Vukafia* — Here are matching businesses:',
    fr:     '🌍 *Vukafia* — Voici les entreprises correspondantes:',
    ar:     '🌍 *Vukafia* — إليك الشركات المطابقة:',
    sw:     '🌍 *Vukafia* — Hapa kuna biashara zinazolingana:',
    ha:     '🌍 *Vukafia* — Ga kasuwanci masu dacewa:',
    pidgin: '🌍 *Vukafia* — See di businesses wey match:',
  };

  const noResult = {
    en:     "Sorry, no results found. Try another search term or contact us on WhatsApp.",
    fr:     "Désolé, aucun résultat. Essayez un autre terme ou contactez-nous.",
    ar:     "عذراً، لم يتم العثور على نتائج. جرب مصطلحاً آخر.",
    sw:     "Samahani, hakuna matokeo. Jaribu maneno mengine.",
    ha:     "Yi hakuri, babu sakamakon. Gwada wani nemo.",
    pidgin: "Omo sorry o, nothing show. Try another thing.",
  };

  if (!listings.length) {
    return `${noResult[lang] || noResult.en}\n\n➕ Want to list your business? Type *LIST MY BUSINESS*`;
  }

  const header = greetings[lang] || greetings.en;
  const items  = listings.map((l, i) => {
    const wa = `https://wa.me/${(l.whatsapp || l.phone || '').replace(/\D/g, '')}`;
    return `\n*${i + 1}. ${l.name}*\n📍 ${l.city || ''}, ${l.country}\n🏷️ ${l.category}\n⭐ ${l.rating || 'New'}\n📞 +${l.phone}\n💬 ${wa}`;
  }).join('\n');

  return `${header}${items}\n\n🔍 Search more: https://vukafia.com\n➕ List your business: type *LIST*`;
}

// ─── HANDLE INCOMING MESSAGE ──────────────────────────────────────────────
async function handleMessage(from, text, k) {
  try {
    const lang    = detectLanguage(text);
    const intent  = extractIntent(text);
    const t       = text.trim().toUpperCase();

    let reply;

    // ── COMMANDS ─────────────────────────────────────────────────────────
    if (t === 'LIST' || t === 'LIST MY BUSINESS' || t === 'ADD BUSINESS') {
      reply = `✅ *List Your Business on Vukafia!*\n\nVisit: https://vukafia.com\nor reply with your details:\n\n📝 Business Name:\n📦 Products/Services:\n📍 Country & City:\n📞 Phone:\n\nWe'll add you within 24 hours! 🌍`;
    } else if (t === 'HELP' || t === 'HI' || t === 'HELLO' || t === 'START') {
      reply = `👋 Welcome to *Vukafia AI*!\n\n🌍 Trans-African Business Directory\n\nTry:\n• *"Find electronics in Lagos"*\n• *"Lawyer in Cairo"*\n• *"Coffee from Ethiopia"*\n• *"South Africa wine"*\n\n📝 Type *LIST* to add your business\n🔍 Browse: https://vukafia.com`;
    } else {
      // ── SEARCH ────────────────────────────────────────────────────────
      const listings = await queryListings(intent, k);
      reply = buildListingsReply(listings, lang, intent);
    }

    // ── SEND REPLY ────────────────────────────────────────────────────────
    await sendWhatsAppMessage(from, reply);

    // ── LOG OUTBOUND ──────────────────────────────────────────────────────
    await k('wa_messages').insert({
      from_number: WA_NUMBER,
      to_number:   from,
      message:     reply,
      direction:   'outbound',
      language:    lang,
      intent:      JSON.stringify(intent),
    });
  } catch (err) {
    console.error('[WA SERVICE ERROR]', err.message);
  }
}

// Also exported for Twilio integration
async function buildReply(from, text, k) {
  const lang   = detectLanguage(text);
  const intent = extractIntent(text);
  const t      = text.trim().toUpperCase();

  if (t === 'LIST' || t === 'LIST MY BUSINESS') {
    return '✅ List your business at https://vukafia.com or reply with your business details!';
  }
  if (t === 'HELP' || t === 'HI' || t === 'HELLO') {
    return '👋 Welcome to Vukafia! Search for any business across Africa. Try: "electronics Lagos" or "lawyer Cairo"';
  }
  const listings = await queryListings(intent, k);
  return buildListingsReply(listings, lang, intent);
}

// ─── SEND VIA META CLOUD API ──────────────────────────────────────────────
async function sendWhatsAppMessage(to, text) {
  if (!WA_TOKEN || !WA_PHONE_ID) {
    console.log(`[WA STUB] To: ${to}\n${text}\n`);
    return; // Dev mode — just log
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${WA_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('[WA SEND ERROR]', err.response?.data || err.message);
  }
}

module.exports = { handleMessage, buildReply, sendWhatsAppMessage };
