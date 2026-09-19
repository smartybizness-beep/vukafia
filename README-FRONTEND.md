# Vukafia Frontend

React + Vite marketplace frontend connecting to the Vukafia backend API.

## Local Development

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173

The dev server proxies API calls to http://localhost:5000/api

## Build for Production

```bash
cd frontend
npm install
npm run build
```

Output: `frontend/dist/`

## Environment Variables

Create `frontend/.env.local`:

```
VITE_API_URL=https://your-backend.railway.app/api
```

## Railway Deployment

Both backend and frontend deploy together:

```bash
# From project root
railway init
railway up
```

Railway automatically:
1. Detects Node.js backend
2. Builds React frontend (`npm run build`)
3. Serves both from the same app

Set `VITE_API_URL` in Railway environment variables if needed.

## Features

- 🛍️ Browse products & services across 54 African nations
- 🔍 Search and filter by country, category, type
- 📞 Contact sellers via phone, WhatsApp, email
- 💬 WhatsApp AI integration for natural language search
- 📱 Mobile-responsive design
- 🎨 Vukafia color scheme (customizable)
