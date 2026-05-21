import { Link } from 'react-router-dom';

export function ProductCard({ product }) {
  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

  const discountPercent = product.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : 0;

  return (
    <Link to={`/product/${product.slug}`} className="block">
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
        <div className="aspect-square bg-gray-100 relative">
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.name}
              className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && (
            <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
              Featured
            </span>
          )}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="p-4">
          {product.category && (
            <p className="text-xs text-blue-600 font-medium mb-1">{product.category.name}</p>
          )}
          <h3 className="font-bold text-gray-900 mb-1 truncate">{product.name}</h3>
          {product.short_description && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.short_description}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">{formatPrice(product.price)}</span>
            {product.discount_price && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.discount_price)}</span>
            )}
          </div>
          {product.brand && (
            <p className="text-xs text-gray-400 mt-1">{product.brand}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
