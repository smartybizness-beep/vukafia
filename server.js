/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           VUKAFIA — PAN-AFRICAN MARKETPLACE API              ║
 * ║           Rising Markets. Connecting Africa.                 ║
 * ║           https://vukafia.com  |  WhatsApp: +2348101477935  ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Stack:  Node.js + Express + SQLite (dev) / PostgreSQL (prod)
 * Author: Vukafia Engineering
 * Deploy: Railway / Render / Heroku / VPS
 */

'use strict';

require('dotenv').config();
const fs           = require('fs');
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const path         = require('path');

const db           = require('./db');
const listingsRouter = require('./routes/listings');
const businessRouter = require('./routes/business');
const authRouter     = require('./routes/auth');
const adminRouter    = require('./routes/admin');
const crawlerRouter  = require('./routes/admin-crawler');
const webhookRouter  = require('./routes/webhook');
const searchRouter   = require('./routes/search');
const claimsRouter   = require('./routes/claims');

const app  = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000; // v2-force-rebuild

// ─── SECURITY & MIDDLEWARE ─────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://places.googleapis.com']
    }
  }
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'https://vukafia.com', 'https://www.vukafia.com'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── RATE LIMITING ─────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts. Please wait 15 minutes.' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

// ─── ADMIN UI (static; data still requires an admin JWT) ───────────────────
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin'), { extensions: ['html'] }));

// ─── FRONTEND (React SPA) ─────────────────────────────────────────────────────
// Serve built React app from frontend/dist (production only)
const frontendPath = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
}

// ─── HEALTH CHECK ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'Vukafia Trans-African Marketplace',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    db: db.isConnected() ? 'connected' : 'disconnected',
  });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Vukafia API',
    tagline: 'Rising Markets. Connecting Africa.',
    version: '1.0.0',
    docs: '/api/docs',
    health: '/health',
    endpoints: {
      listings:   'GET  /api/listings',
      aiSearch:   'POST /api/search/ai',
      business:   'POST /api/business/register',
      auth:       'POST /api/auth/login',
      admin:      'GET  /api/admin/dashboard  (admin only)',
      webhook:    'POST /api/webhook/whatsapp',
    },
  });
});

// ─── ROUTES ────────────────────────────────────────────────────────────────
app.use('/api/listings',  listingsRouter);
app.use('/api/search',    searchRouter);
app.use('/api/claims',    claimsRouter);
app.use('/api/business',  businessRouter);
app.use('/api/auth',      authRouter);
app.use('/api/admin',     adminRouter);
app.use('/api/admin',     crawlerRouter);  // Crawler management
app.use('/api/webhook',   webhookRouter);  // WhatsApp webhook

// ─── SPA FALLBACK (client-side routing) ────────────────────────────────────
// Serve index.html for all non-API routes (React Router handles them)
if (fs.existsSync(frontendPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ─── 404 ───────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// ─── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  if (process.env.NODE_ENV !== 'production') console.error(err.stack);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ─── START ─────────────────────────────────────────────────────────────────
db.init().then(() => {
  // Initialize background job scheduler
  try {
    const { initializeScheduler } = require('./jobs/scheduler');
    initializeScheduler();
  } catch (err) {
    console.warn('⚠️  Background scheduler initialization failed:', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log(`║  🌍  VUKAFIA API running on port ${PORT}         ║`);
    console.log(`║  ENV: ${(process.env.NODE_ENV || 'development').padEnd(38)}║`);
    console.log(`║  📊 Database: ${(process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite').padEnd(36)}║`);
    console.log('╚══════════════════════════════════════════════╝\n');
  });
}).catch(err => {
  console.error('❌ Failed to initialize DB:', err);
  process.exit(1);
});

module.exports = app;
