import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import addressService from '../services/addressService';
import orderService from '../services/orderService';
import api from '../services/api';
import { useSiteSettings } from '../context/SiteSettingsContext';

export function CheckoutPage() {
  const { cart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const { storeName } = useSiteSettings();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Checkout - ${storeName}`;
  }, [storeName]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    addressService.getAddresses().then(res => {
      setAddresses(res.data.items);
      const defaultAddr = res.data.items.find(a => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    }).catch(() => {});
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await api.post('/coupons/validate', {
        code: couponInput.trim(),
        order_amount: cart.subtotal,
      });
      if (res.data.valid) {
        setAppliedCoupon(res.data);
        setCouponInput('');
      } else {
        setCouponError(res.data.message || 'Invalid coupon');
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError('Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

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
        coupon_code: appliedCoupon?.coupon?.code || null,
      });
      navigate(`/orders`, { state: { newOrder: res.data } });
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
      <h1 className="text-3xl font-bold theme-text-primary mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 theme-rounded">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold theme-text-primary mb-4">Shipping Address</h2>
            {addresses.length === 0 ? (
              <p className="theme-text-secondary">No addresses found. Please add one.</p>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <label key={addr.id} className={`block p-4 theme-border theme-rounded cursor-pointer ${selectedAddressId == addr.id ? 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]' : 'theme-border'}`}>
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddressId == addr.id}
                      onChange={e => setSelectedAddressId(e.target.value)}
                      className="sr-only"
                    />
                    <p className="font-medium theme-text-primary">{addr.full_name}</p>
                    <p className="text-sm theme-text-secondary">{addr.address_line}</p>
                    <p className="text-sm theme-text-secondary">{addr.city}, {addr.country}</p>
                    <p className="text-sm theme-text-secondary">{addr.phone}</p>
                  </label>
                ))}
              </div>
            )}

            <div className="mt-6">
              <label className="block text-sm font-medium theme-text-primary mb-1">Order Notes (optional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 theme-border theme-rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold theme-text-primary mb-4">Order Summary</h2>
            <div className="theme-surface theme-shadow theme-rounded p-6 space-y-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm theme-text-primary">
                  <span>{item.product?.name} x{item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.total_price)}</span>
                </div>
              ))}
              <div className="theme-border pt-4 flex justify-between font-bold text-lg theme-text-primary" style={{ borderTopWidth: 1, borderTopStyle: 'solid' }}>
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>

              <div className="theme-border pt-4" style={{ borderTopWidth: 1, borderTopStyle: 'solid' }}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2 text-sm theme-border theme-rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="px-3 py-2 text-sm theme-danger border border-current rounded-lg hover:opacity-80"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponInput.trim()}
                      className="px-3 py-2 text-sm theme-btn-primary disabled:opacity-50"
                    >
                      {validatingCoupon ? '...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="mt-1 text-sm theme-danger">{couponError}</p>
                )}
                {appliedCoupon && (
                  <div className="mt-2 flex justify-between text-sm theme-success">
                    <span>Coupon: {appliedCoupon.coupon.code}</span>
                    <span>-{formatPrice(appliedCoupon.discount_amount)}</span>
                  </div>
                )}
              </div>

              <div className="theme-border pt-4 flex justify-between font-bold text-lg theme-text-primary" style={{ borderTopWidth: 1, borderTopStyle: 'solid' }}>
                <span>Total</span>
                <span>{formatPrice(cart.subtotal - (appliedCoupon?.discount_amount || 0))}</span>
              </div>
              <button
                type="submit"
                disabled={submitting || !selectedAddressId}
                className="w-full theme-btn-primary font-medium no-underline"
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
