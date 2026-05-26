import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reviewService } from '../services/reviewService';
import { StarRating } from '../components/StarRating';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useAuth } from '../context/AuthContext';

export function MyReviewsPage() {
  const { storeName } = useSiteSettings();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, title: '', content: '' });

  useEffect(() => {
    document.title = `My Reviews - ${storeName}`;
  }, [storeName]);

  useEffect(() => {
    if (!user) return;
    reviewService.getMyReviews({ limit: 100 }).then(res => {
      setReviews(res.data.items);
      setTotal(res.data.total);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await reviewService.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      setTotal(prev => prev - 1);
    } catch {}
  };

  const startEdit = (review) => {
    setEditingId(review.id);
    setEditForm({ rating: review.rating, title: review.title || '', content: review.content || '' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ rating: 5, title: '', content: '' });
  };

  const saveEdit = async (id) => {
    try {
      const res = await reviewService.updateReview(id, editForm);
      setReviews(prev => prev.map(r => r.id === id ? res.data : r));
      setEditingId(null);
    } catch {}
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
        <div className="theme-spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 className="theme-text-primary" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Reviews</h1>
      <p className="theme-text-secondary" style={{ marginBottom: '1.5rem' }}>
        {total > 0 ? `You have written ${total} review${total !== 1 ? 's' : ''}.` : 'You haven\'t written any reviews yet.'}
      </p>

      {reviews.length === 0 ? (
        <div className="theme-surface theme-border theme-rounded" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="theme-text-secondary" style={{ marginBottom: '1rem' }}>No reviews yet.</p>
          <Link to="/shop" className="theme-btn-primary" style={{ padding: '0.625rem 1.5rem', borderRadius: 'var(--button-radius)', textDecoration: 'none', display: 'inline-block' }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map(review => (
            <div key={review.id} className={`theme-surface theme-border ${editingId === review.id ? '' : 'theme-shadow'}`} style={{ borderRadius: 'var(--radius)', overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
              <div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
                <Link to={`/product/${review.product.slug}`} style={{ flexShrink: 0, width: 80, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: 'var(--surface-alt)' }}>
                  {review.product.thumbnail ? (
                    <img src={review.product.thumbnail} alt={review.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>No img</div>
                  )}
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link to={`/product/${review.product.slug}`} className="theme-text-primary" style={{ fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}>
                    {review.product.name}
                  </Link>
                  {editingId === review.id ? (
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="theme-text-secondary" style={{ fontSize: '0.875rem' }}>Rating:</span>
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} onClick={() => setEditForm(f => ({ ...f, rating: s }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: s <= editForm.rating ? 'var(--star-color, #eab308)' : 'var(--text-muted)' }}>
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          </button>
                        ))}
                      </div>
                      <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Review title (optional)"
                        className="theme-border" style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }} />
                      <textarea value={editForm.content} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                        placeholder="Your review..."
                        rows={3}
                        className="theme-border" style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }} />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => saveEdit(review.id)} className="theme-btn-primary" style={{ padding: '0.375rem 1rem', borderRadius: 'var(--button-radius)', border: 'none', cursor: 'pointer', fontSize: '0.8125rem' }}>Save</button>
                        <button onClick={cancelEdit} className="theme-btn-secondary" style={{ padding: '0.375rem 1rem', borderRadius: 'var(--button-radius)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '0.8125rem', background: 'transparent', color: 'var(--text-secondary)' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <StarRating rating={review.rating} />
                        <span className="theme-text-secondary" style={{ fontSize: '0.75rem' }}>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      {review.title && <p className="theme-text-primary" style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.375rem' }}>{review.title}</p>}
                      {review.content && <p className="theme-text-secondary" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{review.content}</p>}
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button onClick={() => startEdit(review)} className="theme-text-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', padding: 0 }}>Edit</button>
                        <button onClick={() => handleDelete(review.id)} className="theme-danger" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', padding: 0 }}>Delete</button>
                        {!review.is_approved && <span className="theme-text-secondary" style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>(pending approval)</span>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
