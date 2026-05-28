import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import addressService from '../services/addressService';
import orderService from '../services/orderService';
import api from '../services/api';
import { useSiteSettings } from '../context/SiteSettingsContext';

function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-9 rounded w-40 mb-8" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 theme-rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
          ))}
        </div>
        <div className="h-64 theme-rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
      </div>
    </div>
  );
}

export function CheckoutPage() {
  const { cart, loading: cartLoading, clearCart } = useCart();
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
      clearCart();
      navigate(`/orders`, { state: { newOrder: res.data } });
    } catch (err) {
      setError(err.response?.data?.detail || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

  if (cartLoading) return <LoadingSkeleton />;

  if (!cart?.items?.length) {
    return (
      <div className="text-center py-28 px-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 50%)' }}>
          <svg className="w-9 h-9 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold theme-text-primary mb-2">Your cart is empty</h2>
        <p className="text-sm theme-text-secondary mb-6">Add some items to your cart before checking out.</p>
        <Link to="/shop" className="theme-btn-primary text-sm font-medium no-underline inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Browse Products
        </Link>
      </div>
    );
  }

  const discount = appliedCoupon?.discount_amount || 0;
  const total = cart.subtotal - discount;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* ── Header + steps ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold theme-text-primary">Checkout</h1>
        <div className="flex items-center gap-0 mt-4">
          {[
            { label: 'Review Cart', active: false, done: true },
            { label: 'Checkout', active: true, done: false },
            { label: 'Confirmation', active: false, done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  style={{
                    backgroundColor: step.done ? 'var(--success)' : step.active ? 'var(--primary)' : 'color-mix(in srgb, var(--border), transparent 40%)',
                    color: step.done || step.active ? '#fff' : 'var(--text-secondary)',
                  }}>
                  {step.done ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:inline"
                  style={{ color: step.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {step.label}
                </span>
              </div>
              {i < 2 && (
                <div className="w-8 sm:w-12 h-px mx-2"
                  style={{ backgroundColor: step.done ? 'var(--success)' : 'color-mix(in srgb, var(--border), transparent 40%)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 theme-rounded flex items-start gap-3 text-sm"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--error) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)',
            color: 'var(--error)',
          }}>
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* ── Left: Address + Notes ──────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-6">
            {/* Shipping Address */}
            <div className="theme-surface theme-rounded p-5 sm:p-6"
              style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
              <h2 className="text-lg font-bold theme-text-primary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: 'var(--primary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Shipping Address
              </h2>
              {addresses.length === 0 ? (
                <div className="text-center py-6 theme-rounded"
                  style={{ border: '1px dashed color-mix(in srgb, var(--border), transparent 30%)' }}>
                  <p className="text-sm theme-text-secondary mb-3">No addresses found.</p>
                  <button type="button" className="text-sm theme-text-link font-medium underline">Add an address</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr, idx) => {
                    const isSelected = selectedAddressId == addr.id;
                    return (
                      <label
                        key={addr.id}
                        className={`block p-4 theme-rounded cursor-pointer transition-all duration-200`}
                        style={{
                          border: isSelected
                            ? '2px solid var(--primary)'
                            : '1px solid color-mix(in srgb, var(--border), transparent 40%)',
                          backgroundColor: isSelected
                            ? 'color-mix(in srgb, var(--primary) 6%, transparent)'
                            : 'var(--surface)',
                          animation: `checkoutFadeIn 0.3s ease ${idx * 0.06}s forwards`,
                          opacity: 0,
                        }}>
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors`}
                            style={{
                              borderColor: isSelected ? 'var(--primary)' : 'color-mix(in srgb, var(--border), transparent 30%)',
                            }}>
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm theme-text-primary">{addr.full_name}</p>
                            <p className="text-sm theme-text-secondary mt-0.5">{addr.address_line}</p>
                            <p className="text-sm theme-text-secondary">{addr.city}, {addr.state} {addr.postal_code}, {addr.country}</p>
                            {addr.phone && <p className="text-sm theme-text-secondary mt-0.5">{addr.phone}</p>}
                          </div>
                          {addr.is_default && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0"
                              style={{
                                backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                                color: 'var(--primary)',
                              }}>
                              Default
                            </span>
                          )}
                        </div>
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={isSelected}
                          onChange={e => setSelectedAddressId(e.target.value)}
                          className="sr-only"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="theme-surface theme-rounded p-5 sm:p-6"
              style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
              <h2 className="text-lg font-bold theme-text-primary mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: 'var(--primary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Order Notes
              </h2>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Special instructions for your order (optional)"
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm theme-border theme-rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow resize-none"
              />
            </div>
          </div>

          {/* ── Right: Order Summary ────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="theme-surface theme-rounded p-5 sm:p-6 lg:sticky lg:top-24"
              style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
              <h2 className="text-lg font-bold theme-text-primary mb-5 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: 'var(--primary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto pr-1"
                style={{ scrollbarWidth: 'thin' }}>
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.product?.thumbnail && (
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 50%)' }}>
                        <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium theme-text-primary truncate">{item.product?.name}</p>
                      <p className="text-xs theme-text-secondary">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold theme-text-primary flex-shrink-0">{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div className="flex justify-between text-sm theme-text-secondary pb-3"
                style={{ borderBottom: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
                <span>Subtotal</span>
                <span className="theme-text-primary font-medium">{formatPrice(cart.subtotal)}</span>
              </div>

              {/* Coupon */}
              <div className="pt-3 pb-3"
                style={{ borderBottom: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 theme-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="theme-success font-medium">{appliedCoupon.coupon.code}</span>
                      <span className="theme-text-secondary">-{formatPrice(appliedCoupon.discount_amount)}</span>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon}
                      className="text-xs font-medium px-2 py-1 rounded transition-colors"
                      style={{ color: 'var(--error)' }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="flex-1 px-3 py-2 text-sm theme-border theme-rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponInput.trim()}
                      className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
                      style={{
                        backgroundColor: 'var(--text-primary)',
                        color: 'var(--surface)',
                      }}
                    >
                      {validatingCoupon ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: 'var(--error)' }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {couponError}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="pt-3 space-y-2 text-sm">
                <div className="flex justify-between theme-text-secondary">
                  <span>Subtotal</span>
                  <span className="theme-text-primary">{formatPrice(cart.subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between theme-success">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between theme-text-secondary">
                  <span>Shipping</span>
                  <span className="theme-success">{cart.subtotal >= 100 ? 'Free' : 'Calculated later'}</span>
                </div>
              </div>

              <div className="my-4" style={{ borderTop: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }} />

              <div className="flex justify-between items-baseline mb-6">
                <span className="text-base font-bold theme-text-primary">Total</span>
                <span className="text-xl font-extrabold theme-text-primary">{formatPrice(total)}</span>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedAddressId}
                className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: 'var(--button-bg)',
                  color: 'var(--button-text)',
                  boxShadow: '0 4px 14px color-mix(in srgb, var(--button-bg) 40%, transparent)',
                }}
              >
                {submitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Placing Order...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Place Order
                  </>
                )}
              </button>

              {/* Trust */}
              <div className="mt-4 pt-4 flex flex-wrap gap-3 justify-center text-xs theme-text-secondary"
                style={{ borderTop: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
                {[
                  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', text: 'Secure' },
                ].map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ color: 'var(--success)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
      <style>{`
        @keyframes checkoutFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
