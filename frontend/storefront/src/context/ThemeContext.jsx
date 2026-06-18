import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const CACHE_KEY = 'theme_css_vars';
const DARK_KEY = 'theme_dark_mode';

const DEFAULT_CSS = {
  '--primary': '#8b5cf6', // Premium Violet
  '--secondary': '#6366f1', // Indigo
  '--accent': '#f472b6', // Vibrant Pink
  '--bg': '#0f172a', // Slate 900
  '--surface': '#1e293b', // Slate 800
  '--header-bg': 'color-mix(in srgb, #0f172a 80%, transparent)',
  '--footer-bg': '#0f172a',
  '--text-primary': '#f8fafc', // Slate 50
  '--text-secondary': '#94a3b8', // Slate 400
  '--button-bg': '#8b5cf6',
  '--button-text': '#ffffff',
  '--success': '#10b981',
  '--warning': '#f59e0b',
  '--error': '#ef4444',
  '--border': '#334155', // Slate 700
  '--font-family': '"Outfit", "Inter", system-ui, sans-serif',
  '--heading-size': '2.75rem',
  '--body-size': '1.05rem',
  '--font-weight': '400',
  '--line-height': '1.7',
  '--container-width': '1280px',
  '--border-radius': '1rem', // Softer radius for premium feel
  '--box-shadow': '0 8px 32px rgba(0,0,0,0.3)',
  '--section-spacing': '5rem',
  '--header-height': '4.5rem',
  '--button-radius': '0.75rem',
  '--button-padding': '0.875rem 1.75rem',
  '--button-hover': '#7c3aed',
  '--button-shadow': '0 8px 16px rgba(139, 92, 246, 0.3)',
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
    try { const stored = localStorage.getItem(DARK_KEY); return stored !== null ? stored === 'true' : true; } catch { return true; }
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
