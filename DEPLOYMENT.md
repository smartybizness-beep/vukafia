# Vukafia Deployment Guide

Deploy both backend and frontend to Railway.

## Prerequisites

1. **Railway account** — sign up at https://railway.app
2. **GitHub repo** — push this code to GitHub (Railway deploys from Git)
3. **Anthropic API key** — set in Railway environment variables

## Option A: Deploy with GitHub

1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/yourusername/vukafia.git
   git branch -M main
   git push -u origin main
   ```

2. **Create Railway project:**
   - Go to https://railway.app/dashboard
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your vukafia repo
   - Railway auto-detects Node.js

3. **Add PostgreSQL (for production):**
   - Click "Add Plugin"
   - Select "PostgreSQL"
   - Railway creates DATABASE_URL automatically

4. **Set environment variables:**
   In Railway dashboard, go to Variables and add:
   ```
   NODE_ENV=production
   DATABASE_URL=[auto-filled by Railway]
   JWT_SECRET=your_strong_secret_key_here
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   AI_SEARCH_MODEL=claude-haiku-4-5
   ```

5. **Deploy:**
   - Railway auto-deploys when you push to GitHub
   - Watch logs in Railway dashboard
   - Frontend builds automatically with `npm run build`

## Option B: Deploy with Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set NODE_ENV=production
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set JWT_SECRET=your_secret

# Deploy
railway up
```

## Verify Deployment

1. Your app will get a URL like: `https://vukafia-prod-random.railway.app`
2. Visit it — you should see the marketplace
3. API works at: `https://vukafia-prod-random.railway.app/api/listings`
4. Admin dashboard at: `https://vukafia-prod-random.railway.app/admin/searches`

## Production Database

Railway PostgreSQL is persistent. First deployment runs seed:

```bash
railway run node seed.js
```

This creates the schema and loads seed data.

## Monitor & Logs

In Railway dashboard:
- **Deployments:** see each deploy
- **Logs:** tail live logs
- **Variables:** edit environment variables anytime
- **Metrics:** CPU, memory, bandwidth usage

## Troubleshooting

**Frontend not loading?**
- Check that `npm run build` ran successfully
- Logs should show `frontend/dist` was built
- Clear browser cache (Cmd+Shift+R)

**API calls failing?**
- Verify `ANTHROPIC_API_KEY` is set
- Check `DATABASE_URL` points to PostgreSQL
- Look at Railway logs for errors

**Database issues?**
- Railway PostgreSQL is separate from local SQLite
- First deploy, run `railway run node seed.js`
- Don't use SQLite in production (set DATABASE_URL)

## Scaling

Railway charges per resource used:
- $5/month per GB memory
- $0.50/hour per vCPU
- PostgreSQL from $12/month

Free tier: $5/month credits (enough for MVP).

See https://railway.app/pricing
