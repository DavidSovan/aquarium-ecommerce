import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mediaUrl } from '../utils/mediaUrl';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

function LoadingSkeleton() {
  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 animate-pulse flex flex-col">
      <div className="h-9 rounded w-48 mb-8" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="theme-surface theme-rounded overflow-hidden">
            <div className="aspect-square" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
            <div className="p-4 space-y-3">
              <div className="h-4 rounded" style={{ width: '75%', backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
              <div className="h-5 rounded" style={{ width: '40%', backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
              <div className="h-8 rounded" style={{ width: '60%', backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WishlistPage() {
  const { storeName } = useSiteSettings();
  const { wishlist, removeItem, loading } = useWishlist();
  const { addItem } = useCart();
  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

  useEffect(() => {
    document.title = `Wishlist - ${storeName}`;
  }, [storeName]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 flex flex-col">
      <h1 className="text-2xl sm:text-3xl font-extrabold theme-text-primary mb-8">My Wishlist</h1>

      {!wishlist?.items?.length ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 sm:py-20">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 50%)' }}>
            <svg className="w-9 h-9 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold theme-text-primary mb-2">Your wishlist is empty</h2>
          <p className="text-sm theme-text-secondary mb-6 max-w-xs mx-auto">
            Save items you love and come back to them later.
          </p>
          <Link to="/shop" className="theme-btn-primary text-sm font-medium no-underline inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wishlist.items.map(item => item.product && (
            <div key={item.id} className="theme-surface theme-rounded overflow-hidden"
              style={{
                border: '1px solid color-mix(in srgb, var(--border), transparent 50%)',
                boxShadow: '0 1px 3px color-mix(in srgb, var(--border), transparent 40%)',
              }}>
              <Link to={`/product/${item.product.slug}`}>
                <div className="aspect-square overflow-hidden"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }}>
                  {item.product.thumbnail ? (
                    <img src={mediaUrl(item.product.thumbnail)} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center theme-text-secondary text-sm">No image</div>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/product/${item.product.slug}`} className="font-semibold theme-text-primary hover:theme-text-link no-underline block truncate text-sm sm:text-base">
                  {item.product.name}
                </Link>
                <p className="text-base font-bold mt-1" style={{ color: 'var(--primary)' }}>
                  {formatPrice(item.product.discount_price || item.product.price)}
                </p>
                <div className="flex gap-2 mt-3">
                  {item.product.stock_quantity > 0 && (
                    <button
                      onClick={() => addItem(item.product.id, 1)}
                      className="flex-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                      style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)' }}
                    >Add to Cart</button>
                  )}
                  {item.product.stock_quantity <= 0 && (
                    <span className="flex-1 px-3 py-1.5 rounded-lg text-sm font-medium text-center"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)', color: 'var(--text-secondary)' }}>
                      Out of Stock
                    </span>
                  )}
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 active:scale-95"
                    style={{ color: 'var(--error)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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
