import { useState } from 'react';

const MIN_LENGTH = 10;
const MAX_LENGTH = 1000;
const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export default function ReviewForm({ listingId, onSubmitted, onCancel, onAuthRequired }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const trimmed = comment.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return setError('Please choose a star rating.');
    if (trimmed.length < MIN_LENGTH) return setError(`Please write at least ${MIN_LENGTH} characters.`);

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ listing_id: listingId, rating, comment: trimmed }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        onAuthRequired();
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Could not submit your review. Please try again.');
      onSubmitted(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#fafafa', padding: 'clamp(1rem, 4vw, 1.5rem)', borderRadius: '8px', marginBottom: '1rem' }}>
      <h3 style={{ marginTop: 0, color: '#2d1f0e', fontSize: '1.1rem' }}>Write a review</h3>

      <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1rem 0' }}>
        <legend style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#2d1f0e' }}>Your rating</legend>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.25rem 0.75rem' }}>
          <div role="radiogroup" aria-label="Rating" style={{ display: 'flex' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} star${n > 1 ? 's' : ''} – ${LABELS[n]}`}
                onClick={() => { setRating(n); setError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.2rem',
                  minWidth: '44px',
                  minHeight: '44px',
                  fontSize: '1.9rem',
                  lineHeight: 1,
                  cursor: 'pointer',
                  filter: n <= rating ? 'none' : 'grayscale(1) opacity(0.35)',
                }}
              >
                ⭐
              </button>
            ))}
          </div>
          <span style={{ color: '#666', fontSize: '0.95rem' }}>{rating ? LABELS[rating] : 'Tap a star'}</span>
        </div>
      </fieldset>

      <label htmlFor="review-comment" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#2d1f0e' }}>
        Your experience
      </label>
      <textarea
        id="review-comment"
        value={comment}
        maxLength={MAX_LENGTH}
        onChange={e => { setComment(e.target.value); setError(''); }}
        placeholder="What did you buy or order? How were the quality, communication and delivery?"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          minHeight: '120px',
          padding: '0.75rem',
          border: '1px solid #ddd',
          borderRadius: '6px',
          fontSize: '1rem',
          fontFamily: 'inherit',
          resize: 'vertical',
        }}
      />
      <div style={{ textAlign: 'right', fontSize: '0.8rem', color: trimmed.length < MIN_LENGTH ? '#999' : '#2e7d32', margin: '0.25rem 0 1rem' }}>
        {trimmed.length < MIN_LENGTH ? `${MIN_LENGTH - trimmed.length} more characters needed` : `${trimmed.length} / ${MAX_LENGTH}`}
      </div>

      {error && (
        <div role="alert" style={{ background: '#fdecea', color: '#b71c1c', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <p style={{ fontSize: '0.8rem', color: '#777', margin: '0 0 1rem 0' }}>
        Your name will be shown with your review. Reviews appear after our team approves them.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            flex: '1 1 160px',
            padding: '0.8rem',
            background: '#c0522a',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            fontSize: '1rem',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{ flex: '1 1 120px', padding: '0.8rem', background: '#eee', color: '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
