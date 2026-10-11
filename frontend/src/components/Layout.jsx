import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Layout({ children }) {
  const [showFooterAbout, setShowFooterAbout] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav style={{
        background: '#2d1f0e',
        height: 'auto',
        minHeight: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.8rem 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 400,
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <Link to="/" style={{
          color: '#fff',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          🌍 Vukafia
        </Link>
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <Link to="/" style={{
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'color 0.2s'
          }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
            Home
          </Link>
        </div>
      </nav>

      {children}

      <footer style={{
        background: '#2d1f0e',
        color: '#fff',
        padding: '2rem 1.5rem',
        marginTop: '3rem',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Main Footer Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto 2rem'
        }}>
          {/* About Section */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>About Vukafia</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, opacity: 0.9 }}>
              Trans-African Business Directory connecting 54+ countries with 10,000+ verified businesses. Rising Markets. Connecting Africa.
            </p>
            <button onClick={() => setShowFooterAbout(!showFooterAbout)} style={{
              background: 'transparent',
              color: '#d4a017',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              marginTop: '0.5rem',
              padding: 0
            }}>
              {showFooterAbout ? '▼ Less' : '▶ Learn More'}
            </button>
          </div>

          {/* Contact Section */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Contact Us</h3>
            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
              <a href="https://wa.me/2348101477935" style={{ color: '#25D366', textDecoration: 'none', fontWeight: 600 }}>
                💬 WhatsApp: +234 810 147 7935
              </a>
            </p>
            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
              <a href="mailto:info@vukafia.com" style={{ color: '#d4a017', textDecoration: 'none' }}>
                📧 Email: info@vukafia.com
              </a>
            </p>
            <button onClick={() => navigate('/contact')} style={{
              background: '#c0522a',
              color: '#fff',
              border: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              marginTop: '0.5rem',
              fontWeight: 600
            }}>
              Send Inquiry
            </button>
          </div>

          {/* Quick Links */}
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Quick Links</h3>
            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
              <Link to="/" style={{ color: '#d4a017', textDecoration: 'none' }}>Home</Link>
            </p>
            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
              <a href="https://vukafia.com" style={{ color: '#d4a017', textDecoration: 'none' }}>Browse Businesses</a>
            </p>
            <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
              <button onClick={() => navigate('/contact')} style={{
                background: 'transparent',
                color: '#d4a017',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}>
                Contact Support
              </button>
            </p>
          </div>
        </div>

        {/* Expanded About Section */}
        {showFooterAbout && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            maxWidth: '900px',
            margin: '0 auto 1.5rem'
          }}>
            <h4 style={{ marginBottom: '0.8rem' }}>Our Mission</h4>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem', opacity: 0.9 }}>
              Vukafia is revolutionizing cross-border trade in Africa by creating a verified, transparent marketplace where businesses can discover, connect, and trade with verified partners across 54+ African nations.
            </p>
            <h4 style={{ marginBottom: '0.8rem' }}>Why Choose Vukafia?</h4>
            <ul style={{ fontSize: '0.9rem', lineHeight: 1.8, marginLeft: '1.5rem', opacity: 0.9 }}>
              <li>✅ Verified Listings - Real businesses from Google Maps</li>
              <li>✅ WhatsApp Integration - Direct messaging, no emails</li>
              <li>✅ Trans-African Reach - 54+ countries</li>
              <li>✅ B2B Focused - Built for exporters and suppliers</li>
            </ul>
          </div>
        )}

        {/* Copyright */}
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
          <p style={{ margin: '0.5rem 0', fontSize: '0.85rem', opacity: 0.7 }}>
            {t.copyright}
          </p>
          <p style={{ margin: '0.5rem 0', fontSize: '0.75rem', opacity: 0.6 }}>
            Serving businesses across Africa | Privacy Policy | Terms of Service
          </p>
        </div>
      </footer>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          nav {
            padding: 0.6rem 1rem !important;
            gap: 0.5rem !important;
            justify-content: center !important;
          }
          nav > a {
            order: -1;
            flex-basis: 100%;
            text-align: center;
            margin-bottom: 0.3rem;
          }
          nav > div {
            gap: 1rem !important;
          }
          footer {
            padding: 1.5rem 1rem !important;
          }
        }
      `}</style>
    </>
  );
}
