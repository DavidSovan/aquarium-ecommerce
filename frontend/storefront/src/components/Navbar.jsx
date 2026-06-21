import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { useTheme } from '../context/ThemeContext';
import { mediaUrl } from '../utils/mediaUrl';

export function Navbar({ onCartOpen }) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { storeName, storeLogo } = useSiteSettings();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
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
              <button onClick={toggleDarkMode} className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors rounded-full hover:bg-[color-mix(in_srgb,var(--primary)_15%,transparent)]" aria-label="Toggle Theme">
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              {user ? (
                <div className="hidden sm:flex items-center gap-4 border-l pl-4 border-[color-mix(in_srgb,var(--border),transparent_50%)]">
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
                <div className="hidden sm:flex items-center gap-3 border-l pl-4 border-[color-mix(in_srgb,var(--border),transparent_50%)]">
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
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity animate-[fadeIn_0.3s_ease-out]" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div 
            className="relative h-full w-[85vw] max-w-sm bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] backdrop-blur-2xl shadow-[20px_0_60px_rgba(0,0,0,0.3)] border-r border-[color-mix(in_srgb,var(--border),transparent_30%)] rounded-r-[2rem] flex flex-col overflow-hidden animate-[slideInLeft_0.4s_cubic-bezier(0.16,1,0.3,1)]"
            onClick={e => e.stopPropagation()}
          >
            {/* Decorative Glow */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-[color-mix(in_srgb,var(--primary)_20%,transparent)] to-transparent opacity-50 blur-3xl pointer-events-none -z-10"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-[color-mix(in_srgb,var(--border),transparent_70%)] relative z-10">
              <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)]">
                Menu
              </span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)] text-[var(--text-secondary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_15%,transparent)] hover:text-[var(--text-primary)] transition-all active:scale-90 shadow-sm border border-[color-mix(in_srgb,var(--border),transparent_50%)]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 custom-scrollbar relative z-10">
              <div className="flex flex-col gap-3">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-xl font-bold transition-all active:scale-95 border border-transparent ${location.pathname === '/' ? 'bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] text-[var(--primary)] border-[color-mix(in_srgb,var(--primary)_30%,transparent)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)] hover:text-[var(--text-primary)] border-[color-mix(in_srgb,var(--border),transparent_20%)]'}`}>
                  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  Home
                </Link>
                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-xl font-bold transition-all active:scale-95 border border-transparent ${location.pathname === '/shop' ? 'bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] text-[var(--primary)] border-[color-mix(in_srgb,var(--primary)_30%,transparent)] shadow-sm' : 'text-[var(--text-secondary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)] hover:text-[var(--text-primary)] border-[color-mix(in_srgb,var(--border),transparent_20%)]'}`}>
                  <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  Shop
                </Link>
              </div>

              {/* Actions */}
              <div className="mt-auto pt-6 pb-2 flex flex-col gap-3 relative">
                {/* Subtle top border */}
                <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--border),transparent_50%)] to-transparent"></div>
                
                {user ? (
                  <>
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-xl font-bold text-[var(--text-secondary)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] border border-[color-mix(in_srgb,var(--border),transparent_50%)] shadow-sm hover:border-[var(--primary)] hover:text-[var(--text-primary)] transition-all active:scale-95">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white shrink-0 shadow-md">
                        <span className="text-xl font-black">{user.first_name ? user.first_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="truncate">{user.first_name || user.email.split('@')[0]}</span>
                    </Link>
                    <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 w-full px-5 py-4 rounded-2xl text-xl font-bold text-[var(--error)] bg-[color-mix(in_srgb,var(--error)_5%,transparent)] border border-transparent hover:border-[color-mix(in_srgb,var(--error)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--error)_10%,transparent)] transition-all active:scale-95 mt-1">
                      <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 px-2 py-4 rounded-2xl text-center text-lg font-bold text-[var(--text-secondary)] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] border border-[color-mix(in_srgb,var(--border),transparent_50%)] hover:bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)] hover:text-[var(--text-primary)] transition-all active:scale-95">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex-1 px-2 py-4 rounded-2xl text-center text-lg font-bold text-white transition-all shadow-lg active:scale-95" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}>
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideInLeft {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
          `}} />
        </div>
      )}
    </>
  );
}
