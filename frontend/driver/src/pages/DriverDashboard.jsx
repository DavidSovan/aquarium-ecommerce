import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import driverService from '../services/driverService';
import wsService from '../services/websocket';
import { useAuth } from '../context/AuthContext';
import { mediaUrl } from '../utils/mediaUrl';
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

    const token = localStorage.getItem('fashion_token');
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
      loadOrders();
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
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Driver Portal</h1>
              <p className="text-xs text-gray-500 font-medium">
                {user?.first_name || user?.email?.split('@')[0]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={loadOrders} className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors shadow-sm" title="Refresh">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button onClick={handleLogout} className="p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors shadow-sm" title="Logout">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Dashboard Greeting & Filters */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/20 mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            <h2 className="text-2xl sm:text-3xl font-black mb-1 relative z-10">You have {orders.filter(o => o.order_status !== 'delivered' && o.order_status !== 'cancelled').length} active deliveries</h2>
            <p className="text-blue-100 text-sm sm:text-base font-medium relative z-10">Drive safely and thank you for your hard work!</p>
          </div>

          <div className="flex overflow-x-auto pb-2 gap-2 custom-scrollbar">
            {['', 'shipped', 'processing', 'delivered'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex-shrink-0 ${statusFilter === status ? 'bg-gray-900 text-white shadow-md scale-105' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
              >
                {status === '' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
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
          <div className="space-y-5">
            {orders.map(order => {
              const sm = STATUS_META[order.order_status] || STATUS_META.pending;
              const isShipped = order.order_status === 'shipped';
              const isSelected = selectedOrder?.id === order.id;
              
              return (
                <div
                  key={order.id}
                  className={`bg-white rounded-3xl overflow-hidden transition-all duration-300 border ${isSelected ? 'border-blue-300 shadow-xl shadow-blue-900/5' : 'border-gray-100 shadow-md hover:border-blue-100 hover:shadow-lg'}`}
                >
                  {/* Order header */}
                  <div
                    className="px-5 py-5 sm:px-6 sm:py-6 flex items-center justify-between cursor-pointer active:bg-gray-50/50"
                    onClick={() => setSelectedOrder(isSelected ? null : order)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-50 text-blue-600'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-lg truncate leading-tight mb-0.5">{order.order_number}</p>
                        <p className="text-sm text-gray-500 font-medium truncate">{order.customer_name || order.customer_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold ${sm.bg} ${sm.text} border border-white/20 shadow-sm`}>
                        <span className={`w-2 h-2 rounded-full ${sm.dot} mr-2`} />
                        {sm.label}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-gray-50 text-gray-400'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile badge (shows below on very small screens if needed, but flex gap usually handles it) */}
                  <div className="px-5 pb-4 sm:hidden">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold ${sm.bg} ${sm.text} shadow-sm`}>
                      <span className={`w-2 h-2 rounded-full ${sm.dot} mr-2`} />
                      {sm.label}
                    </span>
                  </div>

                  {/* Expanded detail */}
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isSelected ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="border-t border-gray-100 px-5 py-5 sm:px-6 sm:py-6 space-y-5 bg-gray-50/30">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Total Amount</span>
                          <span className="font-black text-gray-900 text-lg">{formatPrice(order.total)}</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Payment</span>
                          <span className="font-bold text-gray-900 text-lg">{order.payment_method || 'COD'}</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Items</span>
                          <span className="font-bold text-gray-900 text-lg">{order.items?.length || 0}</span>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Date</span>
                          <span className="font-bold text-gray-900 text-sm">{formatDate(order.created_at)}</span>
                        </div>
                      </div>

                      {/* Customer & Address info */}
                      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z" /></svg>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-blue-600 font-black uppercase tracking-wider mb-3 relative z-10">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Delivery Destination
                        </div>
                        <p className="font-black text-gray-900 text-xl mb-2 relative z-10">{order.customer_name || order.customer_email}</p>
                        {order.shipping_address_snapshot ? (
                          <div className="text-sm text-gray-600 font-medium space-y-1.5 relative z-10">
                            <p className="flex items-center gap-2"><svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> {order.shipping_address_snapshot.full_name} &bull; {order.shipping_address_snapshot.phone}</p>
                            <p className="text-gray-800 text-base mt-2">{order.shipping_address_snapshot.address_line}</p>
                            <p>{order.shipping_address_snapshot.city}, {order.shipping_address_snapshot.country}</p>
                            
                            {order.shipping_address_snapshot.latitude && order.shipping_address_snapshot.longitude && (
                              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${order.shipping_address_snapshot.latitude},${order.shipping_address_snapshot.longitude}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold text-sm transition-colors active:scale-95 border border-blue-100"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                  Navigate
                                </a>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${order.shipping_address_snapshot.latitude}, ${order.shipping_address_snapshot.longitude}`);
                                    showToast('Coordinates copied!');
                                  }}
                                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm transition-colors active:scale-95 shadow-sm"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                  Copy Coords
                                </button>
                              </div>
                            )}
                          </div>
                        ) : order.shipping_address_id && (
                          <p className="text-xs text-gray-500 mt-1">Shipping address on file</p>
                        )}
                      </div>

                      {/* Items preview */}
                      {order.items?.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Package Contents</div>
                          <div className="divide-y divide-gray-50">
                            {order.items.slice(0, 5).map(item => (
                              <div key={item.id} className="flex items-center py-4 text-sm gap-5">
                                {item.product_thumbnail ? (
                                  <div className="w-24 h-24 shrink-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center shadow-sm">
                                    <img src={mediaUrl(item.product_thumbnail)} alt={item.product_name} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-2xl border border-gray-200 flex items-center justify-center text-gray-400 shadow-sm">
                                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-gray-900 font-black text-lg truncate">{item.product_name}</div>
                                  <div className="text-sm text-gray-500 mt-1 font-medium">SKU: {item.product_sku || 'N/A'}</div>
                                </div>
                                <span className="text-gray-800 font-black bg-gray-100 px-4 py-2 rounded-xl shrink-0 text-lg shadow-sm border border-gray-200">x{item.quantity}</span>
                              </div>
                            ))}
                            {order.items.length > 5 && (
                              <div className="pt-3 pb-1 text-xs font-bold text-gray-400 text-center">
                                + {order.items.length - 5} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Delivery notes */}
                      {order.notes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 sm:p-5 text-sm shadow-sm">
                          <div className="flex items-center gap-2 text-xs text-yellow-600 font-black uppercase tracking-wider mb-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            Delivery Notes
                          </div>
                          <p className="text-yellow-800 font-medium text-base">{order.notes}</p>
                        </div>
                      )}

                      {/* Delivery date */}
                      {order.preferred_delivery_date && (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 sm:p-5 text-sm shadow-sm">
                          <div className="flex items-center gap-2 text-xs text-indigo-600 font-black uppercase tracking-wider mb-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Scheduled Delivery
                          </div>
                          <p className="text-indigo-900 font-black text-lg">
                            {order.preferred_delivery_date}
                            {order.delivery_slot_name && <span className="text-indigo-600 ml-1 text-base font-bold">({order.delivery_slot_name})</span>}
                          </p>
                        </div>
                      )}

                      {/* Confirm Delivery button */}
                      {isShipped && (
                        <button
                          onClick={() => handleConfirmDelivery(order)}
                          disabled={confirming === order.id}
                          className="w-full py-4 mt-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg rounded-2xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center overflow-hidden relative"
                        >
                          {confirming === order.id ? (
                            <span className="flex items-center justify-center gap-3 relative z-10">
                              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                              Confirming...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-3 relative z-10">
                              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Confirm Delivery
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
