import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import { StarRating } from '../components/StarRating';

export function MyReviewsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getProducts({ limit: 100 }).then(res => {
      setProducts(res.data.items);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Reviews</h1>

      <p className="text-gray-600 mb-6">
        Browse our products and leave a review. <Link to="/shop" className="text-blue-600 hover:text-blue-700">Go to Shop</Link>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.filter(p => p.is_active).slice(0, 12).map(product => (
          <Link key={product.id} to={`/product/${product.slug}`} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
              {product.thumbnail ? (
                <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
            </div>
            <p className="font-medium text-gray-900 truncate">{product.name}</p>
            <p className="text-sm text-blue-600">Write a review &rarr;</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
