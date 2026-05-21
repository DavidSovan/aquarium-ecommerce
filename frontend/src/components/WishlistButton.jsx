export function WishlistButton({ productId, isWishlisted, onToggle, loading = false }) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(productId);
      }}
      disabled={loading}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`p-2 rounded-full transition-all ${
        isWishlisted
          ? 'text-red-500 bg-red-50 hover:bg-red-100'
          : 'text-gray-400 bg-white/80 hover:bg-white hover:text-red-400'
      } disabled:opacity-50`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  );
}
