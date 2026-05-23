import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export function ProfilePage() {
  const { user } = useAuth();
  const { storeName } = useSiteSettings();

  useEffect(() => {
    document.title = `My Account - ${storeName}`;
  }, [storeName]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Name</p>
          <p className="font-medium">{user?.first_name || user?.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '-'}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Role</p>
          <p className="font-medium capitalize">{user?.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/orders" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-lg text-gray-900">My Orders</h3>
          <p className="text-gray-500 text-sm mt-1">View your order history</p>
        </Link>
        <Link to="/addresses" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-lg text-gray-900">My Addresses</h3>
          <p className="text-gray-500 text-sm mt-1">Manage shipping addresses</p>
        </Link>
        <Link to="/reviews" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h3 className="font-bold text-lg text-gray-900">My Reviews</h3>
          <p className="text-gray-500 text-sm mt-1">Manage your product reviews</p>
        </Link>
      </div>
    </div>
  );
}
