const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { generateCoverPhoto } = require('../services/googleMapsCrawler');

const router = express.Router();

const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX = 5000;
const photoUriCache = new Map();

router.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 600, standardHeaders: true, legacyHeaders: false }));

async function resolvePhotoUri(photoName) {
  const { data } = await axios.get(`https://places.googleapis.com/v1/${photoName}/media`, {
    params: { maxHeightPx: 500, skipHttpRedirect: true },
    headers: { 'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY },
    timeout: 8000,
  });
  return data.photoUri;
}

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) return res.status(404).end();

  const cached = photoUriCache.get(id);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    res.set('Cache-Control', 'public, max-age=3600');
    return res.redirect(302, cached.uri);
  }

  let listing;
  try {
    listing = await db.query()('listings').where('id', id).first('google_photo_name', 'category');
  } catch (err) {
    console.error('[PHOTOS]', err.message);
    return res.status(500).end();
  }
  if (!listing) return res.status(404).end();

  const fallback = generateCoverPhoto(listing.category);
  if (!listing.google_photo_name) return res.redirect(302, fallback);

  try {
    const uri = await resolvePhotoUri(listing.google_photo_name);
    if (!uri) throw new Error('No photoUri returned');
    if (photoUriCache.size >= CACHE_MAX) photoUriCache.delete(photoUriCache.keys().next().value);
    photoUriCache.set(id, { uri, at: Date.now() });
    res.set('Cache-Control', 'public, max-age=3600');
    return res.redirect(302, uri);
  } catch (err) {
    console.error(`[PHOTOS] listing ${id}:`, err.response?.status || err.message);
    res.set('Cache-Control', 'public, max-age=600');
    return res.redirect(302, fallback);
  }
});

module.exports = router;
