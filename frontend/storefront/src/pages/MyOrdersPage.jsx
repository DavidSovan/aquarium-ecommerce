import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import orderService from '../services/orderService';
import { useSiteSettings } from '../context/SiteSettingsContext';

export function MyOrdersPage() {
  const location = useLocation();
  const { storeName } = useSiteSettings();

  useEffect(() => {
    document.title = `My Orders - ${storeName}`;
  }, [storeName]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOrder, setConfirmOrder] = useState(location.state?.newOrder || null);

  useEffect(() => {
    orderService.getOrders().then(res => {
      setOrders(res.data.items);
    }).catch(() => {}).finally(() => setLoading(false));
    window.history.replaceState({}, '');
  }, []);

  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;
  const formatDate = (d) => new Date(d).toLocaleDateString();

  const statusColor = (status) => {
    const colors = { pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderService.cancelOrder(id);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, order_status: 'cancelled' } : o));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel order');
    }
  };

  const handleConfirmDelivery = async (id) => {
    if (!window.confirm('Confirm that you have received your order?')) return;
    try {
      const res = await orderService.confirmDelivery(id);
      setOrders(prev => prev.map(o => o.id === id ? res.data : o));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to confirm delivery');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {confirmOrder && (
        <div className="mb-6 p-6 bg-green-100 border border-green-400 text-green-800 rounded-lg">
          <p className="font-bold text-lg mb-1">Order Confirmed!</p>
          <p className="text-sm">Order <span className="font-semibold">#{confirmOrder.order_number}</span> has been placed successfully.</p>
          {confirmOrder.coupon_code && (
            <p className="text-sm mt-1">Coupon <span className="font-semibold">{confirmOrder.coupon_code}</span> applied — you saved ${Number(confirmOrder.coupon_discount).toFixed(2)}.</p>
          )}
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No orders yet</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.order_number}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(order.order_status)}`}>
                  {order.order_status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product_name} x{item.quantity}</span>
                    <span>{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>
              {order.coupon_code && (
                <div className="flex justify-between text-sm text-green-600 border-t pt-2">
                  <span>Coupon: {order.coupon_code}</span>
                  <span>-{formatPrice(order.coupon_discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex gap-4 mt-4">
                {order.order_status === 'pending' && (
                  <button onClick={() => handleCancelOrder(order.id)} className="text-red-500 hover:text-red-600 text-sm font-medium">Cancel Order</button>
                )}
                {order.order_status === 'shipped' && (
                  <button onClick={() => handleConfirmDelivery(order.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors">Confirm Receipt</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
