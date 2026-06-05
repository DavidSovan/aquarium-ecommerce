import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import driverService from '../services/driverService';
import wsService from '../services/websocket';
import { useAuth } from '../context/AuthContext';

const STATUS_META = {
  pending:    { label: 'Pending',    dot: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50' },
  processing: { label: 'Processing', dot: 'bg-blue-400',  text: 'text-blue-700',  bg: 'bg-blue-50' },
  shipped:    { label: 'Shipped',    dot: 'bg-purple-400',text: 'text-purple-700',bg: 'bg-purple-50' },
  delivered:  { label: 'Delivered',  dot: 'bg-green-400', text: 'text-green-700', bg: 'bg-green-50' },
  cancelled:  { label: 'Cancelled',  dot: 'bg-red-400',   text: 'text-red-700',   bg: 'bg-red-50' },
};

export function DriverDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [toast, setToast] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadOrders = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await driverService.getAssignedOrders(params);
      setOrders(res.data.items || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, [statusFilter]);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('aquarium_token');
    if (token) {
      wsService.connect(token);
    }

    const unsubAssigned = wsService.on('driver_assigned', (data) => {
      showToast(`New order assigned: ${data.order_number}`, 'success');
      driverService.getOrder(data.order_id).then(res => {
        setOrders(prev => {
          const exists = prev.some(o => o.id === data.order_id);
          if (exists) return prev;
          return [res.data, ...prev];
        });
      }).catch(() => {});
    });

    const unsubStatus = wsService.on('order_status_updated', (data) => {
      setOrders(prev => prev.map(o =>
        o.id === data.order_id
          ? { ...o, order_status: data.current_status, payment_status: data.payment_status ?? o.payment_status }
          : o
      ));
    });

    return () => {
      unsubAssigned();
      unsubStatus();
      wsService.disconnect();
    };
  }, [user, showToast]);

  const handleConfirmDelivery = async (order) => {
    setConfirming(order.id);
    try {
      const res = await driverService.confirmDelivery(order.id);
      setOrders(prev => prev.map(o => o.id === order.id ? res.data : o));
      if (selectedOrder?.id === order.id) setSelectedOrder(res.data);
      showToast(`Order ${order.order_number} marked as delivered!`);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to confirm delivery', 'error');
    } finally {
      setConfirming(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">My Deliveries</h1>
            <p className="text-xs text-gray-500">
              {user?.first_name || user?.email} ({orders.filter(o => o.order_status !== 'delivered' && o.order_status !== 'cancelled').length} active)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="shipped">Shipped</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
            </select>
            <button onClick={loadOrders} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button onClick={handleLogout} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
            </svg>
            <p className="text-gray-500 font-medium">No deliveries assigned</p>
            <p className="text-gray-400 text-sm mt-1">You'll see your assigned orders here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const sm = STATUS_META[order.order_status] || STATUS_META.pending;
              const isShipped = order.order_status === 'shipped';
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Order header */}
                  <div
                    className="px-4 py-3 flex items-center justify-between cursor-pointer active:bg-gray-50"
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold text-sm">#{String(order.id).slice(-4)}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{order.order_number}</p>
                        <p className="text-xs text-gray-500">{order.customer_name || order.customer_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${sm.bg} ${sm.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sm.dot} mr-1.5`} />
                        {sm.label}
                      </span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${selectedOrder?.id === order.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {selectedOrder?.id === order.id && (
                    <div className="border-t border-gray-100 px-4 py-3 space-y-3 bg-gray-50/50">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-xs text-gray-400 block">Total</span>
                          <span className="font-medium text-gray-900">{formatPrice(order.total)}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block">Payment</span>
                          <span className="font-medium text-gray-900">{order.payment_method || 'COD'}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block">Items</span>
                          <span className="font-medium text-gray-900">{order.items?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block">Date</span>
                          <span className="font-medium text-gray-900">{formatDate(order.created_at)}</span>
                        </div>
                      </div>

                      {/* Customer info */}
                      <div className="bg-white rounded-lg p-3 text-sm border border-gray-200">
                        <p className="text-xs text-gray-400 mb-1">Customer</p>
                        <p className="font-medium text-gray-900">{order.customer_name || order.customer_email}</p>
                        {order.shipping_address_id && <p className="text-xs text-gray-500 mt-1">Shipping address on file</p>}
                      </div>

                      {/* Items preview */}
                      {order.items?.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
                          {order.items.slice(0, 5).map(item => (
                            <div key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                              <span className="text-gray-900 truncate mr-2">{item.product_name}</span>
                              <span className="text-gray-500 flex-shrink-0">x{item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 5 && (
                            <div className="px-3 py-2 text-xs text-gray-400 text-center">
                              +{order.items.length - 5} more items
                            </div>
                          )}
                        </div>
                      )}

                      {/* Delivery notes */}
                      {order.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                          <p className="text-xs text-yellow-600 font-medium mb-1">Delivery Notes</p>
                          <p className="text-yellow-800">{order.notes}</p>
                        </div>
                      )}

                      {/* Delivery date */}
                      {order.preferred_delivery_date && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                          <p className="text-xs text-blue-600 font-medium mb-1">Scheduled Delivery</p>
                          <p className="text-blue-800">
                            {order.preferred_delivery_date}
                            {order.delivery_slot_name && ` (${order.delivery_slot_name})`}
                          </p>
                        </div>
                      )}

                      {/* Confirm Delivery button */}
                      {isShipped && (
                        <button
                          onClick={() => handleConfirmDelivery(order)}
                          disabled={confirming === order.id}
                          className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-xl hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg active:scale-[0.98]"
                        >
                          {confirming === order.id ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Confirming...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Confirm Delivery
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
