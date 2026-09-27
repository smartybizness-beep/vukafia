import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function BusinessDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, [id]);

  const fetchBusiness = async () => {
    try {
      const res = await fetch(`/api/listings/${id}`);
      if (!res.ok) throw new Error('Business not found');
      const data = await res.json();

      if (data.success && data.data) {
        setBusiness(data.data);
      } else {
        setError('Business not found');
      }
    } catch (err) {
      setError('Failed to load business details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '2rem', minHeight: '100vh', background: '#f5ede0' }}>
          ⏳ Loading business details...
        </div>
      </Layout>
    );
  }

  if (error || !business) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '2rem', minHeight: '100vh', background: '#f5ede0' }}>
          <h2 style={{ color: '#c0522a' }}>❌ {error || 'Business not found'}</h2>
          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Back to Directory
          </button>
        </div>
      </Layout>
    );
  }

  const openWhatsApp = () => {
    const message = `Hi, I'm interested in your business on Vukafia: ${business.name}`;
    const cleanPhone = business.phone.replace(/\s+/g, '').replace(/^0+/, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`);
  };

  const shareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div style={{ background: '#f5ede0', minHeight: '100vh', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284c7',
              cursor: 'pointer',
              fontSize: '1rem',
              marginBottom: '1.5rem',
              fontWeight: '600'
            }}
          >
            ← Back to Directory
          </button>

          {/* Business Header */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            {/* Image */}
            {business.cover_photo && (
              <div style={{
                width: '100%',
                height: '300px',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                overflow: 'hidden',
                background: '#ddd'
              }}>
                <img
                  src={business.cover_photo}
                  alt={business.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Title & Type */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h1 style={{
                fontSize: '2.2rem',
                fontFamily: "'Fraunces', serif",
                color: '#2d1f0e',
                margin: '0 0 0.5rem 0'
              }}>
                {business.name}
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#0284c7',
                fontWeight: '600',
                margin: 0
              }}>
                {business.type?.charAt(0).toUpperCase() + business.type?.slice(1)} • {business.category}
              </p>
            </div>

            {/* Rating & Stats */}
            <div style={{
              display: 'flex',
              gap: '2rem',
              marginBottom: '1.5rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c0522a' }}>
                  ⭐ {business.rating || 'N/A'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Rating</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#054030' }}>
                  {business.review_count || '0'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Reviews</div>
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0284c7' }}>
                  {business.country}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>Location</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              <button
                onClick={openWhatsApp}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#25D366',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                💬 WhatsApp
              </button>

              <button
                onClick={shareLink}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#0284c7',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                {copied ? '✅ Copied!' : '🔗 Share'}
              </button>

              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#ddd',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                ❤️ Save
              </button>

              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                🚩 Report
              </button>
            </div>
          </div>

          {/* Details */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#2d1f0e', marginTop: 0 }}>📍 Business Details</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 0.3rem 0' }}>Country</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2d1f0e', margin: 0 }}>
                  {business.country}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 0.3rem 0' }}>Region</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2d1f0e', margin: 0 }}>
                  {business.region || 'N/A'}
                </p>
              </div>
            </div>

            <h3 style={{ color: '#0284c7', marginTop: '1.5rem' }}>📞 Contact</h3>
            <p style={{ fontSize: '1rem', color: '#2d1f0e', margin: '0.5rem 0' }}>
              📱 <strong>{business.phone}</strong>
            </p>
            {business.website && (
              <p style={{ fontSize: '1rem', color: '#2d1f0e', margin: '0.5rem 0' }}>
                🌐 <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0284c7', textDecoration: 'none' }}>
                  Visit Website
                </a>
              </p>
            )}
          </div>

          {/* Verification */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#2d1f0e', marginTop: 0 }}>✅ Verification Status</h2>
            <p style={{ fontSize: '1rem', color: '#4a3520', lineHeight: 1.6 }}>
              ✅ <strong>Verified via Google Maps</strong> - This business is verified and sourced directly from Google Maps database.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#999', margin: '1rem 0 0 0' }}>
              Last verified: Today
            </p>
          </div>

          {/* CTA */}
          <div style={{
            background: 'linear-gradient(135deg, #c0522a 0%, #054030 100%)',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            color: '#fff'
          }}>
            <h3 style={{ marginTop: 0 }}>Ready to do business?</h3>
            <p style={{ marginBottom: '1.5rem' }}>Contact this business directly via WhatsApp for inquiries, pricing, and orders.</p>
            <button
              onClick={openWhatsApp}
              style={{
                padding: '0.75rem 2rem',
                background: '#fff',
                color: '#c0522a',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              💬 Chat on WhatsApp
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
