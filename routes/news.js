const express = require('express');
const router = express.Router();
const { getKnex } = require('../db');
const { COUNTRIES, CATEGORIES } = require('../services/newsCrawler');

router.get('/meta', (req, res) => {
  res.json({
    categories: Object.entries(CATEGORIES).map(([key, c]) => ({ key, label: c.label })),
    countries: COUNTRIES,
  });
});

router.get('/', async (req, res) => {
  try {
    const { category, country, q } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(60, Math.max(1, parseInt(req.query.limit, 10) || 30));

    if (category && !CATEGORIES[category]) return res.status(400).json({ error: 'Unknown category' });

    const knex = getKnex();
    const query = knex('news_articles');
    if (category) query.where('category', category);
    if (country) query.where('country_code', String(country).toUpperCase());
    if (q) query.whereRaw('lower(title) like ?', [`%${String(q).slice(0, 100).toLowerCase()}%`]);

    const [{ count }] = await query.clone().count('* as count');
    const articles = await query
      .select('id', 'title', 'link', 'source', 'country_code', 'country_name', 'category', 'published_at')
      .orderBy('published_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    res.json({ total: Number(count), page, limit, articles });
  } catch (err) {
    console.error('[NEWS]', err.message);
    res.status(500).json({ error: 'Could not load news' });
  }
});

module.exports = router;
