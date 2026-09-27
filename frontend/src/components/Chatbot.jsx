import { useState, useEffect } from 'react';
import { LANGUAGE_NAMES } from '../languages';

// UI messages translations (bot-specific)

// UI messages translations
const UI_MESSAGES = {
  en: {
    greeting: 'Hi! 👋 I\'m Trima, Vukafia\'s AI assistant. Ask me anything about listings, claims, business types, payment, or how the platform works!',
    notFound: 'I\'ll route this to our support team. They\'ll get back to you within 24 hours.',
    placeholder: 'Ask me anything...',
    submitBtn: '📧 Submit Inquiry',
    thinking: '⏳ Thinking...',
    send: 'Send'
  },
  pidgin: {
    greeting: 'Heyy! 👋 Na Trima be, Vukafia AI helper. Ask me about listing, claiming, payment, business types, or how this platform work!',
    notFound: 'I go send this to our support team. Dem go reply you within 24 hours.',
    placeholder: 'Ask me wetin you wan know...',
    submitBtn: '📧 Send Inquiry',
    thinking: '⏳ Lemme think...',
    send: 'Send'
  },
  fr: {
    greeting: 'Salut! 👋 Je suis Trima, assistant IA Vukafia. Posez-moi vos questions sur les annonces, réclamations, paiements, types d\'entreprises, ou la plateforme!',
    notFound: 'Je vais transférer cela à notre équipe d\'assistance. Ils répondront dans 24 heures.',
    placeholder: 'Posez-moi une question...',
    submitBtn: '📧 Soumettre une demande',
    thinking: '⏳ Je réfléchis...',
    send: 'Envoyer'
  },
  sw: {
    greeting: 'Habari! 👋 Mimi ni Trima, AI assistant wa Vukafia. Niulizeni kuhusu orodha, udai, malipo, aina za biashara, au jinsi platform inavyofanya kazi!',
    notFound: 'Nitapeleka hii kwa timu yetu ya msaada. Watakujibu ndani ya saa 24.',
    placeholder: 'Niulizeni kitu yoyote...',
    submitBtn: '📧 Wasilisha Ombi',
    thinking: '⏳ Ninakifikiri...',
    send: 'Tuma'
  },
  es: {
    greeting: '¡Hola! 👋 Soy Trima, asistente IA de Vukafia. Pregúntame sobre listados, reclamaciones, pagos, tipos de negocios, ¡o cómo funciona la plataforma!',
    notFound: 'Enviaré esto a nuestro equipo de soporte. Te responderán en 24 horas.',
    placeholder: 'Pregúntame algo...',
    submitBtn: '📧 Enviar Consulta',
    thinking: '⏳ Pensando...',
    send: 'Enviar'
  }
};

const KNOWLEDGE_BASE = {
  // Platform Overview
  'what is vukafia': 'Vukafia is Africa\'s #1 verified business DIRECTORY - not a marketplace. We CONNECT buyers with sellers across 54+ African nations. You find businesses here, then contact them directly via WhatsApp to negotiate and trade.',
  'what does vukafia do': 'Vukafia is a business CONNECTOR. We help buyers discover suppliers, exporters, manufacturers, and service providers. You browse our directory, find what you need, then contact businesses directly via WhatsApp. Vukafia doesn\'t handle buying/selling - we just connect.',
  'vukafia mission': 'Our mission is to CONNECT African entrepreneurs by creating a verified business directory where buyers can discover and directly contact verified suppliers across 54+ nations via WhatsApp.',
  'can i buy and sell on vukafia': 'No. Vukafia is NOT a marketplace. We\'re a BUSINESS DIRECTORY CONNECTOR. You find suppliers/businesses here, contact them via WhatsApp, and negotiate directly. All buying/selling happens OFF-platform between you and the business.',
  'how does vukafia work': 'Vukafia is a business CONNECTOR, not a marketplace. Step 1: Browse/search for businesses. Step 2: Find what you need. Step 3: Click WhatsApp to contact them directly. Step 4: Negotiate and trade directly with the business (not through Vukafia).',
  'how many countries does vukafia cover': 'Vukafia is available in 54+ African countries, covering West Africa, East Africa, North Africa, Central Africa, and Southern Africa.',
  'how many businesses on vukafia': 'We have 10,000+ verified businesses listed, all sourced from Google Maps and verified by business owners.',

  // Searching and Browsing
  'how to search for businesses': 'Use the search bar at the top to search by keyword (e.g., "cocoa exporter", "fintech startup"). You can also filter by business type (Products, Services, Restaurants, Tourism, Medical), country, and category.',
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
  'do you have a phone number': 'You can reach us via WhatsApp (+234 810 147 7935) or email (hello@vukafia.com).',
  'how fast is customer support': 'Most inquiries get a response within 2-4 hours during business hours. Complex issues may take up to 24 hours.',

  // Common Issues
  'why cant i find my business': 'If your business isn\'t listed, it may not be in Google Maps yet. Click "+ List Business" to add it to Vukafia.',
  'why is my listing showing wrong info': 'Information comes from Google Maps. Update your Google Business Profile, and it will sync to Vukafia within 24 hours.',
  'what if someone claimed my business': 'Contact support immediately. We investigate false claims and remove them. Provide proof of ownership.',
};

