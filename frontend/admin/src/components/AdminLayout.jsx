import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '\u2302' },
  { path: '/admin/products', label: 'Products', icon: '\u2693' },
  { path: '/admin/categories', label: 'Categories', icon: '\u2630' },
  { path: '/admin/inventory', label: 'Inventory', icon: '\u2691' },
  { path: '/admin/orders', label: 'Orders', icon: '\u2709' },
  { path: '/admin/customers', label: 'Users', icon: '\u263A' },
  { path: '/admin/coupons', label: 'Coupons', icon: '\u2605' },
  { path: '/admin/banners', label: 'Banners', icon: '\u263C' },
  { path: '/admin/media', label: 'Media Library', icon: '\u2601' },
  { path: '/admin/cms-blocks', label: 'CMS Blocks', icon: '\u25A3' },
  { path: '/admin/delivery-slots', label: 'Delivery Slots', icon: '\u2708' },
  { path: '/admin/settings/homepage', label: 'Homepage', icon: '\u2302' },
  { path: '/admin/reports', label: 'Reports', icon: '\u2261' },
  { path: '/admin/settings', label: 'Settings', icon: '\u2699' },
];

export function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const { storeName, storeLogo } = useSiteSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const pageTitles = {
    '/admin': 'Dashboard',
    '/admin/products': 'Products',
    '/admin/categories': 'Categories',
    '/admin/inventory': 'Inventory',
    '/admin/orders': 'Orders',
    '/admin/customers': 'Customers',
    '/admin/coupons': 'Coupons',
    '/admin/banners': 'Banners',
    '/admin/media': 'Media Library',
    '/admin/cms-blocks': 'CMS Blocks',
    '/admin/reports': 'Reports',
    '/admin/settings': 'Settings',
    '/admin/settings/homepage': 'Homepage Builder',
  };

  useEffect(() => {
    const page = pageTitles[location.pathname] || 'Admin';
    document.title = `${page} - ${storeName}`;
  }, [location.pathname, storeName]);

  const sidebar = (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-full">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          {storeLogo && <img src={storeLogo} alt={storeName} className="h-8 w-8 rounded object-contain" />}
          <div>
            <h1 className="text-lg font-bold leading-tight">{storeName}</h1>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </div>
        <p className="text-sm text-gray-400 mt-2 truncate">{user?.email}</p>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white">Logout</button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-gray-900 text-white px-4 py-3">
        <button onClick={() => setMobileSidebarOpen(true)} className="p-1 hover:bg-gray-800 rounded-lg" aria-label="Open menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          {storeLogo && <img src={storeLogo} alt={storeName} className="h-6 w-6 rounded object-contain" />}
          <span className="font-semibold text-sm">{storeName}</span>
        </div>
        <div className="w-6" />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex flex-shrink-0">
          {sidebar}
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
            <div className="absolute left-0 top-0 h-full w-64 shadow-2xl">
              {sidebar}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto min-w-0">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
