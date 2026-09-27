import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <>
      <nav style={{
        background: '#2d1f0e',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 400,
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>
          🌍 Vukafia
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Home</Link>
          <Link to="/about" style={{ color: '#fff', textDecoration: 'none' }}>About</Link>
          <Link to="/contact" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Contact</Link>
        </div>
      </nav>

      <div style={{ background: '#f5ede0', minHeight: '100vh', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Logo Section */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src="/assets/vukafia-logo.png" alt="Vukafia" style={{ height: '80px', width: 'auto', objectFit: 'contain' }} />
          </div>

          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{
              fontSize: '3rem',
              fontFamily: "'Fraunces', serif",
              fontWeight: 900,
              color: '#2d1f0e',
              marginBottom: '1rem'
            }}>
              About Vukafia
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: '#4a3520',
              lineHeight: 1.8
            }}>
              Connecting Africa's Rising Markets — One Business at a Time
            </p>
          </div>

          {/* Mission Section */}
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '14px',
            marginBottom: '2rem',
            boxShadow: '0 4px 24px rgba(45, 31, 14, 0.1)'
          }}>
            <h2 style={{ color: '#c0522a', marginBottom: '1rem' }}>🎯 Our Mission</h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#4a3520' }}>
              Vukafia is revolutionizing cross-border trade in Africa by creating a verified, transparent marketplace
              where businesses can discover, connect, and trade with verified partners across 54+ African nations.
            </p>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#4a3520', marginTop: '1rem' }}>
              We empower African entrepreneurs by making it easy to find reliable suppliers, manufacturers, and service
              providers — eliminating information asymmetries and building trust in trade relationships.
            </p>
          </div>

          {/* Vision Section */}
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '14px',
            marginBottom: '2rem',
            boxShadow: '0 4px 24px rgba(45, 31, 14, 0.1)'
          }}>
            <h2 style={{ color: '#054030', marginBottom: '1rem' }}>🌱 Our Vision</h2>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#4a3520' }}>
              To build the largest, most trusted business directory for Africa — where any entrepreneur, from a
              small farmer in Ghana to a manufacturer in Nigeria, can showcase their business to millions of potential
              customers and suppliers across the continent.
            </p>
            <p style={{ fontSize: '1rem', lineHeight: 1.8, color: '#4a3520', marginTop: '1rem' }}>
              We're powered by WhatsApp AI, real Google Maps data, and verified business information — ensuring every
              listing is authentic and every connection is valuable.
            </p>
          </div>

          {/* Key Features */}
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '14px',
            marginBottom: '2rem',
            boxShadow: '0 4px 24px rgba(45, 31, 14, 0.1)'
          }}>
            <h2 style={{ color: '#0284c7', marginBottom: '1.5rem' }}>✨ What Makes Us Different</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>✅</span>
                <strong>Verified Listings:</strong> Every business is verified through Google Maps and WhatsApp AI
              </li>
              <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>✅</span>
                <strong>Real Data:</strong> Authentic business information, ratings, and photos from Google Places API
              </li>
              <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>✅</span>
                <strong>WhatsApp Integration:</strong> Direct messaging with businesses — no emails, no delays
              </li>
              <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>✅</span>
                <strong>Trans-African Reach:</strong> 54+ countries, 10,000+ listings, growing every day
              </li>
              <li style={{ marginBottom: '1rem', paddingLeft: '2rem', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0 }}>✅</span>
                <strong>B2B Focused:</strong> Built for exporters, manufacturers, and service providers
              </li>
            </ul>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '14px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(45, 31, 14, 0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#c0522a' }}>54+</div>
              <div style={{ color: '#4a3520', marginTop: '0.5rem' }}>African Countries</div>
            </div>
            <div style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '14px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(45, 31, 14, 0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#054030' }}>10K+</div>
              <div style={{ color: '#4a3520', marginTop: '0.5rem' }}>Verified Businesses</div>
            </div>
            <div style={{
              background: '#fff',
              padding: '1.5rem',
              borderRadius: '14px',
              textAlign: 'center',
              boxShadow: '0 4px 24px rgba(45, 31, 14, 0.1)'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0284c7' }}>100%</div>
              <div style={{ color: '#4a3520', marginTop: '0.5rem' }}>Real Businesses</div>
            </div>
          </div>

          {/* CTA */}
          <div style={{
            background: 'linear-gradient(135deg, #c0522a 0%, #054030 100%)',
            padding: '2rem',
            borderRadius: '14px',
            textAlign: 'center',
            color: '#fff'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Ready to Join Africa's Marketplace?</h3>
            <p style={{ marginBottom: '1.5rem' }}>List your business or start searching for verified partners today.</p>
            <Link to="/" style={{
              display: 'inline-block',
              padding: '0.75rem 2rem',
              background: '#fff',
              color: '#c0522a',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}>
              Explore Vukafia
            </Link>
          </div>
        </div>
      </div>

      <footer style={{
        background: '#2d1f0e',
        color: '#fff',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <p>© 2026 Vukafia. Rising Markets. Connecting Africa.</p>
      </footer>
    </>
  );
}
