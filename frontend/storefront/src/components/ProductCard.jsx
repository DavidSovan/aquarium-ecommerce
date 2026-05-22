import { Link } from 'react-router-dom';

export function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist }) {
  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <Link to={`/product/${product.slug}`}>
        <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.category?.name || product.brand || ''}</p>
        <Link to={`/product/${product.slug}`} className="font-medium text-gray-900 hover:text-blue-600 block truncate">
          {product.name}
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-blue-600">{formatPrice(product.discount_price || product.price)}</span>
          {product.discount_price && (
            <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className={`text-xs font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onToggleWishlist?.(product.id)}
              className={`p-2 rounded-full ${isInWishlist ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
            >
              <svg className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            {product.stock_quantity > 0 && (
              <button
                onClick={() => onAddToCart?.(product.id)}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
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
