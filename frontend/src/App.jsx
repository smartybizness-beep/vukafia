import { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [listings, setListings] = useState([])
  const [filteredListings, setFilteredListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState('product')
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('')
  const [country, setCountry] = useState('')
  const [category, setCategory] = useState('')
  const [countries, setCountries] = useState([])
  const [categories, setCategories] = useState([])
  const [totalListings, setTotalListings] = useState(0)

  // Claim flow state
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [claimStep, setClaimStep] = useState('search') // search, verify, payment
  const [claimSearch, setClaimSearch] = useState('')
  const [claimCountry, setClaimCountry] = useState('')
  const [claimResults, setClaimResults] = useState([])
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [claimPhone, setClaimPhone] = useState('')
  const [claimLoading, setClaimLoading] = useState(false)
  const [claimMessage, setClaimMessage] = useState('')
  const [claimFee, setClaimFee] = useState(15)
  const [currency, setCurrency] = useState('NGN')
  const [paystackLoading, setPaystackLoading] = useState(false)

  const WA_PHONE = '2348101477935'
  const API_BASE = 'https://vukafia-production.up.railway.app'

  // Fetch listings
  useEffect(() => {
    fetchListings()
    fetchMeta()
  }, [])

  // Filter listings when filters change
  useEffect(() => {
    applyFilters()
  }, [listings, type, search, region, country, category])

  // Handle Paystack payment callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const reference = params.get('reference')
    const listing_id = sessionStorage.getItem('pending_claim_listing_id')

    if (reference && listing_id) {
      verifyPaymentAndCompleteClaim(reference, listing_id)
      sessionStorage.removeItem('pending_claim_listing_id')
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  async function verifyPaymentAndCompleteClaim(reference, listing_id) {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const res = await fetch(`${API_BASE}/api/claims/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reference, listing_id })
      })

      const data = await res.json()
      if (data.success) {
        setShowClaimModal(false)
        resetClaim()
        alert('✅ Business claimed successfully! You can now manage your listing.')
        fetchListings()
      } else {
        alert(`❌ Payment verification failed: ${data.error}`)
      }
    } catch (err) {
      console.error('Payment verification error:', err)
    }
  }

  async function fetchListings() {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/listings?limit=1000`)
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
      const res = await fetch(`${API_BASE}/api/listings/meta/regions`)
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

  const handleRegionClick = (newRegion) => {
    console.log('[REGION CLICK] Setting region to:', newRegion)
    setRegion(newRegion)
  }

  function applyFilters() {
    console.log('[applyFilters] Called with - type:', type, 'region:', region, 'listings:', listings.length)
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

    // Filter by region
    if (region) {
      console.log('[applyFilters] Filtering by region:', region)
      filtered = filtered.filter(l => l.region === region)
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
    fetch(`${API_BASE}/api/listings/${listing.id}/contact`, {
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

  async function searchClaimBusinesses() {
    if (!claimSearch.trim() || !claimCountry) {
      setClaimMessage('Please enter business name and select country')
      return
    }
    setClaimLoading(true)
    setClaimMessage('')
    try {
      const res = await fetch(`${API_BASE}/api/claims/search?name=${encodeURIComponent(claimSearch)}&country=${claimCountry}`)
      const data = await res.json()
      if (data.success) {
        setClaimResults(data.data || [])
        if (data.data.length === 0) {
          setClaimMessage('No businesses found. Contact us to add your business!')
        }
      } else {
        setClaimMessage('Error searching businesses')
      }
    } catch (err) {
      setClaimMessage('Error: ' + err.message)
    } finally {
      setClaimLoading(false)
    }
  }

  async function verifyOwnership() {
    if (!selectedClaim || !claimPhone.trim()) {
      setClaimMessage('Please select a business and enter your phone number')
      return
    }
    setClaimLoading(true)
    setClaimMessage('')
    try {
      const res = await fetch(`${API_BASE}/api/claims/verify-ownership`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          listing_id: selectedClaim.id,
          phone: claimPhone
        })
      })
      const data = await res.json()
      if (data.success) {
        setClaimStep('payment')
        setClaimMessage('✅ Phone verified! Proceed to payment')
      } else {
        setClaimMessage('❌ ' + (data.error || 'Phone does not match this business'))
      }
    } catch (err) {
      setClaimMessage('Error: ' + err.message)
    } finally {
      setClaimLoading(false)
    }
  }

  async function proceedToPayment() {
    if (!selectedClaim) return

    try {
      setPaystackLoading(true)

      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setClaimMessage('❌ Please log in first')
        return
      }

      // Initialize payment with backend
      const res = await fetch(`${API_BASE}/api/claims/initialize-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listing_id: selectedClaim.id,
          currency: currency
        })
      })

      const data = await res.json()
      if (!data.success) {
        setClaimMessage(`❌ ${data.error || 'Failed to initialize payment'}`)
        return
      }

      // Store listing_id for callback verification
      sessionStorage.setItem('pending_claim_listing_id', selectedClaim.id.toString())

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url
    } catch (err) {
      setClaimMessage(`❌ Error: ${err.message}`)
    } finally {
      setPaystackLoading(false)
    }
  }

  function resetClaim() {
    setClaimStep('search')
    setClaimSearch('')
    setClaimCountry('')
    setClaimResults([])
    setSelectedClaim(null)
    setClaimPhone('')
    setClaimMessage('')
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
          <button
            className={`ntab ${type === 'tourism' ? 'active' : ''}`}
            onClick={() => setType('tourism')}
          >
            🏨 Tourism
          </button>
          <button
            className={`ntab ${type === 'medical' ? 'active' : ''}`}
            onClick={() => setType('medical')}
          >
            🏥 Medical
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
          <button
            className="btn-lst"
            onClick={() => { resetClaim(); setShowClaimModal(true) }}
            style={{ background: '#10B981', marginRight: '0.5rem' }}
          >
            ✓ Claim Business
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
            <button
              className={`tbtn t ${type === 'tourism' ? 'active' : ''}`}
              onClick={() => setType('tourism')}
            >
              🏨 Tourism
            </button>
            <button
              className={`tbtn m ${type === 'medical' ? 'active' : ''}`}
              onClick={() => setType('medical')}
            >
              🏥 Medical
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
        <button className={`rtab ${region === '' ? 'active' : ''}`} onClick={() => handleRegionClick('')}>🌍 All Africa</button>
        <button className={`rtab ${region === 'West Africa' ? 'active' : ''}`} onClick={() => handleRegionClick('West Africa')}>🟤 West Africa</button>
        <button className={`rtab ${region === 'East Africa' ? 'active' : ''}`} onClick={() => handleRegionClick('East Africa')}>🟢 East Africa</button>
        <button className={`rtab ${region === 'North Africa' ? 'active' : ''}`} onClick={() => handleRegionClick('North Africa')}>🟡 North Africa</button>
        <button className={`rtab ${region === 'Central Africa' ? 'active' : ''}`} onClick={() => handleRegionClick('Central Africa')}>🟠 Central Africa</button>
        <button className={`rtab ${region === 'Southern Africa' ? 'active' : ''}`} onClick={() => handleRegionClick('Southern Africa')}>🔵 Southern Africa</button>
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
                      {listing.instagram && (
                        <button
                          className="card-btn"
                          onClick={() => {
                            const url = `https://instagram.com/${listing.instagram.replace('@', '')}`;
                            window.open(url, '_blank');
                          }}
                          title={listing.instagram}
                        >
                          📷
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

      {/* Claim Business Modal */}
      {showClaimModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--earth)' }}>
                {claimStep === 'search' && '🔍 Find Your Business'}
                {claimStep === 'verify' && '📱 Verify Ownership'}
                {claimStep === 'payment' && '💳 Complete Payment'}
              </h2>
              <button onClick={() => setShowClaimModal(false)} style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer'
              }}>✕</button>
            </div>

            {/* STEP 1: SEARCH */}
            {claimStep === 'search' && (
              <div>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  Search for your business in our directory. If found, you can claim it and get a verified badge.
                </p>
                <input
                  type="text"
                  placeholder="Business name (e.g., Nike Store, Mama's Food)"
                  value={claimSearch}
                  onChange={e => setClaimSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    marginBottom: '1rem',
                    boxSizing: 'border-box',
                    fontSize: '1rem'
                  }}
                />
                <select
                  value={claimCountry}
                  onChange={e => setClaimCountry(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    marginBottom: '1rem',
                    boxSizing: 'border-box',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button
                  onClick={searchClaimBusinesses}
                  disabled={claimLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: claimLoading ? 'not-allowed' : 'pointer',
                    opacity: claimLoading ? 0.6 : 1
                  }}
                >
                  {claimLoading ? 'Searching...' : 'Search'}
                </button>

                {claimMessage && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: claimMessage.includes('✅') ? '#ECFDF5' : '#FEF2F2',
                    color: claimMessage.includes('✅') ? '#065F46' : '#7F1D1D',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}>
                    {claimMessage}
                  </div>
                )}

                {claimResults.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#333' }}>Found Businesses:</h3>
                    {claimResults.map(business => (
                      <div
                        key={business.id}
                        onClick={() => {
                          if (business.claimed) {
                            setClaimMessage('This business has already been claimed by another owner.');
                            return
                          }
                          setSelectedClaim(business)
                          setClaimStep('verify')
                          setClaimMessage('')
                        }}
                        style={{
                          padding: '1rem',
                          background: business.claimed ? '#FEF2F2' : '#F3F4F6',
                          borderRadius: '8px',
                          marginBottom: '0.75rem',
                          cursor: business.claimed ? 'not-allowed' : 'pointer',
                          borderLeft: `4px solid ${business.claimed ? '#EF4444' : 'var(--accent)'}`,
                          transition: 'all 0.2s',
                          opacity: business.claimed ? 0.6 : 1
                        }}
                        onMouseOver={e => !business.claimed && (e.currentTarget.style.background = '#E5E7EB')}
                        onMouseOut={e => (e.currentTarget.style.background = business.claimed ? '#FEF2F2' : '#F3F4F6')}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.25rem' }}>
                          <div style={{ fontWeight: 'bold' }}>{business.name}</div>
                          {business.claimed && (
                            <span style={{
                              background: '#EF4444',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 'bold'
                            }}>
                              CLAIMED
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          {business.category} • {business.city}, {business.country}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          ⭐ {business.rating || 'New'} • 📱 {business.phone}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: VERIFY */}
            {claimStep === 'verify' && selectedClaim && (
              <div>
                <p style={{ color: '#666', marginBottom: '1rem' }}>
                  Verify that you own <strong>{selectedClaim.name}</strong> by confirming your business phone number.
                </p>
                <div style={{
                  padding: '1rem',
                  background: '#F0FDF4',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  borderLeft: '4px solid #10B981'
                }}>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <strong>Business Phone on File:</strong>
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {selectedClaim.phone}
                  </div>
                </div>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  Enter your business phone number to verify:
                </p>
                <input
                  type="tel"
                  placeholder="+234..."
                  value={claimPhone}
                  onChange={e => setClaimPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    marginBottom: '1rem',
                    boxSizing: 'border-box',
                    fontSize: '1rem'
                  }}
                />
                <button
                  onClick={verifyOwnership}
                  disabled={claimLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: claimLoading ? 'not-allowed' : 'pointer',
                    opacity: claimLoading ? 0.6 : 1,
                    marginBottom: '0.75rem'
                  }}
                >
                  {claimLoading ? 'Verifying...' : 'Verify Phone'}
                </button>
                <button
                  onClick={() => setClaimStep('search')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#E5E7EB',
                    color: '#333',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>

                {claimMessage && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: claimMessage.includes('✅') ? '#ECFDF5' : '#FEF2F2',
                    color: claimMessage.includes('✅') ? '#065F46' : '#7F1D1D',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}>
                    {claimMessage}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: PAYMENT */}
            {claimStep === 'payment' && selectedClaim && (
              <div>
                <div style={{
                  padding: '1.5rem',
                  background: '#F9F5E6',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  textAlign: 'center',
                  borderLeft: '4px solid var(--accent)'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '1.1rem' }}>{selectedClaim.name}</strong>
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
                    {selectedClaim.city}, {selectedClaim.country}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D97706', marginBottom: '0.5rem' }}>
                    {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? '6,000' : '15'}
                  </div>
                  <div style={{ color: '#666', fontSize: '0.9rem' }}>
                    One-time claim & verification fee
                  </div>
                </div>

                <div style={{
                  marginBottom: '1.5rem',
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={() => setCurrency('NGN')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: currency === 'NGN' ? '#D97706' : '#E5E7EB',
                      color: currency === 'NGN' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    NGN (Nigeria)
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: currency === 'USD' ? '#D97706' : '#E5E7EB',
                      color: currency === 'USD' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    USD (International)
                  </button>
                </div>

                <div style={{
                  background: '#E0F2FE',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                  color: '#0369A1',
                  lineHeight: '1.6'
                }}>
                  ✅ <strong>Get a verified badge</strong><br/>
                  ✅ <strong>Manage your listing</strong><br/>
                  ✅ <strong>See who contacted you</strong><br/>
                  ✅ <strong>Access premium features</strong>
                </div>

                {claimMessage && (
                  <div style={{
                    padding: '0.75rem',
                    background: '#FEE2E2',
                    color: '#991B1B',
                    borderRadius: '6px',
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                  }}>
                    {claimMessage}
                  </div>
                )}

                <button
                  onClick={proceedToPayment}
                  disabled={paystackLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: paystackLoading ? '#D1D5DB' : 'var(--accent)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: paystackLoading ? 'not-allowed' : 'pointer',
                    marginBottom: '0.75rem'
                  }}
                >
                  {paystackLoading ? '⏳ Processing...' : '💳 Pay with Paystack'}
                </button>
                <button
                  onClick={() => setShowClaimModal(false)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#E5E7EB',
                    color: '#333',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>

                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: '#FEF3C7',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#92400E'
                }}>
                  💬 Click "Pay $15 via WhatsApp" to complete payment through our team.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
