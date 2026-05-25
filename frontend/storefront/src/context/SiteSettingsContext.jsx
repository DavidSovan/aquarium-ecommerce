import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import settingsService from '../services/settingsService';

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
  const [storeName, setStoreName] = useState('Aquarium Store');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeLogo, setStoreLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [footerLogo, setFooterLogo] = useState(null);
  const [copyrightText, setCopyrightText] = useState('All rights reserved.');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [socialLinks, setSocialLinks] = useState({});
  const [backgroundVideoEnabled, setBackgroundVideoEnabled] = useState(false);
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState(null);
  const [homepageSections, setHomepageSections] = useState([]);
  const [homepageBranding, setHomepageBranding] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(() => {
    Promise.all([
      settingsService.getPublic(),
      settingsService.getBranding(),
      settingsService.getHomepage(),
    ])
      .then(([publicRes, brandingRes, homepageRes]) => {
        setStoreName(brandingRes.data.store_name || publicRes.data.store_name || 'Aquarium Store');
        setStoreEmail(publicRes.data.store_email || '');
        setStoreLogo(brandingRes.data.store_logo || null);
        setFavicon(brandingRes.data.favicon || null);
        setFooterLogo(brandingRes.data.footer_logo || null);
        setCopyrightText(brandingRes.data.copyright_text || 'All rights reserved.');
        setContactEmail(brandingRes.data.contact_email || '');
        setContactPhone(brandingRes.data.contact_phone || '');
        setContactAddress(brandingRes.data.contact_address || '');
        setSocialLinks({
          facebook: brandingRes.data.social_facebook,
          twitter: brandingRes.data.social_twitter,
          instagram: brandingRes.data.social_instagram,
          youtube: brandingRes.data.social_youtube,
          linkedin: brandingRes.data.social_linkedin,
        });
        setBackgroundVideoEnabled(!!publicRes.data.background_video_enabled);
        setBackgroundVideoUrl(publicRes.data.background_video_url || null);
        setHomepageSections(homepageRes.data.sections || []);
        setHomepageBranding(homepageRes.data.branding || null);
      })
      .catch(err => {
        console.error('Failed to load store settings:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (favicon) {
      let link = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = favicon;
    }
  }, [favicon]);

  useEffect(() => {
    if (storeName) {
      document.title = storeName;
    }
  }, [storeName]);

  return (
    <SiteSettingsContext.Provider
      value={{
        storeName, storeEmail, storeLogo, favicon, footerLogo,
        copyrightText, contactEmail, contactPhone, contactAddress,
        socialLinks,
        backgroundVideoEnabled, backgroundVideoUrl,
        homepageSections, homepageBranding,
        loading, reload: loadSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
}
