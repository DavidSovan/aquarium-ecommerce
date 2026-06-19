import { useState, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider, useWishlist } from './context/WishlistContext';
import { SiteSettingsProvider, useSiteSettings } from './context/SiteSettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HeroSection } from './components/HeroSection';
import { DynamicSection } from './components/DynamicSection';
import { Footer } from './components/Footer';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentPage } from './pages/PaymentPage';
import { ProfilePage } from './pages/ProfilePage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { MyAddressesPage } from './pages/MyAddressesPage';
import { MyReviewsPage } from './pages/MyReviewsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout() {
  const { cart, updateItem, removeItem, isCartOpen, setIsCartOpen } = useCart();
  const { storeName, homepageSections } = useSiteSettings();

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

  const hasHero = homepageSections.some(s => s.section_type === 'hero');

  return (
    <div className="app relative" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: 'var(--font-family)', 
      backgroundColor: 'var(--bg)', 
      color: 'var(--text-primary)', 
      minHeight: '100vh',
      overflowX: 'hidden'
    }}>
      {/* Animated Premium Background Blobs */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[100px]" style={{ backgroundColor: 'var(--primary)', animation: 'blob-move 20s infinite alternate' }}></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full opacity-20 blur-[120px]" style={{ backgroundColor: 'var(--accent)', animation: 'blob-move 25s infinite alternate-reverse' }}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[40%] rounded-full opacity-10 blur-[100px]" style={{ backgroundColor: 'var(--secondary)', animation: 'blob-move 30s infinite alternate' }}></div>
      </div>

      <Navbar onCartOpen={() => setIsCartOpen(true)} />
      <main style={{ flex: 1 }} className="relative z-10">
        <Routes>
          <Route path="/" element={
            <>
              {hasHero ? (
                homepageSections
                  .filter(s => s.is_active)
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map(section => <DynamicSection key={section.id} section={section} />)
              ) : (
                <HeroSection />
              )}
            </>
          } />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/payment/:orderId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
          <Route path="/addresses" element={<ProtectedRoute><MyAddressesPage /></ProtectedRoute>} />
          <Route path="/reviews" element={<ProtectedRoute><MyReviewsPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer className="relative z-10" />
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
      <ScrollToTop />
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <SiteSettingsProvider>
              <ThemeProvider>
                <Layout />
              </ThemeProvider>
            </SiteSettingsProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
