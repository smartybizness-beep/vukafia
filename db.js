/**
 * db.js — Database layer
 * Dev:  SQLite (zero config, runs locally)
 * Prod: PostgreSQL (set DATABASE_URL in .env)
 */

'use strict';

const path   = require('path');
const fs     = require('fs');
const isProd = process.env.DATABASE_URL && process.env.NODE_ENV === 'production';

let knex;
let _connected = false;

function getKnex() {
  if (knex) return knex;

  if (isProd) {
    // ── POSTGRESQL (production) ──────────────────────────────────────────
    knex = require('knex')({
      client: 'pg',
      connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      },
      pool: { min: 2, max: 10 },
      searchPath: ['knex', 'public'],
    });
    console.log('📦 Using PostgreSQL database');
  } else {
    // ── SQLITE (development) ─────────────────────────────────────────────
    const dbDir  = path.join(__dirname, 'data');
    const dbFile = path.join(dbDir, 'vukafia.sqlite');
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    knex = require('knex')({
      client: 'sqlite3',
      connection: { filename: dbFile },
      useNullAsDefault: true,
    });
    console.log(`📦 Using SQLite: ${dbFile}`);
  }
  return knex;
}

// ─── SCHEMA BOOTSTRAP ─────────────────────────────────────────────────────
async function init() {
  const k = getKnex();

  // ── users (sellers / admins) ──────────────────────────────────────────
  await k.schema.hasTable('users').then(exists => {
    if (exists) return;
    return k.schema.createTable('users', t => {
      t.increments('id').primary();
      t.string('name').notNullable();
      t.string('email').unique().notNullable();
      t.string('phone').unique().notNullable();
      t.string('password_hash').notNullable();
      t.enu('role', ['seller', 'admin', 'superadmin']).defaultTo('seller');
      t.boolean('active').defaultTo(true);
      t.string('wa_number');           // seller's own WhatsApp
      t.string('plan').defaultTo('free'); // free | growth | pro | enterprise
      t.timestamp('plan_expires_at');
      t.timestamps(true, true);
    });
  });

  // ── listings ──────────────────────────────────────────────────────────
  await k.schema.hasTable('listings').then(exists => {
    if (exists) return;
    return k.schema.createTable('listings', t => {
      t.increments('id').primary();
      t.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      t.enu('type', ['product', 'service', 'tourism', 'medical']).notNullable();
      t.string('region').notNullable();          // West Africa | East Africa ...
      t.string('country').notNullable();
      t.string('country_code', 4);               // NG, GH, KE ...
      t.string('flag', 8);
      t.string('state');
      t.string('city');
      t.string('town');
      t.string('name').notNullable();
      t.string('category').notNullable();
      t.text('products_services');
      t.text('description');
      t.string('phone');
      t.string('whatsapp');
      t.string('email');
      t.string('website');
      t.string('instagram');                 // Instagram handle if available
      t.string('business_website');          // For tracking website separately
      t.decimal('latitude',  10, 6);
      t.decimal('longitude', 10, 6);
      t.decimal('rating', 3, 1).defaultTo(0.0);
      t.integer('review_count').defaultTo(0);
      t.boolean('verified').defaultTo(false);
      t.boolean('featured').defaultTo(false);
      t.boolean('is_new').defaultTo(true);
      t.boolean('active').defaultTo(true);
      t.json('photos');                           // array of photo URLs
      t.string('cover_photo');
      t.string('emoji', 8);
      t.integer('view_count').defaultTo(0);
      t.integer('contact_count').defaultTo(0);   // how many times contacted
      t.string('verified_source');                // google_maps, linkedin, facebook, owner_claimed
      t.timestamp('verified_at');                 // when verified
      t.integer('verification_score').defaultTo(50); // 1-100: confidence it's real
      t.timestamps(true, true);
    });
  });

  // ── reviews ──────────────────────────────────────────────────────────
  await k.schema.hasTable('reviews').then(exists => {
    if (exists) return;
    return k.schema.createTable('reviews', t => {
      t.increments('id').primary();
      t.integer('listing_id').references('id').inTable('listings').onDelete('CASCADE');
      t.string('reviewer_name').notNullable();
      t.string('reviewer_phone');
      t.integer('rating').notNullable();          // 1-5
      t.text('comment');
      t.boolean('approved').defaultTo(false);
      t.timestamps(true, true);
    });
  });

  // ── wa_messages (WhatsApp chat log) ──────────────────────────────────
  await k.schema.hasTable('wa_messages').then(exists => {
    if (exists) return;
    return k.schema.createTable('wa_messages', t => {
      t.increments('id').primary();
      t.string('from_number').notNullable();
      t.string('to_number').notNullable();
      t.text('message').notNullable();
      t.enu('direction', ['inbound', 'outbound']).notNullable();
      t.string('language').defaultTo('en');       // en, fr, ar, sw, ha, pidgin
      t.json('intent');                           // parsed intent from AI
      t.timestamps(true, true);
    });
  });

  // ── subscriptions ─────────────────────────────────────────────────────
  await k.schema.hasTable('subscriptions').then(exists => {
    if (exists) return;
    return k.schema.createTable('subscriptions', t => {
      t.increments('id').primary();
      t.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      t.string('plan').notNullable();             // growth | pro | enterprise
      t.decimal('amount', 10, 2).notNullable();
      t.string('currency').defaultTo('USD');
      t.string('payment_ref');                    // Paystack / Flutterwave ref
      t.enu('status', ['pending','active','expired','cancelled']).defaultTo('pending');
      t.timestamp('starts_at');
      t.timestamp('expires_at');
      t.timestamps(true, true);
    });
  });

  // ── contact_leads (when someone clicks Call/WhatsApp on a listing) ───
  await k.schema.hasTable('contact_leads').then(exists => {
    if (exists) return;
    return k.schema.createTable('contact_leads', t => {
      t.increments('id').primary();
      t.integer('listing_id').references('id').inTable('listings').onDelete('CASCADE');
      t.enu('contact_type', ['call','whatsapp','email','website']).notNullable();
      t.string('visitor_ip');
      t.string('visitor_country');
      t.timestamps(true, true);
    });
  });

  // ── listing_claims (when a business is claimed with payment) ──────────
  await k.schema.hasTable('listing_claims').then(exists => {
    if (exists) return;
    return k.schema.createTable('listing_claims', t => {
      t.increments('id').primary();
      t.integer('listing_id').references('id').inTable('listings').onDelete('CASCADE');
      t.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      t.string('payment_ref').notNullable();
      t.integer('payment_amount');
      t.string('payment_status').defaultTo('completed');
      t.enu('status', ['pending','completed','cancelled']).defaultTo('completed');
      t.timestamp('claimed_at');
      t.timestamps(true, true);
    });
  });

  // ── migrations (everything added after the base tables above) ────────
  await k.migrate.latest({ directory: path.join(__dirname, 'migrations') });

  _connected = true;
  console.log('✅ Database schema ready');
  return k;
}

module.exports = {
  init,
  getKnex,
  isConnected: () => _connected,
  query: () => getKnex(),
};
