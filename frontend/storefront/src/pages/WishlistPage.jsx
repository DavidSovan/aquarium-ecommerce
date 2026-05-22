import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export function WishlistPage() {
  const { wishlist, removeItem, loading } = useWishlist();
  const { addItem } = useCart();
  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>

      {!wishlist?.items?.length ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Your wishlist is empty</p>
          <Link to="/shop" className="text-blue-600 hover:text-blue-700 font-medium">Browse Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.items.map(item => item.product && (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <Link to={`/product/${item.product.slug}`}>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {item.product.thumbnail ? (
                    <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
              </Link>
              <Link to={`/product/${item.product.slug}`} className="font-medium text-gray-900 hover:text-blue-600 block truncate">
                {item.product.name}
              </Link>
              <p className="text-blue-600 font-bold mt-1">{formatPrice(item.product.discount_price || item.product.price)}</p>
              <div className="flex gap-2 mt-3">
                {item.product.stock_quantity > 0 && (
                  <button
                    onClick={() => addItem(item.product.id, 1)}
                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >Add to Cart</button>
                )}
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="px-3 py-1.5 border border-red-200 text-red-500 text-sm rounded hover:bg-red-50"
                >Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
