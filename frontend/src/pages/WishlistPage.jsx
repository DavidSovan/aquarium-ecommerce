import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist';
import { WishlistButton } from '../components/WishlistButton';

export function WishlistPage() {
  const { wishlist, loading, fetchWishlist, toggleItem, wishlistedIds } = useWishlist();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

  if (loading && !wishlist) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          {wishlist && wishlist.items.length > 0 && (
            <span className="text-sm text-gray-500">{wishlist.items.length} item{wishlist.items.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {!wishlist || wishlist.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-gray-500 text-lg mb-2">Your wishlist is empty</p>
            <p className="text-gray-400 text-sm mb-6">Save your favorite items to come back later</p>
            <Link to="/shop" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            {wishlist.items.map((item) => (
              <div key={item.id} className="px-6 py-5 flex gap-5">
                <Link to={`/product/${item.product.slug}`} className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  {item.product.thumbnail ? (
                    <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.slug}`} className="text-base font-medium text-gray-900 hover:text-blue-600">
                    {item.product.name}
                  </Link>
                  {item.product.brand && (
                    <p className="text-sm text-gray-500 mt-0.5">{item.product.brand}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-lg font-bold text-blue-600">{formatPrice(item.product.price)}</span>
                    {item.product.discount_price && (
                      <span className="text-sm text-gray-400 line-through">{formatPrice(item.product.discount_price)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.product.stock_quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-2">
                  <WishlistButton
                    productId={item.product_id}
                    isWishlisted={wishlistedIds.has(item.product_id)}
                    onToggle={toggleItem}
                    loading={loading}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
