import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../services/productService';
import { useCart } from '../hooks/useCart';

export function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(product.id, quantity);
      // Optional: show a success message or open the cart drawer
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProductBySlug(slug);
      setProduct(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Product not found');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

  const discountPercent = product?.discount_price
    ? Math.round((1 - product.discount_price / product.price) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link to="/shop" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link to="/shop" className="hover:text-blue-600">Shop</Link></li>
            <li>&#8250;</li>
            {product.category && (
              <>
                <li><Link to={`/shop?category_id=${product.category.id}`} className="hover:text-blue-600">{product.category.name}</Link></li>
                <li>&#8250;</li>
              </>
            )}
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Image */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              {product.thumbnail ? (
                <img id="main-product-image" src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded">
                  -{discountPercent}%
                </span>
              )}
            </div>

            {/* Info */}
            <div>
              {product.category && (
                <p className="text-sm text-blue-600 font-medium mb-2">{product.category.name}</p>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              {product.brand && (
                <p className="text-sm text-gray-500 mb-4">Brand: <span className="font-medium">{product.brand}</span></p>
              )}

              {product.sku && (
                <p className="text-sm text-gray-500 mb-4">SKU: <span className="font-medium">{product.sku}</span></p>
              )}

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                {product.discount_price && (
                  <span className="text-xl text-gray-400 line-through">{formatPrice(product.discount_price)}</span>
                )}
              </div>

              <div className="mb-6">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock_quantity > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
                </span>
                {product.is_featured && (
                  <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
              </div>

              {/* Short Description */}
              {product.short_description && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{product.short_description}</p>
                </div>
              )}

              {/* Dimensions */}
              {(product.weight || product.length || product.width || product.height) && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Specifications</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {product.weight && (
                      <div className="flex justify-between py-1 px-3 bg-gray-50 rounded">
                        <span className="text-gray-500">Weight</span>
                        <span className="font-medium">{product.weight} kg</span>
                      </div>
                    )}
                    {product.length && (
                      <div className="flex justify-between py-1 px-3 bg-gray-50 rounded">
                        <span className="text-gray-500">Length</span>
                        <span className="font-medium">{product.length} cm</span>
                      </div>
                    )}
                    {product.width && (
                      <div className="flex justify-between py-1 px-3 bg-gray-50 rounded">
                        <span className="text-gray-500">Width</span>
                        <span className="font-medium">{product.width} cm</span>
                      </div>
                    )}
                    {product.height && (
                      <div className="flex justify-between py-1 px-3 bg-gray-50 rounded">
                        <span className="text-gray-500">Height</span>
                        <span className="font-medium">{product.height} cm</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Full Description */}
              {product.description && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Details</h3>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</div>
                </div>
              )}

              {/* Add to Cart Section */}
              <div className="border-t border-gray-100 pt-8 mt-auto">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors"
                      disabled={product.stock_quantity === 0}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors"
                      disabled={product.stock_quantity === 0 || quantity >= product.stock_quantity}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0 || isAdding}
                    className="flex-1 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-all disabled:opacity-50 disabled:bg-gray-400 transform active:scale-95"
                  >
                    {isAdding ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Adding...
                      </span>
                    ) : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {product.images && product.images.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Gallery</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {product.images.map((img) => (
                <div
                  key={img.id}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition-all ${
                    product.thumbnail === img.image_url ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => {
                    const mainImg = document.getElementById('main-product-image');
                    if (mainImg) mainImg.src = img.image_url;
                  }}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link to="/shop" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
            &#8592; Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
