import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('NG');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, [selectedCountry, selectedCategory]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCountry) params.append('country', selectedCountry);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/templates?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (templateId) => {
    try {
      const headers = {};
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/templates/${templateId}/download`, {
        method: 'POST',
        headers
      });

      if (response.status === 402) {
        alert('Free access expired. Upgrade to premium to download.');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        // Redirect to file URL
        window.open(data.file_url, '_blank');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to download template'}`);
      }
    } catch (err) {
      console.error('Error downloading template:', err);
      alert('Error downloading template. Please try again.');
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ color: '#2d1f0e', marginBottom: '1rem' }}>📄 Trade Document Templates</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Free access for 7 days to essential trade documents. After 7 days, upgrade to premium.
        </p>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Country:
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">All Countries</option>
              <option value="NG">🇳🇬 Nigeria</option>
              <option value="KE">🇰🇪 Kenya</option>
              <option value="GH">🇬🇭 Ghana</option>
              <option value="BJ">🇧🇯 Benin</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Document Type:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">All Types</option>
              <option value="invoicing">Invoice Templates</option>
              <option value="shipping">Shipping Documents</option>
              <option value="customs">Customs Forms</option>
              <option value="compliance">Compliance Checklists</option>
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            Loading templates...
          </div>
        ) : templates.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: '#f9f9f9',
            borderRadius: '8px',
            color: '#666'
          }}>
            No templates found for your selection.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}>
            {templates.map(template => (
              <div
                key={template.id}
                style={{
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#2d1f0e' }}>
                    {template.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      background: '#e8f5e9',
                      color: '#2e7d32',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {template.country_name}
                    </span>
                    <span style={{
                      background: '#f3e5f5',
                      color: '#6a1b9a',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      {template.template_type}
                    </span>
                  </div>
                </div>

                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', minHeight: '60px' }}>
                  {template.description}
                </p>

                <button
                  onClick={() => handleDownload(template.id)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#c0522a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                  }}
                >
                  📥 Download (Free - 7 days)
                </button>

                {template.instructions && (
                  <details style={{ fontSize: '0.85rem', color: '#666' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                      View Instructions
                    </summary>
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee' }}>
                      {template.instructions}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
