import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import addressService from '../services/addressService';
import orderService from '../services/orderService';

export function CheckoutPage() {
  const { cart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    addressService.getAddresses().then(res => {
      setAddresses(res.data.items);
      const defaultAddr = res.data.items.find(a => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAddressId || !cart?.id) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await orderService.checkout({
        cart_id: cart.id,
        shipping_address_id: parseInt(selectedAddressId),
        notes: notes || null,
      });
      navigate(`/orders`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

  if (cartLoading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  if (!cart?.items?.length) {
    return <div className="text-center py-20 text-gray-500">Your cart is empty</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
            {addresses.length === 0 ? (
              <p className="text-gray-500">No addresses found. Please add one.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <label key={addr.id} className={`block p-4 border rounded-lg cursor-pointer ${selectedAddressId == addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddressId == addr.id}
                      onChange={e => setSelectedAddressId(e.target.value)}
                      className="sr-only"
                    />
                    <p className="font-medium">{addr.full_name}</p>
                    <p className="text-sm text-gray-600">{addr.address_line}</p>
                    <p className="text-sm text-gray-600">{addr.city}, {addr.country}</p>
                    <p className="text-sm text-gray-600">{addr.phone}</p>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product?.name} x{item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.total_price)}</span>
                </div>
              ))}
              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              <button
                type="submit"
                disabled={submitting || !selectedAddressId}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
