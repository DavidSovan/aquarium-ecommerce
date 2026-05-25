import { useState, useEffect } from 'react';
import brandingService from '../../services/brandingService';
import mediaService from '../../services/mediaService';

const SOCIAL_FIELDS = [
  { key: 'social_facebook', label: 'Facebook URL', icon: 'f' },
  { key: 'social_twitter', label: 'Twitter/X URL', icon: 'X' },
  { key: 'social_instagram', label: 'Instagram URL', icon: 'IG' },
  { key: 'social_youtube', label: 'YouTube URL', icon: 'YT' },
  { key: 'social_linkedin', label: 'LinkedIn URL', icon: 'LI' },
];

function MediaPicker({ label, value, onSelect, onClear }) {
  const [showMediaLib, setShowMediaLib] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);

  const loadMedia = async () => {
    try { const res = await mediaService.list({ media_type: 'image' }); setMediaItems(res.data); } catch {}
  };

  useEffect(() => { if (showMediaLib) loadMedia(); }, [showMediaLib]);

  return (
    <div>
      <label className="text-sm text-gray-600 block mb-1">{label}</label>
      <div className="flex gap-2">
        <input type="text" value={value || ''} onChange={e => onSelect(e.target.value)} placeholder="https://example.com/image.jpg" className="flex-1 px-3 py-2 border rounded-lg text-sm" />
        <button type="button" onClick={() => setShowMediaLib(true)} className="px-3 py-2 bg-gray-100 border rounded-lg text-sm hover:bg-gray-200">Browse</button>
        {value && <button type="button" onClick={onClear} className="px-3 py-2 text-red-500 hover:text-red-700 text-sm">Clear</button>}
      </div>
      {value && <img src={value} alt={label} className="mt-2 h-16 w-auto object-contain border rounded" />}

      {showMediaLib && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowMediaLib(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Select Image</h3>
            <div className="grid grid-cols-4 gap-3">
              {mediaItems.map(m => (
                <div key={m.id} className="cursor-pointer border rounded-lg overflow-hidden hover:border-blue-500" onClick={() => { onSelect(m.url); setShowMediaLib(false); }}>
                  <img src={m.url} alt={m.alt_text} className="w-full h-24 object-cover" />
                  <p className="text-xs text-gray-500 truncate p-1">{m.original_name}</p>
                </div>
              ))}
            </div>
            {mediaItems.length === 0 && <p className="text-gray-500 text-center py-8">No images in media library. Upload some first.</p>}
            <button onClick={() => setShowMediaLib(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BrandingSettings() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await brandingService.get();
      setForm(res.data);
    } catch {} finally { setLoading(false); }
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await brandingService.update(form);
      load();
    } catch (err) { alert(err.response?.data?.detail || 'Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading branding settings...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Branding Settings</h1>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Store Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Store Name</label>
                <input type="text" value={form.store_name || ''} onChange={e => handleChange('store_name', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Contact Email</label>
                <input type="email" value={form.contact_email || ''} onChange={e => handleChange('contact_email', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Contact Phone</label>
                <input type="text" value={form.contact_phone || ''} onChange={e => handleChange('contact_phone', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Contact Address</label>
                <textarea value={form.contact_address || ''} onChange={e => handleChange('contact_address', e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Copyright Text</label>
                <input type="text" value={form.copyright_text || ''} onChange={e => handleChange('copyright_text', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Social Media Links</h2>
            <div className="space-y-4">
              {SOCIAL_FIELDS.map(f => (
                <div key={f.key}>
                  <label className="text-sm text-gray-600 block mb-1">{f.label}</label>
                  <input type="url" value={form[f.key] || ''} onChange={e => handleChange(f.key, e.target.value)} placeholder={`https://${f.icon.toLowerCase()}.com/...`} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Logos & Favicon</h2>
            <div className="space-y-6">
              <MediaPicker label="Store Logo" value={form.store_logo} onSelect={v => handleChange('store_logo', v)} onClear={() => handleChange('store_logo', null)} />
              <MediaPicker label="Favicon" value={form.favicon} onSelect={v => handleChange('favicon', v)} onClear={() => handleChange('favicon', null)} />
              <MediaPicker label="Footer Logo" value={form.footer_logo} onSelect={v => handleChange('footer_logo', v)} onClear={() => handleChange('footer_logo', null)} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b">Preview</h2>
            <div className="p-6 border rounded-lg text-center space-y-3">
              {form.store_logo && <img src={form.store_logo} alt="Logo" className="h-12 mx-auto object-contain" />}
              <h3 className="text-xl font-bold">{form.store_name || 'Store Name'}</h3>
              {form.contact_email && <p className="text-sm text-gray-500">{form.contact_email}</p>}
              {form.contact_phone && <p className="text-sm text-gray-500">{form.contact_phone}</p>}
              <div className="flex justify-center gap-3 pt-2">
                {form.social_facebook && <span className="text-blue-600 text-sm">Facebook</span>}
                {form.social_instagram && <span className="text-pink-600 text-sm">Instagram</span>}
                {form.social_twitter && <span className="text-gray-600 text-sm">Twitter</span>}
              </div>
              <p className="text-xs text-gray-400 pt-2">{form.copyright_text || 'All rights reserved.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandingSettings;