function findAnswer(question) {
  const lower = question.toLowerCase().trim();

  // Direct key matching (highest priority)
  if (KNOWLEDGE_BASE[lower]) {
    return KNOWLEDGE_BASE[lower];
  }

  // Check for substring matches of keys in question (prioritize HOW/WHAT)
  const isHowQuestion = lower.startsWith('how');
  const isWhatQuestion = lower.startsWith('what');

  for (const [key, answer] of Object.entries(KNOWLEDGE_BASE)) {
    if (lower.includes(key) && key.length > 3) {
      // Prioritize HOW/WHAT questions
      if ((isHowQuestion && key.startsWith('how')) || (isWhatQuestion && key.startsWith('what'))) {
        return answer;
      }
    }
  }

  // Smart phrase matching with word order
  const questionWords = lower.split(/\s+/).filter(w => w.length > 2);
  let bestMatch = null;
  let bestScore = 0;

  for (const [key, answer] of Object.entries(KNOWLEDGE_BASE)) {
    const keyWords = key.split(/\s+/);
    let matchScore = 0;
    let matchedWords = 0;

    for (const keyWord of keyWords) {
      for (const questionWord of questionWords) {
        if (questionWord === keyWord || questionWord.includes(keyWord)) {
          matchScore += 2;
          matchedWords++;
          break;
        }
      }
    }

    // Require at least 60% of key words to match
    if (matchedWords >= keyWords.length * 0.6 && matchScore > bestScore) {
      // Bonus for matching question type (HOW/WHAT)
      if ((isHowQuestion && key.startsWith('how')) || (isWhatQuestion && key.startsWith('what'))) {
        matchScore += 5;
      }
      bestScore = matchScore;
      bestMatch = answer;
    }
  }

  // Only return if high confidence (all major words matched)
  return bestScore >= 4 ? bestMatch : null;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: UI_MESSAGES.en.greeting }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Load language preference from localStorage (default: English)
  useEffect(() => {
    const savedLang = localStorage.getItem('vukafiaLanguage');
    setLanguage(savedLang && Object.keys(UI_MESSAGES).includes(savedLang) ? savedLang : 'en');
  }, []);

  // Update bot greeting when language changes
  useEffect(() => {
    setMessages([{ type: 'bot', text: UI_MESSAGES[language]?.greeting || UI_MESSAGES.en.greeting }]);
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('vukafiaLanguage', lang);
    setShowLangMenu(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg = { type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Check for FAQ match
    const answer = findAnswer(input);

    if (answer) {
      // Found an answer
      setTimeout(() => {
        setMessages(prev => [...prev, { type: 'bot', text: answer }]);
        setLoading(false);
      }, 500);
    } else {
      // Complex question - offer to submit inquiry
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          text: UI_MESSAGES[language]?.notFound || UI_MESSAGES.en.notFound,
          showInquiry: true
        }]);
        setLoading(false);
      }, 800);
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#0284c7',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '380px',
          height: '600px',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          maxWidth: 'calc(100vw - 2rem)'
        }}>
          {/* Header */}
          <div style={{
            background: '#0284c7',
            color: '#fff',
            padding: '1rem',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Trima 🌍</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', opacity: 0.8 }}>Vukafia AI Assistant</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {/* Language Selector */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: '#fff',
                    padding: '0.3rem 0.6rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  🌐 {language.toUpperCase()}
                </button>
                {showLangMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    minWidth: '150px',
                    zIndex: 1001,
                    marginTop: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                      <button
                        key={code}
                        onClick={() => changeLanguage(code)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 1rem',
                          background: language === code ? '#0284c7' : '#fff',
                          color: language === code ? '#fff' : '#2d1f0e',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          borderBottom: '1px solid #f0f0f0'
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {messages.map((msg, i) => (
              <div key={i}>
                <div style={{
                  background: msg.type === 'bot' ? '#f3f4f6' : '#0284c7',
                  color: msg.type === 'bot' ? '#2d1f0e' : '#fff',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  maxWidth: '85%',
                  marginLeft: msg.type === 'user' ? 'auto' : 0,
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.9rem',
                  lineHeight: 1.4
                }}>
                  {msg.text}
                </div>
                {msg.showInquiry && (
                  <button
                    onClick={() => window.location.href = '/contact'}
                    style={{
                      marginTop: '0.5rem',
                      padding: '0.5rem 1rem',
                      background: '#10B981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {UI_MESSAGES[language]?.submitBtn || '📧 Submit Inquiry'}
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div style={{
                background: '#f3f4f6',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                {UI_MESSAGES[language]?.thinking || '⏳ Thinking...'}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '1rem',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            gap: '0.5rem'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={UI_MESSAGES[language]?.placeholder || 'Ask me anything...'}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '0.5rem 1rem',
                background: loading || !input.trim() ? '#D1D5DB' : '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              {UI_MESSAGES[language]?.send || 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
