/**
 * services/listingSearch.js
 * Structured listing search shared by AI search (web + WhatsApp).
 *
 * filters: { type, category, country, region, state, city, keywords[], q }
 *
 * If nothing matches and a category was identified, the keywords are dropped so
 * the user sees that category's listings (e.g. any Agriculture business in Ghana
 * when the exact product isn't listed). `relaxed` reports this. Nothing else is
 * relaxed: an unrelated result is worse than an empty one.
 */

'use strict';

const KEYWORD_COLUMNS = ['name', 'products_services', 'description', 'category'];

function applyFilters(query, f) {
  if (f.type)     query = query.where('type', f.type);
  if (f.category) query = query.where('category', f.category);
  if (f.country)  query = query.where('country', f.country);
  if (f.region)   query = query.where('region', f.region);
  if (f.state)    query = query.whereILike('state', `%${f.state}%`);
  if (f.city)     query = query.whereILike('city', `%${f.city}%`);

  // Any keyword may match any text column
  if (f.keywords && f.keywords.length) {
    query = query.where(function () {
      for (const kw of f.keywords) {
        for (const col of KEYWORD_COLUMNS) this.orWhereILike(col, `%${kw}%`);
      }
    });
  }

  if (f.q) {
    const term = `%${f.q}%`;
    query = query.where(function () {
      this.whereILike('name', term)
        .orWhereILike('products_services', term)
        .orWhereILike('category', term);
    });
  }
  return query;
}

async function search(k, filters, { limit = 10, offset = 0, select = '*' } = {}) {
  const attempts = [{ filters, relaxed: null }];
  if (filters.category && filters.keywords && filters.keywords.length) {
    attempts.push({ filters: { ...filters, keywords: [] }, relaxed: 'keywords' });
  }

  for (const { filters: f, relaxed } of attempts) {
    const base = applyFilters(k('listings').where('active', true), f);
    const { total } = await base.clone().count('id as total').first();
    if (!parseInt(total)) continue;

    const rows = await base
      .select(select)
      .orderBy('featured', 'desc')
      .orderBy('verified', 'desc')
      .orderBy('rating', 'desc')
      .limit(limit)
      .offset(offset);
    return { rows, total: parseInt(total), relaxed };
  }
  return { rows: [], total: 0, relaxed: null };
}

module.exports = { search };
