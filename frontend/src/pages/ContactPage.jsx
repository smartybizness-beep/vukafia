import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    message: '',
    type: 'general'
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to submit');

      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', country: '', message: '', type: 'general' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <Link to="/about" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>About</Link>
          <Link to="/contact" style={{ color: '#fff', textDecoration: 'none' }}>Contact</Link>
        </div>
      </nav>

      <div style={{ background: '#f5ede0', minHeight: '100vh', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontFamily: "'Fraunces', serif",
            fontWeight: 900,
            color: '#2d1f0e',
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            Get In Touch
          </h1>
          <p style={{
            textAlign: 'center',
            color: '#4a3520',
            marginBottom: '2rem',
            fontSize: '1rem'
          }}>
            Have questions? Want to list your business? Send us a message and we'll respond within 24 hours.
          </p>

          {submitted && (
            <div style={{
              background: '#DCFCE7',
              border: '1px solid #15803D',
              color: '#15803D',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              ✅ Thank you! We've received your message and will respond soon.
            </div>
          )}

          {error && (
            <div style={{
              background: '#FEE2E2',
              border: '1px solid #991B1B',
              color: '#991B1B',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '14px',
            boxShadow: '0 4px 24px rgba(45, 31, 14, 0.1)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2d1f0e' }}>
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2d4c0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                placeholder="Your name"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2d1f0e' }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2d4c0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                placeholder="your@email.com"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2d1f0e' }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2d4c0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                placeholder="+234 XXX XXX XXXX"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2d1f0e' }}>
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2d4c0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
                placeholder="Your country"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2d1f0e' }}>
                Inquiry Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2d4c0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="general">General Question</option>
                <option value="business_inquiry">Business Inquiry</option>
                <option value="technical">Technical Issue</option>
                <option value="partnership">Partnership</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2d1f0e' }}>
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2d4c0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
                placeholder="Tell us how we can help..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: loading ? '#D1D5DB' : '#c0522a',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {loading ? '⏳ Sending...' : '✉️ Send Message'}
            </button>
          </form>

          {/* Quick Contact */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <h3 style={{ color: '#2d1f0e', marginBottom: '1rem' }}>Other Ways to Reach Us</h3>
            <p style={{ color: '#4a3520' }}>
              💬 <a href="https://wa.me/2348101477935" style={{ color: '#25D366', textDecoration: 'none', fontWeight: 'bold' }}>WhatsApp: +234 810 147 7935</a>
            </p>
            <p style={{ color: '#4a3520', marginTop: '0.5rem' }}>
              📧 Email: <a href="mailto:hello@vukafia.com" style={{ color: '#c0522a', textDecoration: 'none' }}>hello@vukafia.com</a>
            </p>
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
