import { useEffect, useState } from 'react';

export default function ReviewsList({ listingId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [listingId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/listing/${listingId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '1rem', textAlign: 'center' }}>Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div style={{
        padding: '1rem',
        background: '#f9f9f9',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#666'
      }}>
        No reviews yet. Be the first to leave one!
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: '1rem', color: '#2d1f0e' }}>
        Reviews ({reviews.length})
      </h3>

      {reviews.map(review => (
        <div
          key={review.id}
          style={{
            background: '#fff',
            border: '1px solid #eee',
            borderRadius: '8px',
            padding: '1.5rem',
            marginBottom: '1rem'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'start',
            marginBottom: '1rem'
          }}>
            <div>
              <div style={{ fontWeight: 'bold', color: '#2d1f0e' }}>
                {review.reviewer_name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#999' }}>
                {review.reviewer_type === 'seller' ? '🏪 Seller' : '👤 Buyer'} • {new Date(review.created_at).toLocaleDateString()}
              </div>
            </div>
            <div style={{ fontSize: '1.2rem' }}>
              {'⭐'.repeat(review.rating)}
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: '1rem', color: '#555', lineHeight: 1.6 }}>
            {review.comment}
          </div>

          {/* Evidence */}
          {review.evidence && review.evidence.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#666', marginBottom: '0.5rem' }}>
                📸 Evidence ({review.evidence.length}):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 80px)', gap: '0.5rem' }}>
                {review.evidence.map(ev => (
                  <a
                    key={ev.id}
                    href={ev.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      width: '80px',
                      height: '80px',
                      background: '#eee',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      fontSize: '0.7rem',
                      color: '#666',
                      textDecoration: 'none',
                      padding: '0.25rem'
                    }}
                    title={ev.description}
                  >
                    {ev.file_type === 'image' ? '🖼️' : '📄'} View
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Seller Response */}
          {review.responses && review.responses.length > 0 && (
            <div style={{
              background: '#f0f8ff',
              padding: '1rem',
              borderRadius: '4px',
              marginTop: '1rem',
              borderLeft: '4px solid #0284c7'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#0284c7' }}>
                Response from {review.responses[0].responder_name}:
              </div>
              <div style={{ color: '#555', fontSize: '0.95rem' }}>
                {review.responses[0].response_text}
              </div>
            </div>
          )}

          {/* Status Badge */}
          {review.status === 'pending' && (
            <div style={{
              background: '#fff3cd',
              color: '#856404',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              marginTop: '1rem'
            }}>
              ⏳ Pending approval (awaiting evidence verification)
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
