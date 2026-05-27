import { useState, useEffect } from 'react';
import themeService from '../../services/themeService';
import mediaService from '../../services/mediaService';
import { toFullUrl } from '../../utils/mediaUrl';

const COLOR_FIELDS = [
  { key: 'primary_color', label: 'Primary Color' },
  { key: 'secondary_color', label: 'Secondary Color' },
  { key: 'accent_color', label: 'Accent Color' },
  { key: 'background_color', label: 'Background Color' },
  { key: 'surface_color', label: 'Surface/Card Color' },
  { key: 'header_color', label: 'Header Color' },
  { key: 'footer_color', label: 'Footer Color' },
  { key: 'text_primary_color', label: 'Text Primary' },
  { key: 'text_secondary_color', label: 'Text Secondary' },
  { key: 'button_bg_color', label: 'Button Background' },
  { key: 'button_text_color', label: 'Button Text' },
  { key: 'button_hover_color', label: 'Button Hover' },
  { key: 'success_color', label: 'Success Color' },
  { key: 'warning_color', label: 'Warning Color' },
  { key: 'error_color', label: 'Error Color' },
  { key: 'border_color', label: 'Border Color' },
];

const TYPOGRAPHY_FIELDS = [
  { key: 'font_family', label: 'Font Family', type: 'text', placeholder: 'Inter, system-ui, sans-serif' },
  { key: 'heading_font_size', label: 'Heading Font Size', type: 'text', placeholder: '2.5rem' },
  { key: 'body_font_size', label: 'Body Font Size', type: 'text', placeholder: '1rem' },
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
  { key: 'button_border_radius', label: 'Button Border Radius', type: 'text', placeholder: '0.5rem' },
  { key: 'button_padding', label: 'Button Padding', type: 'text', placeholder: '0.75rem 1.5rem' },
  { key: 'button_hover_animation', label: 'Hover Animation', type: 'select', options: ['scale', 'lift', 'glow', 'none'] },
  { key: 'button_shadow', label: 'Button Shadow', type: 'text', placeholder: '0 4px 6px rgba(0,0,0,0.1)' },
];

function ColorPicker({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-gray-600 w-36">{label}</label>
      <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className="px-2 py-1 border rounded text-sm w-24 font-mono" />
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">{title}</h2>
      {children}
    </div>
  );
}

