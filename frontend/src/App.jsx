import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AdminCategories } from './pages/AdminCategories';
import { AdminProducts } from './pages/AdminProducts';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">Aquarium E-Commerce</Link>
          <div className="space-x-4">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
            <Link to="/shop" className="text-gray-600 hover:text-blue-600 font-medium">Shop</Link>
            <Link to="/admin/categories" className="text-gray-600 hover:text-blue-600 font-medium">Categories</Link>
            <Link to="/admin/products" className="text-gray-600 hover:text-blue-600 font-medium">Products</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Aquarium E-Commerce
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Browse our shop or manage your products
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/shop"
              className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Browse Shop
            </Link>
            <Link
              to="/admin/products"
              className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              Manage Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/products" element={<AdminProducts />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
