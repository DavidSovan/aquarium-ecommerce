import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { mediaUrl } from '../utils/mediaUrl';

function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      <div className="h-10 rounded-full w-64 mb-10 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-6 p-6 rounded-3xl border border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]">
              <div className="w-32 h-32 rounded-2xl flex-shrink-0 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
              <div className="flex-1 space-y-4 pt-2">
                <div className="h-6 rounded-full w-3/4 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
                <div className="h-4 rounded-full w-1/4 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
                <div className="h-10 rounded-xl w-32 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-1">
          <div className="h-96 rounded-3xl border border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)]" />
        </div>
      </div>
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] flex items-center justify-center text-[var(--primary)] shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">Your Cart</h1>
            {cart?.items?.length > 0 && (
              <p className="text-sm font-bold text-[var(--text-secondary)] mt-1">{cart.total_items} {cart.total_items === 1 ? 'item' : 'items'} waiting for you</p>
            )}
          </div>
        </div>
        <Link to="/shop" className="text-sm font-bold px-5 py-2.5 rounded-xl border-2 border-[color-mix(in_srgb,var(--primary)_30%,transparent)] text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] transition-all flex items-center gap-2 no-underline hover:scale-[1.02] active:scale-[0.98]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Continue Shopping
        </Link>
      </div>

      {!cart?.items?.length ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-[color-mix(in_srgb,var(--border),transparent_50%)] rounded-3xl bg-[color-mix(in_srgb,var(--surface)_30%,transparent)]">
          <div className="w-24 h-24 mb-6 rounded-full bg-[color-mix(in_srgb,var(--text-secondary)_10%,transparent)] flex items-center justify-center">
            <svg className="w-12 h-12 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-[var(--text-primary)] mb-3">Your cart is empty</h2>
          <p className="text-base text-[var(--text-secondary)] mb-8 max-w-md font-medium">
            Looks like you haven't added anything yet. Explore our collection and find something you'll love!
          </p>
          <Link to="/shop" className="px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2 shadow-lg" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* ── Cart items ─────────────────────────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Free shipping threshold */}
            {cart.subtotal < 100 && (
              <div className="p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-[fadeIn_0.5s_ease]"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                  color: 'var(--primary)',
                  border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)',
                }}>
                <div className="w-8 h-8 rounded-full bg-[color-mix(in_srgb,var(--primary)_20%,transparent)] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span>You're only <strong>{formatPrice(100 - cart.subtotal)}</strong> away from <span className="uppercase tracking-wide">Free Shipping!</span></span>
              </div>
            )}

            {cart.items.map((item, idx) => (
              <div
                key={item.id}
                className="relative p-4 sm:p-6 rounded-3xl border border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-md shadow-sm flex flex-col sm:flex-row gap-5 sm:gap-6 transition-all duration-300 hover:shadow-md hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
                style={{
                  animation: `cartFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.08}s forwards`,
                  opacity: 0,
                  transform: 'translateY(20px)',
                }}
              >
                {item.product?.thumbnail && (
                  <Link to={`/product/${item.product?.slug}`} className="flex-shrink-0 group">
                    <div className="w-full sm:w-32 h-40 sm:h-32 rounded-2xl overflow-hidden bg-[color-mix(in_srgb,var(--border),transparent_30%)] border border-[color-mix(in_srgb,var(--border),transparent_50%)]">
                      <img src={mediaUrl(item.product.thumbnail)} alt={item.product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  </Link>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-start gap-4 mb-1">
                    <Link to={`/product/${item.product?.slug}`}
                      className="font-black text-lg sm:text-xl text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors no-underline truncate pr-4">
                      {item.product?.name}
                    </Link>
                    <button onClick={() => removeItem(item.id)}
                      className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--error)] hover:bg-[color-mix(in_srgb,var(--error)_10%,transparent)] transition-all active:scale-90"
                      aria-label="Remove item">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm font-bold text-[var(--text-secondary)] mb-3">{formatPrice(item.unit_price)} each</p>
                  
                  {item.customizations && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.customizations.map((c, i) => {
                        const label = c.value_text
                          ? `Notes`
                          : Object.values(item.product?.options?.find(o => o.id === c.option_id)?.values?.filter(v => v.id === c.value_id) || []).map(v => v.value).join(', ');
                        return (
                          <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold"
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

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className="inline-flex items-center h-10 rounded-xl bg-[var(--surface)] border border-[color-mix(in_srgb,var(--border),transparent_70%)] overflow-hidden shadow-sm">
                      <button
                        onClick={() => updateItem(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-10 h-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)] transition-colors disabled:opacity-30"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                      </button>
                      <span className="w-12 text-center font-black text-sm text-[var(--text-primary)] select-none border-x border-[color-mix(in_srgb,var(--border),transparent_50%)]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItem(item.id, item.quantity + 1)}
                        className="w-10 h-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      </button>
                    </div>
                    <span className="font-black text-xl text-[var(--text-primary)]">{formatPrice(item.total_price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order summary sidebar ──────────────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="rounded-3xl border border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-md shadow-lg p-6 sm:p-8 lg:sticky lg:top-24">
              <h2 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] flex items-center justify-center text-[var(--primary)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Order Summary
              </h2>

              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal ({cart.total_items} items)</span>
                  <span className="text-[var(--text-primary)]">{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Shipping</span>
                  <span className={cart.subtotal >= 100 ? 'text-[var(--success)] font-bold' : 'text-[var(--text-primary)]'}>
                    {cart.subtotal >= 100 ? 'Free' : 'Calculated next step'}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Tax</span>
                  <span className="text-[var(--text-primary)]">Calculated next step</span>
                </div>
              </div>

              <div className="my-6 border-t border-[color-mix(in_srgb,var(--border),transparent_70%)]" />

              <div className="flex justify-between items-end mb-8">
                <span className="text-lg font-bold text-[var(--text-secondary)]">Total</span>
                <span className="text-3xl font-black text-[var(--primary)]">{formatPrice(cart.subtotal)}</span>
              </div>

              {user ? (
                <Link to="/checkout"
                  className="w-full py-4 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 no-underline transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                    boxShadow: '0 8px 20px color-mix(in srgb, var(--primary) 30%, transparent)',
                  }}>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative flex items-center gap-2">
                    Proceed to Checkout
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              ) : (
                <Link to="/login?redirect=/checkout"
                  className="w-full py-4 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 no-underline transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                    boxShadow: '0 8px 20px color-mix(in srgb, var(--primary) 30%, transparent)',
                  }}>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative flex items-center gap-2">
                    Log in to Checkout
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </span>
                </Link>
              )}

              {/* Trust badges */}
              <div className="mt-8 pt-6 border-t border-[color-mix(in_srgb,var(--border),transparent_50%)] grid grid-cols-2 gap-4">
                {[
                  { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', text: 'Secure Checkout' },
                  { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', text: 'Encrypted Payment' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[color-mix(in_srgb,var(--text-secondary)_5%,transparent)] text-center">
                    <svg className="w-5 h-5 text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes cartFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </div>
  );
}
