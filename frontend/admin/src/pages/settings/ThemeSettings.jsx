import { useState, useEffect } from 'react';
import themeService from '../../services/themeService';
import mediaService from '../../services/mediaService';
import { toFullUrl } from '../../utils/mediaUrl';

const COLOR_FIELDS = [
  { key: 'primary_color', label: 'Primary' },
  { key: 'secondary_color', label: 'Secondary' },
  { key: 'accent_color', label: 'Accent' },
  { key: 'background_color', label: 'Background' },
  { key: 'surface_color', label: 'Surface/Card' },
  { key: 'header_color', label: 'Header Bg' },
  { key: 'footer_color', label: 'Footer Bg' },
  { key: 'text_primary_color', label: 'Text Primary' },
  { key: 'text_secondary_color', label: 'Text Secondary' },
  { key: 'button_bg_color', label: 'Button Bg' },
  { key: 'button_text_color', label: 'Button Text' },
  { key: 'button_hover_color', label: 'Button Hover' },
  { key: 'success_color', label: 'Success' },
  { key: 'warning_color', label: 'Warning' },
  { key: 'error_color', label: 'Error' },
  { key: 'border_color', label: 'Border' },
];

const TYPOGRAPHY_FIELDS = [
  { key: 'font_family', label: 'Font Family', type: 'text', placeholder: 'Inter, system-ui, sans-serif' },
  { key: 'heading_font_size', label: 'Heading Size', type: 'text', placeholder: '2.5rem' },
  { key: 'body_font_size', label: 'Body Size', type: 'text', placeholder: '1rem' },
  { key: 'font_weight', label: 'Font Weight', type: 'text', placeholder: '400' },
  { key: 'line_height', label: 'Line Height', type: 'text', placeholder: '1.6' },
];

const LAYOUT_FIELDS = [
  { key: 'container_width', label: 'Container Width', type: 'text', placeholder: '1280px' },
  { key: 'grid_columns', label: 'Grid Columns', type: 'number', placeholder: '4' },
  { key: 'card_style', label: 'Card Style', type: 'text', placeholder: 'rounded-xl' },
  { key: 'border_radius', label: 'Border Radius', type: 'text', placeholder: '0.75rem' },
  { key: 'box_shadow', label: 'Box Shadow', type: 'text', placeholder: '0 1px 3px rgba(0,0,0,0.1)' },
  { key: 'section_spacing', label: 'Section Spacing', type: 'text', placeholder: '4rem' },
  { key: 'header_height', label: 'Header Height', type: 'text', placeholder: '4rem' },
  { key: 'footer_height', label: 'Footer Height', type: 'text', placeholder: 'auto' },
];

const BUTTON_FIELDS = [
  { key: 'button_border_radius', label: 'Border Radius', type: 'text', placeholder: '0.5rem' },
  { key: 'button_padding', label: 'Padding', type: 'text', placeholder: '0.75rem 1.5rem' },
  { key: 'button_hover_animation', label: 'Hover Animation', type: 'select', options: ['scale', 'lift', 'glow', 'none'] },
  { key: 'button_shadow', label: 'Shadow', type: 'text', placeholder: '0 4px 6px rgba(0,0,0,0.1)' },
];

