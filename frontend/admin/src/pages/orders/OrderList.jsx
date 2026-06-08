import { useEffect, useState, useCallback, useRef } from 'react';
import orderService from '../../services/orderService';
import driverService from '../../services/driverService';
import { useAuth } from '../../context/AuthContext';
import wsService from '../../services/websocket';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
const PAYMENT_METHODS = ['COD', 'ONLINE_PAYMENT'];

const PAYMENT_METHOD_LABELS = {
  COD: 'COD',
  ONLINE_PAYMENT: 'Online',
};

const STATUS_META = {
  pending:    { label: 'Pending',    dot: 'bg-yellow-400', bg: 'bg-yellow-50', text: 'text-yellow-700', ring: 'ring-yellow-600/20' },
  processing: { label: 'Processing', dot: 'bg-blue-400',  bg: 'bg-blue-50',   text: 'text-blue-700',   ring: 'ring-blue-600/20' },
  shipped:    { label: 'Shipped',    dot: 'bg-purple-400',bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-600/20' },
  delivered:  { label: 'Delivered',  dot: 'bg-green-400', bg: 'bg-green-50',  text: 'text-green-700',  ring: 'ring-green-600/20' },
  cancelled:  { label: 'Cancelled',  dot: 'bg-red-400',   bg: 'bg-red-50',    text: 'text-red-700',    ring: 'ring-red-600/20' },
};

const PAYMENT_META = {
  pending:             { label: 'Pending',  bg: 'bg-gray-100 text-gray-700' },
  paid:                { label: 'Paid',     bg: 'bg-green-100 text-green-700' },
  failed:              { label: 'Failed',   bg: 'bg-red-100 text-red-700' },
  refunded:            { label: 'Refunded', bg: 'bg-orange-100 text-orange-700' },
};

export function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 10;
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState(null);
  const [assignOrder, setAssignOrder] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const { isAuthenticated } = useAuth();
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => { loadOrders(); }, [skip, statusFilter, paymentFilter, paymentMethodFilter, search]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = { skip, limit };
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.payment_status = paymentFilter;
      if (paymentMethodFilter) params.payment_method = paymentMethodFilter;
      if (search) params.search = search;
      const res = await orderService.listOrders(params);
      setOrders(res.data.items);
      setTotal(res.data.total);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('fashion_token');
    if (token) {
      wsService.connect(token);
    }

    const unsubNewOrder = wsService.on('new_order', (data) => {
      showToast(`New order received: ${data.order_number}`, 'success');
      setOrders(prev => {
        const exists = prev.some(o => o.id === data.order_id);
        if (exists) return prev;
        const newOrder = {
          id: data.order_id,
          order_number: data.order_number,
          customer_name: data.customer_name,
          total: data.total,
          created_at: data.created_at,
          order_status: 'pending',
          payment_status: 'pending',
          is_new: true,
          items: [],
          subtotal: 0,
          shipping: 0,
          discount: 0,
          coupon_code: null,
          coupon_discount: 0,
          shipping_address_id: null,
          billing_address_id: null,
          notes: null,
          user_id: null,
          customer_email: null,
          updated_at: data.created_at,
        };
        return [newOrder, ...prev].slice(0, limit);
      });
      setTotal(prev => prev + 1);
    });

    const unsubStatusUpdate = wsService.on('order_status_updated', (data) => {
      setOrders(prev => prev.map(o =>
        o.id === data.order_id
          ? { ...o, order_status: data.current_status, payment_status: data.payment_status ?? o.payment_status }
          : o
      ));
      if (data.current_status === 'delivered') {
        showToast(`Order ${data.order_number} delivered`, 'success');
      }
    });

    return () => {
      unsubNewOrder();
      unsubStatusUpdate();
    };
  }, [isAuthenticated, showToast, limit]);

  const updateOrderStatus = useCallback(async (orderId, data) => {
    setUpdating(orderId);
    try {
      const res = await orderService.updateOrderStatus(orderId, data);
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      if (detailOrder?.id === orderId) setDetailOrder(res.data);
      showToast(data.order_status
        ? `Status updated to "${STATUS_META[data.order_status]?.label || data.order_status}"`
        : `Payment status updated`);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Update failed', 'error');
    } finally { setUpdating(null); }
  }, [detailOrder?.id, showToast]);

  const handleInlineStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, { order_status: newStatus });
  };

  const handleInlinePaymentChange = (orderId, newPaymentStatus) => {
    updateOrderStatus(orderId, { payment_status: newPaymentStatus });
  };

  const handleOpenAssign = async (order) => {
    setAssignOrder(order);
    setLoadingDrivers(true);
    try {
      const res = await driverService.listDrivers();
      setDrivers(res.data);
    } catch {
      showToast('Failed to load drivers', 'error');
      setAssignOrder(null);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleAssignDriver = async (driverId) => {
    if (!assignOrder) return;
    try {
      const res = await driverService.assignDriver(assignOrder.id, driverId);
      setOrders(prev => prev.map(o => o.id === assignOrder.id ? res.data : o));
      if (detailOrder?.id === assignOrder.id) setDetailOrder(res.data);
      showToast('Driver assigned successfully');
      setAssignOrder(null);
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to assign driver', 'error');
    }
  };

  const nextStatus = (current) => {
    const map = { pending: 'processing', processing: 'shipped', shipped: 'delivered' };
    return map[current];
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;
  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all animate-in slide-in-from-right ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {toast.type === 'error' ? '\u26A0 ' : '\u2713 '}{toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <span className="text-sm text-gray-500">{total} order{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" placeholder="Search by order number..." value={search}
            onChange={e => { setSearch(e.target.value); setSkip(0); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setSkip(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>
        <select value={paymentMethodFilter} onChange={e => { setPaymentMethodFilter(e.target.value); setSkip(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Methods</option>
          {PAYMENT_METHODS.map(m => <option key={m} value={m}>{PAYMENT_METHOD_LABELS[m]}</option>)}
        </select>
        <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setSkip(0); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Payments</option>
          {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
            </svg>
            <p className="text-gray-500 text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Driver</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Method</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(order => {
                  const sm = STATUS_META[order.order_status] || STATUS_META.pending;
                  const pm = PAYMENT_META[order.payment_status] || PAYMENT_META.pending;
                  const next = nextStatus(order.order_status);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{order.order_number}</span>
                          {order.is_new && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none text-white bg-blue-500 animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-gray-900">{order.customer_name || order.user_id?.slice(0, 8) || '\u2014'}</div>
                        {order.customer_email && <div className="text-xs text-gray-500">{order.customer_email}</div>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-gray-900">{order.driver_name || '\u2014'}</div>
                        {order.driver_id && (
                          <button
                            onClick={() => handleOpenAssign(order)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Reassign
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(order.created_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${sm.bg} ${sm.text} ${sm.ring}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                            {sm.label}
                          </span>
                          {next && (
                            <button
                              onClick={() => handleInlineStatusChange(order.id, next)}
                              disabled={updating === order.id}
                              className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md disabled:opacity-30"
                            >
                              {updating === order.id ? '...' : `\u2192 ${STATUS_META[next].label}`}
                            </button>
                          )}
                          <div className="relative inline-block">
                            <select
                              value={order.order_status}
                              onChange={e => handleInlineStatusChange(order.id, e.target.value)}
                              disabled={updating === order.id}
                              className="opacity-0 absolute inset-0 w-full cursor-pointer disabled:cursor-not-allowed"
                            >
                              {ORDER_STATUSES.map(s => (
                                <option key={s} value={s}>{STATUS_META[s].label}</option>
                              ))}
                            </select>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-700">
                          {PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method || 'COD'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${pm.bg}`}>
                            {pm.label}
                          </span>
                          <div className="relative inline-block">
                            <select
                              value={order.payment_status}
                              onChange={e => handleInlinePaymentChange(order.id, e.target.value)}
                              disabled={updating === order.id}
                              className="opacity-0 absolute inset-0 w-full cursor-pointer disabled:cursor-not-allowed"
                            >
                              {PAYMENT_STATUSES.map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-gray-900">{formatPrice(order.total)}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(order.order_status === 'processing' || order.order_status === 'shipped') && (
                            <button onClick={() => handleOpenAssign(order)}
                              className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                              {order.driver_id ? 'Reassign' : 'Assign'}
                            </button>
                          )}
                          <button onClick={() => setDetailOrder(order)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between mt-6">
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-1.5">
            <button onClick={() => setSkip(0)} disabled={currentPage <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">{'\u00AB'}</button>
            <button onClick={() => setSkip(Math.max(0, skip - limit))} disabled={currentPage <= 1}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">{'\u2039'}</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p;
              if (totalPages <= 7) {
                p = i + 1;
              } else if (currentPage <= 4) {
                p = i + 1;
              } else if (currentPage >= totalPages - 3) {
                p = totalPages - 6 + i;
              } else {
                p = currentPage - 3 + i;
              }
              return (
                <button key={p} onClick={() => setSkip((p - 1) * limit)}
                  className={`px-3 py-1.5 text-sm border rounded-lg ${currentPage === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setSkip(skip + limit)} disabled={currentPage >= totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">{'\u203A'}</button>
            <button onClick={() => setSkip((totalPages - 1) * limit)} disabled={currentPage >= totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">{'\u00BB'}</button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-10 pb-10 overflow-y-auto" onClick={() => setDetailOrder(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Order {detailOrder.order_number}</h2>
                <p className="text-sm text-gray-500">{formatDate(detailOrder.created_at)}</p>
              </div>
              <button onClick={() => setDetailOrder(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Status badges */}
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Order Status</label>
                  <div className="flex items-center gap-2">
                    <select value={detailOrder.order_status}
                      onChange={e => setDetailOrder({ ...detailOrder, order_status: e.target.value })}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                    </select>
                    {detailOrder.order_status !== orders.find(o => o.id === detailOrder.id)?.order_status && (
                      <button onClick={() => handleInlineStatusChange(detailOrder.id, detailOrder.order_status)}
                        disabled={updating === detailOrder.id}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
                        {updating === detailOrder.id ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Payment Method</label>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700">
                    {PAYMENT_METHOD_LABELS[detailOrder.payment_method] || detailOrder.payment_method || 'COD'}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Payment Status</label>
                  <div className="flex items-center gap-2">
                    <select value={detailOrder.payment_status}
                      onChange={e => setDetailOrder({ ...detailOrder, payment_status: e.target.value })}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                    {detailOrder.payment_status !== orders.find(o => o.id === detailOrder.id)?.payment_status && (
                      <button onClick={() => handleInlinePaymentChange(detailOrder.id, detailOrder.payment_status)}
                        disabled={updating === detailOrder.id}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">
                        {updating === detailOrder.id ? 'Saving...' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer info */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Customer & Delivery</h3>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="font-medium text-gray-900">{detailOrder.customer_name || '\u2014'}</p>
                  {detailOrder.customer_email && <p className="text-gray-500">{detailOrder.customer_email}</p>}
                  <p className="text-gray-400 text-xs mt-1 mb-2">ID: {detailOrder.user_id}</p>
                  
                  {detailOrder.shipping_address_snapshot && (
                    <div className="pt-2 border-t border-gray-200 text-gray-700">
                      <p className="font-medium text-gray-900">{detailOrder.shipping_address_snapshot.full_name}</p>
                      <p>{detailOrder.shipping_address_snapshot.phone}</p>
                      <p>{detailOrder.shipping_address_snapshot.address_line}</p>
                      <p>{detailOrder.shipping_address_snapshot.city}, {detailOrder.shipping_address_snapshot.country}</p>
                      
                      {detailOrder.shipping_address_snapshot.latitude && detailOrder.shipping_address_snapshot.longitude && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${detailOrder.shipping_address_snapshot.latitude},${detailOrder.shipping_address_snapshot.longitude}`}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium text-xs transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Open Map
                          </a>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(`${detailOrder.shipping_address_snapshot.latitude}, ${detailOrder.shipping_address_snapshot.longitude}`);
                              showToast('Coordinates copied!');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg font-medium text-xs transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            Copy
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Driver info */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Driver</h3>
                <div className="bg-gray-50 rounded-lg p-3 text-sm flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{detailOrder.driver_name || '\u2014'}</p>
                    <p className="text-xs text-gray-400">{detailOrder.driver_id ? 'Assigned' : 'Not assigned'}</p>
                  </div>
                  {(detailOrder.order_status === 'processing' || detailOrder.order_status === 'shipped') && (
                    <button onClick={() => handleOpenAssign(detailOrder)}
                      className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg">
                      {detailOrder.driver_id ? 'Reassign' : 'Assign Driver'}
                    </button>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Items</h3>
                <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                  {detailOrder.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
                        {item.product_sku && <p className="text-xs text-gray-400">SKU: {item.product_sku}</p>}
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="text-gray-500">x{item.quantity}</span>
                        <span className="font-medium text-gray-900 w-20 text-right">{formatPrice(item.total_price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatPrice(detailOrder.subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span>{formatPrice(detailOrder.shipping)}</span></div>
                {detailOrder.coupon_code && (
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Coupon ({detailOrder.coupon_code})</span><span className="text-green-600">-{formatPrice(detailOrder.coupon_discount)}</span></div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-gray-200 pt-1.5"><span>Total</span><span>{formatPrice(detailOrder.total)}</span></div>
              </div>

              {/* Payment Metadata */}
              {detailOrder.payment_method === 'ONLINE_PAYMENT' && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Payment Details</h3>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                    {detailOrder.payment_qr && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-400 mb-1">Payment QR</p>
                        <p className="text-gray-700 font-mono text-xs break-all">{detailOrder.payment_qr}</p>
                      </div>
                    )}
                    {detailOrder.khqr_md5 && (
                      <p><span className="text-gray-400">KHQR MD5:</span> <span className="font-mono text-xs">{detailOrder.khqr_md5}</span></p>
                    )}
                    {detailOrder.payment_reference && (
                      <p><span className="text-gray-400">Reference:</span> {detailOrder.payment_reference}</p>
                    )}
                    {detailOrder.bakong_account_id && (
                      <p><span className="text-gray-400">Bakong Account:</span> {detailOrder.bakong_account_id}</p>
                    )}
                    {detailOrder.payment_expires_at && (
                      <p><span className="text-gray-400">Expires:</span> {formatDate(detailOrder.payment_expires_at)}</p>
                    )}
                    {detailOrder.paid_at && (
                      <p><span className="text-green-600 font-medium">Paid At:</span> {formatDate(detailOrder.paid_at)}</p>
                    )}
                    {detailOrder.payment_failure_reason && (
                      <p><span className="text-red-600">Failure:</span> {detailOrder.payment_failure_reason}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {detailOrder.notes && (
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Notes</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{detailOrder.notes}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button onClick={() => setDetailOrder(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Driver Modal */}
      {assignOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setAssignOrder(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {assignOrder.driver_id ? 'Reassign Driver' : 'Assign Driver'}
              </h2>
              <button onClick={() => setAssignOrder(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Select a driver for order <strong>{assignOrder.order_number}</strong>
              </p>
              {loadingDrivers ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : drivers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No active drivers available</p>
                  <p className="text-xs text-gray-400 mt-1">Create a user with role "driver" in the settings page</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {drivers.map(driver => {
                    const driverName = [driver.first_name, driver.last_name].filter(Boolean).join(' ') || driver.email;
                    const isCurrent = assignOrder.driver_id === driver.id;
                    return (
                      <button
                        key={driver.id}
                        onClick={() => handleAssignDriver(driver.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                          isCurrent
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-blue-600">
                            {driverName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{driverName}</p>
                          <p className="text-xs text-gray-500">{driver.email}</p>
                        </div>
                        {isCurrent && (
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button onClick={() => setAssignOrder(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
