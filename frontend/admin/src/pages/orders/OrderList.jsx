import { useEffect, useState } from 'react';
import orderService from '../../services/orderService';

export function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');

  useEffect(() => { loadOrders(); }, [skip, statusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.listOrders({ skip, limit });
      setOrders(res.data.items);
      setTotal(res.data.total);
    } catch {} finally { setLoading(false); }
  };

  const handleStatusUpdate = async (orderId) => {
    const data = {};
    if (newStatus) data.order_status = newStatus;
    if (newPaymentStatus) data.payment_status = newPaymentStatus;
    try {
      await orderService.updateOrderStatus(orderId, data);
      setDetailOrder(null);
      setNewStatus('');
      setNewPaymentStatus('');
      loadOrders();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;
  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;
  const formatDate = (d) => new Date(d).toLocaleDateString();
  const statusColor = (s) => ({ pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' }[s] || 'bg-gray-100');

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="flex gap-4 mb-4">
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setSkip(0); }} className="px-4 py-2 border rounded-lg">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option><option value="processing">Processing</option>
          <option value="shipped">Shipped</option><option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order #</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Payment</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Total</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{order.order_number}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(order.order_status)}`}>{order.order_status}</span></td>
                <td className="px-6 py-4 text-sm">{order.payment_status}</td>
                <td className="px-6 py-4 text-right font-medium">{formatPrice(order.total)}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setDetailOrder(order); setNewStatus(order.order_status); setNewPaymentStatus(order.payment_status); }}
                    className="text-blue-600 hover:text-blue-700 text-sm">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setSkip(Math.max(0, skip - limit))} disabled={currentPage <= 1} className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setSkip((p - 1) * limit)}
              className={`px-4 py-2 border rounded ${currentPage === p ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}>{p}</button>
          ))}
          <button onClick={() => setSkip(skip + limit)} disabled={currentPage >= totalPages} className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
      )}

      {detailOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setDetailOrder(null)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Order #{detailOrder.order_number}</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                {detailOrder.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm"><span>{item.product_name} x{item.quantity}</span><span>{formatPrice(item.total_price)}</span></div>
                ))}
              </div>
              <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span>{formatPrice(detailOrder.total)}</span></div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Order Status</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                    <option value="pending">Pending</option><option value="processing">Processing</option>
                    <option value="shipped">Shipped</option><option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Status</label>
                  <select value={newPaymentStatus} onChange={e => setNewPaymentStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                    <option value="pending">Pending</option><option value="paid">Paid</option>
                    <option value="failed">Failed</option><option value="refunded">Refunded</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => handleStatusUpdate(detailOrder.id)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Update</button>
                  <button onClick={() => setDetailOrder(null)} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
