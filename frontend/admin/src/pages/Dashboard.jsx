import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import reportService from '../services/reportService';
import inventoryService from '../services/inventoryService';
import { StatCard } from '../components/StatCard';

export function Dashboard() {
  const [sales, setSales] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportService.getSalesSummary(30),
      inventoryService.getLowStockAlerts(5),
    ]).then(([salesRes, lowStockRes]) => {
      setSales(salesRes.data);
      setLowStock(lowStockRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Orders" value={sales?.total_orders || 0} color="blue" />
        <StatCard title="Revenue (30d)" value={`$${(sales?.total_revenue || 0).toFixed(2)}`} color="green" />
        <StatCard title="Avg Order Value" value={`$${(sales?.average_order_value || 0).toFixed(2)}`} color="purple" />
        <StatCard title="Discounts Given" value={`$${(sales?.total_discount || 0).toFixed(2)}`} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link to="/admin/inventory" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Low Stock Alerts</h2>
          {lowStock.length === 0 ? (
            <p className="text-green-600 font-medium">All products have sufficient stock</p>
          ) : (
            <div className="space-y-3">
              {lowStock.slice(0, 5).map(alert => (
                <div key={alert.product_id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium text-gray-900">{alert.product_name}</span>
                  <span className="text-sm font-medium text-orange-600">Stock: {alert.current_stock}</span>
                </div>
              ))}
            </div>
          )}
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/products" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100">
              <p className="font-medium text-blue-700">Manage Products</p>
              <p className="text-sm text-blue-600">Add, edit, or remove products</p>
            </Link>
            <Link to="/admin/orders" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100">
              <p className="font-medium text-green-700">View Orders</p>
              <p className="text-sm text-green-600">Manage customer orders</p>
            </Link>
            <Link to="/admin/coupons" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100">
              <p className="font-medium text-purple-700">Create Coupon</p>
              <p className="text-sm text-purple-600">Add discount coupons</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
