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
          if (val?.image_url) return val.image_url;
        }
      }
    }
    return null;
  }, [selections, options]);

  const totalSelected = Object.keys(selections).length;
  const requiredCount = options.filter(o => o.is_required).length;
  const requiredFilled = options.filter(o => o.is_required && selections[o.id]?.value_id).length;

  return (
    <div className="mb-6 theme-surface theme-rounded overflow-hidden"
      style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
      {/* Header */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3"
        style={{ borderBottom: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
        <h3 className="text-base font-bold theme-text-primary flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: 'var(--primary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Customize Your Product
        </h3>
        <p className="text-xs theme-text-secondary mt-0.5">
          {totalSelected}/{options.length} selected
          {requiredCount > 0 && ` (${requiredFilled}/${requiredCount} required)`}
        </p>
      </div>

      {/* Preview image */}
      {selectedImage && (
        <div className="px-4 sm:px-6 pt-4">
          <div className="relative rounded-lg overflow-hidden" style={{ backgroundColor: 'color-mix(in srgb, var(--surface), var(--bg) 50%)' }}>
            <img src={selectedImage} alt="Preview" className="w-full max-h-48 object-contain" />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium theme-surface theme-text-secondary" style={{ backdropFilter: 'blur(4px)' }}>
              Preview
            </div>
          </div>
        </div>
      )}

      {/* Options */}
      <div className="px-4 sm:px-6 py-4 space-y-5">
        {options.map(opt => (
          <div key={opt.id}
            className={`transition-all duration-300 ${animating === opt.id ? 'scale-[1.01]' : ''}`}
            style={{ transformOrigin: 'left center' }}>
            <label className="flex items-center gap-1.5 text-sm font-medium theme-text-primary mb-2">
              {opt.name}
              {opt.is_required && (
                <span className="inline-flex items-center gap-0.5 text-xs text-red-500 font-normal">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                  Required
                </span>
              )}
              {selections[opt.id]?.value_id && !errors[opt.id] && (
                <svg className="w-3.5 h-3.5 ml-auto" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </label>

            {/* Dropdown select */}
            {(opt.type === 'dropdown' || (opt.type === 'color' && !opt.values?.some(v => v.value.startsWith('#')))) && (
              <select
                value={selections[opt.id]?.value_id || ''}
                onChange={e => handleSelectChange(opt, e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm theme-surface theme-text-primary transition-shadow focus:ring-2 outline-none"
                style={{
                  border: `1px solid ${errors[opt.id] ? 'var(--error)' : 'color-mix(in srgb, var(--border), transparent 30%)'}`,
                  '--tw-ring-color': errors[opt.id] ? 'var(--error)' : 'var(--primary)',
                }}
              >
                <option value="">— Choose {opt.name} —</option>
                {opt.values?.map(val => (
                  <option key={val.id} value={val.id}>
                    {val.value}{val.price_modifier !== 0 ? ` (${val.price_modifier > 0 ? '+' : ''}$${Math.abs(val.price_modifier).toFixed(2)})` : ''}
                  </option>
                ))}
              </select>
            )}

            {/* Color swatches */}
            {opt.type === 'color' && (
              <div className="flex flex-wrap gap-2.5">
                {opt.values?.map(val => {
                  const selected = selections[opt.id]?.value_id === val.id;
                  return (
                    <button
                      key={val.id}
                      onClick={() => handleSelectChange(opt, val.id)}
                      className="relative transition-all duration-200 hover:scale-110 active:scale-95"
                      style={{ width: 44, height: 44 }}
                      title={`${val.value}${val.price_modifier !== 0 ? ` (${val.price_modifier > 0 ? '+' : ''}$${Math.abs(val.price_modifier).toFixed(2)})` : ''}`}
                    >
                      <span
                        className="block w-full h-full rounded-full border-2 transition-all duration-200"
                        style={{
                          backgroundColor: val.value,
                          borderColor: selected ? 'var(--primary)' : 'color-mix(in srgb, var(--border), transparent 30%)',
                          boxShadow: selected ? `0 0 0 3px var(--primary), 0 2px 8px rgba(0,0,0,0.15)` : '0 1px 3px rgba(0,0,0,0.08)',
                        }}
                      />
                      {selected && (
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <svg className="w-5 h-5" style={{ color: '#fff', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
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
                className="w-full px-3 py-2.5 rounded-lg text-sm theme-surface theme-text-primary transition-shadow focus:ring-2 outline-none"
                style={{
                  border: `1px solid ${errors[opt.id] ? 'var(--error)' : 'color-mix(in srgb, var(--border), transparent 30%)'}`,
                  resize: 'vertical',
                  minHeight: 72,
                }}
              />
            )}

            {/* Dimensions */}
            {opt.type === 'dimensions' && (
              <select
                value={selections[opt.id]?.value_id || ''}
                onChange={e => handleSelectChange(opt, e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm theme-surface theme-text-primary transition-shadow focus:ring-2 outline-none"
                style={{
                  border: `1px solid ${errors[opt.id] ? 'var(--error)' : 'color-mix(in srgb, var(--border), transparent 30%)'}`,
                  '--tw-ring-color': errors[opt.id] ? 'var(--error)' : 'var(--primary)',
                }}
              >
                <option value="">— Choose {opt.name} —</option>
                {opt.values?.map(val => (
                  <option key={val.id} value={val.id}>
                    {val.value}{val.price_modifier !== 0 ? ` (${val.price_modifier > 0 ? '+' : ''}$${Math.abs(val.price_modifier).toFixed(2)})` : ''}
                  </option>
                ))}
              </select>
            )}

            {errors[opt.id] && (
              <p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: 'var(--error)' }}>
                <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                {errors[opt.id]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Price summary */}
      <div className="px-4 sm:px-6 py-4" style={{ borderTop: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="theme-text-secondary">Base Price</span>
            <span className="theme-text-primary">${basePrice.toFixed(2)}</span>
          </div>
          {totalModifier !== 0 && (
            <div className="flex justify-between text-sm">
              <span className="theme-text-secondary">Customizations</span>
              <span className="font-medium" style={{ color: totalModifier > 0 ? 'var(--success, #22c55e)' : 'var(--error)' }}>
                {totalModifier > 0 ? '+' : ''}${totalModifier.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-between font-bold text-base sm:text-lg theme-text-primary mt-2.5 pt-2.5"
          style={{ borderTop: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
          <span>Total</span>
          <span className="transition-all duration-300" style={{ color: 'var(--primary)' }}>
            ${finalPrice.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 rounded w-32 mb-8" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square theme-rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
        <div className="space-y-4">
          <div className="h-6 rounded w-24" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
          <div className="h-10 rounded w-3/4" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
          <div className="h-8 rounded w-1/3" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
          <div className="h-4 rounded w-1/4" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
          <div className="space-y-2 pt-4">
            <div className="h-3 rounded w-full" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
            <div className="h-3 rounded w-5/6" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
            <div className="h-3 rounded w-4/6" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="h-12 rounded-lg w-32" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
            <div className="h-12 rounded-lg w-40" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
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
      <div className="text-center py-28 px-4">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 50%)' }}>
          <svg className="w-9 h-9 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold theme-text-primary mb-2">Product not found</h2>
        <p className="text-sm theme-text-secondary mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/shop" className="theme-btn-primary text-sm font-medium no-underline inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm mb-6 theme-text-secondary">
        <Link to="/" className="hover:theme-text-link transition-colors no-underline theme-text-secondary">Home</Link>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <Link to="/shop" className="hover:theme-text-link transition-colors no-underline theme-text-secondary">Shop</Link>
        {product.category && (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="theme-text-primary font-medium">{product.category.name}</span>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 mb-14">
        {/* ── Image ─────────────────────────────────────────────────────── */}
        <div className="relative">
          <div
            ref={imgRef}
            className="relative aspect-square theme-rounded overflow-hidden cursor-crosshair"
            style={{ backgroundColor: 'color-mix(in srgb, var(--surface), var(--bg) 50%)' }}
            onMouseEnter={() => setImgZoom(true)}
            onMouseLeave={() => setImgZoom(false)}
            onMouseMove={handleMouseMove}
          >
            {product.thumbnail ? (
              <>
                {!imgLoaded && (
                  <div className="absolute inset-0 animate-pulse" style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }} />
                )}
                <img
                  src={product.thumbnail}
                  alt={product.name}
                  onLoad={() => setImgLoaded(true)}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  style={{ opacity: imgLoaded ? 1 : 0 }}
                />
                {imgZoom && (
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${product.thumbnail})`,
                      backgroundSize: '200%',
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center theme-text-secondary text-sm">No image available</div>
            )}
          </div>
          {hasDiscount && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider"
              style={{
                backgroundColor: 'var(--error)',
                color: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}>
              {Math.round((1 - product.discount_price / product.price) * 100)}% OFF
            </div>
          )}
          <button
            onClick={() => isInWishlist(product.id) ? removeWishlist(product.id) : addWishlist(product.id)}
            className="absolute top-3 right-3 p-2.5 rounded-full transition-all duration-200 hover:scale-110 active:scale-90 backdrop-blur-sm"
            style={{
              backgroundColor: isInWishlist ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.85)',
              color: isInWishlist ? 'var(--error)' : 'var(--text-secondary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* ── Product info ──────────────────────────────────────────────── */}
        <div className="flex flex-col">
          {product.brand && (
            <p className="text-xs uppercase tracking-widest font-semibold theme-text-secondary mb-2">{product.brand}</p>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold theme-text-primary leading-tight mb-3">
            {product.name}
          </h1>

          {/* Rating */}
          {reviews.average_rating > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={Math.round(reviews.average_rating)} readonly />
              <span className="text-sm theme-text-secondary">
                {reviews.average_rating.toFixed(1)} ({reviews.total} {reviews.total === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl sm:text-4xl font-extrabold" style={{ color: hasDiscount ? 'var(--error)' : 'var(--text-primary)' }}>
              {formatPrice(product.discount_price || product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg theme-text-secondary line-through">{formatPrice(product.price)}</span>
                <span className="text-sm font-semibold px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--error) 15%, transparent)',
                    color: 'var(--error)',
                  }}>
                  Save {formatPrice(product.price - product.discount_price)}
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center gap-1.5 text-sm font-medium"
              style={{ color: product.stock_quantity > 0 ? 'var(--success)' : 'var(--error)' }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                backgroundColor: product.stock_quantity > 0 ? 'var(--success)' : 'var(--error)',
              }} />
              {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
            </span>
            {product.sku && (
              <span className="text-xs theme-text-secondary">SKU: {product.sku}</span>
            )}
          </div>

          {/* Short description */}
          {product.short_description && (
            <p className="theme-text-secondary leading-relaxed mb-6 text-sm sm:text-base">
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
            <div className="mb-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)',
                color: 'var(--error)',
                border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)',
              }}>
              {customizationErrors.map((err, i) => (
                <p key={i} className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  {err}
                </p>
              ))}
            </div>
          )}

          {/* Actions */}
          {product.stock_quantity > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="inline-flex items-center theme-rounded overflow-hidden"
                style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 30%)' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2.5 transition-colors hover:opacity-70 theme-text-primary font-medium text-sm"
                  disabled={quantity <= 1}
                  style={{ opacity: quantity <= 1 ? 0.4 : 1 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                  </svg>
                </button>
                <span className="px-5 py-2.5 font-semibold text-sm theme-text-primary min-w-[48px] text-center select-none"
                  style={{ borderLeft: '1px solid color-mix(in srgb, var(--border), transparent 30%)', borderRight: '1px solid color-mix(in srgb, var(--border), transparent 30%)' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-3.5 py-2.5 transition-colors hover:opacity-70 theme-text-primary font-medium text-sm"
                  disabled={quantity >= product.stock_quantity}
                  style={{ opacity: quantity >= product.stock_quantity ? 0.4 : 1 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 sm:flex-none px-8 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.97] disabled:opacity-60 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'var(--button-bg)',
                  color: 'var(--button-text)',
                  boxShadow: '0 4px 12px color-mix(in srgb, var(--button-bg) 40%, transparent)',
                }}
              >
                {adding ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          )}

          {/* Trust badges */}
          <div className="flex flex-wrap gap-4 mt-auto pt-6"
            style={{ borderTop: '1px solid color-mix(in srgb, var(--border), transparent 60%)' }}>
            {[
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Secure Checkout' },
              { icon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z', label: 'Free Shipping' },
              { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', label: 'Easy Returns' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs theme-text-secondary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ color: 'var(--primary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Full description ───────────────────────────────────────────── */}
      {product.description && (
        <div className="mb-14 theme-surface theme-rounded p-6 sm:p-8"
          style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
          <h2 className="text-lg sm:text-xl font-bold theme-text-primary mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: 'var(--primary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Description
          </h2>
          <div className="theme-text-secondary leading-relaxed whitespace-pre-wrap text-sm sm:text-base" style={{ lineHeight: '1.8' }}>
            {product.description}
          </div>
        </div>
      )}

      {/* ── Reviews ─────────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }} className="pt-8">
        <h2 className="text-lg sm:text-xl font-bold theme-text-primary mb-8 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: 'var(--primary)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          Customer Reviews
          {reviews.total > 0 && (
            <span className="text-sm font-normal theme-text-secondary ml-1">({reviews.total})</span>
          )}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <ReviewList reviews={reviews.items} averageRating={reviews.average_rating} />
          <div>
            {user ? (
              <ReviewForm onSubmit={handleReviewSubmit} />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 theme-rounded text-center"
                style={{ border: '1px dashed color-mix(in srgb, var(--border), transparent 30%)' }}>
                <svg className="w-10 h-10 mb-3 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-sm theme-text-secondary mb-3">Share your experience with this product</p>
                <Link to={`/login?redirect=/product/${slug}`} className="theme-btn-primary text-sm font-medium no-underline">
                  Write a Review
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
