import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import bannerService from '../services/bannerService';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { mediaUrl } from '../utils/mediaUrl';

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { storeName } = useSiteSettings();
  const [products, setProducts] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    document.title = `Shop - ${storeName}`;
  }, [storeName]);
  const [categories, setCategories] = useState([]);
  const [treeCategories, setTreeCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [skip, setSkip] = useState(0);
  const limit = 12;
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    categoryService.getCategories().then(res => setCategories(res.data)).catch(() => {});
    categoryService.getCategoryTree().then(res => {
      setTreeCategories(res.data);
      if (res.data.length > 0) setActiveParent(res.data[0]);
    }).catch(() => {});
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
    const catId = searchParams.get('category');
    if (catId !== categoryId) {
      setCategoryId(catId || '');
    }
  }, [searchParams]);

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryId) newParams.set('category', categoryId);
    else newParams.delete('category');
    
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true });
    }
  }, [categoryId]);

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

  const getCategoryContext = () => {
    if (!categoryId) return { path: [], displayCategories: treeCategories };
    
    let path = [];
    let target = null;
    let siblings = treeCategories;
    
    const findNode = (nodes, currentPath) => {
      for (const node of nodes) {
        if (String(node.id) === categoryId) {
          path = [...currentPath, node];
          target = node;
          siblings = nodes;
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (findNode(node.children, [...currentPath, node])) {
            return true;
          }
        }
      }
      return false;
    };
    
    findNode(treeCategories, []);
    
    if (target && target.children && target.children.length > 0) {
      return { path, displayCategories: target.children, target };
    } else {
      return { path, displayCategories: siblings, target };
    }
  };

  const { path, displayCategories, target } = getCategoryContext();

  return (
    <div className="flex-1 w-full flex flex-col pb-16" style={{ backgroundColor: 'var(--bg)' }}>
      {/* ── Premium Hero banner ───────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={heroBanners.length === 0
          ? { background: 'linear-gradient(135deg, var(--header-bg) 0%, var(--primary) 40%, var(--accent) 100%)', minHeight: '50vh' }
          : { minHeight: '50vh' }
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
              transform: i === currentBannerIndex ? 'scale(1)' : 'scale(1.1)',
            }}
          />
        ))}
        {/* Dynamic Gradient Overlay */}
        <div className="absolute inset-0 z-10" style={{
          background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)'
        }} />

        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full mix-blend-screen opacity-30 z-10 animate-blob"
             style={{ background: 'var(--primary)', filter: 'blur(100px)' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full mix-blend-screen opacity-30 z-10 animate-blob animation-delay-2000"
             style={{ background: 'var(--accent)', filter: 'blur(100px)' }}></div>
             
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
          <div className="max-w-3xl glass-panel p-8 sm:p-12 rounded-3xl" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}>
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
              style={{
                backgroundColor: 'rgba(0,0,0,0.3)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)'
              }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
              {heroBanners.length > 0 ? heroBanners[currentBannerIndex]?.subtitle || 'Exclusive Collection' : 'Exclusive Collection'}
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 mb-6 drop-shadow-lg"
              style={{ lineHeight: 1.1 }}>
              {heroBanners[currentBannerIndex]?.title || 'Our Collection'}
            </h1>
            
            <p className="text-lg sm:text-xl max-w-2xl mx-auto font-medium" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              {heroBanners[currentBannerIndex]?.description || 'Discover a premium selection of aquatic life and high-end accessories curated for your perfect aquarium.'}
            </p>
            
            {heroBanners[currentBannerIndex]?.button_text && (
              <a href={heroBanners[currentBannerIndex].button_link || '#products'}
                className="group inline-flex items-center justify-center gap-3 mt-8 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                  color: '#fff',
                  boxShadow: '0 10px 25px -5px color-mix(in srgb, var(--primary) 50%, transparent), inset 0 2px 0 rgba(255,255,255,0.2)',
                }}>
                <span>{heroBanners[currentBannerIndex].button_text}</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            )}
          </div>
        </div>
        
        {heroBanners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3 p-2 rounded-full" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)' }}>
            {heroBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBannerIndex(i)}
                className="rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                style={{
                  width: i === currentBannerIndex ? 36 : 12,
                  height: 12,
                  backgroundColor: i === currentBannerIndex ? '#fff' : 'rgba(255,255,255,0.3)',
                  boxShadow: i === currentBannerIndex ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30" id="products">
        {/* ── Floating Filter bar ───────────────────────────────────────── */}
        <div className="theme-surface rounded-2xl p-6 sm:p-8 -mt-12 sm:-mt-16 mb-12 backdrop-blur-xl shadow-2xl transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] relative" 
             style={{ 
               border: '1px solid color-mix(in srgb, var(--border), transparent 50%)',
               background: 'color-mix(in srgb, var(--surface) 90%, transparent)' 
             }}>
          {/* Subtle gradient accent top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] opacity-70"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative group md:col-span-2">
              <label className="block text-xs font-bold theme-text-secondary tracking-widest uppercase mb-2 ml-1">Search Collection</label>
              <div className="relative flex items-center">
                <svg className="absolute left-4 w-5 h-5 theme-text-secondary group-focus-within:text-[var(--primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setSkip(0); }}
                  className="w-full pl-12 pr-4 py-3.5 bg-transparent border-2 border-[color-mix(in_srgb,var(--border),transparent_20%)] rounded-xl text-sm font-medium focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--primary)_15%,transparent)] transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="relative group md:col-span-1">
              <label className="block text-xs font-bold theme-text-secondary tracking-widest uppercase mb-2 ml-1">Sort By</label>
              <div className="relative">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={e => { const [b, o] = e.target.value.split('-'); setSortBy(b); setSortOrder(o); setSkip(0); }}
                  className="w-full pl-4 pr-10 py-3.5 bg-transparent border-2 border-[color-mix(in_srgb,var(--border),transparent_20%)] rounded-xl text-sm font-medium focus:outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--primary)_15%,transparent)] transition-all cursor-pointer appearance-none shadow-sm"
                >
                  <option value="created_at-desc">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none theme-text-secondary group-focus-within:text-[var(--primary)] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                </div>
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-[color-mix(in_srgb,var(--border),transparent_50%)] animate-[shopFadeIn_0.3s_ease_forwards]">
              <span className="text-xs theme-text-secondary font-bold uppercase tracking-wider">Active filters:</span>
              {search && (
                <span className="group inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer border border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    color: 'var(--primary)',
                  }}
                  onClick={() => { setSearch(''); setSkip(0); }}>
                  Search: "{search}"
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              )}
              {categoryId && (
                <span className="group inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer border border-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    color: 'var(--primary)',
                  }}
                  onClick={() => { setCategoryId(''); setSkip(0); }}>
                  {target ? target.name : `Category #${categoryId}`}
                  <svg className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs font-bold uppercase tracking-wider underline ml-2 transition-all hover:text-[var(--primary)] theme-text-secondary">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── Category Navigation Grid ─────────────────────────────────── */}
        <div className="mb-12 animate-[shopFadeIn_0.3s_ease_forwards]">
          {/* Breadcrumb */}
          {path.length > 0 && (
             <div className="flex flex-wrap items-center gap-2 mb-6 text-sm font-bold theme-text-secondary">
               <button onClick={() => { setCategoryId(''); setSkip(0); }} className="hover:text-[var(--primary)] transition-colors">All Categories</button>
               {path.map((node, i) => (
                 <span key={node.id} className="flex items-center gap-2">
                   <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                   <button 
                     onClick={() => { setCategoryId(String(node.id)); setSkip(0); }}
                     className={`transition-colors ${i === path.length - 1 ? 'text-[var(--primary)]' : 'hover:text-[var(--primary)]'}`}
                   >
                     {node.name}
                   </button>
                 </span>
               ))}
             </div>
          )}

          {displayCategories.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {displayCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setCategoryId(String(cat.id)); setSkip(0); }}
                  className={`group relative flex flex-col items-center p-4 sm:p-6 rounded-3xl transition-all duration-300 backdrop-blur-xl ${String(cat.id) === categoryId ? 'bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] border-2 border-[var(--primary)] shadow-[0_10px_30px_-10px_color-mix(in_srgb,var(--primary)_50%,transparent)] -translate-y-1' : 'bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] border border-[color-mix(in_srgb,var(--border),transparent_50%)] shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--primary)_30%,transparent)]'}`}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden relative bg-[color-mix(in_srgb,var(--border),transparent_80%)]">
                    {cat.image ? (
                       <img src={mediaUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    ) : (
                       <svg className="w-8 h-8 theme-text-secondary opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    )}
                  </div>
                  <h3 className={`text-sm sm:text-base font-bold text-center leading-tight transition-colors ${String(cat.id) === categoryId ? 'text-[var(--primary)]' : 'theme-text-primary group-hover:text-[var(--primary)]'}`}>{cat.name}</h3>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Results summary ─────────────────────────────────────────── */}
        {!loading && products.length > 0 && (
          <div className="flex items-center justify-between mb-8 animate-[shopFadeIn_0.4s_ease_forwards]">
            <p className="text-sm font-medium theme-text-secondary bg-[color-mix(in_srgb,var(--surface),transparent_50%)] px-4 py-2 rounded-lg border border-[color-mix(in_srgb,var(--border),transparent_50%)] shadow-sm">
              Showing <span className="font-bold text-[var(--primary)]">{skip + 1}</span>
              {' '}-{' '}
              <span className="font-bold text-[var(--primary)]">{Math.min(skip + limit, total)}</span>
              {' '}of{' '}
              <span className="font-bold text-[var(--primary)]">{total}</span> premium products
            </p>
          </div>
        )}

        {/* ── Product grid / Loading / Empty ───────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="theme-surface rounded-2xl overflow-hidden shadow-sm border border-[color-mix(in_srgb,var(--border),transparent_50%)] animate-pulse">
                <div className="aspect-[4/5] bg-[color-mix(in_srgb,var(--border),transparent_70%)] relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.1)] to-transparent"></div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="h-3 rounded-full bg-[color-mix(in_srgb,var(--border),transparent_60%)] w-1/3" />
                  <div className="h-4 rounded-full bg-[color-mix(in_srgb,var(--border),transparent_60%)] w-3/4" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-5 rounded-full bg-[color-mix(in_srgb,var(--border),transparent_60%)] w-1/4" />
                    <div className="h-10 rounded-xl bg-[color-mix(in_srgb,var(--border),transparent_60%)] w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 px-4 theme-surface rounded-3xl border border-[color-mix(in_srgb,var(--border),transparent_50%)] shadow-sm">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center rotate-12 shadow-lg"
              style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 50%, var(--border)), var(--surface))' }}>
              <svg className="w-10 h-10 theme-text-secondary -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black theme-text-primary mb-3">No aquatic treasures found</h3>
            <p className="text-base theme-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
              We couldn't find any products matching your sophisticated criteria. Try adjusting your search or discovering new categories.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-white transition-all hover:-translate-y-1 shadow-[0_10px_20px_-10px_var(--primary)]"
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="opacity-0 animate-[shopFadeIn_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]"
                  style={{ animationDelay: `${i * 100}ms` }}
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-16 pt-8 border-t border-[color-mix(in_srgb,var(--border),transparent_50%)]">
                <button
                  onClick={() => setSkip(Math.max(0, skip - limit))}
                  disabled={currentPage <= 1}
                  className="group inline-flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed theme-surface border-2 border-[color-mix(in_srgb,var(--border),transparent_20%)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-[0_10px_20px_-10px_color-mix(in_srgb,var(--primary)_50%,transparent)]"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2 bg-[color-mix(in_srgb,var(--surface),transparent_50%)] p-2 rounded-2xl border border-[color-mix(in_srgb,var(--border),transparent_50%)] shadow-sm">
                  {getPageNumbers().map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-3 py-2 text-sm font-bold theme-text-secondary select-none">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setSkip((p - 1) * limit)}
                        className={`min-w-[44px] h-[44px] flex items-center justify-center text-sm font-bold rounded-xl transition-all ${
                          currentPage === p 
                            ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white shadow-[0_8px_16px_-6px_var(--primary)] scale-105' 
                            : 'hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] hover:text-[var(--primary)] theme-text-secondary'
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
                  className="group inline-flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed theme-surface border-2 border-[color-mix(in_srgb,var(--border),transparent_20%)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-[0_10px_20px_-10px_color-mix(in_srgb,var(--primary)_50%,transparent)]"
                >
                  <span>Next Page</span>
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes shopFadeIn {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
