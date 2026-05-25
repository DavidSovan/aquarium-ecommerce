import { Link } from 'react-router-dom';

export function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist }) {
  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

  return (
    <div className="theme-surface theme-shadow hover:shadow-md transition-shadow theme-rounded overflow-hidden">
      <Link to={`/product/${product.slug}`}>
        <div className="aspect-square overflow-hidden" style={{ backgroundColor: 'color-mix(in srgb, var(--surface), var(--bg) 50%)' }}>
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center theme-text-secondary">No image</div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs theme-text-secondary mb-1">{product.category?.name || product.brand || ''}</p>
        <Link to={`/product/${product.slug}`} className="font-medium theme-text-primary hover:theme-text-link block truncate no-underline">
          {product.name}
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold theme-text-link">{formatPrice(product.discount_price || product.price)}</span>
          {product.discount_price && (
            <span className="text-sm theme-text-secondary line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className={`text-xs font-medium ${product.stock_quantity > 0 ? 'theme-success' : 'theme-danger'}`}>
            {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleWishlist?.(product.id)}
              className={`p-2 rounded-full ${isInWishlist ? 'theme-danger' : 'theme-text-secondary'} hover:theme-danger`}
            >
              <svg className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            {product.stock_quantity > 0 && (
              <button
                onClick={() => onAddToCart?.(product.id)}
                className="px-3 py-1.5 theme-btn-primary text-sm no-underline"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
