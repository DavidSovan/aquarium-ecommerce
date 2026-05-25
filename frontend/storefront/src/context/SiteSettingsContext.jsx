import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import settingsService from '../services/settingsService';

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
  const [storeName, setStoreName] = useState('Aquarium Store');
  const [storeEmail, setStoreEmail] = useState('');
  const [backgroundVideoEnabled, setBackgroundVideoEnabled] = useState(false);
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(() => {
    settingsService.getPublic()
      .then(res => {
        setStoreName(res.data.store_name || 'Aquarium Store');
        setStoreEmail(res.data.store_email || '');
        setBackgroundVideoEnabled(!!res.data.background_video_enabled);
        setBackgroundVideoUrl(res.data.background_video_url || null);
      })
      .catch(err => {
        console.error('Failed to load store settings:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <SiteSettingsContext.Provider
      value={{ storeName, storeEmail, backgroundVideoEnabled, backgroundVideoUrl, loading, reload: loadSettings }}
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