function ThemePreview({ theme }) {
  return (
    <div className="sticky top-6">
      <SectionCard title="Live Preview">
        {theme.preview_image && (
          <img src={toFullUrl(theme.preview_image)} alt="Theme preview" className="w-full h-32 object-cover rounded-lg mb-4 border" />
        )}
        <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: theme.surface_color, border: `1px solid ${theme.border_color}` }}>
          <div className="flex gap-2">
            <button style={{ backgroundColor: theme.primary_color, color: theme.button_text_color, borderRadius: theme.button_border_radius, padding: theme.button_padding, boxShadow: theme.button_shadow, border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
              Primary
            </button>
            <button style={{ backgroundColor: 'transparent', color: theme.primary_color, borderRadius: theme.button_border_radius, padding: theme.button_padding, border: `2px solid ${theme.primary_color}`, cursor: 'pointer', fontSize: '0.875rem' }}>
              Secondary
            </button>
          </div>
          <div className="flex gap-2 text-xs">
            <span style={{ color: theme.success_color }}>Success</span>
            <span style={{ color: theme.warning_color }}>Warning</span>
            <span style={{ color: theme.error_color }}>Error</span>
          </div>
          <p style={{ color: theme.text_primary_color, fontSize: theme.body_font_size, lineHeight: theme.line_height }}>
            Body text example with primary color.
          </p>
          <p style={{ color: theme.text_secondary_color, fontSize: '0.875rem' }}>
            Secondary text example.
          </p>
          <div style={{ backgroundColor: theme.background_color, padding: '0.5rem', borderRadius: theme.border_radius, border: `1px solid ${theme.border_color}` }}>
            <span style={{ color: theme.text_primary_color }}>Card surface</span>
          </div>
        </div>
      </SectionCard>
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
      <div className="flex gap-2">
        <input type="text" value={value || ''} onChange={e => onSelect(e.target.value)} placeholder="https://example.com/preview.png" className="flex-1 px-3 py-2 border rounded text-sm" />
        <button type="button" onClick={() => setShowMediaLib(true)} className="px-3 py-2 bg-gray-100 border rounded text-sm hover:bg-gray-200">Browse</button>
        {value && <button type="button" onClick={onClear} className="px-3 py-2 text-red-500 hover:text-red-700 text-sm">Clear</button>}
      </div>
      {showMediaLib && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowMediaLib(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Select Preview Image</h3>
            <div className="grid grid-cols-4 gap-3">
              {mediaItems.map(m => (
                <div key={m.id} className="cursor-pointer border rounded-lg overflow-hidden hover:border-blue-500" onClick={() => { onSelect(m.url); setShowMediaLib(false); }}>
                  <img src={toFullUrl(m.url)} alt={m.alt_text} className="w-full h-24 object-cover" />
                  <p className="text-xs text-gray-500 truncate p-1">{m.original_name}</p>
                </div>
              ))}
            </div>
            {mediaItems.length === 0 && <p className="text-gray-500 text-center py-8">No images in media library.</p>}
            <button onClick={() => setShowMediaLib(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeCard({ theme, isSelected, onClick, onActivate, onDuplicate, onDelete }) {
  const miniColors = [
    theme.primary_color,
    theme.secondary_color,
    theme.accent_color,
    theme.header_color,
    theme.button_bg_color,
  ];

  return (
    <div
      onClick={onClick}
      className={`relative rounded-lg border-2 cursor-pointer transition-all overflow-hidden ${
        theme.is_active ? 'border-blue-500 ring-2 ring-blue-200' :
        isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      {theme.preview_image ? (
        <div className="h-28 overflow-hidden">
          <img src={toFullUrl(theme.preview_image)} alt={theme.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="h-28 flex items-center justify-center" style={{ backgroundColor: theme.background_color }}>
          <div className="flex gap-1.5">
            {miniColors.map((c, i) => (
              <div key={i} className="w-6 h-6 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm truncate">{theme.name}</h3>
          {theme.is_active && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Active</span>}
        </div>
        <div className="flex gap-1 mt-1.5 text-xs text-gray-400">
          {!theme.is_active && (
            <>
              <button onClick={e => { e.stopPropagation(); onActivate(theme); }} className="text-blue-600 hover:text-blue-700">Activate</button>
              <span>|</span>
              <button onClick={e => { e.stopPropagation(); onDuplicate(theme); }} className="text-gray-500 hover:text-gray-700">Duplicate</button>
              <span>|</span>
              <button onClick={e => { e.stopPropagation(); onDelete(theme); }} className="text-red-500 hover:text-red-700">Delete</button>
            </>
          )}
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
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await themeService.listThemes();
      setThemes(res.data);
      const active = res.data.find(t => t.is_active);
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
      setError(err.response?.data?.detail || err.message || 'Failed to load themes');
    } finally { setLoading(false); }
  };

  const handleFieldChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!activeTheme) return;
    setSaving(true);
    setError(null);
    try {
      const res = await themeService.updateTheme(activeTheme.id, { ...form, name: themeName, is_dark_mode: isDarkMode });
      setActiveTheme(res.data);
      load();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleActivate = async (theme) => {
    setError(null);
    try {
      await themeService.updateTheme(theme.id, { is_active: true });
      load();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to activate'); }
  };

  const handleDuplicate = async (theme) => {
    setError(null);
    try {
      await themeService.duplicateTheme(theme.id);
      load();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to duplicate'); }
  };

  const handleCreate = async () => {
    setError(null);
    try {
      await themeService.createTheme({ name: 'New Theme' });
      setShowNewForm(false);
      load();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to create theme'); }
  };

  const handleDelete = async (theme) => {
    if (!confirm(`Delete "${theme.name}"?`)) return;
    setError(null);
    try {
      await themeService.deleteTheme(theme.id);
      load();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to delete'); }
  };

  const selectTheme = (theme) => {
    setActiveTheme(theme);
    setForm(theme);
    setThemeName(theme.name);
    setIsDarkMode(theme.is_dark_mode);
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading themes...</div>;

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-3 text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Theme Settings</h1>
        <div className="flex gap-2">
          {activeTheme && (
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
          <button onClick={() => setShowNewForm(true)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            + New Theme
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-8">
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

      {showNewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowNewForm(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Create New Theme</h2>
            <p className="text-sm text-gray-600 mb-4">Create a new blank theme or duplicate the current one.</p>
            <div className="flex gap-3">
              <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create Blank</button>
              {activeTheme && <button onClick={() => { handleDuplicate(activeTheme); setShowNewForm(false); }} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Duplicate Current</button>}
              <button onClick={() => setShowNewForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {activeTheme ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SectionCard title="Theme Info">
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 block mb-1">Theme Name</label>
                  <input type="text" value={themeName} onChange={e => setThemeName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <label className="flex items-center gap-2 mt-5 text-sm whitespace-nowrap">
                  <input type="checkbox" checked={isDarkMode} onChange={e => setIsDarkMode(e.target.checked)} className="rounded" />
                  Dark Mode
                </label>
              </div>
              <div className="mt-3">
                <label className="text-sm text-gray-600 block mb-1">Preview Image</label>
                <MediaPicker
                  value={form.preview_image}
                  onSelect={v => handleFieldChange('preview_image', v)}
                  onClear={() => handleFieldChange('preview_image', null)}
                />
              </div>
            </SectionCard>

            <SectionCard title="Colors">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {COLOR_FIELDS.map(f => (
                  <ColorPicker key={f.key} label={f.label} value={form[f.key] || ''} onChange={v => handleFieldChange(f.key, v)} />
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Typography">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TYPOGRAPHY_FIELDS.map(f => (
                  <div key={f.key}>
                    <label className="text-sm text-gray-600 block mb-1">{f.label}</label>
                    <input type={f.type} value={form[f.key] || ''} onChange={e => handleFieldChange(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Layout">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {LAYOUT_FIELDS.map(f => (
                  <div key={f.key}>
                    <label className="text-sm text-gray-600 block mb-1">{f.label}</label>
                    {f.type === 'number' ? (
                      <input type="number" value={form[f.key] || ''} onChange={e => handleFieldChange(f.key, parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border rounded-lg" />
                    ) : (
                      <input type="text" value={form[f.key] || ''} onChange={e => handleFieldChange(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-3 py-2 border rounded-lg" />
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Button Styles">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BUTTON_FIELDS.map(f => (
                  <div key={f.key}>
                    <label className="text-sm text-gray-600 block mb-1">{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={form[f.key] || ''} onChange={e => handleFieldChange(f.key, e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={f.type} value={form[f.key] || ''} onChange={e => handleFieldChange(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-3 py-2 border rounded-lg" />
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Theme Actions">
              <div className="flex gap-3">
                <button onClick={() => handleDuplicate(activeTheme)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">Duplicate</button>
                {!activeTheme.is_active && (
                  <button onClick={() => handleDelete(activeTheme)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
                )}
              </div>
            </SectionCard>
          </div>

          <div>
            <ThemePreview theme={form} />
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          No themes found. Click "+ New Theme" to get started.
        </div>
      )}
    </div>
  );
}

export default ThemeSettings;
