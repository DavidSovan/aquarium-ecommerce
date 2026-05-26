import { useState } from 'react';
import { Link } from 'react-router-dom';

export function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;
  const hasDiscount = !!product.discount_price;

  return (
    <div
      className="group theme-surface theme-rounded overflow-hidden transition-all duration-300"
      style={{
        boxShadow: '0 1px 3px color-mix(in srgb, var(--border), transparent 40%), 0 1px 2px color-mix(in srgb, var(--border), transparent 60%)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 30px color-mix(in srgb, var(--border), transparent 20%), 0 2px 8px color-mix(in srgb, var(--border), transparent 40%)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px color-mix(in srgb, var(--border), transparent 40%), 0 1px 2px color-mix(in srgb, var(--border), transparent 60%)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <Link to={`/product/${product.slug}`} className="block relative overflow-hidden">
        <div className="aspect-square overflow-hidden" style={{ backgroundColor: 'color-mix(in srgb, var(--surface), var(--bg) 50%)' }}>
          {product.thumbnail ? (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 animate-pulse" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
              )}
              <img
                src={product.thumbnail}
                alt={product.name}
                onLoad={() => setImgLoaded(true)}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                style={{ opacity: imgLoaded ? 1 : 0 }}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center theme-text-secondary text-xs">No image</div>
          )}
        </div>
        {hasDiscount && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: 'var(--error)',
              color: '#fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}>
            {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
          </div>
        )}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
        >
          <span className="px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm transition-transform duration-300 group-hover:scale-100"
            style={{
              backgroundColor: 'var(--surface)',
              color: 'var(--text-primary)',
              transform: 'scale(0.9)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            }}>
            Quick View
          </span>
        </div>
      </Link>
      <div className="p-3 sm:p-4">
        <p className="text-[11px] uppercase tracking-wider font-semibold theme-text-secondary mb-1 truncate">
          {product.category?.name || product.brand || ''}
        </p>
        <Link to={`/product/${product.slug}`}
          className="font-semibold theme-text-primary hover:theme-text-link block truncate no-underline transition-colors text-sm sm:text-base leading-snug">
          {product.name}
        </Link>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-base sm:text-lg font-bold" style={{ color: hasDiscount ? 'var(--error)' : 'var(--text-primary)' }}>
            {formatPrice(product.discount_price || product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs theme-text-secondary line-through">{formatPrice(product.price)}</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid color-mix(in srgb, var(--border), transparent 60%)' }}>
          <span className="text-[11px] font-medium" style={{ color: product.stock_quantity > 0 ? 'var(--success)' : 'var(--error)' }}>
            {product.stock_quantity > 0 ? (
              <span className="flex items-center gap-1">
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--success)', display: 'inline-block' }} />
                In Stock
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--error)', display: 'inline-block' }} />
                Out of Stock
              </span>
            )}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.preventDefault(); onToggleWishlist?.(product.id); }}
              className="p-1.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-90"
              style={{ color: isInWishlist ? 'var(--error)' : 'var(--text-secondary)' }}
              aria-label="Toggle wishlist"
            >
              <svg className="w-[18px] h-[18px]" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            {product.stock_quantity > 0 && (
              <button
                onClick={(e) => { e.preventDefault(); onAddToCart?.(product.id); }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1.5"
                style={{
                  backgroundColor: 'var(--button-bg)',
                  color: 'var(--button-text)',
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
