/* Admin review moderation. Review text is typed by the public, so the DOM is built
   with textContent only — never innerHTML. */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const TOKEN_KEY = 'vk_admin_token';
  const store = {
    get: k => { try { return sessionStorage.getItem(k); } catch (_) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (_) {} },
    del: k => { try { sessionStorage.removeItem(k); } catch (_) {} },
  };
  let token = store.get(TOKEN_KEY);

  function h(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  class AuthError extends Error {}

  async function api(path, opts = {}) {
    const res = await fetch(path, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 || res.status === 403) throw new AuthError(body.error || 'Not authorised');
    if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
    return body;
  }

  function showLogin(message) {
    $('app').hidden = true;
    $('login').hidden = false;
    $('login-err').hidden = !message;
    $('login-err').textContent = message || '';
  }

  function showApp() {
    $('login').hidden = true;
    $('app').hidden = false;
    load();
  }

  function setStatus(text) { $('status').textContent = text || ''; }

  function renderReview(r) {
    const card = h('article', 'card review');

    const top = h('div', 'top');
    const left = h('div');
    const biz = h('a', 'biz', r.listing_name);
    biz.href = `/business/${r.listing_id}`;
    biz.target = '_blank';
    biz.rel = 'noopener';
    left.append(biz, h('div', 'meta', `${r.country || ''} · listing #${r.listing_id}`));
    const right = h('div', 'stars', '⭐'.repeat(r.rating) + ` ${r.rating}/5`);
    if (r.rating <= 2) right.append(h('span', 'flag', 'low rating'));
    top.append(left, right);

    const from = h('div', 'meta', `From ${r.reviewer_name || 'unknown'}${r.reviewer_email ? ` <${r.reviewer_email}>` : ''} · ${new Date(r.created_at).toLocaleString()}`);
    const quote = h('blockquote', null, r.comment || '');

    const actions = h('div', 'actions');
    const approve = h('button', 'approve', 'Approve');
    const reject = h('button', 'reject', 'Reject');
    approve.type = reject.type = 'button';
    actions.append(approve, reject);

    async function act(kind) {
      approve.disabled = reject.disabled = true;
      try {
        await api(`/api/admin/reviews/${r.id}/${kind}`, { method: 'POST', body: '{}' });
        card.remove();
        setStatus(kind === 'approve' ? `Approved review #${r.id}. It's now on the business page.` : `Rejected review #${r.id}.`);
        if (!$('list').children.length) renderEmpty();
      } catch (err) {
        if (err instanceof AuthError) return showLogin('Your session expired. Please sign in again.');
        setStatus(`Could not ${kind} review #${r.id}: ${err.message}`);
        approve.disabled = reject.disabled = false;
      }
    }
    approve.addEventListener('click', () => act('approve'));
    reject.addEventListener('click', () => {
      if (confirm('Reject this review? It will not be shown on the site.')) act('reject');
    });

    card.append(top, from, quote, actions);
    return card;
  }

  function renderEmpty() {
    $('list').replaceChildren(h('div', 'card empty', 'No reviews waiting for approval.'));
  }

  async function load() {
    setStatus('Loading…');
    try {
      const { data } = await api('/api/admin/reviews/pending');
      setStatus(data.length ? `${data.length} waiting for approval` : '');
      if (!data.length) return renderEmpty();
      $('list').replaceChildren(...data.map(renderReview));
    } catch (err) {
      if (err instanceof AuthError) return showLogin(token ? 'Your session expired or this account is not an admin.' : '');
      setStatus(`Could not load reviews: ${err.message}`);
    }
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

  $('logout').addEventListener('click', () => { token = null; store.del(TOKEN_KEY); showLogin(); });
  $('refresh').addEventListener('click', load);

  if (token) showApp(); else showLogin();
})();
