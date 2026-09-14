# 🌍 Vukafia API — Trans-African Marketplace Backend

> Rising Markets. Connecting Africa.  
> **https://vukafia.com** | WhatsApp: +2348101477935

---

## Stack

| Layer       | Tech                          |
|-------------|-------------------------------|
| Runtime     | Node.js 18+                   |
| Framework   | Express 4                     |
| Database    | SQLite (dev) / PostgreSQL (prod) |
| ORM         | Knex.js                       |
| Auth        | JWT (bcryptjs)                |
| WhatsApp    | Meta Cloud API / Twilio       |

---

## Quick Start (Local Dev)

```bash
# 1. Clone / unzip the backend folder
cd vukafia-backend

# 2. Install dependencies
npm install

# 3. Copy env file
cp .env.example .env
# Edit .env — JWT_SECRET is the only required change for local dev

# 4. Seed the database with African business listings
node seed.js

# 5. Start development server
npm run dev
# → API running at http://localhost:5000
```

---

## API Endpoints

### Public (no auth required)

| Method | Endpoint                         | Description                          |
|--------|----------------------------------|--------------------------------------|
| GET    | `/health`                        | Health check                         |
| GET    | `/api/listings`                  | Search & filter listings             |
| GET    | `/api/listings/:id`              | Get single listing + reviews         |
| GET    | `/api/listings/meta/regions`     | Get regions, countries, categories   |
| POST   | `/api/listings/:id/contact`      | Track contact event (call/WA/email)  |
| POST   | `/api/listings/:id/review`       | Submit a review                      |

### Auth

| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| POST   | `/api/auth/register`        | Create seller account |
| POST   | `/api/auth/login`           | Login → get JWT token |
| GET    | `/api/auth/me`              | Get current user info |
| POST   | `/api/auth/change-password` | Change password       |

### Business (requires JWT)

| Method | Endpoint                       | Description                  |
|--------|--------------------------------|------------------------------|
| POST   | `/api/business/register`       | Register new business listing |
| GET    | `/api/business/my-listings`    | List seller's own listings   |
| PUT    | `/api/business/listing/:id`    | Update a listing             |
| DELETE | `/api/business/listing/:id`    | Deactivate a listing         |
| GET    | `/api/business/stats`          | View/contact analytics       |

### Admin (requires admin JWT)

| Method | Endpoint                          | Description               |
|--------|-----------------------------------|---------------------------|
| GET    | `/api/admin/dashboard`            | Stats overview            |
| GET    | `/api/admin/listings/pending`     | Unverified listings       |
| POST   | `/api/admin/listings/:id/verify`  | Verify a listing          |
| POST   | `/api/admin/listings/:id/feature` | Feature/unfeature listing |
| GET    | `/api/admin/users`                | List all users            |
| PATCH  | `/api/admin/users/:id/plan`       | Upgrade user plan         |
| GET    | `/api/admin/reviews/pending`      | Unapproved reviews        |
| POST   | `/api/admin/reviews/:id/approve`  | Approve review            |

### WhatsApp Webhook

| Method | Endpoint                   | Description                       |
|--------|----------------------------|-----------------------------------|
| GET    | `/api/webhook/whatsapp`    | Meta webhook verification         |
| POST   | `/api/webhook/whatsapp`    | Receive Meta Cloud API messages   |
| POST   | `/api/webhook/twilio`      | Receive Twilio WhatsApp messages  |

---

## Example API Calls

### Search for electronics in Nigeria
```
GET /api/listings?type=product&country=Nigeria&category=Electronics&sort=rating
```

### Search all of West Africa for lawyers
```
GET /api/listings?type=service&region=West%20Africa&category=Legal%20Services
```

### Full-text search across all Africa
```
GET /api/listings?q=cocoa&sort=rating&limit=10
```

### Register a business (authenticated)
```
POST /api/business/register
Authorization: Bearer <token>
{
  "type": "product",
  "region": "East Africa",
  "country": "Kenya",
  "state": "Nairobi County",
  "city": "Nairobi",
  "name": "My Business Name",
  "category": "Electronics",
  "products_services": "Phones, Laptops, Accessories",
  "phone": "254722000000",
  "description": "About my business..."
}
```

---

## Deploy to Production (Railway — Free Tier)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and deploy
railway login
railway init
railway up

# 3. Add PostgreSQL plugin in Railway dashboard
#    → Copy DATABASE_URL into Railway environment variables

# 4. Set environment variables in Railway dashboard:
#    JWT_SECRET, WA_API_TOKEN, WA_PHONE_NUMBER_ID, etc.

# 5. Run seed on production
railway run node seed.js
```

---

## Deploy to Render (Free Tier)

1. Push code to GitHub
2. Create new **Web Service** on render.com
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. Add environment variables from `.env.example`
6. Add a **PostgreSQL** database and connect `DATABASE_URL`

---

## WhatsApp Setup (Meta Cloud API)

1. Create a Meta Developer App at https://developers.facebook.com
2. Add **WhatsApp** product
3. Get your `WA_PHONE_NUMBER_ID` and `WA_API_TOKEN`
4. Set webhook URL: `https://your-api.railway.app/api/webhook/whatsapp`
5. Set `WA_VERIFY_TOKEN` to match your `.env`
6. Subscribe to **messages** webhook field

---

## Pricing Plans

| Plan       | Listings | Price/month |
|------------|----------|-------------|
| Free       | 1        | $0          |
| Growth     | 5        | $25         |
| Pro        | 20       | $75         |
| Enterprise | Unlimited| $150        |

---

## Admin Login (after seeding)

```
Email:    admin@vukafia.com
Password: VukafiaAdmin2025!
```

> ⚠️ Change this immediately in production!

---

## File Structure

```
vukafia-backend/
├── server.js           ← Main Express app
├── db.js               ← Database (SQLite/PostgreSQL)
├── seed.js             ← Seed African business data
├── package.json
├── .env.example
├── routes/
│   ├── listings.js     ← Public search & browse
│   ├── business.js     ← Seller management
│   ├── auth.js         ← Login / register
│   ├── admin.js        ← Admin dashboard
│   └── webhook.js      ← WhatsApp webhook
├── middleware/
│   └── auth.js         ← JWT middleware
├── services/
│   └── whatsapp.js     ← WhatsApp AI handler
└── data/
    └── vukafia.sqlite  ← Auto-created (dev only)
```

---

*Built for Africa. Rising Markets. Connecting Africa.* 🌍
