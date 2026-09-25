# Vukafia Implementation Guide
## Complete Technical Documentation

**Project**: Vukafia Trans-African Business Directory  
**Date**: September 24, 2026  
**Status**: Live & Operational (216 Listings, 54+ Nations)

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Setup](#database-setup)
3. [Deployment Pipeline](#deployment-pipeline)
4. [API Configuration](#api-configuration)
5. [Frontend Implementation](#frontend-implementation)
6. [Domain & DNS Setup](#domain--dns-setup)
7. [Image Handling](#image-handling)
8. [Security Configuration](#security-configuration)
9. [Troubleshooting Reference](#troubleshooting-reference)

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
1. **Category Filtering**: Products, Services, Tourism, Medical
2. **Region Selection**: Dropdown filters by African region
3. **Business Cards**: Display name, rating, location, contact
4. **WhatsApp Integration**: Direct messaging buttons
5. **Claim Business**: Verification flow for business owners

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

### Image Source
**Service**: Unsplash (free, high-quality stock photos)

### Category-to-Image Mapping
**File**: `scripts/crawlGoogleMaps.js` (lines 133-143)

```javascript
function generateCoverPhoto(category) {
  const photos = {
    'Electronics': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=75',
    'Fashion & Textiles': '...',
    'Food & Groceries': '...',
    'Tourism': '...',
    'Technology & IT': '...',
    'Agriculture': '...'
  };
  return photos[category] || 'https://images.unsplash.com/photo-1553729783-c91953dec042?w=500&q=75';
}
```

### Crawler Integration
- Crawler assigns category-based photos to each business
- Photos stored in `listings.cover_photo` column
- Frontend displays via `<img src={listing.cover_photo} />`

### Running the Crawler
```bash
npm run crawl:google-maps  # Updates all businesses with real data + photos
```

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
- Use category-based photo mapping for consistency
- Prefer free services (Unsplash) for scalability
- Store URLs in database, not binary data

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

**Document Version**: 1.0  
**Last Updated**: September 24, 2026  
**Maintained By**: Development Team
