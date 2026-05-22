import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: '\u2302' },
  { path: '/admin/products', label: 'Products', icon: '\u2693' },
  { path: '/admin/categories', label: 'Categories', icon: '\u2630' },
  { path: '/admin/inventory', label: 'Inventory', icon: '\u2691' },
  { path: '/admin/orders', label: 'Orders', icon: '\u2709' },
  { path: '/admin/customers', label: 'Customers', icon: '\u263A' },
  { path: '/admin/coupons', label: 'Coupons', icon: '\u2605' },
  { path: '/admin/banners', label: 'Banners', icon: '\u263C' },
  { path: '/admin/reports', label: 'Reports', icon: '\u2261' },
  { path: '/admin/settings', label: 'Settings', icon: '\u2699' },
];

export function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-1">{user?.email}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
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
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
