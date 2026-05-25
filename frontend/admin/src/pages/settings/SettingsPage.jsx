import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import settingsService from '../../services/settingsService';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const SETTINGS_LINKS = [
  { path: '/admin/settings/theme', label: 'Theme Settings', desc: 'Colors, typography, layout, button styles, and more.' },
  { path: '/admin/settings/branding', label: 'Branding Settings', desc: 'Store name, logo, favicon, contact info, social links.' },
  { path: '/admin/settings/homepage', label: 'Homepage Builder', desc: 'Manage hero sections, banners, and homepage content.' },
  { path: '/admin/banners', label: 'Banners', desc: 'Create and manage promotional banners with scheduling.' },
  { path: '/admin/cms-blocks', label: 'CMS Blocks', desc: 'Create unlimited content blocks with drag-and-drop ordering.' },
  { path: '/admin/media', label: 'Media Library', desc: 'Upload images, videos, and manage media assets.' },
];

export function SettingsPage() {
  const { reload } = useSiteSettings();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    try { const res = await settingsService.listSettings(); setSettings(res.data); } catch {} finally { setLoading(false); }
  };

  const handleSave = async (key) => {
    try {
      await settingsService.updateSetting(key, { value: editValue });
      setEditingKey(null);
      loadSettings();
      reload();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleToggle = async (key, currentValue) => {
    const newValue = currentValue === 'true' ? 'false' : 'true';
    try {
      await settingsService.updateSetting(key, { value: newValue });
      loadSettings();
      reload();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {SETTINGS_LINKS.map(link => (
          <Link key={link.path} to={link.path} className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-gray-900">{link.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{link.desc}</p>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          All Settings (Advanced)
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Key</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Value</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {settings.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-sm">{s.key}</td>
                  <td className="px-6 py-4">
                    {editingKey === s.key ? (
                      <div className="flex gap-2 items-center">
                        {s.key === 'homepage_video_enabled' ? (
                          <>
                            <button
                              onClick={() => setEditValue(editValue === 'true' ? 'false' : 'true')}
                              className={`relative w-12 h-6 rounded-full transition-colors ${editValue === 'true' ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${editValue === 'true' ? 'translate-x-6' : ''}`} />
                            </button>
                            <span className="text-xs text-gray-500 font-medium">{editValue === 'true' ? 'Enabled' : 'Disabled'}</span>
                          </>
                        ) : s.key === 'homepage_video_url' && (editValue || '').trim() ? (
                          <div className="flex flex-col gap-2 flex-1">
                            <input value={editValue} onChange={e => setEditValue(e.target.value)} className="px-2 py-1 border rounded text-sm w-full" />
                            {editValue.match(/^https?:\/\/.+\.\w+/) && (
                              /\.(mp4|webm|ogg|mov)(\?|$)/i.test(editValue) ? (
                                <video
                                  key={editValue}
                                  src={editValue}
                                  muted
                                  autoPlay
                                  loop
                                  playsInline
                                  className="w-full max-h-40 object-cover rounded border bg-black"
                                  onError={e => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : (
                                <img
                                  key={editValue}
                                  src={editValue}
                                  alt="Preview"
                                  className="w-full max-h-40 object-contain rounded border bg-gray-100"
                                  onError={e => { e.currentTarget.style.display = 'none'; }}
                                />
                              )
                            )}
                          </div>
                        ) : (
                          <input value={editValue} onChange={e => setEditValue(e.target.value)} className="flex-1 px-2 py-1 border rounded text-sm" />
                        )}
                        <button onClick={() => handleSave(s.key)} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Save</button>
                        <button onClick={() => setEditingKey(null)} className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300">Cancel</button>
                      </div>
                    ) : s.key === 'homepage_video_enabled' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(s.key, s.value)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${s.value === 'true' ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${s.value === 'true' ? 'translate-x-6' : ''}`} />
                        </button>
                        <span className="text-xs text-gray-500 font-medium">{s.value === 'true' ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-600">{s.value || '-'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.description || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    {s.key !== 'homepage_video_enabled' && (
                      <button onClick={() => { setEditingKey(s.key); setEditValue(s.value || ''); }} className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
