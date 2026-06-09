import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import settingsService from '../../services/settingsService';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { useAuth } from '../../context/AuthContext';
import { ResetDatabaseModal } from '../../components/ResetDatabaseModal';

const ICONS = {
  palette: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" /><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" /><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" /><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.5-4.5-10-10-10z" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  megaphone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-13-7.5A2 2 0 0 0 4 2.5v19a2 2 0 0 0 3 1.73l13-7.5A2 2 0 0 0 21 16z" />
      <path d="M10 6v12" /><path d="M18 12h3" /><path d="M7 12H4" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  photo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  arrowUpRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
    </svg>
  ),
  sliders: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  ),
  chevronDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
};

const SETTINGS_LINKS = [
  { path: '/admin/settings/theme',    label: 'Theme',     desc: 'Colors, fonts & button styles',     icon: ICONS.palette,      accent: '#534AB7' },
  { path: '/admin/settings/branding', label: 'Branding',  desc: 'Logo, favicon & social links',      icon: ICONS.star,         accent: '#185FA5' },
  { path: '/admin/settings/homepage', label: 'Homepage',  desc: 'Hero sections & banners',           icon: ICONS.home,         accent: '#0F6E56' },
  { path: '/admin/banners',           label: 'Banners',   desc: 'Scheduled promo banners',           icon: ICONS.megaphone,    accent: '#BA7517' },
  { path: '/admin/cms-blocks',        label: 'CMS Blocks',desc: 'Drag-and-drop content blocks',      icon: ICONS.grid,         accent: '#993556' },
  { path: '/admin/media',             label: 'Media',     desc: 'Images, videos & assets',           icon: ICONS.photo,        accent: '#185FA5' },
];

const BOOL_KEYS = new Set(['homepage_video_enabled', 'maintenance_mode', 'enable_delivery_scheduling']);

function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div
      className={`
        fixed top-4 right-4 z-[100] flex items-center gap-2.5
        px-4 py-2.5 rounded-xl text-xs font-medium
        shadow-lg animate-in slide-in-from-right duration-200
        ${toast.type === 'error' ? 'bg-red-800 text-white' : 'bg-purple-700 text-white'}
      `}
    >
      <span className="text-sm">{toast.type === 'error' ? ICONS.alert : ICONS.check}</span>
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 transition-opacity">&times;</button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-5 p-1">
      <div className="h-8 bg-gray-100 rounded-lg w-40" />
      <div className="grid grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 h-24" />
        ))}
      </div>
    </div>
  );
}

function NavCard({ link }) {
  return (
    <Link
      to={link.path}
      className="group flex flex-col gap-3 p-4 bg-white border border-gray-100 rounded-xl
                 hover:border-gray-200 hover:bg-gray-50 transition-all duration-150 relative overflow-hidden"
      style={{ '--accent': link.accent }}
    >
      <span
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{ background: link.accent }}
      />
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${link.accent}18` }}
        >
          <span style={{ color: link.accent }}>{link.icon}</span>
        </div>
        <span className="text-gray-300 group-hover:text-gray-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150">
          {ICONS.arrowUpRight}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{link.label}</p>
        <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{link.desc}</p>
      </div>
    </Link>
  );
}

function Toggle({ value, onChange, label }) {
  const isOn = value === 'true';
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-label={label}
        onClick={() => onChange(isOn ? 'false' : 'true')}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
          isOn ? 'bg-purple-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
            isOn ? 'left-[18px]' : 'left-0.5'
          }`}
        />
      </button>
      <span className={`text-[11px] font-medium ${isOn ? 'text-purple-700' : 'text-gray-400'}`}>
        {isOn ? 'on' : 'off'}
      </span>
    </div>
  );
}

