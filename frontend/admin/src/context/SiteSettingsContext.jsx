import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SiteSettingsContext = createContext(null);

export function SiteSettingsProvider({ children }) {
  const [storeName, setStoreName] = useState('Aquarium Store');
  const [storeEmail, setStoreEmail] = useState('');
  const [loading, setLoading] = useState(true);

  const loadSettings = () => {
    api.get('/settings/public')
      .then(res => {
        setStoreName(res.data.store_name || 'Aquarium Store');
        setStoreEmail(res.data.store_email || '');
      })
      .catch(err => {
        console.error('Failed to load store settings:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ storeName, storeEmail, loading, reload: loadSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
}
