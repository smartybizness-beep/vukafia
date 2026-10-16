// Stock questions and answers for the Trima chat widget, plus the matcher that picks one.

export const KNOWLEDGE_BASE = {
  // Greetings & Welcome
  'hello': 'Hi! 👋 I\'m Trima. Ask me anything about listings, claiming, business types, payment, or how Vukafia works. What can I help you with?',
  'hi': 'Hi there! 👋 What can I help you with? Ask me about listings, claiming, payments, or how to find businesses.',
  'hey': 'Hey! 👋 I\'m here to help. What would you like to know about Vukafia?',
  'hello trima': 'Hi! 👋 I\'m Trima. How can I help you today? Ask me anything about listings, claiming, or finding businesses.',
  'hi trima': 'Hey! 👋 What can I help you with? Ask about listings, claiming, payments, or anything else about Vukafia.',

  // Platform Overview
  'what is vukafia': 'Vukafia is Africa\'s #1 verified business DIRECTORY - not a marketplace. We CONNECT buyers with sellers across 54+ African nations. You find businesses here, then contact them directly via WhatsApp to negotiate and trade.',
  'what does vukafia do': 'Vukafia is a business CONNECTOR. We help buyers discover suppliers, exporters, manufacturers, and service providers. You browse our directory, find what you need, then contact businesses directly via WhatsApp. Vukafia doesn\'t handle buying/selling - we just connect.',
  'vukafia mission': 'Our mission is to CONNECT African entrepreneurs by creating a verified business directory where buyers can discover and directly contact verified suppliers across 54+ nations via WhatsApp.',
  'can i buy and sell on vukafia': 'No. Vukafia is NOT a marketplace. We\'re a BUSINESS DIRECTORY CONNECTOR. You find suppliers/businesses here, contact them via WhatsApp, and negotiate directly. All buying/selling happens OFF-platform between you and the business.',
  'how does vukafia work': 'Vukafia is a business CONNECTOR, not a marketplace. Step 1: Browse/search for businesses. Step 2: Find what you need. Step 3: Click WhatsApp to contact them directly. Step 4: Negotiate and trade directly with the business (not through Vukafia).',
  'how many countries does vukafia cover': 'Vukafia is available in 54+ African countries, covering West Africa, East Africa, North Africa, Central Africa, and Southern Africa.',
  'how many businesses on vukafia': 'We have 10,000+ verified businesses listed, all sourced from Google Maps and verified by business owners.',

  // Searching and Browsing
  'how do i find a business': 'Three ways to find businesses: 1️⃣ SEARCH - Use the search bar and type what you need (e.g., "cocoa exporter"). 2️⃣ FILTER BY TYPE - Click Products, Services, Restaurants, Tourism, or Medical. 3️⃣ FILTER BY COUNTRY - Use the dropdown to select a specific country. All searches are 100% FREE!',
  'how to search for businesses': 'Use the search bar at the top to search by keyword (e.g., "cocoa exporter", "fintech startup"). You can also filter by business type (Products, Services, Restaurants, Tourism, Medical), country, and category.',
  'how to find businesses': 'Three ways: 1️⃣ SEARCH by keyword (cocoa, fintech, etc.). 2️⃣ FILTER BY TYPE (Products, Services, Restaurants, Tourism, Medical). 3️⃣ FILTER BY REGION/COUNTRY. All searches are FREE!',
  'is searching free': 'Yes! Searching and browsing all 10,000+ verified businesses is completely free. No hidden fees.',
  'how to filter by type': 'Click on the business type buttons: 🛍️ Products, 🔧 Services, 🍽️ Restaurants, 🏨 Tourism, or 🏥 Medical. Click "Scroll Down" to load more businesses.',
  'how to filter by country': 'Use the "🌍 All Countries" dropdown to select a specific African country. Listings will update to show only businesses in that country.',
  'what business types are available': 'We have 5 main types: Products (agricultural, minerals, manufacturing), Services (tech, fintech, logistics), Restaurants (dining & food), Tourism (hotels, agencies), and Medical (hospitals, pharmacies).',

  // Contacting Businesses
  'how to contact a business': 'Click on any business card, then use the WhatsApp button to message them directly. You negotiate pricing, shipping, and payment details directly with them via WhatsApp - NOT through Vukafia.',
  'can i call businesses': 'Yes! Message them on WhatsApp to ask for their phone number or call details. Transactions and negotiations happen directly between you and the business - we\'re just the connector.',
  'what if a business doesnt respond': 'Try another supplier from our directory. Vukafia doesn\'t handle transactions - we connect you with businesses. The actual buying/selling is between you and them.',

  // Listing Your Business (NEW BUSINESS - NOT YET ON WEBSITE)
  'how to list my business': 'Click "+ List Business", fill in your business details (name, WhatsApp, location, type, category), verify your phone. Your business appears in our DIRECTORY immediately - FREE! Customers find you and message directly via WhatsApp. No transaction fees.',
  'i want to list a business': 'Click "+ List Business" (FREE). Your business gets listed in our directory. Customers find you, contact you via WhatsApp, and negotiate directly. Vukafia doesn\'t handle any transactions - we\'re just the connector.',
  'is it free to list a business': 'YES! Listing your business in our directory is 100% FREE. No monthly fees, no commission on sales, no hidden charges. Only $15 if you want to CLAIM an existing listing.',
  'how long does it take to list': 'Just 5 minutes! Verify your WhatsApp, and your business appears in our directory immediately. Customers can find and contact you right away.',
  'what info do i need to list': 'Business name, WhatsApp number, location (country/city), business type, category, and description. Photo optional but helps attract more buyers.',
  'can i edit my listing later': 'Yes! Update your business information anytime. Click on your listing and use the edit option to keep details current.',
  'what happens after i list': 'Your business appears in our directory immediately. Customers search and find you, then message you directly via WhatsApp. All negotiations and sales happen between you and them - Vukafia is just the connector.',

  // Claiming Your Business (EXISTING BUSINESS ALREADY ON WEBSITE)
  'how to claim my business': 'Your business is already on Vukafia? Click "✓ Claim Business", search for it, verify your phone number, pay $15 USD (one-time), get verified badge instantly! (5-10 minutes total)',
  'how do i claim a business': 'Your business is already on Vukafia? Click "✓ Claim Business", search for it, verify your phone number, pay $15 USD (one-time), get verified badge instantly! (5-10 minutes total)',
  'what is business claiming': 'Claiming proves you own the business. Benefits: verified badge 🏅, listing management tools, priority in search results.',
  'how much does claiming cost': 'Claiming is a one-time fee of $15 USD (or equivalent in local currency). This gives you permanent verified status and management access.',
  'how do i pay to claim': 'After phone verification, we send payment instructions via WhatsApp. You can pay through WhatsApp, mobile money, or bank transfer. Takes 5 minutes.',
  'how long to get verified': 'Usually 5-10 minutes from payment! After payment confirmation, your verified badge appears immediately.',
  'can i claim a business i dont own': 'Only if you own or represent the business! 😊 We verify your phone matches their records. This protects both you and real business owners.',
  'what if my business isnt listed': 'Click "+ List Business" to add your business for FREE! It goes live after WhatsApp verification (no payment needed for new listings, only for claiming existing ones).',

  // Verification and Trust
  'how is data verified': 'All business data comes directly from Google Maps, which verifies information through business owners and customer reviews.',
  'why should i trust vukafia': 'Vukafia only lists real businesses from Google Maps. No fake listings, no scams. Direct WhatsApp contact ensures authenticity.',
  'are all businesses verified': 'Yes. Every business is sourced from Google Maps, which has strict verification processes. Direct WhatsApp ensures real contact.',
  'can i report a fake business': 'Absolutely! We take this seriously. 🛡️ Contact our support team with details, and we\'ll investigate right away. Thank you for helping keep Vukafia trustworthy!',

  // Payment and Fees
  'what are the fees': 'Listing: FREE. Claiming: $15 USD. Everything else is free.',
  'do you take commission': 'No! Vukafia is a DIRECTORY CONNECTOR, not a marketplace. We don\'t handle any transactions or take commissions. You keep 100% of what you earn. All business happens between you and your customers.',
  'what payment methods do you accept': 'We accept WhatsApp payment, mobile money, and bank transfers. Details provided during checkout.',
  'is the $15 refundable': 'The $15 claiming fee is non-refundable but gives you permanent verified status with all management tools.',

  // Business Types
  'what is a product business': 'Product businesses sell physical goods: agricultural commodities (cocoa, coffee, minerals), manufactured items, etc. Focused on B2B suppliers.',
  'what is a service business': 'Service businesses provide professional services: tech, fintech, logistics, telecoms, banking, consulting, etc.',
  'what is a restaurant': 'Restaurants and food service establishments: cafes, dining, catering, food manufacturing.',
  'what is tourism business': 'Tourism businesses: hotels, resorts, tour operators, travel agencies, safari companies.',
  'what is medical business': 'Medical businesses: hospitals, clinics, pharmacies, healthcare providers, medical equipment suppliers.',

  // Regional Information
  'what regions does vukafia serve': 'We serve all 5 African regions: West Africa, East Africa, North Africa, Central Africa, and Southern Africa.',
  'which west african countries': 'Nigeria, Ghana, Ivory Coast, Senegal, Mali, Burkina Faso, Guinea, Sierra Leone, Liberia, and more.',
  'which east african countries': 'Kenya, Uganda, Tanzania, Ethiopia, Rwanda, Burundi, Zambia, Zimbabwe, Mozambique, and more.',
  'which north african countries': 'Egypt, Morocco, Algeria, Tunisia, Libya, Sudan, and more.',

  // Technical
  'is vukafia mobile friendly': 'Yes! Vukafia works perfectly on mobile phones, tablets, and desktop browsers. Optimized for all screen sizes.',
  'do i need an account to search': 'No! You can search for free without creating an account. Account required only to list or claim a business.',
  'how do i reset my password': 'Contact our support team via WhatsApp or email. They\'ll help you reset your password quickly.',
  'does vukafia have an app': 'Vukafia is a web platform optimized for mobile. No app download needed — just visit vukafia.com in your browser.',

  // Support and Help
  'how do i contact support': 'Click "💬 Send Inquiry" in the chat, or use the contact section in the footer (WhatsApp or email). Our team responds within 24 hours.',
  'what are your support hours': 'We respond to inquiries Monday-Friday, 9am-6pm African Time. Weekend inquiries are answered by Monday.',
  'do you have a phone number': 'You can reach us via WhatsApp (+234 810 147 7935) or email (info@vukafia.com).',
  'how fast is customer support': 'Most inquiries get a response within 2-4 hours during business hours. Complex issues may take up to 24 hours.',

  // Common Issues
  'why cant i find my business': 'If your business isn\'t listed, it may not be in Google Maps yet. Click "+ List Business" to add it to Vukafia.',
  'why is my listing showing wrong info': 'Information comes from Google Maps. Update your Google Business Profile, and it will sync to Vukafia within 24 hours.',
  'what if someone claimed my business': 'Contact support immediately. We investigate false claims and remove them. Provide proof of ownership.',
};

