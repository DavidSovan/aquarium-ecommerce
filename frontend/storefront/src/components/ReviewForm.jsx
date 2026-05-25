import { useState } from 'react';
import { StarRating } from './StarRating';

export function ReviewForm({ onSubmit }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ rating, title, content });
      setTitle('');
      setContent('');
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-bold text-lg theme-text-primary">Write a Review</h3>
      <div>
        <label className="block text-sm font-medium theme-text-primary mb-1">Rating</label>
        <StarRating rating={rating} onChange={setRating} />
      </div>
      <div>
        <input
          type="text"
          placeholder="Review title (optional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 theme-border theme-rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>
      <div>
        <textarea
          placeholder="Write your review..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 theme-border theme-rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2 theme-btn-primary no-underline"
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
