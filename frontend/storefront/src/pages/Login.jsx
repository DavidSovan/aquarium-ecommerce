import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { login, googleLogin } = useAuth();

  const { mergeCart } = useCart();
  const { mergeWishlist } = useWishlist();
  const { storeName } = useSiteSettings();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    document.title = `Login - ${storeName}`;
  }, [storeName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      await mergeCart().catch(() => {});
      await mergeWishlist().catch(() => {});
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md theme-surface theme-shadow theme-rounded p-8">
        <h1 className="text-2xl font-bold theme-text-primary mb-6">Login to {storeName}</h1>

        {error && (
          <div
            className="mb-4 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--error) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--error) 30%, transparent)',
              color: 'var(--error)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 theme-border theme-rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{ backgroundColor: 'var(--surface)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium theme-text-primary mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 theme-border theme-rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              style={{ backgroundColor: 'var(--surface)' }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="theme-btn-primary w-full py-2.5 font-medium disabled:opacity-50"
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 theme-surface theme-text-secondary">Or continue with</span>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setSubmitting(true);
                setError(null);
                try {
                  await googleLogin(credentialResponse.credential);
                  await mergeCart().catch(() => {});
                  await mergeWishlist().catch(() => {});
                  navigate(redirect, { replace: true });
                } catch (err) {
                  setError(err.response?.data?.detail || 'Google Login failed');
                } finally {
                  setSubmitting(false);
                }
              }}
              onError={() => {
                setError('Google Login failed');
              }}
            />
          </div>
        </div>

        <p className="mt-6 text-center text-sm theme-text-secondary">
          Don't have an account? <Link to="/register" className="theme-text-link font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}
