import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mediaUrl } from '../utils/mediaUrl';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

export function ProfilePage() {
  const { user } = useAuth();
  const { storeName } = useSiteSettings();
  const { wishlist, removeItem, loading: wlLoading } = useWishlist();
  const { addItem } = useCart();
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    document.title = `My Account - ${storeName}`;
  }, [storeName]);

  const initials = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map(n => n.charAt(0).toUpperCase())
    .join('') || user?.email?.charAt(0).toUpperCase() || '?';

  const wlCount = wishlist?.items?.length || 0;

  const handleAddToCart = async (productId) => {
    setAddingId(productId);
    await addItem(productId, 1);
    setTimeout(() => setAddingId(null), 400);
  };

  const quickLinks = [
    {
      to: '/orders',
      label: 'My Orders',
      desc: 'View order history and track deliveries',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      color: 'var(--primary)',
    },
    {
      to: '/addresses',
      label: 'My Addresses',
      desc: 'Manage your shipping and billing addresses',
      icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
      color: 'var(--accent)',
    },
    {
      to: '/reviews',
      label: 'My Reviews',
      desc: 'See and manage your product reviews',
      icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      color: 'var(--warning)',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* ── Profile header ─────────────────────────────────────────────── */}
      <div className="theme-surface theme-rounded p-6 sm:p-8 mb-6 sm:mb-8"
        style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)',
              color: 'var(--primary)',
            }}>
            {initials}
          </div>
          <div className="text-center sm:text-left flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold theme-text-primary">
              {user?.first_name || user?.last_name
                ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                : 'My Account'}
            </h1>
            <p className="text-sm theme-text-secondary mt-1">{user?.email}</p>
            {user?.role && (
              <span className="inline-block mt-2 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                  color: 'var(--primary)',
                }}>
                {user.role}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick links ────────────────────────────────────────────────── */}
      <h2 className="text-lg font-bold theme-text-primary mb-4">Account Settings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {quickLinks.map((link, i) => (
          <Link key={i} to={link.to}
            className="group theme-surface theme-rounded p-5 flex items-center gap-4 no-underline transition-all duration-200 hover:scale-[1.01]"
            style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
              style={{
                backgroundColor: 'color-mix(in srgb, ' + link.color + ' 12%, transparent)',
                color: link.color,
              }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold theme-text-primary group-hover:theme-text-link transition-colors text-sm sm:text-base">
                {link.label}
              </p>
              <p className="text-xs theme-text-secondary mt-0.5">{link.desc}</p>
            </div>
            <svg className="w-4 h-4 theme-text-secondary group-hover:translate-x-0.5 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      {/* ── Wishlist section ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold theme-text-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ color: 'var(--error)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          My Wishlist
          {wlCount > 0 && (
            <span className="text-sm font-normal theme-text-secondary ml-1">({wlCount} {wlCount === 1 ? 'item' : 'items'})</span>
          )}
        </h2>
      </div>

      {wlLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="theme-rounded overflow-hidden animate-pulse"
              style={{ backgroundColor: 'color-mix(in srgb, var(--surface), transparent 20%)' }}>
              <div className="aspect-square" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
              <div className="p-3 space-y-2">
                <div className="h-3 rounded w-3/4" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
                <div className="h-4 rounded w-1/2" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : !wishlist?.items?.length ? (
        <div className="text-center py-14 sm:py-18 theme-surface theme-rounded"
          style={{ border: '1px dashed color-mix(in srgb, var(--border), transparent 30%)' }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'color-mix(in srgb, var(--error) 12%, transparent)' }}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ color: 'var(--error)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p className="text-base font-semibold theme-text-primary mb-1">Your wishlist is empty</p>
          <p className="text-sm theme-text-secondary mb-5">Save items you love and come back to them later.</p>
          <Link to="/shop" className="theme-btn-primary text-sm font-medium no-underline inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {wishlist.items.filter(i => i.product).map((item) => (
            <div key={item.id}
              className="group theme-surface theme-rounded overflow-hidden transition-all duration-200 hover:scale-[1.02]"
              style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
              <Link to={`/product/${item.product.slug}`} className="block overflow-hidden">
                <div className="aspect-square overflow-hidden"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--surface), var(--bg) 50%)' }}>
                  {item.product.thumbnail ? (
                    <img src={mediaUrl(item.product.thumbnail)} alt={item.product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center theme-text-secondary text-xs">No image</div>
                  )}
                </div>
              </Link>
              <div className="p-3 sm:p-3.5">
                <Link to={`/product/${item.product.slug}`}
                  className="font-semibold theme-text-primary hover:theme-text-link no-underline block truncate text-sm transition-colors">
                  {item.product.name}
                </Link>
                <p className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                  {formatPrice(item.product.discount_price || item.product.price)}
                </p>
                <div className="flex gap-2 mt-3">
                  {item.product.stock_quantity > 0 && (
                    <button
                      onClick={() => handleAddToCart(item.product.id)}
                      disabled={addingId === item.product.id}
                      className="flex-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-60"
                      style={{
                        backgroundColor: 'var(--button-bg)',
                        color: 'var(--button-text)',
                      }}>
                      {addingId === item.product.id ? (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                        </svg>
                      )}
                      Cart
                    </button>
                  )}
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 flex items-center gap-1"
                    style={{
                      color: 'var(--error)',
                      border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)',
                    }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
