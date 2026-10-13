import { useState } from 'react';

export default function ReviewForm({ listingId, onSubmit, onCancel }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewerType, setReviewerType] = useState('buyer');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // In production, upload files to S3/Cloudinary first
      const evidenceUrls = selectedFiles.map(file => ({
        file_url: `file_placeholder_${file.name}`,
        file_type: 'image',
        mime_type: file.type,
        file_size: file.size,
        description: `Evidence from ${file.name}`
      }));

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          listing_id: listingId,
          rating: parseInt(rating),
          comment,
          reviewer_type: reviewerType,
          evidence_urls: evidenceUrls
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit review');
      }

      const result = await response.json();
      onSubmit(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      background: '#f9f9f9',
      padding: '2rem',
      borderRadius: '8px',
      marginBottom: '2rem'
    }}>
      <h3 style={{ marginTop: 0, color: '#2d1f0e' }}>Leave a Review</h3>

      <form onSubmit={handleSubmit}>
        {/* Reviewer Type */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            I am a:
          </label>
          <select
            value={reviewerType}
            onChange={(e) => setReviewerType(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          >
            <option value="buyer">Buyer (purchased from this seller)</option>
            <option value="seller">Seller (rating a buyer)</option>
          </select>
        </div>

        {/* Rating */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Rating: {rating} / 5 ⭐
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            style={{ width: '100%' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  background: rating >= r ? '#c0522a' : '#eee',
                  color: rating >= r ? '#fff' : '#666',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {r === 1 ? '😞' : r === 2 ? '😐' : r === 3 ? '😊' : r === 4 ? '😄' : '🥰'}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Your Review:
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience... (min 10 characters)"
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Evidence Upload */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            📸 Upload Evidence (Optional):
          </label>
          <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 0.5rem 0' }}>
            Screenshots of payment, delivery receipts, or product photos help verify your review
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*,.pdf"
            style={{
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%'
            }}
          />
          {selectedFiles.length > 0 && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              ✅ {selectedFiles.length} file(s) selected
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#fee',
            color: '#c33',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#c0522a',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#eee',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
