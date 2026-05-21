import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';

export function CartPage() {
  const { cart, loading, fetchCart, updateItem, removeItem, clearCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <Link to="/shop" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <p className="text-sm text-gray-600">{cart.total_items} item{cart.total_items !== 1 ? 's' : ''}</p>
                  <button
                    onClick={clearCart}
                    className="text-sm text-red-500 hover:text-red-600 font-medium"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="divide-y divide-gray-200">
                  {cart.items.map((item) => (
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
                        <p className="text-sm text-gray-500 mt-0.5">SKU: {item.product.sku || '-'}</p>

                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              onClick={() => item.quantity > 1 && updateItem(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                            >
                              &minus;
                            </button>
                            <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => item.quantity < item.product.stock_quantity && updateItem(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock_quantity}
                              className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-sm text-red-500 hover:text-red-600 font-medium"
                          >
                            Remove
                          </button>
                        </div>

                        {item.product.discount_price && (
                          <p className="text-xs text-gray-400 mt-1">
                            Was <span className="line-through">{formatPrice(item.product.price)}</span>, save {formatPrice(item.product.price - item.product.discount_price)} each
                          </p>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900">{formatPrice(item.total_price)}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatPrice(item.unit_price)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Link to="/shop" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  &larr; Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({cart.total_items})</span>
                    <span className="font-medium">{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-blue-600">{formatPrice(cart.subtotal)}</span>
                  </div>
                </div>

                <button
                  disabled
                  className="mt-6 w-full py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
                >
                  Checkout (Coming Soon)
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">Free shipping on all orders</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
