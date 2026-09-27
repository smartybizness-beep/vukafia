# Vukafia Implementation Guide
## Complete Technical Documentation

**Project**: Vukafia Trans-African Business Directory  
**Date**: September 25, 2026 (Updated)  
**Status**: Live & Operational (218+ Listings, 54+ Nations, Real Photos)  
**Latest Updates**: Restaurant type filter, B2B commodity focus, Google Maps photos, Pagination

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Setup](#database-setup)
3. [Deployment Pipeline](#deployment-pipeline)
4. [API Configuration](#api-configuration)
5. [Frontend Implementation](#frontend-implementation)
6. [Business Types & Categories](#business-types--categories)
7. [Image Handling](#image-handling)
8. [Domain & DNS Setup](#domain--dns-setup)
9. [Security Configuration](#security-configuration)
10. [Google Maps Crawler](#google-maps-crawler)
11. [Pagination & Performance](#pagination--performance)
12. [Trima AI Assistant & Knowledge Base](#trima-ai-assistant--knowledge-base)
13. [Troubleshooting Reference](#troubleshooting-reference)

---

## Architecture Overview

### Technology Stack
- **Frontend**: React 18 + Vite (TypeScript/JSX)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Railway)
- **Deployment**: Railway (auto-deploy from GitHub)
- **Domain**: vukafia.com (Namecheap + Railway custom domain)
- **CI/CD**: GitHub Actions (disabled, using Railway auto-deploy)

### System Design
```
GitHub (source code)
    ↓ (auto-deploy webhook)
Railway Platform
    ├─ API Service (Node.js/Express on port 5000)
    ├─ PostgreSQL Database
    └─ Static Frontend (React SPA)
    ↓
vukafia.com (custom domain via Railway)
```

---

## Database Setup

### Initialization
1. **Environment**: Production uses PostgreSQL (DATABASE_URL env var)
2. **Schema Migration**: Knex.js handles schema creation
3. **Migrations Directory**: `migrations/` folder contains schema definitions
4. **Migration Trigger**: Runs automatically on application startup

### Schema Components
- **listings table**: Primary business directory (216 records)
- **users table**: Future business owner accounts
- **claims table**: Business verification workflow
- Supporting tables for categories, ratings, reviews

### Running Migrations
```bash
npm run migrate  # Manually trigger migrations if needed
```

### Connection String Format
```
postgresql://user:password@host:port/database
```

---

## Deployment Pipeline

### GitHub Auto-Deploy Configuration
1. **Trigger**: Any push to `main` branch
2. **Method**: Railway detects GitHub webhook
3. **Build Process**:
   - Runs `npm install`
   - Runs `npm run build` (rebuilds frontend)
   - Starts with `node server.js`

### Deployment Steps
1. Commit code changes
2. Push to GitHub main branch
3. Railway webhook triggers automatically
4. Build logs appear in Railway Deployments → Deploy Logs
5. Application restarts with new code

### Monitoring Deployments
- **Status**: Railway Dashboard → Deployments → Active
- **Logs**: Deploy Logs tab shows startup sequence
- **Health**: GET /health endpoint returns connection status

---

## API Configuration

### CORS Setup
**File**: `server.js` (lines 49-53)

```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'https://vukafia.com', 'https://www.vukafia.com'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### Endpoints
- `GET /api/listings` - All businesses (queryable with limit)
- `GET /api/listings/meta/regions` - Region metadata
- `POST /api/search/ai` - AI-powered search
- `POST /api/business/register` - New business registration
- `GET /health` - Health check endpoint

### Rate Limiting
- **API**: 200 requests per 15 minutes
- **Auth**: 10 attempts per 15 minutes

---

## Frontend Implementation

### Key Files
- **App.jsx**: Main React component with business listings
- **index.css**: Styling with color variables and responsive design
- **dist/**: Built production files (committed to git for faster deploys)

### API Integration
**Location**: `frontend/src/App.jsx` (line 32)

```javascript
const API_BASE = ''  // Relative URLs (calls same origin)
```

**Why Relative URLs**: 
- Frontend served from vukafia.com
- API also on vukafia.com
- No CORS issues with same origin

### Key Features
1. **Type Filtering**: Products, Services, Restaurants, Tourism, Medical (5 types)
2. **Category Filtering**: Agricultural Products, Minerals & Mining, Manufacturing, Beauty & Personal Care, etc.
3. **Region Selection**: Dropdown filters by African region
4. **Business Cards**: Display name, rating, location, contact
5. **WhatsApp Integration**: Direct messaging buttons
6. **Claim Business**: Verification flow for business owners
7. **Pagination**: Load More button to browse all 218+ listings

---

## Business Types & Categories

### Business Types
**File**: `frontend/src/App.jsx` (line 9)

The marketplace supports 5 business types with dedicated filter buttons:

1. **🛍️ Products** - Agricultural commodities, minerals, manufactured goods
2. **🔧 Services** - Fintech, tech, logistics, telecoms, banking
3. **🍽️ Restaurants** - Dining establishments, cafes, food service
4. **🏨 Tourism** - Hotels, tourism agencies, safari operators
5. **🏥 Medical** - Hospitals, pharmacies, clinics, healthcare

### Business Categories (Sub-classifications)

Each type can have multiple categories:

**Products**:
- Agricultural Products (cocoa, coffee, tea, cashew, shea, vanilla, spices, dates, citrus, cut flowers)
- Minerals & Mining (gold, diamonds, copper, cobalt, platinum, phosphates, oil & gas)
- Manufacturing (textiles, cement, pharmaceuticals, leather goods, car assembly)

**Services**:
- Technology & IT, Fintech, Logistics, Telecoms, Banking

**Other**:
- Accommodations, Beauty & Personal Care, Restaurant, General Retail

### Type & Category Mapping
**File**: `services/googleMapsCrawler.js` (lines 69-120)

Type is determined by:
1. **Restaurant category** → Always type: 'restaurant'
2. **Service keywords** → type: 'service' (tech, fintech, logistics, mining, etc.)
3. **Default** → type: 'product' (agricultural, minerals, manufacturing)

---

## Domain & DNS Setup

### DNS Configuration (Namecheap)
**Advanced DNS Records**:
```
Type: ALIAS
Host: @
Value: zgdz16tr.up.railway.app
TTL: 5 min

Type: CNAME
Host: www
Value: zgdz16tr.up.railway.app
TTL: 30 min

Type: TXT
Host: @
Value: railway-verify=...
TTL: Automatic
```

### Railway Custom Domain Setup
1. Railway Dashboard → Settings → Networking
2. Add Custom Domain: vukafia.com
3. Railway generates DNS records (shown above)
4. DNS propagates (2-10 minutes typically)
5. SSL certificate auto-provisions

### Verification
- `nslookup vukafia.com` should resolve to Railway IP
- `curl https://vukafia.com/health` should return API response

---

## Image Handling

### Primary Source: Google Maps Photos
**Real business photos** from Google Places API are prioritized:
- URL format: `https://places.googleapis.com/v1/{photo.name}/media?key=...`
- Actual photo URLs served from: `https://lh3.googleusercontent.com/`
- Quality: Real business photos taken by Google or customers

### Fallback: Unsplash Category Photos
When Google Maps photo is unavailable, fallback to category-based Unsplash stock photos:
- Electronics, Fashion & Textiles, Food & Groceries
- Restaurant (dining photos)
- Accommodations, Medical, Agricultural Products, etc.

### Photo Selection Logic
**File**: `services/googleMapsCrawler.js` (lines 293-305)

```javascript
let coverPhoto = generateCoverPhoto(category); // fallback
if (place.photos && place.photos.length > 0) {
  const photo = place.photos[0];
  if (photo.name) {
    // Use real Google Places photo
    coverPhoto = `https://places.googleapis.com/v1/${photo.name}/media?key=${GOOGLE_MAPS_API_KEY}&maxHeightPx=500`;
  }
}
```

1. Try to fetch **real photo** from Google Places API
2. If unavailable, use **category-based Unsplash fallback**
3. Store URL in `listings.cover_photo` database column
4. Frontend displays via `<img src={listing.cover_photo} />`

---

## Security Configuration

### Content Security Policy (CSP)
**File**: `server.js` (lines 38-47)

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      imgSrc: ["'self'", 'data:', 'https://images.unsplash.com']
    }
  }
}));
```

**Purpose**: Allow images from Unsplash while blocking malicious content

### Cache Headers
```javascript
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});
```

**Purpose**: Prevent browser caching of dynamic content

### Environment Variables
**Required (.env or Railway Variables)**:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to 'production'
- `GOOGLE_MAPS_API_KEY` - For business crawler

---

## Troubleshooting Reference

### Issue: Website Not Loading
**Cause**: DNS not propagated or custom domain not configured  
**Solution**:
1. Check Railway custom domain status (should say "Active")
2. Verify Namecheap DNS records match Railway records
3. Wait 5-10 minutes for DNS propagation
4. Test with `curl https://vukafia.com/health`

### Issue: Images Not Displaying
**Cause**: Content Security Policy blocking Unsplash  
**Solution**: Ensure `imgSrc` directive includes `'https://images.unsplash.com'`

### Issue: Database Connection Error
**Cause**: DATABASE_URL not set or invalid  
**Solution**:
1. Verify DATABASE_URL in Railway Variables
2. Check PostgreSQL service is "Online"
3. Run migrations: `npm run migrate`

### Issue: API Returns 404 for /api/listings
**Cause**: Routes not mounted or database schema missing  
**Solution**:
1. Check deploy logs for errors
2. Run migrations to create tables
3. Verify listingsRouter imported and mounted

### Issue: Changes Not Appearing After Push
**Cause**: Railway hasn't redeployed yet or using old cache  
**Solution**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Open private/incognito window
3. Wait 2 minutes for auto-deploy
4. Check Deployments → Deploy Logs for latest status

### Issue: Business Type Filter Shows 0 Results (Medical, Restaurant, etc.)
**Cause**: Frontend was not passing `type` parameter to API when fetching listings  
**Root Problem**: 
- `fetchListings()` called `/api/listings?page=X&limit=50` without type
- Frontend fetched first 50 listings (products/services only)
- When user clicked Medical filter, frontend tried to client-side filter data that was never fetched
- Result: 0 medical listings shown even though database had them

**Solution**:
1. **Update API call** in `frontend/src/App.jsx` (line ~96):
```javascript
// BEFORE (broken):
const res = await fetch(`${API_BASE}/api/listings?page=${page}&limit=50`)

// AFTER (fixed):
const typeParam = type ? `&type=${type}` : ''
const res = await fetch(`${API_BASE}/api/listings?page=${page}&limit=50${typeParam}`)
```

2. **Refetch when type changes** (add new useEffect):
```javascript
// Refetch when type changes
useEffect(() => {
  if (type) {
    setCurrentPage(1)
    fetchListings(1)  // Fetch fresh data for selected type
  } else {
    applyFilters()
  }
}, [type])
```

3. **Remove type from other filters' useEffect**:
```javascript
// Filter listings when OTHER filters change (NOT type)
useEffect(() => {
  applyFilters()
}, [listings, search, region, country, category])  // Remove 'type' from here
```

4. **Rebuild and deploy**:
```bash
npm run build
git add -A
git commit -m "fix: fetch type-filtered listings from API"
git push origin main
```

5. **Clear browser cache** and refresh

**Prevention**: 
- Always pass filter parameters to API calls, not client-side filtering
- When backend adds new data types, ensure frontend requests them explicitly
- Test filters after adding new business types

### Issue: Restaurant Type Filter Shows 0 Results (Database Constraint Error)

**Symptom**: Restaurant filter button appears but shows 0 listings, while other type filters (medical, products) work fine

**Root Cause**: Database constraint validation - 'restaurant' type not allowed by CHECK constraint
- `db.js` schema created with `enu('type', ['product', 'service', 'tourism', 'medical'])`
- This generates PostgreSQL CHECK constraint: `CHECK (type IN ('product', 'service', 'tourism', 'medical'))`
- When data migration tried `UPDATE listings SET type='restaurant'`, constraint rejected it
- **Error in logs**: `new row for relation "listings" violates check constraint "listings_type_check"`

**Step-by-Step Fix**:

**Step 1: Identify the constraint error in Railway logs**
```
migration file "20260927_fix_restaurant_type.js" failed
migration failed with error: update "listings" set "type" = $1, "category" = $2 
  where LOWER(name) ILIKE $3... 
  violates check constraint "listings_type_check"
```

**Step 2: Create constraint-altering migration BEFORE data migration**
```bash
# File: migrations/20260927_0_add_restaurant_type.js
# (Prefix 0_ ensures it runs BEFORE fix_restaurant_type.js alphabetically)
```

File content:
```javascript
exports.up = async function(knex) {
  // Drop the old CHECK constraint that doesn't include 'restaurant'
  await knex.raw(`ALTER TABLE listings DROP CONSTRAINT listings_type_check`);
  
  // Add new constraint with 'restaurant' included
  return knex.raw(`
    ALTER TABLE listings 
    ADD CONSTRAINT listings_type_check 
    CHECK (type IN ('product', 'service', 'restaurant', 'tourism', 'medical'))
  `);
};

exports.down = async function(knex) {
  await knex.raw(`ALTER TABLE listings DROP CONSTRAINT listings_type_check`);
  return knex.raw(`
    ALTER TABLE listings 
    ADD CONSTRAINT listings_type_check 
    CHECK (type IN ('product', 'service', 'tourism', 'medical'))
  `);
};
```

**Step 3: Ensure data migration runs AFTER constraint migration**
```javascript
// File: migrations/20260927_fix_restaurant_type.js
exports.up = async function(knex) {
  return knex('listings')
    .whereRaw("LOWER(name) ILIKE ?", ['%restaurant%'])
    .orWhereRaw("LOWER(name) ILIKE ?", ['%cafe%'])
    .orWhereRaw("LOWER(name) ILIKE ?", ['%food%'])
    .update({ type: 'restaurant', category: 'Restaurant' });
};
```

**Step 4: Commit and push to trigger Railway deployment**
```bash
git add migrations/20260927_0_add_restaurant_type.js
git add migrations/20260927_fix_restaurant_type.js
git commit -m "fix: add restaurant type constraint and reclassify listings"
git push origin main
```

**Step 5: Monitor Railway deployment logs**
- Go to Railway Dashboard → Deployments → Deploy Logs
- Look for:
  - ✅ `migration file "20260927_0_add_restaurant_type.js" succeeded`
  - ✅ `migration file "20260927_fix_restaurant_type.js" succeeded`
- If either migration fails, go back to Step 1 and check error message

**Step 6: Test in browser**
- Hard refresh (Ctrl+Shift+R)
- Click "Restaurants" filter button
- Should now show listings (same count as Medical filter or similar)

**Prevention for Future Type Additions**:
1. **Update db.js schema FIRST** - add new type to `enu()` before any migrations
2. **Create constraint-altering migration** - runs before any data updates
3. **Use alphabetical naming** - `20260927_0_add_type.js` before `20260927_1_update_data.js`
4. **Test locally with SQLite first** - ensures logic is correct before PostgreSQL
5. **Check Railway logs after each deploy** - catch constraint errors immediately
6. **Never rely on frontend filtering alone** - always validate type in database schema

---

## Mobile-Friendly Responsive Design

### Overview
The website is fully responsive with 4 breakpoints optimized for mobile, tablet, and desktop viewing.

### Breakpoints

**1. Desktop (1400px+)**
- 2-column layout with sidebar (250px) + main content
- Full navigation with stats display
- 240px minimum card width
- Type filter buttons inline

**2. Tablet (900px and below)**
- Single-column layout (sidebar hidden)
- Condensed navigation
- 180px minimum card width
- Reduced padding (1.5rem main)

**3. Mobile (768px and below)**
- Stacked navigation (logo + controls)
- Horizontal scrollable sidebar filters
- 160px minimum card width
- 1rem padding on main content
- Full-width search inputs

**4. Small Mobile (480px and below)**
- Minimal padding (0.8rem)
- 140px minimum card width
- Horizontally scrollable type filters
- Optimized button sizes for touch (40px+ target)
- Stack all controls vertically

### Key Mobile Optimizations

**Navigation**
- Responsive height (64px → auto on mobile)
- Wraps controls on smaller screens
- Logo scales from 55px → 40px
- Stat display hidden below 900px

**Search & Filters**
- Stack vertically on mobile (was horizontal)
- Full-width input fields
- Touch-friendly button sizes (40-44px height)
- Horizontal scroll on sidebar filters

**Card Grid**
- Fluid column count: `repeat(auto-fill, minmax(Xpx, 1fr))`
- 240px → 180px → 160px → 140px as screen shrinks
- Reduced gap between cards (1.5rem → 0.6rem)
- Card image height: 160px → 140px → 120px

**Typography**
- Use `clamp()` for fluid scaling: `clamp(min, preferred, max)`
- Hero title: `clamp(1.1rem, 2.5vw, 3.5rem)`
- Responsive font sizes that scale with viewport

**Spacing**
- Main content padding: 2rem → 1rem → 0.8rem
- Card body padding: 1rem → 0.8rem → 0.6rem
- Hero padding: 3.5rem → 1.5rem → 1.2rem

### Touch-Friendly Design
- Minimum touch target: 40-44px (all buttons comply)
- Adequate spacing between interactive elements (0.5rem+ gap)
- Larger tap areas for mobile users
- No hover-only interactions (hover works, but not required)

### Testing Checklist
- [ ] Mobile (375px iPhone SE)
- [ ] Tablet (768px iPad)
- [ ] Landscape (667px wide)
- [ ] Large mobile (480px)
- [ ] Responsive font scaling
- [ ] Touch target sizes
- [ ] Image loading performance
- [ ] Navigation usability

### Performance on Mobile
- Card images: 120-160px (small file sizes)
- Lazy loading recommended for images
- Minimal layout shifts (use clamp() for fonts)
- Sidebar filters scroll horizontally (not reflow)

---

## Google Maps Crawler

### Purpose
Extract **real African businesses** from Google Places API across 54 nations, focused on:
- Agricultural commodities (cocoa, coffee, tea, cashew, shea, vanilla, spices)
- Minerals & mining (gold, diamonds, copper, cobalt, phosphates)
- Manufacturing (textiles, cement, pharmaceuticals, leather goods)
- Services (fintech, tech, logistics, telecoms, banking)

### Crawler Structure
**File**: `services/googleMapsCrawler.js`

**Data Source**: `PRODUCTS_AND_SERVICES` object maps countries → cities → product queries

Example:
```javascript
'Nigeria': {
  'Lagos': ['cocoa exporter', 'cashew supplier', 'fintech startup', ...],
  'Abuja': ['agriculture cooperative', 'food processor', ...]
}
'Kenya': {
  'Nairobi': ['coffee exporter', 'tech startup', 'fintech', ...],
  'Mombasa': ['coffee exporter', 'spice trader', ...]
}
```

### Key Features
1. **Real Photos**: Extracts from Google Places API with fallback to Unsplash
2. **Rating & Reviews**: Includes Google user ratings and review counts
3. **Contact Info**: Phone, website, Instagram from Google listings
4. **Location Data**: Latitude/longitude for map integration
5. **Categorization**: Auto-maps queries to Vukafia categories

### Running the Crawler
```bash
npm run crawl:google-maps
```

Output:
- ✅ Found: 218+ businesses (real African suppliers)
- 📊 Organized by country and region
- 🔗 Cross-linked on vukafia.com

### B2B Focus (AfCFTA Trade)
The crawler prioritizes businesses suitable for cross-border trade:
- **Exporters**: cocoa, coffee, tea, cashew, shea, spices, minerals
- **Manufacturers**: textiles, cement, pharmaceuticals, leather goods
- **Service Providers**: fintech, logistics, telecoms for supply chains

---

## Pagination & Performance

### Problem
- 218+ listings in database but only showing 50 on frontend
- API max limit was 50 per request
- Users couldn't browse full marketplace

### Solution: Pagination with "Load More"
**File**: `frontend/src/App.jsx` (lines 40-65)

**Implementation**:
1. Initial load: Fetch page 1 (50 listings)
2. Display listings with "Load More" button
3. Click button: Fetch page 2, append to list
4. Shows progress: "Showing 50 of 218"
5. Button disappears when all loaded

**State Management**:
```javascript
const [currentPage, setCurrentPage] = useState(1)
const [hasMore, setHasMore] = useState(true)
const [loadingMore, setLoadingMore] = useState(false)

async function loadMore() {
  await fetchListings(currentPage + 1, true)  // append: true
}
```

**API Usage**:
```
GET /api/listings?page=1&limit=50
GET /api/listings?page=2&limit=50
GET /api/listings?page=3&limit=50
...
```

### Benefits
- Faster initial page load (50 vs 218 items)
- User controls how much to load
- Works with all filters (region, country, category, type)
- Shows total count for transparency

---

## Trima AI Assistant & Knowledge Base

### Overview

**Trima** is Vukafia's AI virtual assistant that answers user questions immediately from a comprehensive knowledge base. Only questions outside the knowledge base are directed to the inquiry form.

**Problem Solved**: Previously, ALL questions were being directed to inquiry forms, causing unnecessary support tickets for common, answerable questions.

**Solution**: Smart knowledge base with 50+ Q&A pairs covering platform features, with intelligent matching to provide instant answers.

### Architecture

**File**: `frontend/src/components/Chatbot.jsx`

### Knowledge Base Coverage

The knowledge base includes 50+ Q&A pairs organized by topic:

**1. Platform Overview** (5 Q&A)
- What is Vukafia?
- What does Vukafia do?
- Mission statement
- Coverage (54+ countries)
- Business count (10,000+)

**2. Searching & Browsing** (6 Q&A)
- How to search for businesses
- Search free? Yes!
- How to filter by type/country/category
- Available business types

**3. Contacting Businesses** (3 Q&A)
- How to contact via WhatsApp
- Phone numbers and direct calls
- Business response time

**4. Listing Your Business** (7 Q&A)
- How to list a business
- Free listing? Yes!
- Time to go live (5 minutes)
- Required information
- Edit listings later
- What happens after listing

**5. Claiming & Verification** (7 Q&A)
- How to claim your business
- What is claiming/verification
- Cost ($15 USD one-time)
- Payment methods
- Verification timeline (5-10 min)
- Ownership restrictions

**6. Verification & Trust** (4 Q&A)
- Data sources (Google Maps)
- Why trust Vukafia
- All businesses verified? Yes!
- Report fake businesses

**7. Payment & Fees** (4 Q&A)
- What are the fees? (Free + $15 claim)
- Do you take commission? No!
- Payment methods
- Refund policy

**8. Business Types** (5 Q&A)
- Products (commodities, goods)
- Services (tech, fintech, logistics)
- Restaurants (dining, food)
- Tourism (hotels, agencies)
- Medical (hospitals, clinics)

**9. Regional Information** (4 Q&A)
- All 5 African regions covered
- West Africa countries
- East Africa countries
- North Africa countries

**10. Technical** (5 Q&A)
- Mobile friendly? Yes!
- Account required to search? No!
- Password reset
- Web platform (no app needed)

**11. Support & Help** (4 Q&A)
- How to contact support
- Support hours (Mon-Fri, 9am-6pm)
- Support phone (WhatsApp)
- Response time (2-4 hours)

**12. Common Issues** (3 Q&A)
- Business not listed
- Wrong information shown
- False claims reported

### Question Matching Algorithm

**Smart Matching with Confidence Scoring**:
1. **Direct match** - Exact question key found → Return answer immediately
2. **Keyword matching** - Split question into words (3+ chars)
3. **Score calculation** - Count matching keywords with answer keys
4. **Confidence threshold** - Only return answer if 2+ word matches (high confidence)
5. **Fallback** - If no match found → Offer inquiry button

**Benefits**:
- Reduces false positives (wrong answers)
- Handles variations in user questions
- "How do I search?" vs "How to find businesses?" both work
- Unknown questions still get routed to support

### User Flow

**Scenario 1: Knowledge Base Question**
```
User: "Is it free to list a business?"
↓
Bot: Matches "how to list my business" + "is it free"
↓
Bot: Returns answer immediately ✅ "Yes! Listing your business on Vukafia is completely free..."
```

**Scenario 2: Unknown Question**
```
User: "Do you support cryptocurrency payment?"
↓
Bot: No keyword matches found
↓
Bot: "I don't have information about that in my knowledge base...
      Click below to submit an inquiry. Our team will respond within 24 hours."
↓
User can click "Submit Inquiry" button
```

### Bot Greeting

**Initial Message**:
```
Hi! 👋 I'm Trima, Vukafia's AI assistant. I can answer questions about the platform, listings, claims, business types, payment, and more.

For complex inquiries outside my knowledge, I'll connect you with our team.
```

### Adding New Q&A Pairs

To add more questions to the knowledge base:

**File**: `frontend/src/components/Chatbot.jsx` (lines 4-70)

```javascript
const KNOWLEDGE_BASE = {
  'your question here': 'Your answer here',
  'another question': 'Another answer',
};
```

**Guidelines**:
1. Keep questions lowercase and concise
2. Include common question variations as separate entries
3. Answers should be 1-2 sentences max
4. Use emojis for visual clarity
5. Test in dev mode before deploying

### Analytics & Improvements

**Tracking Questions**:
- Monitor which questions users ask most
- Identify gaps in knowledge base
- Add new Q&A pairs based on inquiry volume
- Update answers based on feedback

**Monthly Review Checklist**:
- [ ] Review top 10 unanswered questions
- [ ] Add any missing Q&A pairs
- [ ] Update answers based on policy changes
- [ ] Test new questions in dev
- [ ] Deploy and monitor

### Performance Impact

- **Bot latency**: <500ms (instant response)
- **No API calls required** for FAQ answers
- **Reduced database load** (fewer inquiries)
- **Faster user experience**
- **24/7 availability** (no wait time)

---

## Key Learnings & Best Practices

### Deployment
- Use Railway auto-deploy webhook (simpler than GitHub Actions)
- Commit built dist/ files to avoid rebuild delays
- Monitor Deploy Logs, not Build Logs, for runtime errors

### Database
- Always run migrations before first deployment
- Test locally with SQLite, deploy with PostgreSQL
- Use explicit connection strings (not env detection)

### Frontend
- Use relative API URLs to avoid CORS issues
- Clear browser cache aggressively during development
- Test in incognito/private mode for cache validation

### Security
- Configure CSP correctly for external resources
- Use helmet() middleware for secure headers
- Validate all external image sources

### Images
- Prioritize real photos from Google Places API
- Use category-based Unsplash fallback when unavailable
- Store URLs in database, not binary data
- Include both primary and secondary CSP domains (places.googleapis.com, lh3.googleusercontent.com)

### Pagination
- Implement pagination for large datasets (50+ items)
- Show progress indicator (X of Y)
- Use API `page` and `limit` parameters for control
- Keep initial load fast (50 items), let users load more on demand

### B2B Marketplace
- Focus crawler on high-value commodities and services
- Target businesses suitable for cross-border trade (AfCFTA)
- Prioritize real business data over generated content
- Include contact info (phone, website, Instagram) for easy outreach

---

## Deployment Checklist

Before going live with changes:
- [ ] Code committed and pushed to main branch
- [ ] Tests pass locally
- [ ] No console errors in browser dev tools
- [ ] Images load correctly
- [ ] API endpoints respond
- [ ] CORS configured for all origins
- [ ] Database migrations run successfully
- [ ] Environment variables set in Railway
- [ ] Custom domain DNS propagated

---

## Contact & Support

**Issue Tracking**: GitHub Issues in repository  
**Deployment Status**: Railway Dashboard  
**Database Queries**: PostgreSQL console (Railway)  
**Live Site**: https://vukafia.com

---

**Document Version**: 2.0  
**Last Updated**: September 25, 2026  
**Maintained By**: Development Team

## Navigation Architecture (Mobile-First Redesign)

### About Us & Contact Us Moved to Footer

**Why**: Separate About and Contact pages added clutter to the navbar on mobile devices, creating a poor user experience.

**Solution**: Integrated About Us and Contact Us sections directly into the footer on all pages.

### Navigation Structure

**Navbar** (Simple and Clean):
- Logo (left)
- Business counts (center)
- Action buttons: WhatsApp AI, Claim Business, List Business (right)
- About and Contact links removed

**Footer** (Rich, Informative):
Replaces the separate page routes with integrated footer sections on all pages:

1. **About Vukafia Section**
   - Brief mission statement
   - "Learn More" toggle button to expand detailed information
   - Expanded content includes: Mission, Vision, and "Why Choose Vukafia?" bullet points

2. **Contact Us Section**
   - WhatsApp link with phone number (+234 810 147 7935)
   - Email link (hello@vukafia.com)
   - "Send Inquiry" button (navigates to /contact form)

3. **Quick Links Section**
   - Home (back to listings)
   - Browse Businesses
   - Contact Support

4. **Expandable About Details** (Collapsible)
   - Full mission statement
   - Verification story
   - Why Choose Vukafia (5 key features)

### Implementation Details

**Files Changed**:
- `frontend/src/components/Layout.jsx` - Updated footer with expandable About and Contact sections
- `frontend/src/App.jsx` - Removed About/Contact navbar links, integrated footer with sections
- `frontend/src/AppWrapper.jsx` - Removed /about route, kept /contact route for full form page

**Routes**:
- `/` - Home page (with integrated footer)
- `/contact` - Full contact form page (for detailed inquiries)
- `/about` - REMOVED (content now in footer)

**Key Features**:
- Footer uses responsive grid layout (auto-fit columns)
- "Learn More" button in About section toggles expanded content
- Mobile-friendly (stacks on small screens)
- Consistent footer on all pages (home, contact form)

### Benefits
- ✅ Cleaner navbar for mobile (less clutter)
- ✅ About and Contact always accessible (in footer)
- ✅ Reduces page load for About page
- ✅ Improved mobile UX (natural place for secondary content)
- ✅ Footer provides context on every page

---

## Recent Changes (September 27, 2026)

**Trima AI Assistant & Knowledge Base**:
- ✅ Created comprehensive knowledge base with 50+ Q&A pairs
- ✅ Smart question matching algorithm with confidence scoring
- ✅ Intelligent routing: KB answers returned immediately, unknowns directed to inquiries
- ✅ Reduced unnecessary inquiry tickets for common questions
- ✅ Renamed bot from "Tumi" to "Trima"
- ✅ Expanded knowledge base coverage:
  - Platform overview, searching, listing, claiming
  - Verification, payments, fees
  - Business types, regions, support
  - Common issues and troubleshooting
- ✅ Updated bot greeting and WhatsApp messages

**Mobile-Friendly Footer Redesign**:
- ✅ Moved About Us and Contact Us from separate pages to footer sections
- ✅ Implemented expandable "About" section with Learn More toggle
- ✅ Removed About/Contact links from navbar for cleaner design
- ✅ Integrated footer on all pages
- ✅ Removed /about route (content now in footer)

**Previous Changes** (September 25, 2026):
- ✅ Added Restaurant (🍽️) as dedicated type filter
- ✅ Restructured crawler for B2B African commodities & services
- ✅ Implemented pagination with "Load More" button
- ✅ Fixed Google Places photo CSP (lh3.googleusercontent.com)
- ✅ Real business photos from Google Maps API with Unsplash fallback
- ✅ 218+ African businesses across 54 nations
- ✅ 5 business types: Products, Services, Restaurants, Tourism, Medical
