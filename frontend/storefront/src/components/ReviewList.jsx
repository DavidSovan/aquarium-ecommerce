import { StarRating } from './StarRating';

export function ReviewList({ reviews, averageRating, onDelete }) {
  const formatDate = (d) => new Date(d).toLocaleDateString();

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
