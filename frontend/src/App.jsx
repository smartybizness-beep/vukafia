import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LANGUAGE_NAMES, TRANSLATIONS } from './languages'
import './App.css'

const BusinessCardLink = ({ listing, children }) => {
  return (
    <Link
      to={`/business/${listing.id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      {children}
    </Link>
  );
}

// v2.1 - fixed CORS and relative URLs
export default function App() {
  const navigate = useNavigate()
  const [language, setLanguage] = useState('en')
  const [showLangMenu, setShowLangMenu] = useState(false)
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
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showFooterAbout, setShowFooterAbout] = useState(false)

  const t = TRANSLATIONS[language] || TRANSLATIONS.en

  // Load language preference from localStorage (default: English)
  useEffect(() => {
    const savedLang = localStorage.getItem('vukafiaLanguage')
    setLanguage(savedLang && Object.keys(TRANSLATIONS).includes(savedLang) ? savedLang : 'en')
  }, [])

  const changeLanguage = (lang) => {
    setLanguage(lang)
    localStorage.setItem('vukafiaLanguage', lang)
    setShowLangMenu(false)
  }

  // Claim flow state
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [claimStep, setClaimStep] = useState('search') // search, verify, edit, payment
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
  // Edit business info state
  const [claimBusinessPhoto, setClaimBusinessPhoto] = useState('')
  const [claimBusinessPhone, setClaimBusinessPhone] = useState('')
  const [claimBusinessEmail, setClaimBusinessEmail] = useState('')
  const [claimBusinessWebsite, setClaimBusinessWebsite] = useState('')
  const [claimContactName, setClaimContactName] = useState('')

  const WA_PHONE = '2348101477935'
  const API_BASE = ''

  // Fetch listings once on mount
  useEffect(() => {
    fetchListings()
    fetchMeta()
  }, [])

  // Refetch when type changes, otherwise just filter
  useEffect(() => {
    if (type) {
      setCurrentPage(1)
      fetchListings(1)
    } else {
      applyFilters()
    }
  }, [type])

  // Filter listings when other filters change
  useEffect(() => {
    applyFilters()
  }, [listings, search, region, country, category])

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

  async function fetchListings(page = 1, append = false) {
    try {
      if (!append) setLoading(true)
      else setLoadingMore(true)

      const typeParam = type ? `&type=${type}` : ''
      const res = await fetch(`${API_BASE}/api/listings?page=${page}&limit=50${typeParam}`)
      const data = await res.json()
      if (data.success) {
        const newListings = data.data || []

        if (append) {
          setListings(prev => [...prev, ...newListings])
        } else {
          setListings(newListings)
        }

        setTotalListings(data.pagination?.total || 0)
        setCurrentPage(page)
        setHasMore(data.pagination?.has_next || false)
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err)
    } finally {
      if (!append) setLoading(false)
      else setLoadingMore(false)
    }
  }

  async function loadMore() {
    await fetchListings(currentPage + 1, true)
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
    console.log('[REGION CLICK v3] Setting region to:', newRegion)
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

    // Sort: Featured/Claimed businesses first, then by rating
    filtered.sort((a, b) => {
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1
      }
      if (a.verified_source === 'owner_claimed' && b.verified_source !== 'owner_claimed') {
        return -1
      }
      if (a.verified_source !== 'owner_claimed' && b.verified_source === 'owner_claimed') {
        return 1
      }
      return (b.rating || 0) - (a.rating || 0)
    })

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
        // Initialize edit fields with current business data
        setClaimBusinessPhone(selectedClaim.phone || '')
        setClaimBusinessEmail(selectedClaim.email || '')
        setClaimBusinessWebsite(selectedClaim.website || '')
        setClaimBusinessPhoto(selectedClaim.cover_photo || '')
        setClaimContactName('')
        setClaimStep('edit')
        setClaimMessage('✅ Phone verified! Update your business information')
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
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <img src="/assets/vukafia-logo.png" alt="Vukafia" className="logo-image" />
        </Link>
        <div className="ntabs">
          <button
            className={`ntab ${type === 'product' ? 'active' : ''}`}
            onClick={() => setType('product')}
          >
            {t.products}
          </button>
          <button
            className={`ntab ${type === 'service' ? 'active' : ''}`}
            onClick={() => setType('service')}
          >
            {t.services}
          </button>
          <button
            className={`ntab ${type === 'restaurant' ? 'active' : ''}`}
            onClick={() => setType('restaurant')}
          >
            {t.restaurants}
          </button>
          <button
            className={`ntab ${type === 'tourism' ? 'active' : ''}`}
            onClick={() => setType('tourism')}
          >
            {t.tourism}
          </button>
          <button
            className={`ntab ${type === 'medical' ? 'active' : ''}`}
            onClick={() => setType('medical')}
          >
            {t.medical}
          </button>
        </div>
        <div className="nav-right">
          <div className="nav-stat">
            <strong>{totalListings}</strong>{t.listings}
          </div>
          <div className="nav-stat">
            <strong>54+</strong>{t.nations}
          </div>

          <button className="btn-wa-n" onClick={() => openWhatsApp(`👋 Welcome to Vukafia! I'm Trima, your AI assistant.\n\nWhat would you like to do?\n\n1️⃣ Register a new business\n2️⃣ Claim an existing business\n3️⃣ Search for businesses`)}>
            {t.whatsappAi}
          </button>
          <button
            className="btn-lst"
            onClick={() => { resetClaim(); setShowClaimModal(true) }}
          >
            {t.claimBusiness}
          </button>
          <button className="btn-lst" onClick={listBusiness}>
            {t.listBusiness}
          </button>

          {/* Language Selector (Last) */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                padding: 'clamp(0.3rem, 2vw, 0.5rem) clamp(0.5rem, 3vw, 0.8rem)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: 'clamp(0.65rem, 2vw, 0.75rem)',
                fontWeight: 'bold',
                minWidth: 'clamp(60px, 15vw, 100px)',
                whiteSpace: 'nowrap'
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
                zIndex: 500,
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
        </div>
      </nav>

      <div className="hero">
        <div className="hero-pat"></div>
        <div className="hero-in">
          <div className="h-pill">🌍 {t.heroTagline}</div>
          <h1>Trans-African #1<br /><em>Business Directory</em></h1>
          <p>{t.heroDesc}</p>
          <div className="type-tog">
            <button
              className={`tbtn p ${type === 'product' ? 'active' : ''}`}
              onClick={() => setType('product')}
            >
              {t.products}
            </button>
            <button
              className={`tbtn s ${type === 'service' ? 'active' : ''}`}
              onClick={() => setType('service')}
            >
              {t.services}
            </button>
            <button
              className={`tbtn r ${type === 'restaurant' ? 'active' : ''}`}
              onClick={() => setType('restaurant')}
            >
              {t.restaurants}
            </button>
            <button
              className={`tbtn t ${type === 'tourism' ? 'active' : ''}`}
              onClick={() => setType('tourism')}
            >
              {t.tourism}
            </button>
            <button
              className={`tbtn m ${type === 'medical' ? 'active' : ''}`}
              onClick={() => setType('medical')}
            >
              {t.medical}
            </button>
          </div>
          <div className="sw">
            <div className="sr">
              <div className="si">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button className="bs" onClick={applyFilters}>{t.search}</button>
            </div>
            <div className="lr">
              <select className="lsel" value={country} onChange={e => setCountry(e.target.value)}>
                <option value="">{t.allCountries}</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="lsel" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">{t.allCategories}</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="rbar">
        <select
          className="lsel"
          style={{background: 'var(--em)', color: '#fff', border: 'none', borderRadius: '0', padding: '0.75rem 1.2rem', fontSize: '0.79rem'}}
          value={region}
          onChange={(e) => {
            console.log('[Region Select] Changed to:', e.target.value)
            setRegion(e.target.value)
          }}
        >
          <option value="">{t.allAfrica}</option>
          <option value="West Africa">{t.westAfrica}</option>
          <option value="East Africa">{t.eastAfrica}</option>
          <option value="North Africa">{t.northAfrica}</option>
          <option value="Central Africa">{t.centralAfrica}</option>
          <option value="Southern Africa">{t.southernAfrica}</option>
        </select>
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
              onClick={() => openWhatsApp(`👋 Welcome to Vukafia! I'm Trima, your AI assistant.\n\nWhat would you like to do?\n\n1️⃣ Register a new business\n2️⃣ Claim an existing business\n3️⃣ Search for businesses`)}
            >
              💬 Open WhatsApp AI
            </button>
          </div>
        </aside>

        <main className="main">
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              {type === 'product' ? '🛍️ Products'
                : type === 'service' ? '🔧 Services'
                : type === 'restaurant' ? '🍽️ Restaurants'
                : type === 'tourism' ? '🏨 Tourism'
                : type === 'medical' ? '🏥 Medical'
                : type}
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
                <BusinessCardLink key={listing.id} listing={listing}>
                  <div className="card">
                    <div className="card-img-container">
                      <img
                        src={listing.cover_photo || 'https://images.unsplash.com/photo-1553729783-c91953dec042?w=500&q=75'}
                        alt={listing.name}
                        className="card-img"
                      />
                      {listing.featured && (
                        <div className="verified-badge" style={{ background: '#FFD700', color: '#000', fontWeight: 'bold' }}>⭐ Featured</div>
                      )}
                      {listing.verified_source === 'owner_claimed' && (
                        <div className="verified-badge" style={{ background: '#4CAF50', color: '#fff', fontWeight: 'bold' }}>✓ Claimed</div>
                      )}
                      {listing.verified_source === 'WhatsApp AI' && (
                        <div className="verified-badge whatsapp-verified">💬 WhatsApp AI Verified</div>
                      )}
                      {listing.verified_source === 'Google Maps' && (
                        <div className="verified-badge google-verified">🔍 Google Verified</div>
                      )}
                    </div>
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
                </BusinessCardLink>
              ))}
            </div>
          )}

          {!loading && filteredListings.length > 0 && hasMore && (
            <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  padding: '0.5rem 1.1rem',
                  background: loadingMore ? '#ccc' : 'var(--t)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: loadingMore ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s',
                  opacity: loadingMore ? 0.7 : 1,
                  minWidth: '140px',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={e => !loadingMore && (e.target.style.background = 'var(--tl)')}
                onMouseOut={e => !loadingMore && (e.target.style.background = 'var(--t)')}
              >
                {loadingMore ? t.loading : t.scrollDown}
              </button>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--mu)', fontWeight: 600 }}>
                Page {currentPage} • {filteredListings.length} {type === 'product' ? 'Products' : type === 'service' ? 'Services' : type === 'restaurant' ? 'Restaurants' : type === 'tourism' ? 'Tourism' : 'Medical'} shown
              </p>
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
                {claimStep === 'edit' && '✏️ Update Business Info'}
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

            {/* STEP 3: EDIT BUSINESS INFO */}
            {claimStep === 'edit' && selectedClaim && (
              <div>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                  Update your business information. All fields are optional except phone.
                </p>

                {/* Contact Name */}
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                  Business Contact Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Your name or department name"
                  value={claimContactName}
                  onChange={e => setClaimContactName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    marginBottom: '1.25rem',
                    boxSizing: 'border-box',
                    fontSize: '1rem'
                  }}
                />

                {/* Phone */}
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                  Business Phone
                </label>
                <input
                  type="tel"
                  placeholder="+234..."
                  value={claimBusinessPhone}
                  onChange={e => setClaimBusinessPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    marginBottom: '1.25rem',
                    boxSizing: 'border-box',
                    fontSize: '1rem'
                  }}
                />

                {/* Email */}
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="business@example.com"
                  value={claimBusinessEmail}
                  onChange={e => setClaimBusinessEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    marginBottom: '1.25rem',
                    boxSizing: 'border-box',
                    fontSize: '1rem'
                  }}
                />

                {/* Website */}
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                  Website
                </label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={claimBusinessWebsite}
                  onChange={e => setClaimBusinessWebsite(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    marginBottom: '1.25rem',
                    boxSizing: 'border-box',
                    fontSize: '1rem'
                  }}
                />

                {/* Photo Upload */}
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
                  Business Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (evt) => setClaimBusinessPhoto(evt.target.result)
                      reader.readAsDataURL(file)
                    }
                  }}
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

                {claimBusinessPhoto && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <img
                      src={claimBusinessPhoto}
                      alt="Preview"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '200px',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                )}

                <button
                  onClick={() => setClaimStep('payment')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0284c7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: '0.75rem'
                  }}
                >
                  Continue to Payment
                </button>
                <button
                  onClick={() => setClaimStep('verify')}
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
              </div>
            )}

            {/* STEP 4: PAYMENT */}
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
        background: '#2d1f0e',
        color: '#fff',
        padding: '2rem 1.5rem',
        marginTop: '3rem',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Footer Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <img
            src="/assets/vukafia-logo.png"
            alt="Vukafia"
            className="footer-logo"
            style={{
              height: 'clamp(50px, 10vw, 80px)',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>

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
              <a href="mailto:hello@vukafia.com" style={{ color: '#d4a017', textDecoration: 'none' }}>
                📧 Email: hello@vukafia.com
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
            © 2026 Vukafia. Rising Markets. Connecting Africa.
          </p>
          <p style={{ margin: '0.5rem 0', fontSize: '0.75rem', opacity: 0.6 }}>
            Serving businesses across Africa | Privacy Policy | Terms of Service
          </p>
        </div>
      </footer>
    </>
  )
}
