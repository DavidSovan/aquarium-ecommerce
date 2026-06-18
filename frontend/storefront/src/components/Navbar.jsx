import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { mediaUrl } from '../utils/mediaUrl';

export function Navbar({ onCartOpen }) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { storeName, storeLogo } = useSiteSettings();
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 transition-all duration-300 backdrop-blur-xl"
         style={{ 
           backgroundColor: 'color-mix(in srgb, var(--surface) 80%, transparent)',
           borderBottom: '1px solid color-mix(in srgb, var(--border), transparent 50%)',
           boxShadow: '0 4px 30px -10px rgba(0,0,0,0.1)'
         }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <Link to="/" className="group flex items-center gap-3 text-decoration-none transition-transform duration-300 hover:scale-105">
            {storeLogo ? (
              <img src={mediaUrl(storeLogo)} alt={storeName} className="h-10 object-contain drop-shadow-md" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black shadow-lg" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}>
                  {storeName.charAt(0)}
                </div>
                <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">
                  {storeName}
                </span>
              </div>
            )}
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`relative text-sm font-bold tracking-wide transition-colors ${location.pathname === '/' ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'} group`}>
              Home
              <span className={`absolute -bottom-2 left-0 w-full h-0.5 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300 ${location.pathname === '/' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'}`}></span>
            </Link>
            <Link to="/shop" className={`relative text-sm font-bold tracking-wide transition-colors ${location.pathname === '/shop' ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'} group`}>
              Shop
              <span className={`absolute -bottom-2 left-0 w-full h-0.5 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-300 ${location.pathname === '/shop' ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'}`}></span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            {user ? (
              <div className="hidden sm:flex items-center gap-4 border-r pr-6 border-[color-mix(in_srgb,var(--border),transparent_50%)]">
                <Link to="/profile" className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] flex items-center justify-center text-[var(--primary)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="truncate max-w-[100px]">{user.first_name || user.email.split('@')[0]}</span>
                </Link>
                <button onClick={logout} className="text-sm font-bold text-[var(--error)] hover:opacity-80 transition-opacity">
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3 border-r pr-6 border-[color-mix(in_srgb,var(--border),transparent_50%)]">
                <Link to="/login" className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-2">Login</Link>
                <Link to="/register" className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-6px_var(--primary)]" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}>
                  Register
                </Link>
              </div>
            )}

            <button onClick={onCartOpen} className="group relative p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors" aria-label="Open Cart">
              <div className="absolute inset-0 rounded-full bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              <svg className="w-6 h-6 relative z-10 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-black text-white rounded-full border-2 border-[var(--surface)] shadow-sm" style={{ background: 'linear-gradient(135deg, var(--error) 0%, #ff4b4b 100%)' }}>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ backgroundColor: 'var(--error)' }}></span>
                  <span className="relative">{itemCount > 99 ? '99+' : itemCount}</span>
                </span>
              )}
            </button>
            
            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
