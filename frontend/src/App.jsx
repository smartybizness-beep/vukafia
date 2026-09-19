import { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [listings, setListings] = useState([])
  const [filteredListings, setFilteredListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('product')
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [category, setCategory] = useState('')
  const [countries, setCountries] = useState([])
  const [categories, setCategories] = useState([])
  const [totalListings, setTotalListings] = useState(0)

  const WA_PHONE = '2348101477935'

  // Fetch listings
  useEffect(() => {
    fetchListings()
    fetchMeta()
  }, [])

  // Filter listings when filters change
  useEffect(() => {
    applyFilters()
  }, [listings, type, search, country, category])

  async function fetchListings() {
    try {
      setLoading(true)
      const res = await fetch('/api/listings?limit=1000')
      const data = await res.json()
      if (data.success) {
        setListings(data.data || [])
        setTotalListings(data.pagination?.total || 0)
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchMeta() {
    try {
      console.log('Fetching metadata from: /api/listings/meta/regions')
      const res = await fetch('/api/listings/meta/regions')
      const data = await res.json()
      console.log('Metadata response:', data)
      if (data.success) {
        const countryList = [...new Set(data.data.countries.map(c => c.country))].sort()
        const categoryList = [...new Set(data.data.categories.map(c => c.category))].sort()
        console.log('Countries:', countryList)
        console.log('Categories:', categoryList)
        setCountries(countryList)
        setCategories(categoryList)
      }
    } catch (err) {
      console.error('Failed to fetch metadata:', err)
    }
  }

  function applyFilters() {
    let filtered = [...listings]

    // Filter by type
    if (type) {
      filtered = filtered.filter(l => l.type === type)
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.products_services.toLowerCase().includes(q)
      )
    }

    // Filter by country
    if (country) {
      filtered = filtered.filter(l => l.country === country)
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter(l => l.category === category)
    }

    setFilteredListings(filtered)
  }

  function openWhatsApp(msg = '') {
    const text = msg || 'Hi Vukafia! Help me find products and services across all 54 African nations.'
    window.open(`https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`, '_blank')
  }

  function listBusiness() {
    openWhatsApp('Hi Vukafia! I want to list my business. Please help me get started.')
  }

  function contactListing(listing, type) {
    // Track contact
    fetch(`/api/listings/${listing.id}/contact`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contact_type: type })
    }).catch(console.error)

    // Open contact method
    if (type === 'call' && listing.phone) {
      window.open(`tel:${listing.phone}`)
    } else if (type === 'whatsapp' && listing.whatsapp) {
      openWhatsApp(`Hi, I'm interested in your listing: ${listing.name}`)
    } else if (type === 'email' && listing.email) {
      window.open(`mailto:${listing.email}?subject=Interested in ${listing.name}`)
    } else if (type === 'website' && listing.website) {
      window.open(listing.website, '_blank')
    }
  }

  return (
    <>
      <nav>
        <div className="logo" onClick={() => window.location.reload()}>
          <div className="logo-mark">V</div>
          <div className="logo-text">Vuk<span>A</span>fia</div>
        </div>
        <div className="ntabs">
          <button
            className={`ntab ${type === 'product' ? 'active' : ''}`}
            onClick={() => setType('product')}
          >
            🛍️ Products
          </button>
          <button
            className={`ntab ${type === 'service' ? 'active' : ''}`}
            onClick={() => setType('service')}
          >
            🔧 Services
          </button>
        </div>
        <div className="nav-right">
          <div className="nav-stat">
            <strong>{totalListings}</strong>Listings
          </div>
          <div className="nav-stat">
            <strong>54+</strong>Nations
          </div>
          <button className="btn-wa-n" onClick={() => openWhatsApp()}>
            💬 WhatsApp AI
          </button>
          <button className="btn-lst" onClick={listBusiness}>
            + List Business
          </button>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-pat"></div>
        <div className="hero-in">
          <div className="h-pill">🌍 Rising Markets. Connecting Africa.</div>
          <h1>Trans-African #1<br /><em>Business Directory</em></h1>
          <p>Discover verified products and services from businesses across all 54 African nations. Search, connect, trade — powered by WhatsApp AI.</p>
          <div className="type-tog">
            <button
              className={`tbtn p ${type === 'product' ? 'active' : ''}`}
              onClick={() => setType('product')}
            >
              🛍️ Products
            </button>
            <button
              className={`tbtn s ${type === 'service' ? 'active' : ''}`}
              onClick={() => setType('service')}
            >
              🔧 Services
            </button>
          </div>
          <div className="sw">
            <div className="sr">
              <div className="si">
                <input
                  type="text"
                  placeholder="Search businesses, products, services…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button className="bs" onClick={applyFilters}>Search</button>
            </div>
            <div className="lr">
              <select className="lsel" value={country} onChange={e => setCountry(e.target.value)}>
                <option value="">🌍 All Countries</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="lsel" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="rbar">
        <div className="rtab active">🌍 All Africa</div>
        <div className="rtab">🟤 West Africa</div>
        <div className="rtab">🟢 East Africa</div>
        <div className="rtab">🟡 North Africa</div>
        <div className="rtab">🟠 Central Africa</div>
        <div className="rtab">🔵 Southern Africa</div>
      </div>

      <div className="layout">
        <aside className="sb">
          <div className="sbb">
            <div className="sbt">📍 Filters</div>
            <select
              className="lf"
              value={country}
              onChange={e => setCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              className="lf"
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="sbb">
            <div className="sbt">💬 WhatsApp AI</div>
            <p style={{ fontSize: '0.77rem', color: 'var(--mu)', marginBottom: '0.65rem', lineHeight: 1.5 }}>
              Find what you need in any language.
            </p>
            <button
              style={{
                width: '100%',
                padding: '0.6rem',
                background: 'var(--wa)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              onClick={() => openWhatsApp()}
            >
              💬 Open WhatsApp AI
            </button>
          </div>
        </aside>

        <main className="main">
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {type === 'product' ? '🛍️ Products' : '🔧 Services'}
              <span style={{ marginLeft: '0.5rem', color: 'var(--mu)' }}>
                ({filteredListings.length})
              </span>
            </div>
          </div>

          {loading && (
            <div className="loading">⏳ Loading listings…</div>
          )}

          {!loading && filteredListings.length === 0 && (
            <div className="empty">
              <div className="empty-icon">🔍</div>
              <h3>No listings found</h3>
              <p>Try adjusting your filters or search term.</p>
            </div>
          )}

          {!loading && filteredListings.length > 0 && (
            <div className="grid">
              {filteredListings.map(listing => (
                <div key={listing.id} className="card">
                  <img
                    src={listing.cover_photo || 'https://images.unsplash.com/photo-1553729783-c91953dec042?w=500&q=75'}
                    alt={listing.name}
                    className="card-img"
                  />
                  <div className="card-body">
                    <div className="card-name">{listing.name}</div>
                    <div className="card-cat">{listing.category}</div>
                    <div className="card-rating">
                      ⭐ {listing.rating || 'New'} ({listing.review_count || 0})
                    </div>
                    <div className="card-location">
                      📍 {listing.city || listing.state}, {listing.country}
                    </div>
                    <div className="card-btns">
                      {listing.phone && (
                        <button
                          className="card-btn"
                          onClick={() => contactListing(listing, 'call')}
                        >
                          📞
                        </button>
                      )}
                      {listing.whatsapp && (
                        <button
                          className="card-btn"
                          onClick={() => contactListing(listing, 'whatsapp')}
                        >
                          💬
                        </button>
                      )}
                      {listing.email && (
                        <button
                          className="card-btn"
                          onClick={() => contactListing(listing, 'email')}
                        >
                          ✉️
                        </button>
                      )}
                      {listing.website && (
                        <button
                          className="card-btn"
                          onClick={() => contactListing(listing, 'website')}
                        >
                          🌐
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <footer style={{
        background: 'var(--earth)',
        color: 'rgba(255,255,255,.5)',
        padding: '2rem',
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.25rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
            Vuk<span style={{ color: 'var(--gl)' }}>A</span>fia
          </div>
          <div style={{ fontSize: '0.75rem', marginTop: '0.3rem' }}>
            Rising Markets. Connecting Africa. · vukafia.com
          </div>
        </div>
      </footer>
    </>
  )
}
