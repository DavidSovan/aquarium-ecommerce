import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import settingsService from '../services/settingsService';

const CACHE_KEY = 'site_settings';

const defaults = {
  storeName: 'Aquarium Store',
  storeEmail: '',
  storeLogo: null,
  favicon: null,
  footerLogo: null,
  copyrightText: 'All rights reserved.',
  contactEmail: '',
  contactPhone: '',
  contactAddress: '',
  socialLinks: {},
  backgroundVideoEnabled: false,
  backgroundVideoUrl: null,
  homepageSections: [],
  homepageBranding: null,
};

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
}

const cached = readCache();
const initial = cached || defaults;

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
  const [storeName, setStoreName] = useState(initial.storeName);
  const [storeEmail, setStoreEmail] = useState(initial.storeEmail);
  const [storeLogo, setStoreLogo] = useState(initial.storeLogo);
  const [favicon, setFavicon] = useState(initial.favicon);
  const [footerLogo, setFooterLogo] = useState(initial.footerLogo);
  const [copyrightText, setCopyrightText] = useState(initial.copyrightText);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);
  const [contactPhone, setContactPhone] = useState(initial.contactPhone);
  const [contactAddress, setContactAddress] = useState(initial.contactAddress);
  const [socialLinks, setSocialLinks] = useState(initial.socialLinks);
  const [backgroundVideoEnabled, setBackgroundVideoEnabled] = useState(initial.backgroundVideoEnabled);
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState(initial.backgroundVideoUrl);
  const [homepageSections, setHomepageSections] = useState(initial.homepageSections);
  const [homepageBranding, setHomepageBranding] = useState(initial.homepageBranding);
  const [loading, setLoading] = useState(!cached);

  const loadSettings = useCallback(() => {
    Promise.all([
      settingsService.getPublic(),
      settingsService.getBranding(),
      settingsService.getHomepage(),
    ])
      .then(([publicRes, brandingRes, homepageRes]) => {
        const data = {
          storeName: brandingRes.data.store_name || publicRes.data.store_name || 'Aquarium Store',
          storeEmail: publicRes.data.store_email || '',
          storeLogo: brandingRes.data.store_logo || null,
          favicon: brandingRes.data.favicon || null,
          footerLogo: brandingRes.data.footer_logo || null,
          copyrightText: brandingRes.data.copyright_text || 'All rights reserved.',
          contactEmail: brandingRes.data.contact_email || '',
          contactPhone: brandingRes.data.contact_phone || '',
          contactAddress: brandingRes.data.contact_address || '',
          socialLinks: {
            facebook: brandingRes.data.social_facebook,
            twitter: brandingRes.data.social_twitter,
            instagram: brandingRes.data.social_instagram,
            youtube: brandingRes.data.social_youtube,
            linkedin: brandingRes.data.social_linkedin,
          },
          backgroundVideoEnabled: !!publicRes.data.background_video_enabled,
          backgroundVideoUrl: publicRes.data.background_video_url || null,
          homepageSections: homepageRes.data.sections || [],
          homepageBranding: homepageRes.data.branding || null,
        };
        setStoreName(data.storeName);
        setStoreEmail(data.storeEmail);
        setStoreLogo(data.storeLogo);
        setFavicon(data.favicon);
        setFooterLogo(data.footerLogo);
        setCopyrightText(data.copyrightText);
        setContactEmail(data.contactEmail);
        setContactPhone(data.contactPhone);
        setContactAddress(data.contactAddress);
        setSocialLinks(data.socialLinks);
        setBackgroundVideoEnabled(data.backgroundVideoEnabled);
        setBackgroundVideoUrl(data.backgroundVideoUrl);
        setHomepageSections(data.homepageSections);
        setHomepageBranding(data.homepageBranding);
        writeCache(data);
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
