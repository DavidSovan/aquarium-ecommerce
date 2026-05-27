import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { mediaUrl } from '../utils/mediaUrl';

export function Footer() {
  const { storeName, storeLogo, footerLogo, copyrightText, contactEmail, contactPhone, contactAddress, socialLinks } = useSiteSettings();

  return (
    <footer style={{ backgroundColor: 'var(--footer-bg)', color: 'rgba(255,255,255,0.8)', padding: '3rem 1rem 1.5rem', marginTop: 'auto' }}>
      <div style={{ maxWidth: 'var(--container-width)', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            {footerLogo && <img src={mediaUrl(footerLogo)} alt={storeName} style={{ height: 40, marginBottom: '0.75rem', objectFit: 'contain' }} />}
            {!footerLogo && storeLogo && <img src={mediaUrl(storeLogo)} alt={storeName} style={{ height: 40, marginBottom: '0.75rem', objectFit: 'contain' }} />}
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>{storeName}</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>Premium aquatic products for enthusiasts and professionals.</p>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '0.75rem' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.875rem' }}>
              <Link to="/shop" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Shop</Link>
              <Link to="/cart" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Cart</Link>
              <Link to="/wishlist" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Wishlist</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '0.75rem' }}>Contact</h4>
            <div style={{ fontSize: '0.875rem', opacity: 0.7, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {contactEmail && <span>Email: {contactEmail}</span>}
              {contactPhone && <span>Phone: {contactPhone}</span>}
              {contactAddress && <span>{contactAddress}</span>}
            </div>
          </div>

          <div>
            <h4 style={{ fontWeight: 600, color: '#ffffff', marginBottom: '0.75rem' }}>Follow Us</h4>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {socialLinks?.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>Facebook</a>
              )}
              {socialLinks?.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>Instagram</a>
              )}
              {socialLinks?.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>Twitter</a>
              )}
              {socialLinks?.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.875rem' }}>YouTube</a>
              )}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', textAlign: 'center', fontSize: '0.8125rem', opacity: 0.6 }}>
          &copy; {new Date().getFullYear()} {storeName}. {copyrightText}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
