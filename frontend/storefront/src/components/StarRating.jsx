export function StarRating({ rating, onChange, readonly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type={onChange ? 'button' : undefined}
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`text-xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} ${onChange ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        >
          &#9733;
        </button>
      ))}
    </div>
  );
}
