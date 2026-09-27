import { Link } from 'react-router-dom';

export default function Layout({ children }) {
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
          <Link to="/about" style={{
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'color 0.2s'
          }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
            About
          </Link>
          <Link to="/contact" style={{
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'color 0.2s'
          }} onMouseEnter={(e) => e.target.style.color = '#fff'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
            Contact
          </Link>
        </div>
      </nav>

      {children}

      <footer style={{
        background: '#2d1f0e',
        color: '#fff',
        padding: '2rem',
        textAlign: 'center',
        marginTop: '2rem',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <p style={{ margin: '0.5rem 0' }}>© 2026 Vukafia. Rising Markets. Connecting Africa.</p>
        <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', opacity: 0.8 }}>
          <a href="https://wa.me/2348101477935" style={{ color: '#25D366', textDecoration: 'none' }}>WhatsApp</a>
          {' • '}
          <Link to="/contact" style={{ color: '#d4a017', textDecoration: 'none' }}>Contact Us</Link>
        </p>
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
