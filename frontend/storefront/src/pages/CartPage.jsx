import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function CartPage() {
  const { cart, updateItem, removeItem, loading } = useCart();
  const { user } = useAuth();
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {!cart?.items?.length ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <Link to="/shop" className="text-blue-600 hover:text-blue-700 font-medium">Continue Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
              {item.product?.thumbnail && (
                <img src={item.product.thumbnail} alt={item.product.name} className="w-24 h-24 object-cover rounded" />
              )}
              <div className="flex-1">
                <Link to={`/product/${item.product?.slug}`} className="font-medium text-gray-900 hover:text-blue-600">
                  {item.product?.name}
                </Link>
                <p className="text-blue-600 font-medium mt-1">{formatPrice(item.unit_price)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => updateItem(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                  >-</button>
                  <span className="font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateItem(item.id, item.quantity + 1)}
                    className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-100"
                  >+</button>
                  <button onClick={() => removeItem(item.id)} className="ml-auto text-red-500 hover:text-red-600 text-sm">Remove</button>
                </div>
              </div>
              <div className="text-right font-bold text-lg">{formatPrice(item.total_price)}</div>
            </div>
          ))}

          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            {user ? (
              <Link to="/checkout" className="block w-full text-center mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
                Proceed to Checkout
              </Link>
            ) : (
              <Link to="/login?redirect=/checkout" className="block w-full text-center mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">
                Log in to Checkout
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
