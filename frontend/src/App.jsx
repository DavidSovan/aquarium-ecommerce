import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AdminCategories } from './pages/AdminCategories';
import { AdminProducts } from './pages/AdminProducts';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { CartDrawer } from './components/CartDrawer';
import { useCart, CartProvider } from './context/CartContext';

function Layout({ children }) {
  const { cart, itemCount, updateItem, removeItem, isDrawerOpen, openDrawer, closeDrawer } = useCart();

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      removeItem(itemId);
    } else {
      updateItem(itemId, quantity);
    }
  };

  return (
    <div>
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-600">Aquarium E-Commerce</Link>
          <div className="flex items-center gap-5">
            <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Home</Link>
            <Link to="/shop" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Shop</Link>
            <Link to="/admin/categories" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Categories</Link>
            <Link to="/admin/products" className="text-gray-600 hover:text-blue-600 font-medium text-sm">Products</Link>
            <button onClick={openDrawer} className="relative text-gray-600 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {children}

      <CartDrawer
        cart={cart}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={removeItem}
      />
    </div>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
    <CartProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/products" element={<AdminProducts />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
