import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import reportService from '../services/reportService';
import inventoryService from '../services/inventoryService';
import orderService from '../services/orderService';
import { StatCard } from '../components/StatCard';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useAuth } from '../context/AuthContext';
import wsService from '../services/websocket';

const quickActions = [
  {
    to: '/admin/products',
    label: 'Manage Products',
    desc: 'Add, edit, or remove products',
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
    text: 'text-blue-700',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    to: '/admin/orders',
    label: 'View Orders',
    desc: 'Manage customer orders',
    color: 'bg-green-50 hover:bg-green-100 border-green-200',
    text: 'text-green-700',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    to: '/admin/coupons',
    label: 'Create Coupon',
    desc: 'Add discount coupons',
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    text: 'text-purple-700',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    to: '/admin/settings',
    label: 'Store Settings',
    desc: 'Theme, branding, homepage',
    color: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
    text: 'text-amber-700',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const STATUS_META = {
  pending: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  processing: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  shipped: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  delivered: 'bg-green-50 text-green-700 ring-green-600/20',
  cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
};

export function Dashboard() {
  const { storeName } = useSiteSettings();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sales, setSales] = useState(null);
  const [customerSummary, setCustomerSummary] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [newOrderIds, setNewOrderIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const prevNewCount = useRef(0);

  useEffect(() => {
    document.title = `Dashboard - ${storeName}`;
  }, [storeName]);

  useEffect(() => {
    Promise.all([
      reportService.getSalesSummary(30),
      reportService.getCustomerSummary(),
      inventoryService.getLowStockAlerts(5),
      orderService.listOrders({ skip: 0, limit: 5 }),
    ]).then(([salesRes, custRes, lowStockRes, ordersRes]) => {
      setSales(salesRes.data);
      setCustomerSummary(custRes.data);
      setLowStock(lowStockRes.data);
      const items = ordersRes.data.items || [];
      setRecentOrders(items);
      setNewOrderIds(new Set(items.filter(o => o.is_new).map(o => o.id)));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('aquarium_token');
    if (token) wsService.connect(token);

    const unsub = wsService.on('new_order', (data) => {
      setRecentOrders(prev => {
        const exists = prev.some(o => o.id === data.order_id);
        if (exists) return prev;
        const newOrder = {
          id: data.order_id,
          order_number: data.order_number,
          customer_name: data.customer_name,
          total: data.total,
          created_at: data.created_at,
          order_status: 'pending',
        };
        return [newOrder, ...prev].slice(0, 5);
      });
      setNewOrderIds(prev => new Set(prev).add(data.order_id));
    });

    return () => { unsub(); };
  }, [isAuthenticated]);

  const handleTouchOrder = useCallback((orderId) => {
    setNewOrderIds(prev => {
      const next = new Set(prev);
      next.delete(orderId);
      return next;
    });
    navigate('/admin/orders');
  }, [navigate]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-100 rounded-xl" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {storeName} admin
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Last 30 days
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Orders"
          value={sales?.total_orders || 0}
          color="blue"
          icon={(
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          )}
        />
        <StatCard
          title="Revenue"
          value={formatPrice(sales?.total_revenue || 0)}
          color="green"
          icon={(
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        />
        <StatCard
          title="Avg Order Value"
          value={formatPrice(sales?.average_order_value || 0)}
          color="purple"
          icon={(
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          )}
        />
        <StatCard
          title="Customers"
          value={customerSummary?.total_customers || 0}
          color="yellow"
          icon={(
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          )}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">Recent Orders</h2>
              {newOrderIds.size > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-blue-500 rounded-full animate-pulse">
                  {newOrderIds.size} new
                </span>
              )}
            </div>
            <button onClick={() => { setNewOrderIds(new Set()); navigate('/admin/orders'); }} className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View all &rarr;
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
              <p className="text-sm text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map(order => {
                const isNew = newOrderIds.has(order.id);
                const statusClass = STATUS_META[order.order_status] || 'bg-gray-50 text-gray-700';
                return (
                  <button
                    key={order.id}
                    onClick={() => handleTouchOrder(order.id)}
                    className={`w-full flex items-center justify-between px-5 py-3 transition-colors group text-left ${
                      isNew ? 'bg-blue-50/50 hover:bg-blue-50' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-medium text-sm text-gray-900">{order.order_number}</span>
                      {isNew && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none text-white bg-blue-500 animate-pulse">
                          NEW
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ring-inset ${statusClass}`}>
                        {order.order_status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(order.total)}</span>
                      <span className="text-xs text-gray-400">{formatDate(order.created_at)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">Low Stock Alerts</h2>
              {lowStock.length > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {lowStock.length}
                </span>
              )}
            </div>
            <Link to="/admin/inventory" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              Manage inventory &rarr;
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-10 h-10 mx-auto text-green-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-600 font-medium">All products have sufficient stock</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {lowStock.slice(0, 5).map(alert => {
                const pct = Math.min((alert.current_stock / 10) * 100, 100);
                const barColor = alert.current_stock <= 0
                  ? 'bg-red-500'
                  : alert.current_stock <= 3
                    ? 'bg-orange-500'
                    : 'bg-yellow-500';
                return (
                  <div key={alert.product_id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-gray-900 truncate">{alert.product_name}</p>
                      <div className="mt-1.5 w-full max-w-[200px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className={`text-sm font-semibold flex-shrink-0 ${
                      alert.current_stock <= 0 ? 'text-red-600' : alert.current_stock <= 3 ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      {alert.current_stock} left
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions - full width */}
        <div className="lg:col-span-2">
          <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map(action => (
              <Link
                key={action.to}
                to={action.to}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${action.color}`}
              >
                <div className={`${action.text}`}>
                  {action.icon}
                </div>
                <div className="text-center">
                  <p className={`text-sm font-semibold ${action.text}`}>{action.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Revenue card (from previous StatCard for discounts earned) */}
        <div className="lg:col-span-2">
          <StatCard
            title="Discounts Given (30d)"
            value={formatPrice(sales?.total_discount || 0)}
            subtitle="Total coupon and promotional discounts applied"
            color="red"
            icon={(
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            )}
          />
        </div>
      </div>
    </div>
  );
}
