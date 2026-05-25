import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export function CartPage() {
  const { cart, updateItem, removeItem, loading } = useCart();
  const { user } = useAuth();
  const { storeName } = useSiteSettings();
  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

  useEffect(() => {
    document.title = `Shopping Cart - ${storeName}`;
  }, [storeName]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold theme-text-primary mb-8">Shopping Cart</h1>

      {!cart?.items?.length ? (
        <div className="text-center py-12">
          <p className="theme-text-secondary text-lg mb-4">Your cart is empty</p>
          <Link to="/shop" className="theme-text-link font-medium">Continue Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="theme-surface theme-shadow theme-rounded p-4 flex flex-col sm:flex-row gap-4">
              {item.product?.thumbnail && (
                <img src={item.product.thumbnail} alt={item.product.name} className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded" />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <Link to={`/product/${item.product?.slug}`} className="font-medium theme-text-primary hover:theme-text-link">
                    {item.product?.name}
                  </Link>
                  <div className="text-right font-bold text-lg theme-text-primary">{formatPrice(item.total_price)}</div>
                </div>
                <p className="theme-text-link font-medium mt-1">{formatPrice(item.unit_price)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => updateItem(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 theme-border rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                  >-</button>
                  <span className="font-medium theme-text-primary">{item.quantity}</span>
                  <button
                    onClick={() => updateItem(item.id, item.quantity + 1)}
                    className="w-8 h-8 theme-border rounded flex items-center justify-center hover:bg-gray-100"
                  >+</button>
                  <button onClick={() => removeItem(item.id)} className="ml-auto theme-danger text-sm">Remove</button>
                </div>
              </div>
            </div>
          ))}

          <div className="theme-surface theme-shadow theme-rounded p-6 mt-6">
            <div className="flex justify-between text-xl font-bold theme-text-primary">
              <span>Total</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            {user ? (
              <Link to="/checkout" className="block w-full text-center mt-4 theme-btn-primary font-medium no-underline">
                Proceed to Checkout
              </Link>
            ) : (
              <Link to="/login?redirect=/checkout" className="block w-full text-center mt-4 theme-btn-primary font-medium no-underline">
                Log in to Checkout
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
