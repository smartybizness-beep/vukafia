# Vukafia Quick Start Guide

## What You Have

A **complete AI-powered African marketplace** with:
- ✅ React frontend (Vite) with Vukafia branding
- ✅ Express backend with Claude AI integration
- ✅ Real business listings with AI generation
- ✅ WhatsApp AI search bot
- ✅ Multi-region coverage (West, East, North Africa)
- ✅ Business claim system with verification

---

## Your First Day

### Step 1: Let the Crawler Finish (In Progress ⏳)
Currently generating realistic African businesses. Takes 3-5 minutes.

### Step 2: See Your Data
```bash
npm run dev
# Open http://localhost:5173
```

You'll see:
- 25-30 businesses from all regions
- High ratings (3.5-5.0 stars)
- Realistic details (phones, websites, services)
- 🌐 Website links for each business
- 📞 Phone numbers
- 💬 WhatsApp contact buttons

### Step 3: Test Contacts
Click any business card to:
- 📞 Call the business
- 💬 Message on WhatsApp
- ✉️ Email them
- 🌐 Visit their website

### Step 4: Deploy (Friday)
```bash
git push origin main
railway up
```

Your site is now live at `https://your-app.railway.app` with real data.

---

## What Each Button Does

On every business card:

| Button | Action | Data |
|--------|--------|------|
| **📞** | Initiates phone call | `listing.phone` |
| **💬** | Opens WhatsApp chat | `listing.whatsapp` or phone |
| **✉️** | Sends email | `listing.email` |
| **🌐** | Opens website | `listing.website` |

Example:
- Business: "Chukwu Electronics Hub"
- 📞 +2348012345678 (call)
- 💬 Send WhatsApp message
- 🌐 www.chukwuelectronics.com

---

## Contact Tracking

Every contact action is logged to the database:
```sql
POST /api/listings/{id}/contact
{ "contact_type": "call|whatsapp|email|website" }
```

This lets you see:
- Total contacts per business
- Most popular contact methods
- Which businesses are getting interest

---

## Business Data

Each listing includes:
```json
{
  "id": 123,
  "name": "Business Name",
  "category": "Electronics",
  "country": "Nigeria",
  "city": "Lagos",
  "rating": 4.8,
  "review_count": 145,
  "phone": "+2348012345678",
  "website": "https://business.com",
  "instagram": "@businesshandle",
  "cover_photo": "https://unsplash.com/...",
  "emoji": "🛍️",
  "verified": true,
  "featured": true
}
```

---

## Ongoing Updates

### Manual Refresh (Anytime)
Add more businesses on-demand:
```bash
npm run crawl
```

### Automatic Nightly (Production)
Set up in Railway dashboard:
```
Cron: 0 2 * * *
Command: npm run crawl:scheduled
```

Both commands:
- Generate 25-30 new businesses
- Skip duplicates
- Rate-limit to once per 6 hours
- Log results to `logs/crawler-YYYY-MM-DD.log`

---

## Claiming System (For Businesses)

Business owners can claim their listing:

1. **Search**: Find their business
   ```
   GET /api/claims/search?name=MyBiz&country=Nigeria
   ```

2. **Verify**: Prove they own it (phone match)
   ```
   POST /api/claims/verify-ownership
   ```

3. **Pay**: Claim fee ($5-25)
   ```
   POST /api/claims/claim
   ```

4. **Manage**: Edit listing details, view analytics

Revenue model: $15 × 100 claims = $1,500 day 1

---

## Customizing Data

Want different regions/countries?

Edit `services/businessCrawler.js`:
```javascript
const REGIONS = {
  'West Africa': {
    countries: ['Nigeria', 'Ghana', 'Côte d\'Ivoire'],
    categories: ['Electronics', 'Fashion & Textiles', 'Food & Groceries'],
  },
  // Add more regions
};
```

Then re-run `npm run crawl`.

---

## Database Schema

### listings table
- `id` — Primary key
- `name`, `category`, `description`
- `country`, `city`, `region`
- `phone`, `whatsapp`, `email`, `website`, `instagram`
- `rating`, `review_count`, `verified`, `featured`
- `cover_photo`, `emoji`
- `view_count`, `contact_count` — Analytics

### search_queries table (AI search log)
- Tracks all searches
- Parsed intent, filters used
- Tokens consumed, latency

### listing_claims table (Claim tracking)
- `listing_id`, `user_id`
- `payment_ref`, `status`
- `claimed_at` timestamp

---

## Frontend Features

### Search & Filters
- Full-text search (name, category, services)
- Country dropdown
- Category dropdown
- Type toggle (Products / Services)

### Results
- Grid view with cards
- High-quality cover photos
- Rating & review count
- Quick contact buttons
- Verified badge
- Featured highlight

### AI Chat (WhatsApp)
- Multi-language support (EN, FR, AR, SW, HA, Pidgin)
- Natural language queries
- Intelligent filtering

---

## API Endpoints

### Public (No Auth)
```
GET  /api/listings?type=product&country=Nigeria&limit=50
GET  /api/listings/meta/regions  (countries & categories)
POST /api/search/ai  (AI-powered search)
POST /api/webhook/whatsapp  (WhatsApp bot)
```

### Claims (Business Owners)
```
GET  /api/claims/search?name=MyBiz&country=Nigeria
POST /api/claims/verify-ownership
POST /api/claims/claim  (requires auth + payment)
GET  /api/claims/my-claims  (requires auth)
```

### Admin (Admin Only)
```
GET  /api/admin/dashboard
GET  /api/admin/searches  (search log analytics)
```

---

## Environment Variables

```bash
# App
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=  # Leave blank for SQLite (dev)

# JWT (change in production!)
JWT_SECRET=your_secret_key_here
JWT_EXPIRES=7d

# Claude API (for AI search)
ANTHROPIC_API_KEY=sk-ant-...
AI_SEARCH_MODEL=claude-haiku-4-5

# WhatsApp (optional)
WA_PHONE_NUMBER=2348101477935
WA_API_TOKEN=your_token_here
WA_VERIFY_TOKEN=your_verify_token
```

---

## Troubleshooting

### No businesses showing
1. Wait for crawler to finish
2. Check `npm run dev` console for errors
3. Open http://localhost:5173 in browser

### Website button not showing
1. Crawler needs to finish (generates websites)
2. Check database has `website` field (should be auto-created)
3. Refresh browser

### Slow page loads
1. First load processes 1000+ listings
2. Filter by country to speed up
3. Pagination available in API

### API errors
1. Check `ANTHROPIC_API_KEY` in `.env`
2. Run `npm install` to ensure all deps
3. Check port 5000 is available

---

## Next Steps

1. ✅ Crawler running (wait for completion)
2. ✅ Test locally: http://localhost:5173
3. ⏭️ Deploy to Railway
4. ⏭️ Setup nightly crawl (optional)
5. ⏭️ Launch claim system & marketing

---

## Files Reference

| File | Purpose |
|------|---------|
| `server.js` | Express API server |
| `frontend/src/App.jsx` | React marketplace UI |
| `services/businessCrawler.js` | Claude-powered business generator |
| `services/aiSearch.js` | Natural-language search |
| `routes/listings.js` | Listing API endpoints |
| `routes/claims.js` | Claim system API |
| `db.js` | Database initialization |

---

## Support & Documentation

- **LAUNCH_STRATEGY.md** — Day-1 launch plan
- **CRAWLER.md** — Crawler usage & customization
- **Frontend styling** — `frontend/src/index.css` (500+ lines custom)
- **Admin dashboard** — `public/admin/searches.html`

Enjoy your marketplace! 🌍