function ColorPicker({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider truncate" title={label}>{label}</label>
      <div className="relative flex items-center">
        <input 
          type="color" 
          value={value || '#000000'} 
          onChange={e => onChange(e.target.value)} 
          className="absolute left-1.5 top-1.5 w-7 h-7 rounded cursor-pointer opacity-0 z-10" 
        />
        <div className="absolute left-2 w-6 h-6 rounded-md shadow-sm border border-black/10 pointer-events-none z-0" style={{ backgroundColor: value || '#000000' }} />
        <input 
          type="text" 
          value={value || ''} 
          onChange={e => onChange(e.target.value)} 
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white uppercase" 
        />
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function ThemePreview({ theme }) {
  return (
    <div className="sticky top-6">
      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 pl-1">Live Preview</h3>
      
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform transition-all hover:scale-[1.01]">
        {theme.preview_image && (
          <div className="h-32 w-full overflow-hidden border-b border-gray-100">
            <img src={toFullUrl(theme.preview_image)} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="p-0 flex flex-col min-h-[300px]" style={{ backgroundColor: theme.background_color }}>
          {/* Mock Header */}
          <div className="px-4 py-3 flex items-center justify-between shadow-sm" style={{ backgroundColor: theme.header_color }}>
            <div className="w-24 h-5 rounded" style={{ backgroundColor: theme.primary_color }}></div>
            <div className="flex gap-3">
              <div className="w-8 h-2 rounded" style={{ backgroundColor: theme.text_primary_color, opacity: 0.7 }}></div>
              <div className="w-8 h-2 rounded" style={{ backgroundColor: theme.text_primary_color, opacity: 0.7 }}></div>
            </div>
          </div>

          {/* Mock Body */}
          <div className="p-6 flex-1 space-y-4">
            <h1 style={{ color: theme.text_primary_color, fontFamily: theme.font_family, fontWeight: 'bold', fontSize: '1.5rem' }}>Hero Heading</h1>
            <p style={{ color: theme.text_secondary_color, fontFamily: theme.font_family, fontSize: theme.body_font_size, lineHeight: theme.line_height }}>
              This is a preview of how your typography and colors will look together on the main background.
            </p>
            
            <div className="flex gap-3 pt-2">
              <button style={{ backgroundColor: theme.primary_color, color: theme.button_text_color, borderRadius: theme.button_border_radius, padding: theme.button_padding, boxShadow: theme.button_shadow, border: 'none', fontWeight: 'bold' }}>
                Primary Action
              </button>
              <button style={{ backgroundColor: 'transparent', color: theme.primary_color, borderRadius: theme.button_border_radius, padding: theme.button_padding, border: `2px solid ${theme.primary_color}`, fontWeight: 'bold' }}>
                Secondary
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 shadow-sm" style={{ backgroundColor: theme.surface_color, borderRadius: theme.border_radius, border: `1px solid ${theme.border_color}` }}>
                <h3 style={{ color: theme.text_primary_color, fontWeight: 'bold', marginBottom: '0.5rem' }}>Feature Card</h3>
                <p style={{ color: theme.text_secondary_color, fontSize: '0.875rem' }}>Card surface example.</p>
              </div>
              <div className="space-y-2 flex flex-col justify-center">
                <div className="px-3 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: theme.success_color + '20', color: theme.success_color, border: `1px solid ${theme.success_color}40` }}>Success State</div>
                <div className="px-3 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: theme.error_color + '20', color: theme.error_color, border: `1px solid ${theme.error_color}40` }}>Error State</div>
              </div>
            </div>
          </div>

          {/* Mock Footer */}
          <div className="px-4 py-4 mt-auto" style={{ backgroundColor: theme.footer_color }}>
            <div className="w-16 h-2 rounded mb-2" style={{ backgroundColor: theme.text_secondary_color, opacity: 0.5 }}></div>
            <div className="w-32 h-2 rounded" style={{ backgroundColor: theme.text_secondary_color, opacity: 0.5 }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaPicker({ value, onSelect, onClear }) {
  const [showMediaLib, setShowMediaLib] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);

  const loadMedia = async () => {
    try { const res = await mediaService.list({ media_type: 'image' }); setMediaItems(res.data); } catch {}
  };

  useEffect(() => { if (showMediaLib) loadMedia(); }, [showMediaLib]);

  return (
    <div>
      <div className="flex gap-2 relative">
        <input 
          type="text" 
          value={value || ''} 
          onChange={e => onSelect(e.target.value)} 
          placeholder="https://example.com/preview.png" 
          className="flex-1 pl-3 pr-8 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50" 
        />
        {value && (
          <button type="button" onClick={onClear} className="absolute right-24 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
        <button type="button" onClick={() => setShowMediaLib(true)} className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">Browse</button>
      </div>

      {showMediaLib && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowMediaLib(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Select Preview Image</h3>
              <button onClick={() => setShowMediaLib(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto min-h-[300px]">
              {mediaItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <p className="text-gray-500 font-medium">Your media library is empty.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {mediaItems.map(m => (
                    <div 
                      key={m.id} 
                      className="group cursor-pointer rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all bg-gray-50 relative" 
                      onClick={() => { onSelect(m.url); setShowMediaLib(false); }}
                    >
                      <img src={toFullUrl(m.url)} alt={m.alt_text} className="w-full h-24 object-contain p-2" />
                      <div className="p-2 border-t border-gray-100 bg-white">
                        <p className="text-xs text-gray-600 truncate font-medium">{m.original_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeCard({ theme, isSelected, onClick, onActivate, onActivateDark, onDuplicate, onDelete }) {
  return (
    <div 
      className={`group relative rounded-2xl border-2 transition-all cursor-pointer overflow-hidden flex flex-col ${
        isSelected ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-md transform scale-[1.02]' : 
        ((theme.is_active || theme.is_active_dark) ? 'border-blue-300 shadow-sm' : 'border-gray-200 hover:border-blue-400 hover:shadow-md')
      }`}
      onClick={() => onClick()}
    >
      {/* Status Badges */}
      <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 items-end pointer-events-none">
        {theme.is_active && <span className="bg-blue-600 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full shadow-sm">Light Active</span>}
        {theme.is_active_dark && <span className="bg-slate-900 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full shadow-sm">Dark Active</span>}
      </div>

      {theme.preview_image ? (
        <div className="h-32 overflow-hidden bg-gray-100 relative">
          <img src={toFullUrl(theme.preview_image)} alt={theme.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ) : (
        <div className="h-32 flex flex-col" style={{ backgroundColor: theme.background_color }}>
          <div className="h-1/3 w-full opacity-50" style={{ backgroundColor: theme.header_color }}></div>
          <div className="flex-1 flex items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: theme.primary_color }}></div>
            <div className="w-8 h-8 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: theme.secondary_color }}></div>
            <div className="w-8 h-8 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: theme.accent_color }}></div>
          </div>
          <div className="h-1/4 w-full opacity-50" style={{ backgroundColor: theme.footer_color }}></div>
        </div>
      )}
      
      <div className="p-4 bg-white flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 truncate mb-3">{theme.name}</h3>
        
        <div className="flex flex-wrap gap-2 text-xs mt-auto">
          {!theme.is_active && (
            <button onClick={e => { e.stopPropagation(); onActivate(theme, false); }} className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-medium transition-colors">Set Light</button>
          )}
          {!theme.is_active_dark && (
            <button onClick={e => { e.stopPropagation(); onActivate(theme, true); }} className="px-2 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium transition-colors">Set Dark</button>
          )}
          <div className="flex gap-1 ml-auto">
            <button onClick={e => { e.stopPropagation(); onDuplicate(theme); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Duplicate">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(theme); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ThemeSettings() {
  const [themes, setThemes] = useState([]);
  const [activeTheme, setActiveTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [form, setForm] = useState({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  const load = async () => {
    setLoading(true);
    try {
      const res = await themeService.listThemes();
      setThemes(res.data);
      const active = res.data.find(t => t.is_active || t.is_active_dark);
      if (active) {
        setActiveTheme(active);
        setForm(active);
        setThemeName(active.name);
        setIsDarkMode(active.is_dark_mode);
      } else if (res.data.length > 0) {
        setActiveTheme(res.data[0]);
        setForm(res.data[0]);
        setThemeName(res.data[0].name);
        setIsDarkMode(res.data[0].is_dark_mode);
      }
    } catch (err) {
      showToast('error', err.response?.data?.detail || err.message || 'Failed to load themes');
    } finally { setLoading(false); }
  };

  const handleFieldChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!activeTheme) return;
    setSaving(true);
    try {
      const res = await themeService.updateTheme(activeTheme.id, { ...form, name: themeName, is_dark_mode: isDarkMode });
      setActiveTheme(res.data);
      showToast('success', 'Theme saved successfully');
      load();
    } catch (err) { 
      showToast('error', err.response?.data?.detail || 'Failed to save theme'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleActivate = async (theme, isDark = false) => {
    try {
      const payload = { ...theme };
      if (isDark) {
        payload.is_active_dark = true;
      } else {
        payload.is_active = true;
      }
      await themeService.updateTheme(theme.id, payload);
      showToast('success', `Activated "${theme.name}" as ${isDark ? 'Dark' : 'Light'} theme`);
      load();
    } catch (err) { 
      showToast('error', err.response?.data?.detail || 'Failed to activate theme'); 
    }
  };

  const handleDuplicate = async (theme) => {
    try {
      await themeService.duplicateTheme(theme.id);
      showToast('success', `Duplicated "${theme.name}"`);
      load();
    } catch (err) { 
      showToast('error', err.response?.data?.detail || 'Failed to duplicate theme'); 
    }
  };

  const handleCreate = async () => {
    try {
      await themeService.createTheme({ name: 'New Theme' });
      setShowNewForm(false);
      showToast('success', 'Created new blank theme');
      load();
    } catch (err) { 
      showToast('error', err.response?.data?.detail || 'Failed to create theme'); 
    }
  };

  const handleDelete = async (theme) => {
    if (!confirm(`Delete "${theme.name}"?`)) return;
    try {
      await themeService.deleteTheme(theme.id);
      showToast('success', 'Theme deleted');
      load();
    } catch (err) { 
      showToast('error', err.response?.data?.detail || 'Failed to delete theme'); 
    }
  };

  const selectTheme = (theme) => {
    setActiveTheme(theme);
    setForm(theme);
    setThemeName(theme.name);
    setIsDarkMode(theme.is_dark_mode);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-in slide-in-from-right flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {toast.type === 'error' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            Theme Editor
          </h1>
          <p className="text-sm text-gray-500 mt-1">Customize colors, typography, and layout. Changes apply instantly to the preview.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowNewForm(true)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
            + New Theme
          </button>
          {activeTheme && (
            <button 
              onClick={handleSave} 
              disabled={saving} 
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm focus:ring-4 focus:ring-blue-100"
            >
              {saving ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              )}
              {saving ? 'Saving...' : 'Save Theme'}
            </button>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 pl-1">Available Themes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {themes.map(t => (
            <ThemeCard
              key={t.id}
              theme={t}
              isSelected={activeTheme?.id === t.id}
              onClick={() => selectTheme(t)}
              onActivate={handleActivate}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      {showNewForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowNewForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Create New Theme</h2>
            <p className="text-sm text-gray-600 mb-6">Create a new blank theme from scratch, or duplicate the currently selected theme to make variations.</p>
            <div className="flex flex-col gap-3">
              {activeTheme && (
                <button onClick={() => { handleDuplicate(activeTheme); setShowNewForm(false); }} className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  Duplicate Current Theme
                </button>
              )}
              <button onClick={handleCreate} className="w-full px-4 py-3 bg-gray-100 text-gray-900 font-medium rounded-xl hover:bg-gray-200 transition-colors">
                Create Blank Theme
              </button>
              <button onClick={() => setShowNewForm(false)} className="w-full px-4 py-3 text-gray-500 font-medium rounded-xl hover:bg-gray-50 mt-2 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTheme ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            
            <SectionCard 
              title="Theme Settings" 
              icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Theme Name</label>
                  <input type="text" value={themeName} onChange={e => setThemeName(e.target.value)} placeholder="e.g. Ocean Blue" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
                </div>
                <div className="flex items-center h-[70px]">
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl hover:bg-gray-50 w-full transition-colors">
                    <input type="checkbox" checked={isDarkMode} onChange={e => setIsDarkMode(e.target.checked)} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                    <span className="text-sm font-semibold text-gray-700">Dark Mode Optimized</span>
                  </label>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Preview Image</label>
                  <MediaPicker
                    value={form.preview_image}
                    onSelect={v => handleFieldChange('preview_image', v)}
                    onClear={() => handleFieldChange('preview_image', null)}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard 
              title="Color Palette" 
              icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
                {COLOR_FIELDS.map(f => (
                  <ColorPicker key={f.key} label={f.label} value={form[f.key] || ''} onChange={v => handleFieldChange(f.key, v)} />
                ))}
              </div>
            </SectionCard>

            <SectionCard 
              title="Typography" 
              icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {TYPOGRAPHY_FIELDS.map(f => (
                  <div key={f.key} className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider truncate">{f.label}</label>
                    <input type={f.type} value={form[f.key] || ''} onChange={e => handleFieldChange(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard 
              title="Layout & Spacing" 
              icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {LAYOUT_FIELDS.map(f => (
                  <div key={f.key} className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider truncate">{f.label}</label>
                    {f.type === 'number' ? (
                      <input type="number" value={form[f.key] || ''} onChange={e => handleFieldChange(f.key, parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
                    ) : (
                      <input type="text" value={form[f.key] || ''} onChange={e => handleFieldChange(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard 
              title="Button Styles" 
              icon={<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {BUTTON_FIELDS.map(f => (
                  <div key={f.key} className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider truncate">{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={form[f.key] || ''} onChange={e => handleFieldChange(f.key, e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white">
                        {f.options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                      </select>
                    ) : (
                      <input type={f.type} value={form[f.key] || ''} onChange={e => handleFieldChange(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

          </div>

          <div>
            <ThemePreview theme={{ ...form, name: themeName }} />
          </div>
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Themes Available</h2>
          <p className="text-gray-500 mb-6">Create your first theme to customize the look and feel of your store.</p>
          <button onClick={() => setShowNewForm(true)} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            + Create New Theme
          </button>
        </div>
      )}
    </div>
  );
}

export default ThemeSettings;
