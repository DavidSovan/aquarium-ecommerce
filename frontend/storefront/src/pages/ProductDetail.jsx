import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../services/productService';
import reviewService from '../services/reviewService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { StarRating } from '../components/StarRating';
import { ReviewList } from '../components/ReviewList';
import { ReviewForm } from '../components/ReviewForm';
import { mediaUrl } from '../utils/mediaUrl';

function CustomizationPanel({ options, onCustomizationsChange, basePrice }) {
  const [selections, setSelections] = useState({});
  const [errors, setErrors] = useState({});
  const [animating, setAnimating] = useState(null);

  const handleSelectChange = (option, valueId) => {
    const newSelections = { ...selections };
    if (valueId === '' || Number.isNaN(Number(valueId))) {
      delete newSelections[option.id];
    } else {
      newSelections[option.id] = { option_id: option.id, value_id: Number(valueId) };
      setAnimating(option.id);
      setTimeout(() => setAnimating(null), 400);
    }
    setSelections(newSelections);
    setErrors({ ...errors, [option.id]: '' });
    onCustomizationsChange(Object.values(newSelections));
  };

  const handleTextChange = (option, value) => {
    const newSelections = { ...selections, [option.id]: { option_id: option.id, value_text: value } };
    setSelections(newSelections);
    if (value.trim()) setErrors({ ...errors, [option.id]: '' });
    onCustomizationsChange(Object.values(newSelections));
  };

  const totalModifier = useMemo(() => {
    let total = 0;
    Object.values(selections).forEach(sel => {
      if (sel.value_id) {
        for (const opt of options) {
          const val = opt.values?.find(v => v.id === sel.value_id);
          if (val) total += val.price_modifier;
        }
      }
    });
    return total;
  }, [selections, options]);

  const finalPrice = basePrice + totalModifier;

  const selectedImage = useMemo(() => {
    for (const sel of Object.values(selections)) {
      if (sel.value_id) {
        for (const opt of options) {
          const val = opt.values?.find(v => v.id === sel.value_id);
          if (val?.image_url) return mediaUrl(val.image_url);
        }
      }
    }
    return null;
  }, [selections, options]);

  const totalSelected = Object.keys(selections).length;
  const requiredCount = options.filter(o => o.is_required).length;
  const requiredFilled = options.filter(o => o.is_required && selections[o.id]?.value_id).length;

  return (
    <div className="mb-8 rounded-2xl overflow-hidden border border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-md shadow-sm">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-[color-mix(in_srgb,var(--border),transparent_80%)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] flex items-center justify-center text-[var(--primary)]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            Customize
          </h3>
          <span className="text-sm font-medium text-[var(--text-secondary)] px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--text-secondary)_10%,transparent)]">
            {totalSelected}/{options.length} Selected
          </span>
        </div>
      </div>

      {/* Preview image */}
      {selectedImage && (
        <div className="px-6 pt-6">
          <div className="relative rounded-xl overflow-hidden bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)] border border-[color-mix(in_srgb,var(--border),transparent_80%)] group">
            <img src={selectedImage} alt="Preview" className="w-full h-48 object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-[var(--text-primary)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] backdrop-blur-md border border-[color-mix(in_srgb,var(--border),transparent_70%)] shadow-sm">
              Live Preview
            </div>
          </div>
        </div>
      )}

      {/* Options */}
      <div className="px-6 py-6 space-y-6">
        {options.map(opt => (
          <div key={opt.id} className={`transition-all duration-300 ${animating === opt.id ? 'scale-[1.02]' : ''}`}>
            <label className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-3">
              {opt.name}
              {opt.is_required && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-black text-white bg-[var(--error)] px-2 py-0.5 rounded-full shadow-sm">
                  Required
                </span>
              )}
              {selections[opt.id]?.value_id && !errors[opt.id] && (
                <svg className="w-4 h-4 ml-auto text-[var(--success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </label>

            {/* Dropdown select */}
            {(opt.type === 'dropdown' || (opt.type === 'color' && !opt.values?.some(v => v.value.startsWith('#')))) && (
              <select
                value={selections[opt.id]?.value_id || ''}
                onChange={e => handleSelectChange(opt, e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-primary)] bg-[var(--surface)] transition-all outline-none appearance-none"
                style={{
                  border: `2px solid ${errors[opt.id] ? 'var(--error)' : 'color-mix(in srgb, var(--border), transparent 60%)'}`,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 1rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.2em 1.2em',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = errors[opt.id] ? 'var(--error)' : 'color-mix(in srgb, var(--border), transparent 60%)'}
              >
                <option value="">— Select an option —</option>
                {opt.values?.map(val => (
                  <option key={val.id} value={val.id}>
                    {val.value}{val.price_modifier !== 0 ? ` (${val.price_modifier > 0 ? '+' : ''}$${Math.abs(val.price_modifier).toFixed(2)})` : ''}
                  </option>
                ))}
              </select>
            )}

            {/* Color swatches */}
            {opt.type === 'color' && (
              <div className="flex flex-wrap gap-3">
                {opt.values?.map(val => {
                  const selected = selections[opt.id]?.value_id === val.id;
                  return (
                    <button
                      key={val.id}
                      onClick={() => handleSelectChange(opt, val.id)}
                      className={`relative w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 ${selected ? 'scale-110 shadow-lg' : 'shadow-sm'}`}
                      title={`${val.value}${val.price_modifier !== 0 ? ` (${val.price_modifier > 0 ? '+' : ''}$${Math.abs(val.price_modifier).toFixed(2)})` : ''}`}
                    >
                      <span
                        className="block w-full h-full rounded-full border-2 transition-colors duration-300"
                        style={{
                          backgroundColor: val.value,
                          borderColor: selected ? 'var(--primary)' : 'rgba(0,0,0,0.1)',
                          boxShadow: selected ? `0 0 0 4px color-mix(in srgb, var(--primary) 30%, transparent)` : 'none',
                        }}
                      />
                      {selected && (
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Text input */}
            {opt.type === 'text' && (
              <textarea
                value={selections[opt.id]?.value_text || ''}
                onChange={e => handleTextChange(opt, e.target.value)}
                placeholder={`Enter your ${opt.name.toLowerCase()}`}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-primary)] bg-[var(--surface)] transition-all outline-none"
                style={{
                  border: `2px solid ${errors[opt.id] ? 'var(--error)' : 'color-mix(in srgb, var(--border), transparent 60%)'}`,
                  resize: 'vertical',
                  minHeight: 80,
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = errors[opt.id] ? 'var(--error)' : 'color-mix(in srgb, var(--border), transparent 60%)'}
              />
            )}

            {/* Dimensions */}
            {opt.type === 'dimensions' && (
              <select
                value={selections[opt.id]?.value_id || ''}
                onChange={e => handleSelectChange(opt, e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-primary)] bg-[var(--surface)] transition-all outline-none appearance-none"
                style={{
                  border: `2px solid ${errors[opt.id] ? 'var(--error)' : 'color-mix(in srgb, var(--border), transparent 60%)'}`,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 1rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.2em 1.2em',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = errors[opt.id] ? 'var(--error)' : 'color-mix(in srgb, var(--border), transparent 60%)'}
              >
                <option value="">— Select an option —</option>
                {opt.values?.map(val => (
                  <option key={val.id} value={val.id}>
                    {val.value}{val.price_modifier !== 0 ? ` (${val.price_modifier > 0 ? '+' : ''}$${Math.abs(val.price_modifier).toFixed(2)})` : ''}
                  </option>
                ))}
              </select>
            )}

            {errors[opt.id] && (
              <p className="flex items-center gap-1.5 text-xs font-bold mt-2 text-[var(--error)] animate-[fadeIn_0.3s_ease]">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                {errors[opt.id]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Price summary */}
      <div className="px-6 py-5 border-t border-[color-mix(in_srgb,var(--border),transparent_80%)] bg-[color-mix(in_srgb,var(--primary)_5%,transparent)]">
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-[var(--text-secondary)]">Base Price</span>
            <span className="text-[var(--text-primary)]">${basePrice.toFixed(2)}</span>
          </div>
          {totalModifier !== 0 && (
            <div className="flex justify-between text-sm font-bold">
              <span className="text-[var(--text-secondary)]">Customizations</span>
              <span className={totalModifier > 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}>
                {totalModifier > 0 ? '+' : ''}${totalModifier.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center pt-4 border-t border-[color-mix(in_srgb,var(--border),transparent_80%)]">
          <span className="font-bold text-[var(--text-primary)]">Total Price</span>
          <span className="text-2xl font-black text-[var(--primary)] transition-all duration-300">
            ${finalPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse" style={{ minHeight: '85vh' }}>
      <div className="h-5 rounded-full w-48 mb-10 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <div className="aspect-square rounded-3xl bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
        <div className="space-y-6 pt-4">
          <div className="h-8 rounded-full w-32 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
          <div className="h-12 rounded-xl w-3/4 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
          <div className="h-10 rounded-xl w-1/3 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
          <div className="h-5 rounded-full w-1/4 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
          <div className="space-y-3 pt-6">
            <div className="h-4 rounded-full w-full bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
            <div className="h-4 rounded-full w-5/6 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
            <div className="h-4 rounded-full w-4/6 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
          </div>
          <div className="flex gap-4 pt-8">
            <div className="h-14 rounded-2xl w-32 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
            <div className="h-14 rounded-2xl w-48 bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductDetail() {
  const { slug } = useParams();
  const { storeName } = useSiteSettings();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState({ items: [], total: 0, average_rating: 0 });
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [customizations, setCustomizations] = useState([]);
  const [customizationErrors, setCustomizationErrors] = useState([]);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgZoom, setImgZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imgRef = useRef(null);
  const { addItem } = useCart();
  const { addItem: addWishlist, removeItem: removeWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    document.title = storeName;
  }, [storeName]);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await productService.getProductBySlug(slug);
      setProduct(res.data);
      document.title = `${res.data.name} - ${storeName}`;
      const revRes = await reviewService.getProductReviews(res.data.id);
      setReviews(revRes.data);
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (data) => {
    await reviewService.createReview(product.id, data);
    const revRes = await reviewService.getProductReviews(product.id);
    setReviews(revRes.data);
  };

  const handleAddToCart = async () => {
    if (product.is_customizable) {
      const errors = [];
      for (const opt of product.options || []) {
        if (opt.is_required) {
          const sel = customizations.find(c => c.option_id === opt.id);
          if (!sel || (!sel.value_id && !sel.value_text)) {
            errors.push(`${opt.name} is required`);
          }
        }
      }
      if (errors.length > 0) {
        setCustomizationErrors(errors);
        return;
      }
    }
    setCustomizationErrors([]);
    setAdding(true);
    const custData = customizations.length > 0 ? customizations : null;
    await addItem(product.id, quantity, custData);
    setTimeout(() => setAdding(false), 600);
  };

  const handleCustomizationsChange = (selections) => {
    setCustomizations(selections);
    setCustomizationErrors([]);
  };

  const handleMouseMove = (e) => {
    if (!imgRef.current || !imgZoom) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;
  const hasDiscount = product?.discount_price;

  if (loading) return <LoadingSkeleton />;

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="w-24 h-24 mb-8 rounded-full bg-[color-mix(in_srgb,var(--text-secondary)_10%,transparent)] flex items-center justify-center">
          <svg className="w-12 h-12 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-[var(--text-primary)] mb-3 tracking-tight">Product Not Found</h2>
        <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md">The product you're looking for doesn't exist or may have been removed.</p>
        <Link to="/shop" className="px-8 py-4 rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-2" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-[pageFadeIn_0.6s_ease-out]">
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2.5 text-sm font-medium mb-8 text-[var(--text-secondary)] animate-[slideUpFade_0.6s_ease-out_0.1s_both]">
        <Link to="/" className="hover:text-[var(--primary)] transition-colors no-underline">Home</Link>
        <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <Link to="/shop" className="hover:text-[var(--primary)] transition-colors no-underline">Shop</Link>
        {product.category && (
          <>
            <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[var(--text-primary)] font-bold">{product.category.name}</span>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
        {/* ── Image Gallery ─────────────────────────────────────────────────────── */}
        <div className="relative group animate-[slideUpFade_0.6s_ease-out_0.2s_both]">
          <div
            ref={imgRef}
            className="relative aspect-square rounded-[2rem] overflow-hidden cursor-crosshair shadow-lg border border-[color-mix(in_srgb,var(--border),transparent_80%)] bg-[color-mix(in_srgb,var(--text-primary)_3%,transparent)]"
            onMouseEnter={() => setImgZoom(true)}
            onMouseLeave={() => setImgZoom(false)}
            onMouseMove={handleMouseMove}
          >
            {product.thumbnail ? (
              <>
                {!imgLoaded && (
                  <div className="absolute inset-0 animate-pulse bg-[color-mix(in_srgb,var(--border),transparent_60%)]" />
                )}
                <img
                  src={mediaUrl(product.thumbnail)}
                  alt={product.name}
                  onLoad={() => setImgLoaded(true)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  style={{ opacity: imgLoaded ? 1 : 0 }}
                />
                {imgZoom && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-[2rem]"
                    style={{
                      backgroundImage: `url(${mediaUrl(product.thumbnail)})`,
                      backgroundSize: '200%',
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundRepeat: 'no-repeat',
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                    }}
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="font-medium">No Image</span>
              </div>
            )}
          </div>
          {hasDiscount && (
            <div className="absolute top-6 left-6 px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest text-white shadow-lg animate-[bounce_2s_infinite]"
              style={{
                background: 'linear-gradient(135deg, var(--error) 0%, #f43f5e 100%)',
              }}>
              {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
            </div>
          )}
          <button
            onClick={() => isInWishlist(product.id) ? removeWishlist(product.id) : addWishlist(product.id)}
            className="absolute top-6 right-6 p-4 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 backdrop-blur-md border border-white/20 shadow-lg"
            style={{
              backgroundColor: isInWishlist ? 'var(--error)' : 'color-mix(in srgb, var(--surface) 80%, transparent)',
              color: isInWishlist ? '#fff' : 'var(--text-primary)',
            }}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg className="w-6 h-6" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* ── Product Info ──────────────────────────────────────────────── */}
        <div className="flex flex-col py-2 animate-[slideUpFade_0.6s_ease-out_0.3s_both]">
          {product.brand && (
            <p className="text-sm uppercase tracking-[0.2em] font-bold text-[var(--primary)] mb-3">{product.brand}</p>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] leading-[1.1] mb-4 tracking-tight">
            {product.name}
          </h1>

          {/* Rating */}
          {reviews.average_rating > 0 && (
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl w-fit bg-[color-mix(in_srgb,var(--primary)_5%,transparent)] border border-[color-mix(in_srgb,var(--primary)_10%,transparent)]">
              <StarRating rating={Math.round(reviews.average_rating)} readonly />
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {reviews.average_rating.toFixed(1)} <span className="text-[var(--text-secondary)] font-medium">({reviews.total} {reviews.total === 1 ? 'review' : 'reviews'})</span>
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-4 mb-6">
            <span className="text-4xl sm:text-5xl font-black" style={{ color: hasDiscount ? 'var(--error)' : 'var(--text-primary)' }}>
              {formatPrice(product.discount_price || product.price)}
            </span>
            {hasDiscount && (
              <div className="flex flex-col gap-1 pb-1">
                <span className="text-xl text-[var(--text-secondary)] line-through font-bold opacity-60">{formatPrice(product.price)}</span>
                <span className="text-sm font-bold px-2 py-1 rounded-md text-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,transparent)] border border-[color-mix(in_srgb,var(--error)_20%,transparent)]">
                  Save {formatPrice(product.price - product.discount_price)}
                </span>
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border ${product.stock_quantity > 0 ? 'text-[var(--success)] bg-[color-mix(in_srgb,var(--success)_10%,transparent)] border-[color-mix(in_srgb,var(--success)_20%,transparent)]' : 'text-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,transparent)] border-[color-mix(in_srgb,var(--error)_20%,transparent)]'}`}>
              <span className={`w-2 h-2 rounded-full ${product.stock_quantity > 0 ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--error)]'}`} />
              {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
            </div>
            {product.sku && (
              <span className="text-sm font-medium text-[var(--text-secondary)] px-3 py-1.5 rounded-lg bg-[color-mix(in_srgb,var(--text-secondary)_10%,transparent)] border border-[color-mix(in_srgb,var(--text-secondary)_20%,transparent)]">
                SKU: {product.sku}
              </span>
            )}
          </div>

          {/* Short description */}
          {product.short_description && (
            <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed mb-8 font-medium">
              {product.short_description}
            </p>
          )}

          {/* ── Customization Panel ─────────────────────────────────────── */}
          {product.is_customizable && product.options?.length > 0 && (
            <CustomizationPanel
              options={product.options}
              onCustomizationsChange={handleCustomizationsChange}
              basePrice={product.discount_price || product.price}
            />
          )}

          {product.is_customizable && customizationErrors.length > 0 && (
            <div className="mb-6 p-4 rounded-xl border-l-4 border-[var(--error)] bg-[color-mix(in_srgb,var(--error)_10%,transparent)] animate-[fadeIn_0.3s_ease]">
              {customizationErrors.map((err, i) => (
                <p key={i} className="flex items-center gap-2 text-sm font-bold text-[var(--error)] mb-1 last:mb-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {err}
                </p>
              ))}
            </div>
          )}

          {/* Actions */}
          {product.stock_quantity > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
              <div className="flex items-center h-14 rounded-xl border-2 border-[color-mix(in_srgb,var(--border),transparent_50%)] bg-[var(--surface)] overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-14 h-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={quantity <= 1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
                </button>
                <span className="w-16 text-center font-black text-lg text-[var(--text-primary)] select-none border-x-2 border-[color-mix(in_srgb,var(--border),transparent_50%)]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="w-14 h-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={quantity >= product.stock_quantity}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 h-14 rounded-xl font-bold text-lg text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-3 relative overflow-hidden group"
                style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', boxShadow: '0 8px 20px color-mix(in srgb, var(--primary) 30%, transparent)' }}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative flex items-center gap-2">
                  {adding ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </span>
              </button>
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 mt-auto pt-8 border-t border-[color-mix(in_srgb,var(--border),transparent_70%)]">
            {[
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Secure Checkout' },
              { icon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z', label: 'Free Shipping' },
              { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: 'Easy Returns' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-4 rounded-xl bg-[color-mix(in_srgb,var(--text-secondary)_5%,transparent)] border border-[color-mix(in_srgb,var(--border),transparent_80%)] text-center transition-transform hover:-translate-y-1">
                <svg className="w-6 h-6 mb-2 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span className="text-xs font-bold text-[var(--text-secondary)]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Full description ───────────────────────────────────────────── */}
      {product.description && (
        <div className="mb-16 rounded-3xl p-8 sm:p-12 border border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[var(--surface)] shadow-lg relative overflow-hidden animate-[slideUpFade_0.6s_ease-out_0.4s_both]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)] rounded-full mix-blend-multiply filter blur-[80px] opacity-10 pointer-events-none" />
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-8 flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] flex items-center justify-center text-[var(--primary)] shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Product Details
          </h2>
          <div className="text-[var(--text-secondary)] font-medium leading-[1.9] whitespace-pre-wrap text-base sm:text-lg relative z-10 max-w-4xl">
            {product.description}
          </div>
        </div>
      )}

      {/* ── Reviews ─────────────────────────────────────────────────────── */}
      <div className="pt-12 border-t border-[color-mix(in_srgb,var(--border),transparent_70%)] animate-[slideUpFade_0.6s_ease-out_0.5s_both]">
        <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] flex items-center justify-center text-[var(--primary)] shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          Customer Reviews
          {reviews.total > 0 && (
            <span className="text-xl font-bold text-[var(--text-secondary)] px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--text-secondary)_10%,transparent)] ml-2">
              {reviews.total}
            </span>
          )}
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-7 xl:col-span-8">
            <ReviewList reviews={reviews.items} averageRating={reviews.average_rating} />
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-24">
              {user ? (
                <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[color-mix(in_srgb,var(--border),transparent_70%)] shadow-lg">
                  <ReviewForm onSubmit={handleReviewSubmit} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 rounded-2xl text-center border-2 border-dashed border-[color-mix(in_srgb,var(--border),transparent_30%)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-full bg-[color-mix(in_srgb,var(--text-secondary)_10%,transparent)] flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Write a Review</h3>
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-6">Share your experience with this product to help others.</p>
                  <Link to={`/login?redirect=/product/${slug}`} className="px-8 py-3 w-full rounded-xl font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)', boxShadow: '0 4px 12px color-mix(in srgb, var(--primary) 30%, transparent)' }}>
                    Login to Write Review
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pageFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
