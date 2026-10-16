/* Admin claim completion. Values come from users and listings, so the DOM is built with
   textContent only — never innerHTML. */
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

  const setStatus = text => { $('status').textContent = text || ''; };
  const when = d => (d ? new Date(d).toLocaleString() : '');

  function renderClaim(c) {
    const card = h('article', 'card review');
    const verified = c.status === 'verified';

    const top = h('div', 'top');
    const left = h('div');
    const biz = h('a', 'biz', c.listing_name);
    biz.href = `/business/${c.listing_id}`;
    biz.target = '_blank';
    biz.rel = 'noopener';
    left.append(biz, h('div', 'meta', `${c.country || ''} · listing #${c.listing_id} · phone on file ${c.listing_phone || 'none'}`));
    top.append(left, h('span', verified ? 'badge-ok' : 'flag', verified ? 'Ownership verified' : 'Not verified'));

    const who = h('div', 'meta', `Claimed by ${c.user_name} <${c.user_email}>${c.user_phone ? ` · ${c.user_phone}` : ''} · started ${when(c.created_at)}`);
    const detail = verified
      ? h('div', 'meta', `Code ${c.code} sent from WhatsApp +${c.verified_phone} on ${when(c.verified_at)}`)
      : h('div', 'warn', `They haven't confirmed ownership over WhatsApp (code ${c.code}). Only complete this if you've checked another way that they own the business, e.g. a call to the number on file.`);

    const note = h('input');
    note.placeholder = 'Note, e.g. Bachs payment reference';
    note.style.width = '100%';
    note.style.margin = '10px 0';

    const actions = h('div', 'actions');
    const complete = h('button', 'approve', 'Payment confirmed: complete claim');
    const cancel = h('button', 'reject', 'Cancel claim');
    complete.type = cancel.type = 'button';
    actions.append(complete, cancel);

    async function act(kind) {
      complete.disabled = cancel.disabled = true;
      try {
        const { message } = await api(`/api/admin/claims/${c.id}/${kind}`, { method: 'POST', body: JSON.stringify({ note: note.value }) });
        card.remove();
        setStatus(`${c.listing_name}: ${message}`);
        if (!$('list').children.length) renderEmpty();
      } catch (err) {
        if (err instanceof AuthError) return showLogin('Your session expired. Please sign in again.');
        setStatus(`Could not ${kind} the claim for ${c.listing_name}: ${err.message}`);
        complete.disabled = cancel.disabled = false;
      }
    }
    complete.addEventListener('click', () => {
      const msg = verified
        ? `Confirm you've received the $14.99 payment for ${c.listing_name}?`
        : `${c.listing_name} has NOT been verified over WhatsApp. Complete anyway because you've confirmed ownership and payment yourself?`;
      if (confirm(msg)) act('complete');
    });
    cancel.addEventListener('click', () => { if (confirm('Cancel this claim?')) act('cancel'); });

    card.append(top, who, detail, note, actions);
    return card;
  }

  function renderEmpty() {
    $('list').replaceChildren(h('div', 'card empty', 'No open claims.'));
  }

  async function load() {
    setStatus('Loading…');
    try {
      const { data } = await api('/api/admin/claims');
      const verified = data.filter(c => c.status === 'verified').length;
      setStatus(data.length ? `${verified} verified, ${data.length - verified} not yet verified` : '');
      if (!data.length) return renderEmpty();
      $('list').replaceChildren(...data.map(renderClaim));
    } catch (err) {
      if (err instanceof AuthError) return showLogin(token ? 'Your session expired or this account is not an admin.' : '');
      setStatus(`Could not load claims: ${err.message}`);
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
