import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { mediaUrl } from '../utils/mediaUrl';

export function Footer() {
  const { storeName, tagline, storeLogo, footerLogo, copyrightText, contactEmail, contactPhone, contactAddress, socialLinks } = useSiteSettings();

  return (
    <footer className="relative overflow-hidden mt-auto z-[1]" style={{ backgroundColor: 'var(--footer-bg)', color: '#fff' }}>
      {/* Decorative Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] opacity-50"></div>
      
      {/* Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-[var(--primary)] rounded-[100%] blur-[120px] opacity-10 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col items-start">
            <Link to="/" className="inline-block mb-6 transition-transform duration-300 hover:scale-105">
              {footerLogo || storeLogo ? (
                <img src={mediaUrl(footerLogo || storeLogo)} alt={storeName} className="h-12 object-contain drop-shadow-md" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}>
                    {storeName.charAt(0)}
                  </div>
                  <span className="text-2xl font-black tracking-tight">{storeName}</span>
                </div>
              )}
            </Link>
            {tagline && (
              <p className="text-sm font-medium leading-relaxed opacity-70 max-w-xs mb-6">
                {tagline}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6 opacity-90">Explore</h4>
            <ul className="flex flex-col gap-4">
              <li>
                <Link to="/shop" className="group flex items-center text-sm font-medium opacity-70 hover:opacity-100 transition-opacity">
                  <span className="w-0 h-0.5 bg-[var(--accent)] mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  Shop Collection
                </Link>
              </li>
              <li>
                <Link to="/cart" className="group flex items-center text-sm font-medium opacity-70 hover:opacity-100 transition-opacity">
                  <span className="w-0 h-0.5 bg-[var(--accent)] mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  Your Cart
                </Link>
              </li>
              <li>
                <Link to="/wishlist" className="group flex items-center text-sm font-medium opacity-70 hover:opacity-100 transition-opacity">
                  <span className="w-0 h-0.5 bg-[var(--accent)] mr-0 group-hover:w-3 group-hover:mr-2 transition-all duration-300"></span>
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6 opacity-90">Contact</h4>
            <ul className="flex flex-col gap-4 text-sm font-medium opacity-70">
              {contactEmail && (
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">{contactEmail}</a>
                </li>
              )}
              {contactPhone && (
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">{contactPhone}</a>
                </li>
              )}
              {contactAddress && (
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 text-[var(--accent)] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="leading-relaxed">{contactAddress}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest mb-6 opacity-90">Connect</h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks?.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-[var(--primary)] transition-colors duration-300" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {socialLinks?.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-[var(--primary)] transition-colors duration-300" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
              {socialLinks?.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-[var(--primary)] transition-colors duration-300" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
              )}
              {socialLinks?.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-[var(--primary)] transition-colors duration-300" aria-label="YouTube">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium opacity-60">
            &copy; {new Date().getFullYear()} {storeName}. {copyrightText}
          </p>
          <div className="flex items-center gap-6 text-sm font-medium opacity-60">
            <Link to="/privacy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <Link to="/terms" className="hover:opacity-100 transition-opacity">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
