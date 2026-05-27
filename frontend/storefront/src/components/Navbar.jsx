import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { mediaUrl } from '../utils/mediaUrl';

export function Navbar({ onCartOpen }) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { storeName, storeLogo } = useSiteSettings();

  return (
    <nav style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', height: 'var(--header-height)' }}>
      <div style={{ maxWidth: 'var(--container-width)', margin: '0 auto', padding: '0 1rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          {storeLogo ? (
            <img src={mediaUrl(storeLogo)} alt={storeName} style={{ height: 32, objectFit: 'contain' }} />
          ) : (
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{storeName}</span>
          )}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <Link to="/shop" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Shop</Link>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/profile" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>
                {user.first_name || user.email}
              </Link>
              <button onClick={logout} style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none' }}>Login</Link>
              <Link to="/register" style={{ backgroundColor: 'var(--button-bg)', color: 'var(--button-text)', padding: '0.5rem 1rem', borderRadius: 'var(--button-radius)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', boxShadow: 'var(--button-shadow)' }}>Register</Link>
            </div>
          )}
          <button onClick={onCartOpen} style={{ position: 'relative', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {itemCount > 0 && (
              <span style={{ position: 'absolute', top: -8, right: -8, backgroundColor: 'var(--primary)', color: '#ffffff', fontSize: 10, fontWeight: 700, width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
