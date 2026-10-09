/**
 * routes/auth.js
 * Seller registration, login, token refresh
 */

'use strict';

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const axios   = require('axios');
const db      = require('../db');
const { requireAuth } = require('../middleware/auth');

const JWT_SECRET  = process.env.JWT_SECRET  || 'vukafia_dev_secret_change_in_prod';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, plan: user.plan },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

// ─── POST /api/auth/register ──────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const k = db.query();
    const { name, email, phone, password, wa_number } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'name, email, phone and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check for existing
    const existing = await k('users').where('email', email).orWhere('phone', phone).first();
    if (existing) {
      return res.status(409).json({
        error: existing.email === email
          ? 'An account with this email already exists'
          : 'An account with this phone number already exists',
      });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const [id] = await k('users').insert({
      name, email, phone, password_hash,
      wa_number: wa_number || phone,
      role: 'seller',
      plan: 'free',
      active: true,
    });

    const user  = await k('users').where('id', id).first();
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created! Welcome to Vukafia.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const k = db.query();
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
      return res.status(400).json({ error: 'email or phone, and password are required' });
    }

    const user = await k('users')
      .where(function () {
        if (email) this.where('email', email);
        else       this.where('phone', phone);
      })
      .first();

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.active) return res.status(403).json({ error: 'Account deactivated. Contact support.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan },
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const k    = db.query();
    const user = await k('users').where('id', req.user.id).first();
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password_hash, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/change-password ──────────────────────────────────────
router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const k = db.query();
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password required' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    const user = await k('users').where('id', req.user.id).first();
    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const password_hash = await bcrypt.hash(new_password, 12);
    await k('users').where('id', req.user.id).update({ password_hash });
    res.json({ success: true, message: 'Password updated.' });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/google-callback ───────────────────────────────────────
// Handle Google OAuth authorization code exchange
router.post('/google-callback', async (req, res, next) => {
  try {
    const { code, redirectUri } = req.body
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' })
    }

    const k = db.query()
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '372615640842-neq3e0j2581e5lh4udddcf35emsdc1a2.apps.googleusercontent.com'
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

    console.log('Google OAuth Callback')
    console.log('- Code:', code.substring(0, 20) + '...')
    console.log('- Redirect URI:', redirectUri)
    console.log('- Client ID:', GOOGLE_CLIENT_ID)
    console.log('- Has Client Secret:', !!GOOGLE_CLIENT_SECRET)
    console.log('- Client Secret value (first 20 chars):', GOOGLE_CLIENT_SECRET ? GOOGLE_CLIENT_SECRET.substring(0, 20) : 'NOT SET')

    if (!GOOGLE_CLIENT_SECRET) {
      console.error('❌ GOOGLE_CLIENT_SECRET is not set in environment variables')
      return res.status(500).json({ error: 'Server configuration error: GOOGLE_CLIENT_SECRET not set. Check Railway environment variables.' })
    }

    // Exchange code for tokens
    console.log('Exchanging authorization code for tokens with Google...')
    let tokenResponse
    try {
      tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    } catch (tokenErr) {
      console.error('Google token exchange failed:')
      console.error('- Status:', tokenErr.response?.status)
      console.error('- Error:', tokenErr.response?.data?.error)
      console.error('- Description:', tokenErr.response?.data?.error_description)
      throw tokenErr
    }

    const { id_token } = tokenResponse.data

    // Verify ID token
    const verifyResponse = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
      params: { id_token }
    })

    const { email, name, picture } = verifyResponse.data

    if (!email) {
      return res.status(400).json({ error: 'Could not get email from Google' })
    }

    // Check if user exists
    let user = await k('users').where('email', email).first()

    if (user) {
      const token = signToken(user)
      return res.json({
        success: true,
        message: 'Welcome back!',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan },
        isNewUser: false
      })
    }

    // Create new user
    const [userId] = await k('users').insert({
      name: name || email.split('@')[0],
      email,
      phone: '',
      password_hash: '',
      wa_number: '',
      role: 'seller',
      plan: 'free',
      active: true,
      auth_provider: 'google',
      avatar_url: picture
    })

    user = await k('users').where('id', userId).first()
    const token = signToken(user)

    res.status(201).json({
      success: true,
      message: 'Account created! Welcome to Vukafia.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan },
      isNewUser: true
    })
  } catch (err) {
    console.error('Google callback error:', err.response?.data || err.message)
    res.status(401).json({ error: 'Google OAuth failed: ' + (err.response?.data?.error_description || err.message) })
  }
})

// ─── POST /api/auth/google ────────────────────────────────────────────────
// Google OAuth authentication (legacy - id_token flow)
router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body; // Google JWT token
    if (!credential) {
      return res.status(400).json({ error: 'credential is required' });
    }

    const k = db.query();

    // Verify Google token with Google's API
    try {
      const response = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
        params: { id_token: credential }
      });

      const { email, name, picture } = response.data;

      if (!email) {
        return res.status(400).json({ error: 'Could not get email from Google' });
      }

      // Check if user exists
      let user = await k('users').where('email', email).first();

      if (user) {
        // User exists, log them in
        const token = signToken(user);
        return res.json({
          success: true,
          message: 'Welcome back!',
          token,
          user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan },
          isNewUser: false
        });
      }

      // Create new user with Google info
      const [userId] = await k('users').insert({
        name: name || email.split('@')[0],
        email,
        phone: '', // Not required for Google users
        password_hash: '', // No password for OAuth users
        wa_number: '',
        role: 'seller',
        plan: 'free',
        active: true,
        auth_provider: 'google',
        avatar_url: picture
      });

      user = await k('users').where('id', userId).first();
      const token = signToken(user);

      res.status(201).json({
        success: true,
        message: 'Account created! Welcome to Vukafia.',
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, plan: user.plan },
        isNewUser: true
      });
    } catch (googleError) {
      console.error('Google token verification error:', googleError.message);
      return res.status(401).json({ error: 'Invalid Google token' });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
