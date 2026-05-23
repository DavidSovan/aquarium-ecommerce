import { useEffect, useState } from 'react';
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

export function ProductDetail() {
  const { slug } = useParams();
  const { storeName } = useSiteSettings();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState({ items: [], total: 0, average_rating: 0 });
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
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

  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-20 text-gray-500">Product not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/shop" className="text-blue-600 hover:text-blue-700 text-sm mb-4 inline-block">&larr; Back to Shop</Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {product.thumbnail ? (
            <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          {product.brand && <p className="text-gray-500 mb-4">{product.brand}</p>}

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-blue-600">{formatPrice(product.discount_price || product.price)}</span>
            {product.discount_price && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className={`text-sm font-medium mb-4 ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
          </p>

          {product.short_description && (
            <p className="text-gray-600 mb-6">{product.short_description}</p>
          )}

          {product.stock_quantity > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100">-</button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))} className="px-3 py-2 hover:bg-gray-100">+</button>
              </div>
              <button
                onClick={() => addItem(product.id, quantity)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Add to Cart
              </button>
              <button
                onClick={() => isInWishlist(product.id) ? removeWishlist(product.id) : addWishlist(product.id)}
                className={`p-2.5 rounded-lg border ${isInWishlist(product.id) ? 'text-red-500 border-red-200' : 'text-gray-400 border-gray-300'} hover:border-red-200`}
              >
                <svg className="w-5 h-5" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          )}

          {product.description && (
            <div className="prose max-w-none mt-6">
              <h3 className="font-bold text-lg mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ReviewList reviews={reviews.items} averageRating={reviews.average_rating} />
          {user && (
            <ReviewForm onSubmit={handleReviewSubmit} />
          )}
          {!user && (
            <div className="flex items-center justify-center">
              <Link to={`/login?redirect=/product/${slug}`} className="text-blue-600 hover:text-blue-700">
                Log in to write a review
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
