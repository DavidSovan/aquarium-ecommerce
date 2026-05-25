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
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero banner slideshow ──────────────────────────────────────────── */}
      <div
        className={`relative text-white overflow-hidden ${heroBanners.length === 0 ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800' : ''}`}
      >
        {heroBanners.map((banner, i) => (
          <div
            key={banner.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              backgroundImage: `url(${banner.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === currentBannerIndex ? 1 : 0,
              zIndex: i === currentBannerIndex ? 1 : 0,
            }}
          />
        ))}
        {heroBanners.length > 0 && <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 z-10" />}
        <div className="relative z-20 max-w-6xl mx-auto px-4 py-12 sm:py-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            {heroBanners[currentBannerIndex]?.title || 'Shop'}
          </h1>
          <p className="mt-3 text-lg sm:text-xl text-blue-100 max-w-xl">
            {heroBanners[currentBannerIndex]?.subtitle || 'Explore our curated collection of aquatic life, supplies, and accessories.'}
          </p>
        </div>
        {heroBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {heroBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBannerIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentBannerIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6">
        {/* ── Filter card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setSkip(0); }}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                />
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={e => { setCategoryId(e.target.value); setSkip(0); }}
                className="w-full sm:w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Sort By</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={e => { const [b, o] = e.target.value.split('-'); setSortBy(b); setSortOrder(o); setSkip(0); }}
                className="w-full sm:w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow"
              >
                <option value="created_at-desc">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
              </select>
            </div>
          </div>

          {/* ── Active filter badges ───────────────────────────────────── */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 font-medium">Active filters:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  Search: "{search}"
                  <button onClick={() => { setSearch(''); setSkip(0); }} className="hover:text-blue-900">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {categoryId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  {selectedCategoryName || `Category #${categoryId}`}
                  <button onClick={() => { setCategoryId(''); setSkip(0); }} className="hover:text-blue-900">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 underline ml-1">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── Results summary ─────────────────────────────────────────── */}
        {!loading && products.length > 0 && (
          <div className="flex items-center justify-between mt-6 mb-4">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{skip + 1}</span>
              {' '}-{' '}
              <span className="font-medium text-gray-900">{Math.min(skip + limit, total)}</span>
              {' '}of{' '}
              <span className="font-medium text-gray-900">{total}</span> products
            </p>
          </div>
        )}

        {/* ── Product grid / Loading / Empty ───────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                  <div className="flex justify-between items-center pt-1">
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-8 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              Try adjusting your search or filter criteria to find what you're looking for.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-2">
              {products.map((product, i) => (
                <div key={product.id} className="animate-[fadeIn_0.3s_ease_both]" style={{ animationDelay: `${(i % 4) * 60}ms` }}>
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
              <div className="flex items-center justify-center gap-1.5 mt-10 pb-8">
                <button
                  onClick={() => setSkip(Math.max(0, skip - limit))}
                  disabled={currentPage <= 1}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 py-2 text-sm text-gray-400">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setSkip((p - 1) * limit)}
                        className={`min-w-[36px] px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === p
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => setSkip(skip + limit)}
                  disabled={currentPage >= totalPages}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
