import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';

export function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrders().then(res => {
      setOrders(res.data.items);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;
  const formatDate = (d) => new Date(d).toLocaleDateString();

  const statusColor = (status) => {
    const colors = { pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

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
              <div className="flex justify-between font-bold border-t pt-4">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              {order.order_status === 'pending' && (
                <button onClick={async () => { await orderService.cancelOrder(order.id); setOrders(prev => prev.filter(o => o.id !== order.id)); }} className="mt-4 text-red-500 hover:text-red-600 text-sm">Cancel Order</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
