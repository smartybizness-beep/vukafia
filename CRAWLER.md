# Vukafia Business Crawler

Auto-discover and populate real African businesses in your marketplace using AI.

## Quick Start

### Manual Crawl (One-time)
```bash
npm run crawl
```
Generates 25-30 realistic businesses across all regions. Good for testing or on-demand refreshes.

### Scheduled Crawl (Nightly)
```bash
npm run crawl:scheduled
```
Runs once per day, skips if already crawled today. Production-ready.

---

## How It Works

1. **Generate Phase**: Claude Opus creates realistic business names, details, phone numbers
2. **Enrich Phase**: Claude Haiku adds cover photos, emojis, social handles
3. **Save Phase**: Inserts into database, checks for duplicates
4. **Summary**: Shows count by country

---

## Usage

### Development
```bash
# Single crawl
npm run crawl

# Check logs
cat logs/crawler-2026-09-19.log
```

### Production (Railway)
```
Settings → Cron Jobs → New Job
Schedule: 0 2 * * * (2 AM UTC daily)
Command: npm run crawl:scheduled
```

---

## Rate Limiting

Both crawlers skip if you've crawled within 6 hours. This prevents:
- Hitting Claude API rate limits
- Creating duplicate businesses
- Wasting API credits

To force a crawl anyway, delete the oldest listings or edit the time check in `scripts/scheduledCrawl.js`.

---

## Data Generated Per Run

| Region | Countries | Categories | Expected Listings |
|--------|-----------|-----------|-------------------|
| West Africa | Nigeria, Ghana, Côte d'Ivoire | Electronics, Fashion, Food | 9 |
| East Africa | Kenya, Tanzania, Uganda | Agriculture, Tech, Food | 9 |
| North Africa | Egypt, Morocco | Tourism, Fashion, Agriculture | 9 |
| **Total** | 8 countries | 7 categories | **~27** |

---

## Customization

### Change Regions/Countries/Categories
Edit `services/businessCrawler.js`:

```javascript
const REGIONS = {
  'West Africa': {
    countries: ['Nigeria', 'Ghana'],  // Add/remove countries
    categories: ['Electronics', 'Fashion'],  // Add/remove categories
  },
  // Add more regions
};
```

Then run `npm run crawl` to test your changes.

### Change Business Count Per Combo
In `services/businessCrawler.js`, the prompt says:
```
Generate 3-5 real-sounding African businesses...
```

Edit "3-5" to "5-10" to generate more per category.

---

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
```bash
# Check your .env file
grep ANTHROPIC_API_KEY .env

# If missing, add it:
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```

### "Crawler skipped: crawled X hours ago"
The 6-hour rate limit is active. Either:
- Wait 6 hours
- Edit the check in `scripts/scheduledCrawl.js` (line ~45)
- Delete old listings (development only)

### "Failed to generate businesses for..."
Claude API call failed. Check:
- API key is valid
- Rate limits (check terminal for 429 errors)
- Network connection

### "Crawler completed. Saved: 0"
All 27 businesses already exist in database. This is fine for ongoing runs!

---

## Logs

Logs are saved to `logs/crawler-YYYY-MM-DD.log` with:
- Start/stop times
- Business count per run
- Errors (if any)
- Before/after database stats

```bash
# View today's log
tail -f logs/crawler-$(date +%Y-%m-%d).log

# View all logs
ls -la logs/
```

---

## Next Steps

1. **Let the first crawl finish** (takes 2-5 minutes)
2. **Check the results**: Open http://localhost:5173 and filter by country
3. **Deploy to Railway** (adds PostgreSQL)
4. **Set up scheduled crawl** in Railway dashboard (optional)

---

## Tips & Tricks

### View Database Stats
```sql
sqlite3 data/vukafia.sqlite
SELECT country, COUNT(*) as count FROM listings GROUP BY country;
```

### Clear Database (Dev Only)
```bash
rm data/vukafia.sqlite
npm run seed
npm run crawl
```

### Monitor Crawl in Real-time
```bash
npm run crawl:scheduled &
tail -f logs/crawler-*.log
```

---

## Support

- **Slow crawls?** Normal - Claude API calls take 3-10 seconds each
- **Want fewer businesses?** Edit category count in `services/businessCrawler.js`
- **Want real data?** Current approach uses Claude to generate realistic data; you can modify prompts to match your strategy