function SettingsRow({ s, editingKey, editValue, setEditValue, onEdit, onSave, onCancel, onToggle }) {
  const isEditing = editingKey === s.key;
  const isBool = BOOL_KEYS.has(s.key);

  if (isEditing) {
    return (
      <tr className="bg-gray-50/70">
        <td className="px-4 py-3">
          <span className="inline-block font-mono text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
            {s.key}
          </span>
        </td>
        <td className="px-4 py-3" colSpan={2}>
          {isBool ? (
            <Toggle value={editValue} onChange={setEditValue} label={`Edit ${s.key}`} />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="font-mono text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg bg-white
                         focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400
                         min-w-[160px] text-gray-800"
              autoFocus
            />
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onSave(s.key)}
              className="text-[11px] font-medium bg-purple-600 text-white px-3 py-1.5
                         rounded-lg hover:bg-purple-700 transition-colors"
            >
              save
            </button>
            <button
              onClick={onCancel}
              className="text-[11px] text-gray-500 bg-white border border-gray-200 px-2.5 py-1.5
                         rounded-lg hover:bg-gray-50 transition-colors"
            >
              cancel
            </button>
          </div>
        </td>
        <td />
      </tr>
    );
  }

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors duration-100">
      <td className="px-4 py-3">
        <span className="inline-block font-mono text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
          {s.key}
        </span>
      </td>
      <td className="px-4 py-3">
        {isBool ? (
          <Toggle value={s.value} onChange={val => onToggle(s.key, val)} label={`Toggle ${s.key}`} />
        ) : s.value ? (
          <span className="font-mono text-[11.5px] text-gray-500 block max-w-[200px] truncate" title={s.value}>
            {s.value}
          </span>
        ) : (
          <span className="font-mono text-[11px] text-gray-300 italic">empty</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-gray-400 block max-w-[180px] truncate" title={s.description}>
          {s.description || '\u2014'}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onEdit(s.key, s.value)}
          className="text-[11px] text-purple-600 border border-purple-100 bg-transparent
                     px-2.5 py-1 rounded-md hover:bg-purple-50 hover:border-purple-300 transition-all"
        >
          edit
        </button>
      </td>
    </tr>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { reload } = useSiteSettings();
  const { user, logout } = useAuth();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterQ, setFilterQ] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);
  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsService.listSettings();
      setSettings(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key) => {
    try {
      await settingsService.updateSetting(key, { value: editValue });
      setEditingKey(null);
      showToast('Setting saved');
      loadSettings();
      reload();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to save', 'error');
    }
  };

  const handleToggle = async (key, newValue) => {
    try {
      await settingsService.updateSetting(key, { value: newValue });
      showToast('Setting updated');
      loadSettings();
      reload();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update', 'error');
    }
  };

  const filtered = settings.filter(s =>
    s.key.includes(filterQ) ||
    (s.value || '').includes(filterQ) ||
    (s.description || '').includes(filterQ)
  );

  if (loading) return <Skeleton />;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="pb-10">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ResetDatabaseModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onSuccess={() => { logout(); navigate('/login'); }}
      />

      <nav className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-6 tracking-wide">
        <Link to="/admin" className="hover:text-gray-600 transition-colors">dashboard</Link>
        <span>/</span>
        <span className="text-gray-700">settings</span>
      </nav>

      {error && (
        <div className="mb-5 flex items-center justify-between px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-3 opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}

      <div className="flex items-end justify-between gap-4 mb-7">
        <h1 className="text-[32px] font-sans font-light text-gray-900 leading-tight tracking-[-0.03em]">
          Site <span className="font-medium text-purple-600">Settings</span>
        </h1>
        <span className="text-[11px] text-purple-700 bg-purple-50 px-3 py-1 rounded-full self-center">
          {settings.length} settings
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {SETTINGS_LINKS.map(link => (
          <NavCard key={link.path} link={link} />
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-[10px] tracking-widest uppercase text-gray-400">advanced</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowAdvanced(v => !v)}
          aria-expanded={showAdvanced}
          className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-400 flex-shrink-0">
            {ICONS.sliders}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">Raw configuration</p>
            <p className="text-[11px] text-gray-400">Key-value store &middot; edit with care</p>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <span className="text-[11px] text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full">
              {settings.length} keys
            </span>
            <span
              className={`text-gray-400 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
            >
              {ICONS.chevronDown}
            </span>
          </div>
        </button>

        {showAdvanced && (
          <div className="border-t border-gray-100">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {ICONS.search}
                </span>
                <input
                  type="text"
                  placeholder="filter keys\u2026"
                  value={filterQ}
                  onChange={e => setFilterQ(e.target.value)}
                  aria-label="Filter settings"
                  className="w-full pl-7 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg
                             font-mono text-xs text-gray-700 placeholder-gray-300
                             focus:outline-none focus:ring-2 focus:ring-purple-500/15 focus:border-purple-300"
                />
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xs text-gray-400">No settings match your filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" aria-label="Site settings key-value store">
                  <thead>
                    <tr className="bg-gray-50">
                      {['key', 'value', 'description', 'action'].map(h => (
                        <th
                          key={h}
                          className={`px-4 py-2.5 text-[10px] font-medium tracking-widest uppercase text-gray-400 border-b border-gray-100 ${
                            h === 'action' ? 'text-right' : 'text-left'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <SettingsRow
                        key={s.id}
                        s={s}
                        editingKey={editingKey}
                        editValue={editValue}
                        setEditValue={setEditValue}
                        onEdit={(key, val) => { setEditingKey(key); setEditValue(val || ''); }}
                        onSave={handleSave}
                        onCancel={() => setEditingKey(null)}
                        onToggle={handleToggle}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {isAdmin && (
        <>
          <div className="flex items-center gap-3 mb-5 mt-8">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[10px] tracking-widest uppercase text-red-400">danger zone</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="bg-white border border-red-200 rounded-2xl overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-red-600">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Reset Database</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Permanently delete all data and restore the database to its default seed state.
                    A backup will be created automatically before the reset.
                  </p>
                </div>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="flex-shrink-0 text-xs font-medium text-white bg-red-600
                             px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reset Database
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
