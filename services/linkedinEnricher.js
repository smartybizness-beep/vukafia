'use strict';

const axios = require('axios');
const net = require('net');
const db = require('../db');

const BATCH_LIMIT = 500;
const CONCURRENCY = 5;
const RECHECK_DAYS = 30;

// Company, school and showcase pages only; personal /in/ profiles are deliberately ignored.
const LINKEDIN_RE = /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(company|school|showcase)\/([A-Za-z0-9_\-.%]+)/gi;

// Skip sites that are themselves social profiles rather than the business's own website.
const SOCIAL_HOSTS = /(^|\.)(instagram|facebook|fb|linkedin|twitter|x|tiktok|wa|whatsapp|linktr)\.(com|me|ee)$/i;

function isFetchable(rawUrl) {
  let url;
  try { url = new URL(rawUrl); } catch { return false; }
  if (!['http:', 'https:'].includes(url.protocol)) return false;
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || net.isIP(host)) return false;
  return !SOCIAL_HOSTS.test(host);
}

function extractLinkedIn(html) {
  const counts = new Map();
  for (const [, kind, slug] of html.matchAll(LINKEDIN_RE)) {
    const clean = decodeURIComponent(slug).replace(/[.\-_]+$/, '');
    if (!clean) continue;
    const url = `https://www.linkedin.com/${kind.toLowerCase()}/${clean}`;
    counts.set(url, (counts.get(url) || 0) + 1);
  }
  if (!counts.size) return null;
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

async function findLinkedIn(website) {
  const { data } = await axios.get(website, {
    timeout: 10000,
    maxRedirects: 3,
    maxContentLength: 2 * 1024 * 1024,
    responseType: 'text',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VukafiaBot/1.0; +https://vukafia.com)' },
    validateStatus: s => s >= 200 && s < 400,
  });
  return typeof data === 'string' ? extractLinkedIn(data) : null;
}

async function enrichLinkedIn({ limit = BATCH_LIMIT } = {}) {
  const k = db.query();
  const started = Date.now();
  const recheckBefore = new Date(Date.now() - RECHECK_DAYS * 24 * 60 * 60 * 1000);

  const listings = await k('listings')
    .where('active', true)
    .whereNotNull('website')
    .whereNull('linkedin_url')
    .where(q => q.whereNull('linkedin_checked_at').orWhere('linkedin_checked_at', '<', recheckBefore))
    .orderBy('id')
    .limit(limit)
    .select('id', 'name', 'website');

  let found = 0, notFound = 0, failed = 0, skipped = 0;

  for (let i = 0; i < listings.length; i += CONCURRENCY) {
    await Promise.all(listings.slice(i, i + CONCURRENCY).map(async listing => {
      let linkedin = null;
      if (!isFetchable(listing.website)) {
        skipped++;
      } else {
        try {
          linkedin = await findLinkedIn(listing.website);
          if (linkedin) found++; else notFound++;
        } catch {
          failed++;
        }
      }
      await k('listings').where('id', listing.id).update({
        linkedin_url: linkedin,
        linkedin_checked_at: new Date(),
      });
    }));
  }

  const result = {
    checked: listings.length, found, notFound, failed, skipped,
    duration_s: Math.round((Date.now() - started) / 1000),
  };
  console.log('[LINKEDIN ENRICHER]', result);
  return result;
}

module.exports = { enrichLinkedIn, extractLinkedIn };
