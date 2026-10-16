import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';

const PAGE_SIZE = 30;

const CATEGORY_ICONS = {
  government: '🏛️', politics: '🗳️', technology: '💻', banking: '🏦', agriculture: '🌾',
  economy: '📈', energy: '⚡', trade: '🚢', mining: '⛏️', health: '🏥',
};

function timeAgo(date) {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 7 ? `${days}d ago` : new Date(date).toLocaleDateString();
}

export default function NewsPage() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const country = params.get('country') || '';
  const q = params.get('q') || '';

  const [meta, setMeta] = useState({ categories: [], countries: [] });
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    fetch('/api/news/meta').then(r => r.json()).then(setMeta).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
    load(1, false);
  }, [category, country, q]);

  async function load(pageNum, append) {
    setLoading(true);
    setError('');
    try {
      const qs = new URLSearchParams({ page: pageNum, limit: PAGE_SIZE });
      if (category) qs.set('category', category);
      if (country) qs.set('country', country);
      if (q) qs.set('q', q);
      const res = await fetch(`/api/news?${qs}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setArticles(prev => (append ? [...prev, ...data.articles] : data.articles));
      setTotal(data.total);
    } catch {
      setError('Could not load news right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  }

  function updateParam(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  }

  function loadMore() {
    const next = page + 1;
    setPage(next);
    load(next, true);
  }

  const chip = active => ({
    padding: '0.5rem 1rem',
    borderRadius: '999px',
    border: `1px solid ${active ? '#c0522a' : '#e0d6c8'}`,
    background: active ? '#c0522a' : '#fff',
    color: active ? '#fff' : '#2d1f0e',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  });

  const selectedCountry = meta.countries.find(c => c.code === country);

  return (
    <Layout>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        <h1 style={{ color: '#2d1f0e', margin: '0 0 0.4rem 0', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }}>
          📰 Africa Market News
        </h1>
        <p style={{ color: '#666', margin: '0 0 1.5rem 0' }}>
          Latest business, policy and market headlines from all 54 African countries, updated every 6 hours.
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <button style={chip(!category)} onClick={() => updateParam('category', '')}>All News</button>
          {meta.categories.map(c => (
            <button key={c.key} style={chip(category === c.key)} onClick={() => updateParam('category', c.key)}>
              {CATEGORY_ICONS[c.key]} {c.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <select
            value={country}
            onChange={e => updateParam('country', e.target.value)}
            style={{ flex: '1 1 220px', padding: '0.7rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem' }}
          >
            <option value="">🌍 All 54 Countries</option>
            {meta.countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
          <form
            onSubmit={e => { e.preventDefault(); updateParam('q', searchInput.trim()); }}
            style={{ flex: '2 1 300px', display: 'flex', gap: '0.5rem' }}
          >
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search headlines…"
              style={{ flex: 1, padding: '0.7rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', minWidth: 0 }}
            />
            <button type="submit" style={{ padding: '0.7rem 1.2rem', background: '#2d1f0e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
              Search
            </button>
          </form>
        </div>

        {!loading && !error && (
          <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {total.toLocaleString()} articles
            {selectedCountry && ` · ${selectedCountry.name}`}
            {q && ` · matching "${q}"`}
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', background: '#fdecea', color: '#b71c1c', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#f9f6f1', borderRadius: '8px', color: '#666' }}>
            No news found for this selection yet. Try another category or country.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {articles.map(a => (
            <a
              key={a.id}
              href={a.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', flexDirection: 'column', gap: '0.6rem',
                background: '#fff', border: '1px solid #eee', borderRadius: '10px',
                padding: '1.1rem', textDecoration: 'none', color: 'inherit',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.75rem', fontWeight: 700 }}>
                <span style={{ background: '#fdf3e1', color: '#8a5a00', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                  {CATEGORY_ICONS[a.category]} {meta.categories.find(c => c.key === a.category)?.label || a.category}
                </span>
                <span style={{ background: '#eef4ee', color: '#2e7d32', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                  {a.country_name}
                </span>
              </div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', lineHeight: 1.4, color: '#2d1f0e' }}>{a.title}</h3>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888' }}>
                <span>{a.source}</span>
                <span>{timeAgo(a.published_at)}</span>
              </div>
            </a>
          ))}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading news…</div>}

        {!loading && articles.length < total && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button onClick={loadMore} style={{ padding: '0.8rem 2rem', background: '#c0522a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>
              Load more
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
