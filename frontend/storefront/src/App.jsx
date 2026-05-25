import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HeroSection } from './components/HeroSection';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CheckoutPage } from './pages/CheckoutPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { MyAddressesPage } from './pages/MyAddressesPage';
import { MyReviewsPage } from './pages/MyReviewsPage';

function Layout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, updateItem, removeItem } = useCart();
  const { storeName } = useSiteSettings();

  useEffect(() => {
    document.title = storeName;
  }, [storeName]);

  const handleUpdateQuantity = (itemId, quantity) => {
    if (quantity < 1) {
      removeItem(itemId);
    } else {
      updateItem(itemId, quantity);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
        <Route path="/addresses" element={<ProtectedRoute><MyAddressesPage /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute><MyReviewsPage /></ProtectedRoute>} />
      </Routes>
      <CartDrawer
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={removeItem}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <SiteSettingsProvider>
              <Layout />
            </SiteSettingsProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
