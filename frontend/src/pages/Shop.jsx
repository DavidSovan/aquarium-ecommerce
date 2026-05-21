import { useEffect, useState } from 'react';
import { useProductAPI } from '../hooks/useProductAPI';
import { ProductCard } from '../components/ProductCard';
import categoryService from '../services/categoryService';

export function Shop() {
  const { products, total, loading, error, fetchProducts } = useProductAPI();
  const [categories, setCategories] = useState([]);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(12);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [skip, categoryFilter, brandFilter, minPrice, maxPrice, featuredOnly, inStockOnly, sortBy, sortOrder]);

  const loadProducts = async () => {
    const params = { skip, limit, sort_by: sortBy, sort_order: sortOrder };
    if (search) params.search = search;
    if (categoryFilter) params.category_id = parseInt(categoryFilter, 10);
    if (brandFilter) params.brand = brandFilter;
    if (minPrice) params.min_price = parseFloat(minPrice);
    if (maxPrice) params.max_price = parseFloat(maxPrice);
    if (featuredOnly) params.is_featured = true;
    if (inStockOnly) params.in_stock = true;
    try {
      await fetchProducts(params);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setSkip(0);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === 'newest') { setSortBy('created_at'); setSortOrder('desc'); }
    else if (value === 'oldest') { setSortBy('created_at'); setSortOrder('asc'); }
    else if (value === 'price_asc') { setSortBy('price'); setSortOrder('asc'); }
    else if (value === 'price_desc') { setSortBy('price'); setSortOrder('desc'); }
    else if (value === 'name_asc') { setSortBy('name'); setSortOrder('asc'); }
    else if (value === 'name_desc') { setSortBy('name'); setSortOrder('desc'); }
    setSkip(0);
  };

  const resetFilters = () => {
    setCategoryFilter('');
    setBrandFilter('');
    setMinPrice('');
    setMaxPrice('');
    setFeaturedOnly(false);
    setInStockOnly(false);
    setSearch('');
    setSearchInput('');
    setSkip(0);
  };

  const handlePrevious = () => setSkip(Math.max(0, skip - limit));
  const handleNext = () => setSkip(skip + limit);

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter Sidebar */}
          <div className="md:w-64 flex-shrink-0">
            <div className="md:hidden mb-4">
              <button onClick={() => setShowFilters(!showFilters)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium text-sm">
                {showFilters ? 'Hide Filters' : 'Show Filters'} &#9660;
              </button>
            </div>

            <div className={`bg-white rounded-lg shadow p-5 ${showFilters ? 'block' : 'hidden'} md:block`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Filters</h3>
                <button onClick={resetFilters} className="text-xs text-blue-600 hover:text-blue-700">Reset</button>
              </div>

              <div className="space-y-5">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setSkip(0); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                  <input type="text" value={brandFilter} onChange={(e) => { setBrandFilter(e.target.value); setSkip(0); }}
                    placeholder="Search brand..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex gap-2">
                    <input type="number" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setSkip(0); }}
                      placeholder="Min" min="0" step="0.01"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input type="number" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setSkip(0); }}
                      placeholder="Max" min="0" step="0.01"
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" checked={featuredOnly} onChange={(e) => { setFeaturedOnly(e.target.checked); setSkip(0); }}
                      className="h-4 w-4 text-blue-600 rounded" />
                    <span className="ml-2 text-sm text-gray-700">Featured only</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked={inStockOnly} onChange={(e) => { setInStockOnly(e.target.checked); setSkip(0); }}
                      className="h-4 w-4 text-blue-600 rounded" />
                    <span className="ml-2 text-sm text-gray-700">In stock only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">&#128269;</span>
                <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </form>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
                <select onChange={handleSortChange}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A-Z</option>
                  <option value="name_desc">Name: Z-A</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
                {error}
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-lg shadow">
                <p className="text-gray-500 text-lg">No products found</p>
                <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">{total} product{total !== 1 ? 's' : ''} found</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between bg-white rounded-lg shadow px-6 py-4">
                    <span className="text-sm text-gray-600">
                      Showing {skip + 1}-{Math.min(skip + limit, total)} of {total}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={handlePrevious} disabled={currentPage <= 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
                        Previous
                      </button>
                      <button onClick={handleNext} disabled={skip + limit >= total}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
