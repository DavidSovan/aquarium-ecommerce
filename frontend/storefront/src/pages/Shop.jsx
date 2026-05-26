import { useEffect, useState } from 'react';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import bannerService from '../services/bannerService';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export function Shop() {
  const { storeName } = useSiteSettings();
  const [products, setProducts] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    document.title = `Shop - ${storeName}`;
  }, [storeName]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [skip, setSkip] = useState(0);
  const limit = 12;
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    categoryService.getCategories().then(res => setCategories(res.data)).catch(() => {});
    bannerService.getActiveBanners().then(res => {
      const filtered = res.data.filter(b => b.position === 'hero');
      if (filtered.length > 0) setHeroBanners(filtered);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (heroBanners.length < 2) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % heroBanners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  useEffect(() => {
    loadProducts();
  }, [skip, categoryId, search, sortBy, sortOrder]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { skip, limit, sort_by: sortBy, sort_order: sortOrder };
      if (categoryId) params.category_id = categoryId;
      if (search) params.search = search;
      const res = await productService.getProducts(params);
      setProducts(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;

  const clearFilters = () => {
    setSearch('');
    setCategoryId('');
    setSortBy('created_at');
    setSortOrder('desc');
    setSkip(0);
  };

  const hasActiveFilters = search || categoryId;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const selectedCategoryName = categories.find(c => c.id === Number(categoryId))?.name;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* ── Hero banner ───────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={heroBanners.length === 0
          ? { background: 'linear-gradient(135deg, var(--header-bg) 0%, var(--primary) 40%, var(--accent) 100%)' }
          : { minHeight: '42vh' }
        }
      >
        {heroBanners.map((banner, i) => (
          <div
            key={banner.id}
            className="absolute inset-0 transition-all duration-1000 ease-out"
            style={{
              backgroundImage: `url(${banner.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === currentBannerIndex ? 1 : 0,
              zIndex: i === currentBannerIndex ? 1 : 0,
              transform: i === currentBannerIndex ? 'scale(1)' : 'scale(1.05)',
            }}
          />
        ))}
        {heroBanners.length > 0 && (
          <div className="absolute inset-0 z-10" style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.10) 100%)'
          }} />
        )}
        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-4"
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
              {heroBanners.length > 0 ? heroBanners[currentBannerIndex]?.subtitle || 'Premium Collection' : 'Premium Collection'}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight"
              style={{ textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
              {heroBanners[currentBannerIndex]?.title || 'Shop'}
            </h1>
            <p className="mt-4 text-lg sm:text-xl max-w-xl" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {heroBanners[currentBannerIndex]?.description || 'Explore our curated collection of aquatic life, supplies, and accessories.'}
            </p>
          </div>
          {heroBanners[currentBannerIndex]?.button_text && (
            <a href={heroBanners[currentBannerIndex].button_link || '#products'}
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
              style={{
                backgroundColor: 'var(--button-bg)',
                color: 'var(--button-text)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              }}>
              {heroBanners[currentBannerIndex].button_text}
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/>
              </svg>
            </a>
          )}
        </div>
        {heroBanners.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
            {heroBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBannerIndex(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentBannerIndex ? 28 : 8,
                  height: 8,
                  backgroundColor: i === currentBannerIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                }}
              />
            ))}
          </div>
        )}
        {heroBanners.length === 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-bounce">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
              <path d="M10 3v14M5 12l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-30" id="products">
        {/* ── Filter bar ───────────────────────────────────────────────── */}
        <div className="theme-surface theme-shadow theme-rounded p-4 sm:p-5" style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold theme-text-secondary tracking-wider mb-1.5">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setSkip(0); }}
                  className="w-full pl-9 pr-3 py-2.5 theme-border theme-rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow"
                />
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-xs font-semibold theme-text-secondary tracking-wider mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={e => { setCategoryId(e.target.value); setSkip(0); }}
                className="w-full sm:w-44 px-3 py-2.5 theme-border theme-rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] theme-surface cursor-pointer"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-xs font-semibold theme-text-secondary tracking-wider mb-1.5">Sort</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={e => { const [b, o] = e.target.value.split('-'); setSortBy(b); setSortOrder(o); setSkip(0); }}
                className="w-full sm:w-44 px-3 py-2.5 theme-border theme-rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] theme-surface cursor-pointer"
              >
                <option value="created_at-desc">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4" style={{ borderTop: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
              <span className="text-xs theme-text-secondary font-medium">Active filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-colors"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                    color: 'var(--primary)',
                  }}>
                  Search: "{search}"
                  <button onClick={() => { setSearch(''); setSkip(0); }} className="hover:opacity-70 transition-opacity">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {categoryId && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-colors"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                    color: 'var(--primary)',
                  }}>
                  {selectedCategoryName || `Category #${categoryId}`}
                  <button onClick={() => { setCategoryId(''); setSkip(0); }} className="hover:opacity-70 transition-opacity">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs underline ml-1 transition-opacity hover:opacity-70"
                style={{ color: 'var(--text-secondary)' }}>
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── Results summary ─────────────────────────────────────────── */}
        {!loading && products.length > 0 && (
          <div className="flex items-center justify-between mt-6 mb-5">
            <p className="text-sm theme-text-secondary">
              Showing <span className="font-semibold theme-text-primary">{skip + 1}</span>
              {' '}-{' '}
              <span className="font-semibold theme-text-primary">{Math.min(skip + limit, total)}</span>
              {' '}of{' '}
              <span className="font-semibold theme-text-primary">{total}</span> products
            </p>
          </div>
        )}

        {/* ── Product grid / Loading / Empty ───────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="theme-surface theme-rounded overflow-hidden animate-pulse">
                <div className="aspect-square" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
                <div className="p-3 sm:p-4 space-y-2.5">
                  <div className="h-2.5 rounded" style={{ width: '40%', backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
                  <div className="h-3.5 rounded" style={{ width: '75%', backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
                  <div className="h-4 rounded" style={{ width: '50%', backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
                  <div className="flex justify-between items-center pt-1">
                    <div className="h-2.5 rounded" style={{ width: '30%', backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
                    <div className="h-7 rounded" style={{ width: '35%', backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 sm:py-28">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 50%)' }}>
              <svg className="w-9 h-9 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold theme-text-primary">No products found</h3>
            <p className="mt-2 text-sm theme-text-secondary max-w-xs mx-auto">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 theme-btn-primary text-sm font-medium no-underline inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 mt-2">
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="opacity-0 animate-[shopFadeIn_0.4s_ease_forwards]"
                  style={{ animationDelay: `${(i % 4) * 80}ms` }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={(id) => addItem(id, 1)}
                    onToggleWishlist={(id) => isInWishlist(id) ? removeWishlist(id) : addWishlist(id)}
                    isInWishlist={isInWishlist(product.id)}
                  />
                </div>
              ))}
            </div>

            {/* ── Pagination ────────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 pb-10">
                <button
                  onClick={() => setSkip(Math.max(0, skip - limit))}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium theme-rounded transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--surface), var(--bg) 50%)',
                    border: '1px solid color-mix(in srgb, var(--border), transparent 30%)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-2 text-sm theme-text-secondary select-none">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setSkip((p - 1) * limit)}
                        className="min-w-[38px] h-[38px] px-2 text-sm font-medium theme-rounded transition-all active:scale-90"
                        style={currentPage === p ? {
                          backgroundColor: 'var(--primary)',
                          color: '#fff',
                          boxShadow: '0 2px 8px color-mix(in srgb, var(--primary) 40%, transparent)',
                        } : {
                          backgroundColor: 'color-mix(in srgb, var(--surface), var(--bg) 50%)',
                          color: 'var(--text-secondary)',
                          border: '1px solid color-mix(in srgb, var(--border), transparent 30%)',
                        }}
                        onMouseEnter={e => {
                          if (currentPage !== p) e.currentTarget.style.borderColor = 'var(--primary)';
                        }}
                        onMouseLeave={e => {
                          if (currentPage !== p) e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--border), transparent 30%)';
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => setSkip(skip + limit)}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium theme-rounded transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--surface), var(--bg) 50%)',
                    border: '1px solid color-mix(in srgb, var(--border), transparent 30%)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span className="hidden sm:inline">Next</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes shopFadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
