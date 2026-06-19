import { useState } from 'react';
import { Link } from 'react-router-dom';

export function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;
  const hasDiscount = !!product.discount_price;

  return (
    <div
      className="group relative flex flex-col theme-surface rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 border border-[color-mix(in_srgb,var(--border),transparent_40%)]"
      style={{
        boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 20px 40px -10px color-mix(in srgb, var(--primary) 20%, rgba(0,0,0,0.2))';
        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--primary) 50%, transparent)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 4px 20px -5px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--border), transparent 40%)';
      }}
    >
      <Link to={`/product/${product.slug}`} className="block relative w-full pt-[100%] overflow-hidden bg-[color-mix(in_srgb,var(--surface),var(--bg)_50%)]">
        <div className="absolute inset-0">
          {product.thumbnail ? (
            <>
              {!imgLoaded && (
                <div className="absolute inset-0 z-0 bg-[color-mix(in_srgb,var(--border),transparent_60%)] animate-pulse overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent" />
                </div>
              )}
              <img
                src={product.thumbnail}
                alt={product.name}
                onLoad={() => setImgLoaded(true)}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                style={{ opacity: imgLoaded ? 1 : 0 }}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center theme-text-secondary text-xs uppercase tracking-widest font-bold">
              No Image
            </div>
          )}
        </div>
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest z-10"
            style={{
              background: 'linear-gradient(135deg, var(--error) 0%, #ff4b4b 100%)',
              color: '#fff',
              boxShadow: '0 4px 10px -2px var(--error)',
            }}>
            {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => { e.preventDefault(); onToggleWishlist?.(product.id); }}
            className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: isInWishlist ? '#ff4b4b' : '#fff',
              boxShadow: isInWishlist ? '0 0 15px rgba(255,75,75,0.4)' : '0 4px 10px rgba(0,0,0,0.1)',
            }}
            aria-label="Toggle wishlist"
          >
            <svg className="w-5 h-5 transition-transform" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={isInWishlist ? 1 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-grow relative z-20">
        <p className="text-[10px] uppercase tracking-[0.2em] font-black mb-2 opacity-70 truncate transition-colors group-hover:text-[var(--primary)]" style={{ color: 'var(--text-secondary)' }}>
          {product.category?.name || product.brand || 'Category'}
        </p>
        
        <Link to={`/product/${product.slug}`}
          className="font-bold text-base leading-tight mb-3 truncate-2-lines flex-grow transition-colors"
          style={{ color: 'var(--text-primary)' }}>
          {product.name}
        </Link>
        
        <div className="flex items-end justify-between mt-auto pt-4" style={{ borderTop: '1px dashed color-mix(in srgb, var(--border), transparent 60%)' }}>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black" style={{ color: hasDiscount ? 'var(--error)' : 'var(--text-primary)' }}>
                {formatPrice(product.discount_price || product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xs font-bold opacity-50 line-through" style={{ color: 'var(--text-secondary)' }}>
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            
            <span className="text-[10px] font-bold uppercase tracking-wider mt-1 block" style={{ color: product.stock_quantity > 0 ? 'var(--success)' : 'var(--error)' }}>
              {product.stock_quantity > 0 ? (
                <span className="flex items-center gap-1.5 opacity-80">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--success)' }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--success)' }}></span>
                  </span>
                  In Stock
                </span>
              ) : (
                <span className="flex items-center gap-1.5 opacity-80">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--error)' }}></span>
                  Out of Stock
                </span>
              )}
            </span>
          </div>
          
          {product.stock_quantity > 0 && (
            <button
              onClick={(e) => { e.preventDefault(); onAddToCart?.(product.id); }}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                color: '#fff',
                boxShadow: '0 4px 15px -3px color-mix(in srgb, var(--primary) 50%, transparent)',
              }}
              aria-label="Add to cart"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <style>{`
        .truncate-2-lines {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
}