const STOPWORDS = new Set([
  'how', 'do', 'does', 'did', 'i', 'a', 'an', 'the', 'my', 'me', 'to', 'is', 'are', 'am', 'can', 'could', 'should',
  'what', 'which', 'why', 'when', 'where', 'who', 'for', 'on', 'of', 'in', 'it', 'its', 'you', 'your', 'we', 'our',
  'there', 'any', 'this', 'that', 'and', 'or', 'be', 'please', 'tell', 'about', 'with', 'if', 'at', 'by', 'from',
  'want', 'need', 'get', 'some', 'have', 'has', 'will', 'would', 'much', 'many', 'long',
]);
const GREETINGS = new Set(['hi', 'hello', 'hey', 'trima', 'there', 'good', 'morning', 'afternoon', 'evening']);
const QUESTION_TYPES = ['how much', 'how many', 'how long', 'how', 'what', 'why', 'which', 'can', 'is', 'do'];

const normalize = text => text.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9$\s]/g, ' ').replace(/\s+/g, ' ').trim();

// Crude stemming so claim / claims / claiming / claimed, list / listing / listed, business / businesses compare equal
function stem(word) {
  if (word.endsWith('ss')) return word;
  for (const suffix of ['ing', 'ed', 'es', 's']) {
    if (word.length > suffix.length + 3 && word.endsWith(suffix)) return word.slice(0, -suffix.length);
  }
  return word;
}

