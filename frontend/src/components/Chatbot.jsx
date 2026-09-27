import { useState } from 'react';

const FAQ = {
  'how to list a business': 'Click the "+ List Business" button in the top navigation. Fill in your business details, verify your WhatsApp, and your listing goes live immediately!',
  'how to claim a business': 'Click "✓ Claim Business" button. Search for your business, verify your phone number, and claim ownership for a small fee.',
  'is it free to search': 'Yes! Searching and browsing all 10,000+ verified businesses is completely free.',
  'how many countries': 'Vukafia is available in 54+ African countries, covering all major regions.',
  'what businesses can list': 'Any legitimate business can list: suppliers, exporters, manufacturers, service providers, retailers, and more.',
  'how do i contact a business': 'Click on any business card and use the WhatsApp button to message them directly — no email needed!',
  'what is vukafia': 'Vukafia is Africa\'s #1 verified business directory. We connect entrepreneurs across 54+ nations with real, Google-verified businesses.',
  'how is data verified': 'All data comes directly from Google Maps and is verified by business owners through WhatsApp.',
  'what is the claim fee': 'Claiming a business costs $15 USD (or equivalent) and includes a verified badge and listing management.',
  'how long does claiming take': 'Usually 5-10 minutes! Pay, verify your phone, and your verified badge appears immediately.'
};

function findAnswer(question) {
  const lower = question.toLowerCase();
  for (const [key, answer] of Object.entries(FAQ)) {
    if (lower.includes(key)) return answer;
  }
  return null;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! 👋 I\'m Vukafia\'s AI assistant. I can answer basic questions about listings, claims, and how the platform works.\n\nFor complex inquiries, I\'ll help you contact our team.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
          text: 'That\'s a great question! I don\'t have the answer in my knowledge base.\n\nWould you like me to connect you with our team? Click the button below to submit an inquiry, and someone will respond within 24 hours.',
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
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Vukafia Assistant</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', opacity: 0.8 }}>Always here to help!</p>
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
                    📧 Submit Inquiry
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
                ⏳ Thinking...
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
              placeholder="Ask me anything..."
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
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
