# Deploy Vukafia to Railway 🚀

Railway is perfect for deploying Node.js + React apps with PostgreSQL. Here's how to get live in 10 minutes.

## Step 1: Push to GitHub

```bash
git remote add origin https://github.com/yourusername/vukafia.git
git branch -M main
git push -u origin main
```

## Step 2: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Create a new project

## Step 3: Add PostgreSQL Database

In Railway dashboard:
1. New → Database → PostgreSQL
2. Railway auto-creates `DATABASE_URL` environment variable

## Step 4: Deploy Backend

1. New → GitHub Repo → Select your repo
2. Railway auto-detects Node.js
3. Set environment variables:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-secret-key-here-change-in-prod
GOOGLE_MAPS_API_KEY=AIzaSyDCU21aqaojuRJ_DyD8SLfVD3lH6K7lik4
ANTHROPIC_API_KEY=sk-ant-api03-...
PAYSTACK_SECRET_KEY=sk_live_... (add later)
PAYSTACK_PUBLIC_KEY=pk_live_... (add later)
CLAIM_FEE_USD=15
CLAIM_FEE_NGN=6000
ALLOWED_ORIGINS=https://yourdomain.railway.app,https://yourdomain.com
```

4. Deploy will auto-start ✅

## Step 5: Deploy Frontend

The backend serves the built frontend automatically!

Just make sure in `server.js`:
```javascript
app.use(express.static(path.join(__dirname, 'frontend/dist')));
```

This is already configured ✅

## Step 6: Get Your Live URL

Railway gives you: `https://yourdomain-prod.railway.app`

## Step 7: Seed Database

After first deploy, run crawler:
```bash
npm run crawl:google-maps
```

Railway allows one-off commands via dashboard → Logs

## Step 8: Add Custom Domain (Optional)

In Railway → Networking → Custom Domain

## Important Notes

⚠️ **Paystack**: Will show "not configured" message until you add keys
- Users can still browse & search everything
- Add keys anytime → payments instantly work
- No downtime needed

✅ **Database**: PostgreSQL auto-runs migrations via `db.init()`

✅ **Frontend**: Auto-built during deploy

✅ **Photos**: Real Google Maps photos display immediately

## Your Live Checklist

- [ ] GitHub repo created & pushed
- [ ] Railway PostgreSQL created
- [ ] Environment variables set
- [ ] Backend deployed (green checkmark in Railway)
- [ ] Visit your Railway URL
- [ ] Test browsing businesses
- [ ] Test search
- [ ] Note the "Paystack not configured" message (OK for now)

## Once Paystack Account Ready

1. Get `sk_live_...` and `pk_live_...` from Paystack
2. Update in Railway environment variables
3. Refresh dashboard → Payments active ✅

**You're live! 🎉**