const SYNONYMS = {
  add: 'list', register: 'list', regist: 'list',
  company: 'business', compani: 'business', supplier: 'business', vendor: 'business', seller: 'business',
};
// Too common to identify a question on their own
const GENERIC = new Set(['business', 'vukafia']);

const contentWords = text => [...new Set(
  normalize(text).split(' ').filter(w => w && !STOPWORDS.has(w)).map(stem).map(w => SYNONYMS[w] || w)
)];
const questionType = text => QUESTION_TYPES.find(t => normalize(text).startsWith(t + ' ')) || '';

const INDEX = Object.entries(KNOWLEDGE_BASE).map(([key, answer]) => ({
  key, answer, words: contentWords(key), type: questionType(key),
}));

export function findAnswer(question) {
  const q = normalize(question);
  if (!q) return null;
  if (KNOWLEDGE_BASE[q]) return KNOWLEDGE_BASE[q];

  const allWords = q.split(' ');
  if (allWords.every(w => GREETINGS.has(w))) return KNOWLEDGE_BASE[allWords.includes('trima') ? 'hi trima' : 'hello'];

  const qWords = new Set(contentWords(q));
  if (!qWords.size) return null;
  const qType = questionType(q);

  let best = null;
  let bestScore = 0;
  for (const entry of INDEX) {
    if (!entry.words.length) continue;
    const matchedWords = entry.words.filter(w => qWords.has(w));
    const matched = matchedWords.length;
    if (!matched) continue;
    if (!matchedWords.some(w => !GENERIC.has(w)) && [...qWords].some(w => !GENERIC.has(w))) continue;
    const coverage = matched / entry.words.length; // how much of the stock question the visitor asked about
    const precision = matched / qWords.size;       // how much of the visitor's question the stock answer explains
    if (coverage < 0.5 || precision < 0.5) continue;
    const score = coverage * 2 + precision + (qType && qType === entry.type ? 0.25 : 0);
    if (score > bestScore) {
      bestScore = score;
      best = entry.answer;
    }
  }
  return best;
}
