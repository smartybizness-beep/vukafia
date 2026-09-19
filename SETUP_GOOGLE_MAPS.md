# Google Maps API Setup Guide

## Get Free Google Maps API Key (5 minutes)

### 1. Create Google Cloud Project
```
1. Go to: https://console.cloud.google.com
2. Click "Select a Project" → "New Project"
3. Name: "Vukafia"
4. Click "Create"
5. Wait for project to create
```

### 2. Enable Places API
```
1. In search bar, type: "Places API"
2. Click "Places API"
3. Click "Enable"
4. Wait for it to enable
```

### 3. Create API Key
```
1. Click "Create Credentials"
2. Select "API Key"
3. Copy the key
4. Restrict it (recommended):
   - Go to "Credentials" in left menu
   - Click your key
   - Under "Application restrictions": Select "HTTP referrers"
   - Add: localhost:5000
   - Under "API restrictions": Select "Places API"
   - Save
```

### 4. Add to .env
```bash
# .env
GOOGLE_MAPS_API_KEY=AIzaSy...your_key_here...
```

### 5. Verify It Works
```bash
curl "https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurant%20in%20Lagos&key=YOUR_KEY"
```

---

## Free Tier Limits

- **25,000 requests/month free** (Sky is the limit!)
- **$7 per 1,000 requests** after free tier
- **Perfect for Africa crawl**: 5,000-10,000 requests/month

---

## Cost Estimation

To crawl 10,000 real African businesses:
- ~1,000 API calls
- **Free tier covers it completely**
- No cost for MVP

---

## Done!

Add GOOGLE_MAPS_API_KEY to .env and run:
```bash
npm run crawl:google-maps
```
