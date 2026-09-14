/**
 * routes/auth.js
 * Seller registration, login, token refresh
 */

'use strict';

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
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

module.exports = router;
