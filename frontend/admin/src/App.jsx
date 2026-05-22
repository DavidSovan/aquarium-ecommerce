import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { ProductList } from './pages/products/ProductList';
import { CategoryList } from './pages/categories/CategoryList';
import { InventoryMgmt } from './pages/inventory/InventoryMgmt';
import { OrderList } from './pages/orders/OrderList';
import { CustomerList } from './pages/customers/CustomerList';
import { CouponList } from './pages/coupons/CouponList';
import { BannerList } from './pages/banners/BannerList';
import { ReportsPage } from './pages/reports/ReportsPage';
import { SettingsPage } from './pages/settings/SettingsPage';

function AdminRoutes() {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="inventory" element={<InventoryMgmt />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="coupons" element={<CouponList />} />
        <Route path="banners" element={<BannerList />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </AdminLayout>
  );
}

function PublicRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (user) return <Navigate to="/admin" replace />;
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/admin/*" element={<ProtectedRoute><AdminRoutes /></ProtectedRoute>} />
          <Route path="/*" element={<PublicRoute />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
