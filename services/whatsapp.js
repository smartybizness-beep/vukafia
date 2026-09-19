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
const { detectLanguage } = require('./keywordIntent');
const { runSearch } = require('./aiSearch');

const WA_TOKEN      = process.env.WA_API_TOKEN;       // Meta Cloud API token
const WA_PHONE_ID   = process.env.WA_PHONE_NUMBER_ID; // Meta phone number ID
const WA_NUMBER     = process.env.WA_PHONE_NUMBER || '2348101477935';

// ─── SEARCH ───────────────────────────────────────────────────────────────
const WA_RESULT_LIMIT = 3;
const WA_COLUMNS = ['name', 'category', 'country', 'city', 'phone', 'whatsapp', 'rating', 'products_services'];

function searchListings(from, text, k) {
  return runSearch(text, k, { source: 'whatsapp', clientRef: from, limit: WA_RESULT_LIMIT, select: WA_COLUMNS });
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
    const t = text.trim().toUpperCase();

    let reply;
    let lang   = detectLanguage(text);
    let intent = null;

    // ── COMMANDS ─────────────────────────────────────────────────────────
    if (t === 'LIST' || t === 'LIST MY BUSINESS' || t === 'ADD BUSINESS') {
      reply = `✅ *List Your Business on Vukafia!*\n\nVisit: https://vukafia.com\nor reply with your details:\n\n📝 Business Name:\n📦 Products/Services:\n📍 Country & City:\n📞 Phone:\n\nWe'll add you within 24 hours! 🌍`;
    } else if (t === 'HELP' || t === 'HI' || t === 'HELLO' || t === 'START') {
      reply = `👋 Welcome to *Vukafia AI*!\n\n🌍 Trans-African Business Directory\n\nTry:\n• *"Find electronics in Lagos"*\n• *"Lawyer in Cairo"*\n• *"Coffee from Ethiopia"*\n• *"South Africa wine"*\n\n📝 Type *LIST* to add your business\n🔍 Browse: https://vukafia.com`;
    } else {
      // ── SEARCH ────────────────────────────────────────────────────────
      const found = await searchListings(from, text, k);
      lang   = found.language;
      intent = found.filters;
      reply  = buildListingsReply(found.rows, lang, intent);
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
  const t = text.trim().toUpperCase();

  if (t === 'LIST' || t === 'LIST MY BUSINESS') {
    return '✅ List your business at https://vukafia.com or reply with your business details!';
  }
  if (t === 'HELP' || t === 'HI' || t === 'HELLO') {
    return '👋 Welcome to Vukafia! Search for any business across Africa. Try: "electronics Lagos" or "lawyer Cairo"';
  }
  const found = await searchListings(from, text, k);
  return buildListingsReply(found.rows, found.language, found.filters);
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
