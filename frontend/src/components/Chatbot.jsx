import { useState, useEffect } from 'react';
import { LANGUAGE_NAMES } from '../languages';
import { findAnswer } from './chatbotKnowledge';

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
