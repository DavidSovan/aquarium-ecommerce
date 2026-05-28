import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-9 rounded w-48 mb-8" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 mb-4 theme-rounded"
          style={{ backgroundColor: 'color-mix(in srgb, var(--surface), transparent 30%)' }}>
          <div className="w-24 h-24 rounded flex-shrink-0" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
          <div className="flex-1 space-y-3">
            <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
            <div className="h-3 rounded w-1/4" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
            <div className="h-8 rounded w-28" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CartPage() {
  const { cart, updateItem, removeItem, loading } = useCart();
  const { user } = useAuth();
  const { storeName } = useSiteSettings();
  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

  useEffect(() => {
    document.title = `Shopping Cart - ${storeName}`;
  }, [storeName]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold theme-text-primary">Shopping Cart</h1>
          {cart?.items?.length > 0 && (
            <p className="text-sm theme-text-secondary mt-1">{cart.total_items} {cart.total_items === 1 ? 'item' : 'items'}</p>
          )}
        </div>
        <Link to="/shop" className="text-sm theme-text-link no-underline flex items-center gap-1.5 font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Continue Shopping
        </Link>
      </div>

      {!cart?.items?.length ? (
        <div className="text-center py-20 sm:py-28">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 50%)' }}>
            <svg className="w-11 h-11 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold theme-text-primary mb-2">Your cart is empty</h2>
          <p className="text-sm theme-text-secondary mb-6 max-w-xs mx-auto">
            Looks like you haven't added anything yet. Explore our collection and find something you love.
          </p>
          <Link to="/shop" className="theme-btn-primary text-sm font-medium no-underline inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ── Cart items ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Free shipping threshold */}
            {cart.subtotal < 100 && (
              <div className="p-3 theme-rounded text-sm flex items-center gap-2.5"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                  color: 'var(--primary)',
                  border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
                }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Add <strong>{formatPrice(100 - cart.subtotal)}</strong> more for free shipping!</span>
              </div>
            )}

            {cart.items.map((item, idx) => (
              <div
                key={item.id}
                className="theme-surface theme-rounded p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5 transition-all duration-200"
                style={{
                  border: '1px solid color-mix(in srgb, var(--border), transparent 50%)',
                  animation: `cartFadeIn 0.3s ease ${idx * 0.05}s forwards`,
                  opacity: 0,
                }}
              >
                {item.product?.thumbnail && (
                  <Link to={`/product/${item.product?.slug}`} className="flex-shrink-0">
                    <div className="w-full sm:w-24 h-32 sm:h-24 theme-rounded overflow-hidden">
                      <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                  </Link>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-3">
                    <Link to={`/product/${item.product?.slug}`}
                      className="font-semibold theme-text-primary hover:theme-text-link no-underline truncate text-sm sm:text-base">
                      {item.product?.name}
                    </Link>
                    <span className="font-bold text-base sm:text-lg theme-text-primary flex-shrink-0">{formatPrice(item.total_price)}</span>
                  </div>
                  <p className="text-sm theme-text-secondary mt-0.5">{formatPrice(item.unit_price)} each</p>
                  {item.customizations && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {item.customizations.map((c, i) => {
                        const label = c.value_text
                          ? `Notes`
                          : Object.values(item.product?.options?.find(o => o.id === c.option_id)?.values?.filter(v => v.id === c.value_id) || []).map(v => v.value).join(', ');
                        return (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                              color: 'var(--primary)',
                            }}>
                            {c.value_text ? `Notes: ${c.value_text.substring(0, 30)}${c.value_text.length > 30 ? '...' : ''}` : label || `Option selected`}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3 sm:mt-4">
                    <div className="inline-flex items-center theme-rounded overflow-hidden"
                      style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 30%)' }}>
                      <button
                        onClick={() => updateItem(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1.5 transition-colors hover:opacity-70 theme-text-primary"
                        style={{ opacity: item.quantity <= 1 ? 0.4 : 1 }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="px-4 py-1.5 font-semibold text-sm theme-text-primary select-none min-w-[32px] text-center"
                        style={{ borderLeft: '1px solid color-mix(in srgb, var(--border), transparent 30%)', borderRight: '1px solid color-mix(in srgb, var(--border), transparent 30%)' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 transition-colors hover:opacity-70 theme-text-primary"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1.5 text-xs font-medium transition-all hover:scale-105 active:scale-95 px-2.5 py-1.5 rounded-lg"
                      style={{ color: 'var(--error)' }}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order summary sidebar ──────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="theme-surface theme-rounded p-5 sm:p-6 lg:sticky lg:top-24"
              style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
              <h2 className="text-lg font-bold theme-text-primary mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between theme-text-secondary">
                  <span>Subtotal ({cart.total_items} items)</span>
                  <span className="theme-text-primary font-medium">{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between theme-text-secondary">
                  <span>Shipping</span>
                  <span className="theme-success font-medium">{cart.subtotal >= 100 ? 'Free' : 'Calculated at next step'}</span>
                </div>
                <div className="flex justify-between theme-text-secondary">
                  <span>Tax</span>
                  <span className="theme-text-primary font-medium">Calculated at next step</span>
                </div>
              </div>

              <div className="my-4" style={{ borderTop: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }} />

              <div className="flex justify-between items-baseline mb-6">
                <span className="text-base font-bold theme-text-primary">Total</span>
                <span className="text-xl font-extrabold theme-text-primary">{formatPrice(cart.subtotal)}</span>
              </div>

              {user ? (
                <Link to="/checkout"
                  className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 no-underline transition-all duration-200 active:scale-[0.98]"
                  style={{
                    backgroundColor: 'var(--button-bg)',
                    color: 'var(--button-text)',
                    boxShadow: '0 4px 14px color-mix(in srgb, var(--button-bg) 40%, transparent)',
                  }}>
                  Proceed to Checkout
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <Link to="/login?redirect=/checkout"
                  className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 no-underline transition-all duration-200 active:scale-[0.98]"
                  style={{
                    backgroundColor: 'var(--button-bg)',
                    color: 'var(--button-text)',
                    boxShadow: '0 4px 14px color-mix(in srgb, var(--button-bg) 40%, transparent)',
                  }}>
                  Log in to Checkout
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </Link>
              )}

              {/* Trust badges */}
              <div className="mt-5 pt-4 flex flex-col gap-2.5"
                style={{ borderTop: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
                {[
                  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', text: 'Secure checkout' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs theme-text-secondary">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ color: 'var(--success)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes cartFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
