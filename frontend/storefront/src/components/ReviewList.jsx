import { StarRating } from './StarRating';

export function ReviewList({ reviews, averageRating, onDelete }) {
  const formatDate = (d) => new Date(d).toLocaleDateString();

  return (
    <div>
      {averageRating > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl font-bold">{averageRating}</span>
          <StarRating rating={Math.round(averageRating)} readonly />
          <span className="text-gray-500">({reviews.length} reviews)</span>
        </div>
      )}
      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex items-center justify-between">
                <StarRating rating={review.rating} readonly />
                <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
              </div>
              {review.title && <p className="font-medium mt-1">{review.title}</p>}
              {review.content && <p className="text-gray-600 mt-1">{review.content}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
