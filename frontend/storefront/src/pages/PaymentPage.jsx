import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { BakongQRCode } from '../components/BakongQRCode';
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
  const [retrying, setRetrying] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const pollRef = useRef(null);
  const qrRef = useRef(null);

  const confettiParticles = useRef(
    Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      tx: (Math.random() - 0.5) * 200,
      ty: -(Math.random() * 150 + 50),
      color: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b', '#818cf8', '#a78bfa', '#f472b6'][Math.floor(Math.random() * 8)],
      size: Math.random() * 6 + 4,
      rotation: Math.random() * 360,
      duration: Math.random() * 0.8 + 0.8,
      delay: Math.random() * 0.3,
    }))
  ).current;

  const sparkles = useRef(
    Array.from({ length: 6 }, () => ({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 4 + 4,
      duration: Math.random() * 1 + 1.2,
      delay: Math.random() * 1.5 + 0.5,
    }))
  ).current;

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
      setOrder(prev => ({ ...prev, ...res.data }));
      setPaymentStatus('pending');
      const remaining = Math.max(0, Math.floor((new Date(res.data.payment_expires_at).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      setTimeout(() => setPollingActive(true), 3000);
    } catch {
      setError('Failed to retry payment');
    } finally {
      setRetrying(false);
    }
  }, [orderId]);

  const handleDownload = async () => {
    if (!qrRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(qrRef.current, { useCORS: true, backgroundColor: '#ffffff' });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_Code_${order.order_number}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleShare = async () => {
    if (!qrRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(qrRef.current, { useCORS: true, backgroundColor: '#ffffff' });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `QR_Code_${order.order_number}.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Payment QR Code',
            text: `Scan to pay for order #${order.order_number}`,
            files: [file]
          });
        } else {
          alert('Sharing is not supported on this browser or device.');
        }
      });
    } catch (err) {
      console.error('Share failed', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const fmt = (m, s) => `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  if (loading) return (
    <div className="flex-1 w-full flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[var(--border)] border-t-[var(--primary)] rounded-full animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="flex-1 w-full flex flex-col items-center justify-center max-w-lg mx-auto px-4 py-20 text-center">
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
    <div className="flex-1 w-full flex flex-col items-center justify-center max-w-lg mx-auto px-4 py-20 text-center payment-success-wrapper">
      {/* Confetti particles */}
      {confettiParticles.map((p, i) => (
        <div
          key={`confetti-${i}`}
          className="confetti-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: i % 3 === 0 ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`,
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: `confettiBurst ${p.duration}s ease-out ${p.delay}s forwards`,
            translate: `0 0`,
          }}
        />
      ))}

      {/* Sparkle elements */}
      {sparkles.map((s, i) => (
        <div
          key={`sparkle-${i}`}
          className="payment-sparkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            '--duration': `${s.duration}s`,
            '--delay': `${s.delay}s`,
          }}
        />
      ))}

      {/* Animated checkmark circle */}
      <div
        className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center payment-success-icon"
        style={{ backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)' }}
      >
        <svg className="w-10 h-10" style={{ color: 'var(--success)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path
            className="payment-success-check"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold theme-text-primary mb-2 payment-success-title">
        Payment Successful!
      </h2>
      <p className="text-sm theme-text-secondary mb-8 payment-success-subtitle">
        Payment for #{order.order_number} confirmed.
      </p>
      <Link
        to="/orders"
        className="theme-btn-primary text-sm font-medium no-underline inline-flex items-center gap-2 px-8 py-3 rounded-lg payment-success-btn"
      >
        View Order
      </Link>
    </div>
  );


  if (paymentStatus === 'failed' || timeLeft === 0) return (
    <div className="flex-1 w-full flex flex-col items-center justify-center max-w-lg mx-auto px-4 py-20 text-center">
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
    <div className="flex-1 w-full flex flex-col max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold theme-text-primary text-center mb-2">Scan to Pay</h1>
      <p className="text-sm theme-text-secondary text-center mb-8">Order #{order.order_number}</p>

      <div className="theme-surface theme-rounded p-6" style={{ border: '1px solid color-mix(in srgb, var(--border), transparent 50%)' }}>
        <div ref={qrRef} className="bg-white p-4 rounded-xl mb-6 flex flex-col items-center justify-center">
          <BakongQRCode 
            khqrString={order?.payment_qr} 
            amount={order?.total} 
            merchantName={storeName} 
          />
        </div>

        <div className="flex gap-3 justify-center mb-6">
          <button onClick={handleShare} disabled={isCapturing} className="flex-1 text-sm font-bold inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-[color-mix(in_srgb,var(--border),transparent_50%)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all shadow-sm disabled:opacity-50 active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Share
          </button>
          <button onClick={handleDownload} disabled={isCapturing} className="flex-1 text-sm font-bold inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-[color-mix(in_srgb,var(--border),transparent_50%)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all shadow-sm disabled:opacity-50 active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Download
          </button>
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
