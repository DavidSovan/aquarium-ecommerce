import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import addressService from '../services/addressService';
import orderService from '../services/orderService';
import telegramService from '../services/telegramService';
import deliveryService from '../services/deliveryService';
import api from '../services/api';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { mediaUrl } from '../utils/mediaUrl';

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-10 rounded-full w-48 mb-10 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-3xl border border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]" />
          ))}
        </div>
        <div className="lg:col-span-2">
          <div className="h-96 rounded-3xl border border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]" />
        </div>
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
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const [linkingTelegram, setLinkingTelegram] = useState(false);
  const [telegramError, setTelegramError] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [wantSchedule, setWantSchedule] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState(null);

  useEffect(() => {
    addressService.getAddresses().then(res => {
      setAddresses(res.data.items);
      const defaultAddr = res.data.items.find(a => a.is_default);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    telegramService.getTelegramStatus().then(res => {
      setTelegramConnected(res.data.connected);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    deliveryService.getDeliverySettings().then(res => {
      setDeliveryEnabled(res.data.enable_delivery_scheduling);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!deliveryEnabled || !deliveryDate) {
      setAvailableSlots([]);
      setSelectedSlotId('');
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selDate = new Date(deliveryDate + 'T00:00:00');
    if (selDate <= today) {
      setSlotError('Delivery date must be in the future');
      setAvailableSlots([]);
      setSelectedSlotId('');
      return;
    }
    setSlotError(null);
    setLoadingSlots(true);
    deliveryService.getAvailableSlots(deliveryDate)
      .then(res => {
        setAvailableSlots(res.data);
        setSelectedSlotId('');
      })
      .catch(err => setSlotError(err.response?.data?.detail || 'Failed to load slots'))
      .finally(() => setLoadingSlots(false));
  }, [deliveryDate, deliveryEnabled]);

  const handleConnectTelegram = async () => {
    setLinkingTelegram(true);
    setTelegramError(null);
    try {
      const res = await telegramService.requestTelegramLinkToken();
      const { token, bot_username } = res.data;
      window.open(`https://t.me/${bot_username}?start=${token}`, '_blank');
    } catch (err) {
      setTelegramError(err.response?.data?.detail || 'Failed to connect Telegram');
    } finally {
      setLinkingTelegram(false);
    }
  };

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
    if (deliveryEnabled && wantSchedule && (!deliveryDate || !selectedSlotId)) {
      setError('Please select a delivery date and time slot');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await orderService.checkout({
        cart_id: cart.id,
        shipping_address_id: parseInt(selectedAddressId),
        notes: notes || null,
        coupon_code: appliedCoupon?.coupon?.code || null,
        payment_method: paymentMethod,
        preferred_delivery_date: (deliveryEnabled && wantSchedule) ? deliveryDate : null,
        delivery_slot_id: (deliveryEnabled && wantSchedule) ? parseInt(selectedSlotId) : null,
      });
      clearCart();
      if (res.data.payment_method === 'ONLINE_PAYMENT' && res.data.payment_qr) {
        navigate(`/payment/${res.data.id}`, { state: { newOrder: res.data } });
      } else {
        navigate(`/orders`, { state: { newOrder: res.data } });
      }
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
      <div className="flex-1 w-full flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="w-24 h-24 mb-6 rounded-full bg-[color-mix(in_srgb,var(--text-secondary)_10%,transparent)] flex items-center justify-center">
          <svg className="w-12 h-12 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3">Your cart is empty</h2>
        <p className="text-base text-[var(--text-secondary)] mb-8 max-w-md font-medium">Add some items to your cart before checking out.</p>
        <Link to="/shop" className="px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2 shadow-lg" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
    <div className="flex-1 w-full flex flex-col max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ── Header + steps ─────────────────────────────────────────────── */}
      <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] flex items-center justify-center text-[var(--primary)] shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">Checkout</h1>
            <p className="text-sm font-bold text-[var(--text-secondary)] mt-1">Almost there, just a few details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-0">
          {[
            { label: 'Review Cart', active: false, done: true },
            { label: 'Checkout', active: true, done: false },
            { label: 'Confirmation', active: false, done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black transition-all shadow-sm"
                  style={{
                    backgroundColor: step.done ? 'var(--success)' : step.active ? 'var(--primary)' : 'color-mix(in srgb, var(--border), transparent 40%)',
                    color: step.done || step.active ? '#fff' : 'var(--text-secondary)',
                  }}>
                  {step.done ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-sm font-bold hidden sm:inline"
                  style={{ color: step.active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {step.label}
                </span>
              </div>
              {i < 2 && (
                <div className="w-8 sm:w-12 h-[2px] mx-3 rounded-full"
                  style={{ backgroundColor: step.done ? 'var(--success)' : 'color-mix(in srgb, var(--border), transparent 40%)' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-2xl flex items-start gap-3 text-sm font-bold"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--error) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)',
            color: 'var(--error)',
          }}>
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* ── Left: Address + Notes ──────────────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* Shipping Address */}
            <div className="rounded-3xl border border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-md shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] flex items-center justify-center text-[var(--primary)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                Shipping Address
              </h2>
              {addresses.length === 0 ? (
                <div className="text-center py-8 rounded-2xl border-2 border-dashed border-[color-mix(in_srgb,var(--border),transparent_50%)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]">
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-4">You need an address to checkout.</p>
                  <Link to="/addresses" className="px-6 py-2.5 rounded-xl font-bold border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] transition-colors no-underline inline-flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Add Address
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr, idx) => {
                    const isSelected = selectedAddressId == addr.id;
                    return (
                      <label
                        key={addr.id}
                        className={`block p-5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden`}
                        style={{
                          border: isSelected
                            ? '2px solid var(--primary)'
                            : '1px solid color-mix(in srgb, var(--border), transparent 60%)',
                          backgroundColor: isSelected
                            ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
                            : 'var(--surface)',
                          boxShadow: isSelected ? '0 4px 12px color-mix(in srgb, var(--primary) 15%, transparent)' : 'none',
                          animation: `checkoutFadeIn 0.4s ease ${idx * 0.08}s forwards`,
                          opacity: 0,
                          transform: 'translateY(10px)',
                        }}>
                        <div className="flex items-start gap-4">
                          <div className={`w-5 h-5 rounded-full border-[2.5px] flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors`}
                            style={{
                              borderColor: isSelected ? 'var(--primary)' : 'color-mix(in srgb, var(--border), transparent 50%)',
                            }}>
                            {isSelected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-base text-[var(--text-primary)] mb-1">{addr.full_name}</p>
                            <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">{addr.address_line}</p>
                            <p className="text-sm text-[var(--text-secondary)] font-medium">{addr.city}, {addr.state} {addr.postal_code}, {addr.country}</p>
                            {addr.phone && <p className="text-sm text-[var(--text-primary)] font-bold mt-2">{addr.phone}</p>}
                          </div>
                          {addr.is_default && (
                            <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md"
                              style={{
                                backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)',
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

            {/* Payment Method */}
            <div className="rounded-3xl border border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-md shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] flex items-center justify-center text-[var(--primary)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`block p-5 rounded-2xl cursor-pointer transition-all duration-300`}
                  style={{
                    border: paymentMethod === 'COD'
                      ? '2px solid var(--primary)'
                      : '1px solid color-mix(in srgb, var(--border), transparent 60%)',
                    backgroundColor: paymentMethod === 'COD'
                      ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
                      : 'var(--surface)',
                    boxShadow: paymentMethod === 'COD' ? '0 4px 12px color-mix(in srgb, var(--primary) 15%, transparent)' : 'none',
                  }}>
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full border-[2.5px] flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: paymentMethod === 'COD' ? 'var(--primary)' : 'color-mix(in srgb, var(--border), transparent 50%)' }}>
                      {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />}
                    </div>
                    <div>
                      <p className="font-black text-base text-[var(--text-primary)]">Cash on Delivery</p>
                      <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">Pay when you receive it</p>
                    </div>
                    <div className="ml-auto w-10 h-10 rounded-full bg-[color-mix(in_srgb,var(--text-secondary)_10%,transparent)] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  </div>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="sr-only" />
                </label>
                <label
                  className={`block p-5 rounded-2xl cursor-pointer transition-all duration-300`}
                  style={{
                    border: paymentMethod === 'ONLINE_PAYMENT'
                      ? '2px solid var(--primary)'
                      : '1px solid color-mix(in srgb, var(--border), transparent 60%)',
                    backgroundColor: paymentMethod === 'ONLINE_PAYMENT'
                      ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
                      : 'var(--surface)',
                    boxShadow: paymentMethod === 'ONLINE_PAYMENT' ? '0 4px 12px color-mix(in srgb, var(--primary) 15%, transparent)' : 'none',
                  }}>
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full border-[2.5px] flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: paymentMethod === 'ONLINE_PAYMENT' ? 'var(--primary)' : 'color-mix(in srgb, var(--border), transparent 50%)' }}>
                      {paymentMethod === 'ONLINE_PAYMENT' && <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />}
                    </div>
                    <div>
                      <p className="font-black text-base text-[var(--text-primary)]">Online Payment</p>
                      <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">Scan to pay with KHQR</p>
                    </div>
                    <div className="ml-auto w-10 h-10 rounded-full bg-[color-mix(in_srgb,var(--text-secondary)_10%,transparent)] flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                    </div>
                  </div>
                  <input type="radio" name="payment" value="ONLINE_PAYMENT" checked={paymentMethod === 'ONLINE_PAYMENT'} onChange={() => setPaymentMethod('ONLINE_PAYMENT')} className="sr-only" />
                </label>
              </div>
            </div>

            {/* Telegram Connection */}
            <div className="rounded-3xl border border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-md shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] flex items-center justify-center text-[var(--primary)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z" />
                  </svg>
                </div>
                Order Updates via Telegram
              </h2>
              {telegramConnected ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[color-mix(in_srgb,var(--success)_10%,transparent)] border border-[color-mix(in_srgb,var(--success)_20%,transparent)]">
                  <div className="w-8 h-8 rounded-full bg-[var(--success)] flex items-center justify-center text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-black text-[var(--success)] text-sm">Telegram Connected</span>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-[color-mix(in_srgb,var(--border),transparent_60%)] bg-[var(--surface)]">
                  <div>
                    <p className="font-bold text-[var(--text-primary)]">Stay Updated</p>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
                      Get real-time order updates straight to your Telegram.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleConnectTelegram}
                    disabled={linkingTelegram}
                    className="flex-shrink-0 px-5 py-2.5 text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 shadow-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #0088cc 0%, #00aaff 100%)' }}
                  >
                    {linkingTelegram ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.89 8.23l-1.97 9.26c-.15.65-.53.81-1.07.51l-2.96-2.18-1.43 1.38c-.16.16-.29.29-.59.29l.21-3.02 5.5-4.97c.24-.22-.05-.34-.37-.12l-6.8 4.28-2.93-.91c-.64-.2-.65-.64.13-.95l11.45-4.41c.53-.19 1.01.12.83.84z"/>
                        </svg>
                        Connect Telegram
                      </>
                    )}
                  </button>
                  {telegramError && (
                    <p className="w-full text-xs font-bold text-[var(--error)] mt-2">{telegramError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Delivery Scheduling */}
            {deliveryEnabled && (
              <div className="rounded-3xl border border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-md shadow-sm p-6 sm:p-8">
                <h2 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] flex items-center justify-center text-[var(--primary)]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  Schedule Delivery
                </h2>
                <div className="space-y-5">
                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-[color-mix(in_srgb,var(--border),transparent_50%)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] transition-colors hover:bg-[color-mix(in_srgb,var(--primary)_5%,transparent)]">
                    <input
                      type="checkbox"
                      checked={wantSchedule}
                      onChange={e => {
                        const checked = e.target.checked;
                        setWantSchedule(checked);
                        if (!checked) {
                          setDeliveryDate('');
                          setSelectedSlotId('');
                        }
                      }}
                      className="w-5 h-5 rounded border-2 border-[color-mix(in_srgb,var(--border),transparent_50%)] text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span className="text-base font-bold text-[var(--text-primary)]">I want to schedule my delivery (optional)</span>
                  </label>

                  {wantSchedule ? (
                    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[color-mix(in_srgb,var(--border),transparent_50%)] space-y-5">
                      <div>
                        <label className="block text-sm font-black text-[var(--text-primary)] mb-2">Preferred Delivery Date</label>
                        <input
                          type="date"
                          value={deliveryDate}
                          onChange={e => setDeliveryDate(e.target.value)}
                          min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                          className="w-full px-4 py-3 text-sm font-bold bg-[var(--surface)] border-2 border-[color-mix(in_srgb,var(--border),transparent_50%)] rounded-xl focus:border-[var(--primary)] focus:outline-none transition-colors"
                        />
                      </div>
                      {deliveryDate && (
                        <div>
                          <label className="block text-sm font-black text-[var(--text-primary)] mb-2">Available Time Slots</label>
                          {loadingSlots ? (
                            <div className="flex items-center justify-center p-6 bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] rounded-xl border border-[color-mix(in_srgb,var(--border),transparent_50%)]">
                              <svg className="w-6 h-6 animate-spin text-[var(--primary)]" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            </div>
                          ) : slotError ? (
                            <p className="text-sm font-bold p-4 rounded-xl bg-[color-mix(in_srgb,var(--error)_10%,transparent)] text-[var(--error)]">{slotError}</p>
                          ) : availableSlots.length === 0 ? (
                            <p className="text-sm font-bold p-4 rounded-xl bg-[color-mix(in_srgb,var(--text-secondary)_10%,transparent)] text-[var(--text-secondary)] text-center">No available slots for this date.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {availableSlots.map(slot => {
                                const isSelected = selectedSlotId == slot.id;
                                const isFull = slot.remaining_capacity <= 0;
                                return (
                                  <label
                                    key={slot.id}
                                    className={`block p-4 rounded-xl cursor-pointer transition-all duration-200 ${isFull ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                    style={{
                                      border: isSelected
                                        ? '2px solid var(--primary)'
                                        : '1px solid color-mix(in srgb, var(--border), transparent 50%)',
                                      backgroundColor: isSelected
                                        ? 'color-mix(in srgb, var(--primary) 8%, transparent)'
                                        : 'var(--surface)',
                                      boxShadow: isSelected ? '0 4px 12px color-mix(in srgb, var(--primary) 15%, transparent)' : 'none',
                                    }}>
                                    <div className="flex items-start gap-3">
                                      <div className="w-5 h-5 rounded-full border-[2px] flex items-center justify-center flex-shrink-0 mt-0.5"
                                        style={{ borderColor: isSelected ? 'var(--primary)' : 'color-mix(in srgb, var(--border), transparent 40%)' }}>
                                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-[var(--text-primary)]">{slot.name}</p>
                                        <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">{slot.start_time} - {slot.end_time}</p>
                                        <div className="mt-2 inline-flex">
                                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md" 
                                            style={{ 
                                              backgroundColor: slot.remaining_capacity <= 3 ? 'color-mix(in srgb, var(--warning) 15%, transparent)' : 'color-mix(in srgb, var(--success) 15%, transparent)',
                                              color: slot.remaining_capacity <= 3 ? 'var(--warning)' : 'var(--success)'
                                            }}>
                                            {slot.remaining_capacity} left
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <input type="radio" name="delivery_slot" value={slot.id} checked={isSelected} onChange={() => setSelectedSlotId(slot.id)} disabled={isFull} className="sr-only" />
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--primary)_5%,transparent)] border border-dashed border-[color-mix(in_srgb,var(--primary)_20%,transparent)]">
                      <p className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Standard delivery will be used. Your order will be shipped as soon as possible without a specific delivery slot. Check the box above if you would prefer to schedule a specific delivery date and time.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Notes */}
            <div className="rounded-3xl border border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-md shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] flex items-center justify-center text-[var(--primary)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                Order Notes
              </h2>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Special instructions for your order (optional)"
                rows={3}
                className="w-full px-4 py-3 text-sm font-medium bg-[var(--surface)] border-2 border-[color-mix(in_srgb,var(--border),transparent_50%)] rounded-2xl focus:border-[var(--primary)] focus:outline-none transition-colors resize-none placeholder:text-[var(--text-secondary)]"
              />
            </div>
          </div>

          {/* ── Right: Order Summary ────────────────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="rounded-3xl border border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-md shadow-xl p-6 sm:p-8 lg:sticky lg:top-24">
              <h2 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] flex items-center justify-center text-[var(--primary)]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                Summary
              </h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    {item.product?.thumbnail && (
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-[color-mix(in_srgb,var(--border),transparent_50%)] bg-[var(--surface)]">
                        <img src={mediaUrl(item.product.thumbnail)} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[var(--text-primary)] truncate">{item.product?.name}</p>
                      <p className="text-xs font-medium text-[var(--text-secondary)] mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-black text-[var(--text-primary)] flex-shrink-0">{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[color-mix(in_srgb,var(--border),transparent_70%)] mb-6" />

              {/* Coupon */}
              <div className="mb-6">
                <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-secondary)] mb-3">Promo Code</label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[color-mix(in_srgb,var(--success)_10%,transparent)] border border-[color-mix(in_srgb,var(--success)_20%,transparent)]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--success)] flex items-center justify-center text-white">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="font-black text-[var(--success)] text-sm">{appliedCoupon.coupon.code}</span>
                      <span className="font-bold text-[var(--text-secondary)] text-xs ml-1">(-{formatPrice(appliedCoupon.discount_amount)})</span>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[color-mix(in_srgb,var(--error)_15%,transparent)] text-[var(--error)] transition-colors hover:bg-[color-mix(in_srgb,var(--error)_25%,transparent)] active:scale-95">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter code"
                        className="flex-1 px-4 py-3 text-sm font-bold bg-[var(--surface)] border-2 border-[color-mix(in_srgb,var(--border),transparent_50%)] rounded-xl focus:border-[var(--primary)] focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponInput.trim()}
                        className="px-5 py-3 text-sm font-bold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40 flex items-center justify-center text-white bg-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_80%,#000)]"
                      >
                        {validatingCoupon ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="mt-2 text-xs font-bold text-[var(--error)] flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal</span>
                  <span className="text-[var(--text-primary)] font-bold">{formatPrice(cart.subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[var(--success)] font-bold">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Shipping</span>
                  <span className={cart.subtotal >= 100 ? 'text-[var(--success)] font-bold' : 'text-[var(--text-primary)] font-bold'}>
                    {cart.subtotal >= 100 ? 'Free' : 'Calculated later'}
                  </span>
                </div>
              </div>

              <div className="my-6 border-t border-[color-mix(in_srgb,var(--border),transparent_70%)]" />

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-[var(--text-secondary)]">Total</span>
                <span className="text-3xl font-black text-[var(--primary)]">{formatPrice(total)}</span>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedAddressId}
                className="w-full py-4 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                  boxShadow: '0 8px 20px color-mix(in srgb, var(--primary) 30%, transparent)',
                }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center gap-2">
                  {submitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Confirm & Pay
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </span>
              </button>

              {/* Trust */}
              <div className="mt-6 pt-5 border-t border-[color-mix(in_srgb,var(--border),transparent_50%)] grid grid-cols-2 gap-3">
                {[
                  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', text: 'Secure Checkout' },
                  { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', text: 'Encrypted Payment' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-[color-mix(in_srgb,var(--text-secondary)_5%,transparent)] text-center">
                    <svg className="w-4 h-4 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-wider">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes checkoutFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: color-mix(in srgb, var(--border), transparent 30%);
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}
