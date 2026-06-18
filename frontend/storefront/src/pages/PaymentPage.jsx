import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import orderService from '../services/orderService';
import wsService from '../services/websocket';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

const POLL_INTERVAL = 5000;
const COUNTDOWN_INTERVAL = 1000;

export function PaymentPage() {
  const { orderId } = useParams();
  const { isAuthenticated } = useAuth();
  const { storeName } = useSiteSettings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [pollingActive, setPollingActive] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    document.title = `Payment - ${storeName}`;
  }, [storeName]);

  useEffect(() => {
    if (!orderId) return;

    orderService.getOrder(orderId)
      .then(res => {
        const o = res.data;
        setOrder(o);
        if (o.payment_status === 'paid' || o.payment_status === 'failed') {
          setPaymentStatus(o.payment_status);
          setPollingActive(false);
        }
        if (o.payment_expires_at) {
          const remaining = Math.max(0, Math.floor((new Date(o.payment_expires_at).getTime() - Date.now()) / 1000));
          setTimeLeft(remaining);
          if (remaining <= 0) setPollingActive(false);
        }
        if (o.payment_qr) {
          QRCode.toDataURL(o.payment_qr, {
            width: 280,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
          }, (err, url) => {
            if (!err && url) setQrDataUrl(url);
          });
        }
      })
      .catch(() => setError('Failed to load order'))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || paymentStatus !== 'pending') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); setPollingActive(false); return 0; }
        return prev - 1;
      });
    }, COUNTDOWN_INTERVAL);
    return () => clearInterval(timer);
  }, [timeLeft, paymentStatus]);

  useEffect(() => {
    if (!pollingActive || !orderId || paymentStatus !== 'pending') return;

    const check = async () => {
      try {
        const res = await orderService.checkPayment(orderId);
        const { status } = res.data;
        if (status === 'paid' || status === 'failed') {
          setPaymentStatus(status);
          setPollingActive(false);
        }
      } catch {}
    };

    check();
    pollRef.current = setInterval(check, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [pollingActive, orderId, paymentStatus]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('fashion_token');
    if (token) wsService.connect(token);
    const unsub = wsService.on('payment_status_updated', (data) => {
      if (data.order_id === parseInt(orderId)) {
        setPaymentStatus(data.status);
        setPollingActive(false);
      }
    });
    return () => { unsub(); wsService.disconnect(); };
  }, [isAuthenticated, orderId]);

  const handleRetry = useCallback(async () => {
    setRetrying(true);
    try {
      const res = await orderService.retryPayment(orderId);
      setPaymentStatus('pending');
      const remaining = Math.max(0, Math.floor((new Date(res.data.payment_expires_at).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (res.data.payment_qr) {
        QRCode.toDataURL(res.data.payment_qr, {
          width: 280, margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        }, (err, url) => {
          if (err) console.error('QR generation error:', err);
          if (!err && url) setQrDataUrl(url);
        });
      } else {
        console.error('No payment_qr in retry response');
      }
      setTimeout(() => setPollingActive(true), 3000);
    } catch {
      setError('Failed to retry payment');
    } finally {
      setRetrying(false);
    }
  }, [orderId]);

  const fmt = (m, s) => `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--error) 15%, transparent)' }}>
        <svg className="w-8 h-8" style={{ color: 'var(--error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold theme-text-primary mb-2">Order Not Found</h2>
      <p className="text-sm theme-text-secondary mb-6">{error || 'Could not load order details.'}</p>
      <Link to="/orders" className="theme-btn-primary text-sm font-medium no-underline inline-flex items-center gap-2 px-6 py-2.5 rounded-lg">My Orders</Link>
    </div>
  );

  if (paymentStatus === 'paid') return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)' }}>
        <svg className="w-8 h-8" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m6-3.75a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold theme-text-primary mb-2">Payment Successful!</h2>
      <p className="text-sm theme-text-secondary mb-6">Payment for #{order.order_number} confirmed.</p>
      <Link to="/orders" className="theme-btn-primary text-sm font-medium no-underline inline-flex items-center gap-2 px-6 py-2.5 rounded-lg">View Order</Link>
    </div>
  );

  if (paymentStatus === 'failed' || timeLeft === 0) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'color-mix(in srgb, var(--error) 15%, transparent)' }}>
        <svg className="w-8 h-8" style={{ color: 'var(--error)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold theme-text-primary mb-2">Payment {timeLeft === 0 ? 'Expired' : 'Failed'}</h2>
      <p className="text-sm theme-text-secondary mb-6">{timeLeft === 0 ? 'The QR code has expired.' : order.payment_failure_reason || 'Payment could not be processed.'} Please try again.</p>
      <button onClick={handleRetry} disabled={retrying} className="theme-btn-primary text-sm font-medium inline-flex items-center gap-2 px-6 py-2.5 rounded-lg">
        {retrying ? 'Retrying...' : 'Try Again'}
      </button>
    </div>
  );

  const expMin = Math.floor(timeLeft / 60);
  const expSec = timeLeft % 60;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold theme-text-primary text-center mb-2">Scan to Pay</h1>
      <p className="text-sm theme-text-secondary text-center mb-8">Order #{order.order_number}</p>

      <div className="theme-surface theme-rounded p-6" style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
        <div className="flex justify-center mb-6">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Payment QR" className="w-56 h-56 rounded-xl"
              style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 30%)' }} />
          ) : (
            <div className="w-56 h-56 rounded-xl flex items-center justify-center theme-text-secondary text-sm"
              style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)' }}>
              <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <p className="text-xs theme-text-secondary uppercase tracking-wider mb-1">Amount</p>
          <p className="text-2xl font-bold theme-text-primary">${Number(order.total).toFixed(2)}</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: timeLeft <= 60 ? 'color-mix(in srgb, var(--error) 12%, transparent)' : 'color-mix(in srgb, var(--border), transparent 50%)',
              color: timeLeft <= 60 ? 'var(--error)' : 'var(--text-secondary)',
            }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {fmt(expMin, expSec)}
          </div>
        </div>

        <div className="text-center text-xs theme-text-secondary space-y-1">
          <p>Scan the QR code with your Bakong-compatible app</p>
          <p>to complete the payment.</p>
        </div>

        {order.bakong_account_id && (
          <div className="mt-4 p-3 rounded-lg text-xs theme-text-secondary text-center"
            style={{ backgroundColor: 'color-mix(in srgb, var(--border), transparent 70%)' }}>
            Pay to: <span className="font-mono font-medium theme-text-primary">{order.bakong_account_id}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-6 text-xs theme-text-secondary">
        <div className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
        Waiting for payment...
      </div>
    </div>
  );
}
