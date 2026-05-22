import { useEffect, useState } from 'react';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export function Shop() {
  const [products, setProducts] = useState([]);
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
  }, []);

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Shop</h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => { setSearch(e.target.value); setSkip(0); }}
          className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={categoryId}
          onChange={e => { setCategoryId(e.target.value); setSkip(0); }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={e => { const [b, o] = e.target.value.split('-'); setSortBy(b); setSortOrder(o); setSkip(0); }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="created_at-desc">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A-Z</option>
          <option value="name-desc">Name: Z-A</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No products found</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(id) => addItem(id, 1)}
                onToggleWishlist={(id) => isInWishlist(id) ? removeWishlist(id) : addWishlist(id)}
                isInWishlist={isInWishlist(product.id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => setSkip(Math.max(0, skip - limit))}
                disabled={currentPage <= 1}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setSkip((p - 1) * limit)}
                  className={`px-4 py-2 border rounded ${currentPage === p ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}
                >{p}</button>
              ))}
              <button
                onClick={() => setSkip(skip + limit)}
                disabled={currentPage >= totalPages}
                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
