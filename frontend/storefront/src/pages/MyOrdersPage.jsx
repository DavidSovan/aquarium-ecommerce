import { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import orderService from '../services/orderService';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useAuth } from '../context/AuthContext';
import wsService from '../services/websocket';
import { OrderTimeline } from '../components/orders/OrderTimeline';

const STATUS_META = {
  pending:    { label: 'Pending',    bg: 'var(--warning)', color: '#ffffff' },
  processing: { label: 'Processing', bg: 'var(--primary)', color: '#ffffff' },
  shipped:    { label: 'Shipped',    bg: 'var(--accent)',  color: '#ffffff' },
  delivered:  { label: 'Delivered',  bg: 'var(--success)', color: '#ffffff' },
  cancelled:  { label: 'Cancelled',  bg: 'var(--error)',   color: '#ffffff' },
};

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'var(--error)' : 'var(--success)';

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      backgroundColor: bgColor,
      color: '#fff',
      padding: '0.75rem 1.25rem',
      borderRadius: 'var(--radius)',
      fontSize: '0.875rem',
      fontWeight: 500,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxWidth: '24rem',
      animation: 'slideInUp 0.3s ease-out',
    }}>
      {message}
    </div>
  );
}

export function MyOrdersPage() {
  const location = useLocation();
  const { storeName } = useSiteSettings();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    document.title = `My Orders - ${storeName}`;
  }, [storeName]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOrder, setConfirmOrder] = useState(location.state?.newOrder || null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    orderService.getOrders().then(res => {
      setOrders(res.data.items);
    }).catch(() => {}).finally(() => setLoading(false));
    window.history.replaceState({}, '');
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('aquarium_token');
    if (token) {
      wsService.connect(token);
    }

    const unsubscribe = wsService.on('order_status_updated', (data) => {
      setOrders(prev => prev.map(o =>
        o.id === data.order_id
          ? { ...o, order_status: data.current_status, payment_status: data.payment_status ?? o.payment_status }
          : o
      ));
      setToast({ message: data.message, type: 'info' });
    });

    return () => {
      unsubscribe();
      wsService.disconnect();
    };
  }, [isAuthenticated]);

  const clearToast = useCallback(() => setToast(null), []);

  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;
  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

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
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
        <div style={{ width: 32, height: 32, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 className="theme-text-primary" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>My Orders</h1>

      {confirmOrder && (
        <div style={{ marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)', border: '1px solid var(--success)', borderRadius: 'var(--radius)', color: 'var(--success)' }}>
          <p style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.25rem' }}>Order Confirmed!</p>
          <p style={{ fontSize: '0.875rem' }}>Order <strong>#{confirmOrder.order_number}</strong> has been placed successfully.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Payment Method: <strong>{confirmOrder.payment_method === 'ONLINE_PAYMENT' ? 'Online Payment' : 'Cash on Delivery (COD)'}</strong>
          </p>
          {confirmOrder.payment_method === 'ONLINE_PAYMENT' && (
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
              Online payment integration is coming soon. Your order has been created successfully.
            </p>
          )}
          {confirmOrder.coupon_code && (
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Coupon <strong>{confirmOrder.coupon_code}</strong> applied — you saved ${Number(confirmOrder.coupon_discount).toFixed(2)}.</p>
          )}
        </div>
      )}

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <p className="theme-text-secondary" style={{ marginBottom: '1rem' }}>No orders yet.</p>
          <Link to="/shop" className="theme-btn-primary" style={{ padding: '0.625rem 1.5rem', borderRadius: 'var(--button-radius)', textDecoration: 'none', display: 'inline-block', fontSize: '0.875rem' }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => {
            const sm = STATUS_META[order.order_status] || STATUS_META.pending;
            return (
              <div key={order.id} className="theme-surface theme-border theme-rounded" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <p className="theme-text-secondary" style={{ fontSize: '0.875rem' }}>Order #{order.order_number}</p>
                    <p className="theme-text-secondary" style={{ fontSize: '0.875rem' }}>{formatDate(order.created_at)}</p>
                  </div>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, backgroundColor: sm.bg, color: sm.color }}>
                    {sm.label}
                  </span>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <OrderTimeline currentStatus={order.order_status} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                      <span className="theme-text-primary">{item.product_name} x{item.quantity}</span>
                      <span className="theme-text-secondary">{formatPrice(item.total_price)}</span>
                    </div>
                  ))}
                </div>
                {order.coupon_code && (
                  <div className="theme-success" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                    <span>Coupon: {order.coupon_code}</span>
                    <span>-{formatPrice(order.coupon_discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', paddingTop: '0.5rem' }}>
                  <span className="theme-text-secondary">Payment Method</span>
                  <span className="theme-text-secondary">{order.payment_method === 'ONLINE_PAYMENT' ? 'Online Payment' : 'Cash on Delivery (COD)'}</span>
                </div>
                <div className="theme-border" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, paddingTop: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                  <span className="theme-text-primary">Total</span>
                  <span className="theme-text-primary">{formatPrice(order.total)}</span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  {order.order_status === 'pending' && (
                    <button onClick={() => handleCancelOrder(order.id)} className="theme-danger" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, padding: 0 }}>Cancel Order</button>
                  )}
                  {order.order_status === 'shipped' && (
                    <button onClick={() => handleConfirmDelivery(order.id)} className="theme-btn-primary" style={{ border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600 }}>Confirm Receipt</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}
    </div>
  );
}
