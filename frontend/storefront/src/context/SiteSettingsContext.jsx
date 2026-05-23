import { createContext, useContext, useState, useEffect } from 'react';
import settingsService from '../services/settingsService';

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
  const [storeName, setStoreName] = useState('Aquarium Store');
  const [storeEmail, setStoreEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsService.getPublic()
      .then(res => {
        setStoreName(res.data.store_name || 'Aquarium Store');
        setStoreEmail(res.data.store_email || '');
      })
      .catch(err => {
        console.error('Failed to load store settings:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ storeName, storeEmail, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
}
