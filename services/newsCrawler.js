'use strict';

const axios = require('axios');
const { getKnex } = require('../db');

const COUNTRIES = [
  ['DZ', 'Algeria'], ['AO', 'Angola'], ['BJ', 'Benin'], ['BW', 'Botswana'],
  ['BF', 'Burkina Faso'], ['BI', 'Burundi'], ['CV', 'Cape Verde'], ['CM', 'Cameroon'],
  ['CF', 'Central African Republic'], ['TD', 'Chad'], ['KM', 'Comoros'], ['CG', 'Republic of the Congo'],
  ['CD', 'DR Congo'], ['CI', "Côte d'Ivoire"], ['DJ', 'Djibouti'], ['EG', 'Egypt'],
  ['GQ', 'Equatorial Guinea'], ['ER', 'Eritrea'], ['SZ', 'Eswatini'], ['ET', 'Ethiopia'],
  ['GA', 'Gabon'], ['GM', 'Gambia'], ['GH', 'Ghana'], ['GN', 'Guinea'],
  ['GW', 'Guinea-Bissau'], ['KE', 'Kenya'], ['LS', 'Lesotho'], ['LR', 'Liberia'],
  ['LY', 'Libya'], ['MG', 'Madagascar'], ['MW', 'Malawi'], ['ML', 'Mali'],
  ['MR', 'Mauritania'], ['MU', 'Mauritius'], ['MA', 'Morocco'], ['MZ', 'Mozambique'],
  ['NA', 'Namibia'], ['NE', 'Niger'], ['NG', 'Nigeria'], ['RW', 'Rwanda'],
  ['ST', 'São Tomé and Príncipe'], ['SN', 'Senegal'], ['SC', 'Seychelles'], ['SL', 'Sierra Leone'],
  ['SO', 'Somalia'], ['ZA', 'South Africa'], ['SS', 'South Sudan'], ['SD', 'Sudan'],
  ['TZ', 'Tanzania'], ['TG', 'Togo'], ['TN', 'Tunisia'], ['UG', 'Uganda'],
  ['ZM', 'Zambia'], ['ZW', 'Zimbabwe'],
].map(([code, name]) => ({ code, name }));

const CATEGORIES = {
  government:  { label: 'Government',  terms: 'government OR ministry OR minister OR policy' },
  politics:    { label: 'Politics',    terms: 'politics OR election OR president OR parliament' },
  technology:  { label: 'Technology',  terms: 'technology OR tech OR startup OR digital' },
  banking:     { label: 'Banking',     terms: 'bank OR banking OR fintech OR "central bank"' },
  agriculture: { label: 'Agriculture', terms: 'agriculture OR farmers OR crop OR harvest' },
  economy:     { label: 'Economy',     terms: 'economy OR inflation OR GDP OR budget' },
  energy:      { label: 'Energy',      terms: 'energy OR oil OR electricity OR solar OR gas' },
  trade:       { label: 'Trade',       terms: 'trade OR export OR import OR AfCFTA OR customs' },
  mining:      { label: 'Mining',      terms: 'mining OR minerals OR gold OR lithium' },
  health:      { label: 'Health',      terms: 'health OR hospital OR disease OR vaccine' },
};

const CONCURRENCY = 4;
const DELAY_MS = 400;
const MAX_PER_QUERY = 15;
const RETENTION_DAYS = 30;

const sleep = ms => new Promise(r => setTimeout(r, ms));

function decode(str = '') {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : '';
}

function parseRss(xml) {
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  return items.map(block => {
    const source = tag(block, 'source');
    let title = tag(block, 'title');
    // Google News appends " - Source Name" to titles
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    const published = new Date(tag(block, 'pubDate'));
    return {
      title: title.slice(0, 500),
      link: tag(block, 'link'),
      source: source.slice(0, 200),
      published_at: isNaN(published) ? new Date() : published,
    };
  }).filter(a => a.title && /^https?:\/\//.test(a.link));
}

async function fetchArticles(country, categoryKey) {
  const q = `"${country.name}" (${CATEGORIES[categoryKey].terms}) when:3d`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en&gl=US&ceid=US:en`;
  const { data } = await axios.get(url, {
    timeout: 15000,
    responseType: 'text',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VukafiaNewsBot/1.0; +https://vukafia.com)' },
  });
  return parseRss(data).slice(0, MAX_PER_QUERY).map(a => ({
    ...a,
    country_code: country.code,
    country_name: country.name,
    category: categoryKey,
  }));
}

let running = false;

async function crawlNews({ countries = COUNTRIES, categories = Object.keys(CATEGORIES) } = {}) {
  if (running) return { skipped: true, reason: 'Crawl already in progress' };
  running = true;

  const knex = getKnex();
  const started = Date.now();
  const tasks = countries.flatMap(c => categories.map(cat => [c, cat]));
  let fetched = 0, inserted = 0, failed = 0;

  try {
    for (let i = 0; i < tasks.length; i += CONCURRENCY) {
      const batch = tasks.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(batch.map(([c, cat]) => fetchArticles(c, cat)));

      for (const r of results) {
        if (r.status === 'rejected') { failed++; continue; }
        if (!r.value.length) continue;
        fetched += r.value.length;
        const rows = await knex('news_articles')
          .insert(r.value)
          .onConflict('link')
          .ignore()
          .returning('id');
        inserted += rows.length;
      }
      await sleep(DELAY_MS);
    }

    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const pruned = await knex('news_articles').where('published_at', '<', cutoff).del();

    const result = {
      queries: tasks.length, fetched, inserted, failed, pruned,
      duration_s: Math.round((Date.now() - started) / 1000),
    };
    console.log('[NEWS CRAWLER]', result);
    return result;
  } finally {
    running = false;
  }
}

module.exports = { crawlNews, COUNTRIES, CATEGORIES };
