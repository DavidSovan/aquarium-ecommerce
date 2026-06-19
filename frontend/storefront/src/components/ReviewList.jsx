import { StarRating } from './StarRating';

export function ReviewList({ reviews, averageRating, onDelete }) {
  const formatDate = (d) => new Date(d).toLocaleDateString();

  const getAuthorName = (review) => {
    if (review.user && (review.user.first_name || review.user.last_name)) {
      return `${review.user.first_name || ''} ${review.user.last_name || ''}`.trim();
    }
    return 'Anonymous Customer';
  };

  return (
    <div>
      {averageRating > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl font-bold">{averageRating}</span>
          <StarRating rating={Math.round(averageRating)} readonly />
          <span className="theme-text-secondary">({reviews.length} reviews)</span>
        </div>
      )}
      {reviews.length === 0 ? (
        <p className="theme-text-secondary">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="pb-4 theme-border" style={{ borderBottomWidth: 1, borderBottomStyle: 'solid' }}>
              <div className="flex items-center justify-between">
                <StarRating rating={review.rating} readonly />
                <span className="text-sm theme-text-secondary">{formatDate(review.created_at)}</span>
              </div>
              {review.title && <p className="font-medium theme-text-primary mt-1">{review.title}</p>}
              {review.content && <p className="theme-text-secondary mt-1">{review.content}</p>}
              <p className="text-sm theme-text-secondary mt-2 font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                {getAuthorName(review)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
