/* Admin search-log viewer. Every value from the API is untrusted (search text is
   typed by the public), so DOM is built with textContent only — never innerHTML. */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const TOKEN_KEY = 'vk_admin_token';
  const PAGE_SIZE = 25;

  const store = {
    get: k => { try { return sessionStorage.getItem(k); } catch (_) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) {} },
    del: k => { try { sessionStorage.removeItem(k); } catch (_) {} },
  };

  let token = store.get(TOKEN_KEY);
  let page = 1;
  let pages = 1;

  const compact = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });
  const fmt = new Intl.NumberFormat();

  function h(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // ── API ────────────────────────────────────────────────────────────────
  class AuthError extends Error {}

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) throw new AuthError(body.error || 'Not authorised');
    if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
    return body;
  }

  // ── Auth ───────────────────────────────────────────────────────────────
  function showLogin(message) {
    $('app').hidden = true;
    $('login').hidden = false;
    const err = $('login-err');
    err.hidden = !message;
    err.textContent = message || '';
  }

  function showApp() {
    $('login').hidden = true;
    $('app').hidden = false;
    loadAll();
  }

  $('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    try {
      const body = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: $('email').value, password: $('password').value }),
      });
      token = body.token;
      store.set(TOKEN_KEY, token);
      $('password').value = '';
      showApp();
    } catch (err) {
      showLogin(err.message);
    }
  });

  $('logout').addEventListener('click', () => {
    token = null;
    store.del(TOKEN_KEY);
    showLogin();
  });

  // ── Summary ────────────────────────────────────────────────────────────
  function tile(label, value, note) {
    const t = h('div', 'card tile');
    t.append(h('div', 'label', label), h('div', 'value', value), h('div', 'note', note));
    return t;
  }

  function renderBars(list, items) {
    list.replaceChildren();
    if (!items.length) {
      const li = h('li', 'empty', 'Nothing yet.');
      list.append(li);
      return;
    }
    const max = Math.max(...items.map(i => parseInt(i.count)));
    for (const item of items) {
      const n = parseInt(item.count);
      const li = h('li');
      const row = h('div', 'row');
      const q = h('span', 'q', item.query);
      q.title = item.query;
      row.append(q, h('span', 'n', fmt.format(n)));
      const track = h('div', 'track');
      const fill = h('div', 'fill');
      fill.style.width = `${(n / max) * 100}%`;
      track.append(fill);
      li.append(row, track);
      list.append(li);
    }
  }

  const pct = (part, whole) => (whole ? `${Math.round((part / whole) * 100)}%` : '—');

  async function loadSummary() {
    const { data: s } = await api(`/api/admin/searches/summary?days=${$('days').value}`);

    $('tiles').replaceChildren(
      tile('Searches', fmt.format(s.searches), `last ${s.days} days`),
      tile('Parsed by AI', pct(s.ai_searches, s.searches), `${fmt.format(s.keyword_fallback)} used keyword fallback`),
      tile('Zero results', pct(s.zero_results, s.searches), `${fmt.format(s.zero_results)} searches found nothing`),
      tile('Avg response', s.searches ? `${fmt.format(s.avg_latency_ms)} ms` : '—', `${fmt.format(s.relaxed)} broadened to category`),
      tile('AI tokens', compact.format(s.input_tokens + s.output_tokens),
        `${compact.format(s.input_tokens)} in · ${compact.format(s.output_tokens)} out`),
    );

    const parts = [];
    if (s.by_source.length) parts.push(s.by_source.map(r => `${r.source === 'web' ? 'Web' : 'WhatsApp'} ${fmt.format(r.count)}`).join(' · '));
    if (s.by_language.length) parts.push('Languages: ' + s.by_language.map(r => `${r.language || '?'} ${fmt.format(r.count)}`).join(', '));
    $('breakdown').textContent = parts.join('   |   ');

    renderBars($('top'), s.top_queries);
    renderBars($('notfound'), s.top_not_found);
  }

  // ── Log ────────────────────────────────────────────────────────────────
  function parseUtc(s) {
    return new Date(String(s).replace(' ', 'T') + 'Z');
  }

  function chips(r) {
    const f = r.filters || {};
    const wrap = document.createDocumentFragment();
    const add = (k, v) => {
      if (!v || (Array.isArray(v) && !v.length)) return;
      const c = h('span', 'chip');
      c.append(h('b', '', `${k} `), document.createTextNode(Array.isArray(v) ? v.join(', ') : v));
      wrap.append(c);
    };
    add('type', f.type); add('category', f.category); add('country', f.country);
    add('region', f.region); add('state', f.state); add('city', f.city);
    add('keywords', f.keywords); add('text', f.q);
    if (r.relaxed) add('broadened', r.relaxed);
    if (!wrap.childNodes.length) wrap.append(h('span', 'empty', '—'));
    return wrap;
  }

  async function loadLog() {
    const p = new URLSearchParams({ days: $('days').value, page, limit: PAGE_SIZE });
    if ($('f-q').value.trim()) p.set('q', $('f-q').value.trim());
    if ($('f-source').value) p.set('source', $('f-source').value);
    if ($('f-ai').value) p.set('ai', $('f-ai').value);
    if ($('f-zero').checked) p.set('zero_results', 'true');

    const body = await api(`/api/admin/searches?${p}`);
    pages = Math.max(1, body.pagination.pages);

    const tbody = $('rows');
    tbody.replaceChildren();
    for (const r of body.data) {
      const tr = h('tr');
      const when = h('td', 'time', parseUtc(r.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }));
      const q = h('td', 'query', r.query);
      const parsed = h('td', 'parsed'); parsed.append(chips(r));
      const src = h('td', 'src', r.source === 'web' ? 'Web' : 'WhatsApp');
      const parser = h('td', 'parser', r.used_ai ? 'AI' : 'Keyword');
      const res = h('td', r.result_count ? 'num' : 'num zero', fmt.format(r.result_count));
      tr.append(when, q, parsed, src, parser, res);
      tbody.append(tr);
    }
    $('log-empty').hidden = body.data.length > 0;
    $('page-info').textContent = body.pagination.total
      ? `Page ${page} of ${pages} · ${fmt.format(body.pagination.total)} searches`
      : '';
    $('prev').disabled = page <= 1;
    $('next').disabled = page >= pages;
  }

  async function loadAll() {
    try {
      await Promise.all([loadSummary(), loadLog()]);
    } catch (err) {
      if (err instanceof AuthError) {
        token = null; store.del(TOKEN_KEY);
        showLogin(err.message === 'Admin access required.' ? err.message : 'Please sign in again.');
      } else {
        console.error(err);
        $('breakdown').textContent = `Could not load data: ${err.message}`;
      }
    }
  }

  // ── Wiring ─────────────────────────────────────────────────────────────
  let debounce;
  const resetAndLoadLog = () => { page = 1; loadLog().catch(console.error); };

  $('days').addEventListener('change', () => { page = 1; loadAll(); });
  $('refresh').addEventListener('click', loadAll);
  $('f-source').addEventListener('change', resetAndLoadLog);
  $('f-ai').addEventListener('change', resetAndLoadLog);
  $('f-zero').addEventListener('change', resetAndLoadLog);
  $('f-q').addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(resetAndLoadLog, 300); });
  $('prev').addEventListener('click', () => { if (page > 1) { page--; loadLog().catch(console.error); } });
  $('next').addEventListener('click', () => { if (page < pages) { page++; loadLog().catch(console.error); } });

  token ? showApp() : showLogin();
})();
