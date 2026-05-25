import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CACHE_KEY = 'theme_css_vars';
const DARK_KEY = 'theme_dark_mode';

const DEFAULT_CSS = {
  '--primary': '#2563eb',
  '--secondary': '#4f46e5',
  '--accent': '#38bdf8',
  '--bg': '#f9fafb',
  '--surface': '#ffffff',
  '--header-bg': '#0c1445',
  '--footer-bg': '#0c1445',
  '--text-primary': '#111827',
  '--text-secondary': '#6b7280',
  '--button-bg': '#2563eb',
  '--button-text': '#ffffff',
  '--success': '#10b981',
  '--warning': '#f59e0b',
  '--error': '#ef4444',
  '--border': '#e5e7eb',
  '--font-family': 'Inter, system-ui, sans-serif',
  '--heading-size': '2.5rem',
  '--body-size': '1rem',
  '--font-weight': '400',
  '--line-height': '1.6',
  '--container-width': '1280px',
  '--border-radius': '0.75rem',
  '--box-shadow': '0 1px 3px rgba(0,0,0,0.1)',
  '--section-spacing': '4rem',
  '--header-height': '4rem',
  '--button-radius': '0.5rem',
  '--button-padding': '0.75rem 1.5rem',
  '--button-hover': '#1d4ed8',
  '--button-shadow': '0 4px 6px rgba(0,0,0,0.1)',
};

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function writeCache(vars, darkMode) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(vars));
    localStorage.setItem(DARK_KEY, String(!!darkMode));
  } catch {}
}

function applyVars(vars, darkMode) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.classList.toggle('dark', !!darkMode);
}

const cached = readCache();
const initialVars = cached || DEFAULT_CSS;

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [cssVars, setCssVars] = useState(initialVars);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return localStorage.getItem(DARK_KEY) === 'true'; } catch { return false; }
  });
  const [ready, setReady] = useState(!!cached);

  const loadTheme = useCallback(async () => {
    try {
      const res = await api.get('/settings/theme/active');
      const { css_variables, is_dark_mode } = res.data;
      if (css_variables && Object.keys(css_variables).length > 0) {
        applyVars(css_variables, is_dark_mode);
        writeCache(css_variables, is_dark_mode);
        setCssVars(css_variables);
        setIsDarkMode(is_dark_mode);
      }
    } catch (err) {
      console.error('Failed to load theme:', err);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    loadTheme();
    const interval = setInterval(loadTheme, 60000);
    return () => clearInterval(interval);
  }, [loadTheme]);

  return (
    <ThemeContext.Provider value={{ cssVars, isDarkMode, ready, reload: loadTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export default ThemeContext;
