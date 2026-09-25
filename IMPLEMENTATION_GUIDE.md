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
12. [Troubleshooting Reference](#troubleshooting-reference)

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

## Recent Changes (September 25, 2026)
- ✅ Added Restaurant (🍽️) as dedicated type filter
- ✅ Restructured crawler for B2B African commodities & services
- ✅ Implemented pagination with "Load More" button
- ✅ Fixed Google Places photo CSP (lh3.googleusercontent.com)
- ✅ Real business photos from Google Maps API with Unsplash fallback
- ✅ 218+ African businesses across 54 nations
- ✅ 5 business types: Products, Services, Restaurants, Tourism, Medical
