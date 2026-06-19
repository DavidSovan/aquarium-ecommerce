import { useState, useEffect } from 'react';
import brandingService from '../../services/brandingService';
import mediaService from '../../services/mediaService';
import { toFullUrl } from '../../utils/mediaUrl';

const SOCIAL_FIELDS = [
  { key: 'social_facebook', label: 'Facebook', icon: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
  ), placeholder: "https://facebook.com/yourpage" },
  { key: 'social_twitter', label: 'Twitter / X', icon: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
  ), placeholder: "https://x.com/yourhandle" },
  { key: 'social_instagram', label: 'Instagram', icon: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
  ), placeholder: "https://instagram.com/yourpage" },
  { key: 'social_youtube', label: 'YouTube', icon: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
  ), placeholder: "https://youtube.com/c/yourchannel" },
  { key: 'social_linkedin', label: 'LinkedIn', icon: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
  ), placeholder: "https://linkedin.com/company/yourcompany" },
];

function MediaPicker({ label, value, onSelect, onClear, helperText }) {
  const [showMediaLib, setShowMediaLib] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);

  const loadMedia = async () => {
    try { const res = await mediaService.list({ media_type: 'image' }); setMediaItems(res.data); } catch {}
  };

  useEffect(() => { if (showMediaLib) loadMedia(); }, [showMediaLib]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">{label}</label>
        {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
      </div>
      
      <div className="flex gap-2 items-start">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2 relative">
            <input 
              type="text" 
              value={value || ''} 
              onChange={e => onSelect(e.target.value)} 
              placeholder="https://example.com/image.png" 
              className="flex-1 pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow" 
            />
            {value && (
              <button 
                type="button" 
                onClick={onClear} 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                title="Clear"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
          <button 
            type="button" 
            onClick={() => setShowMediaLib(true)} 
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 hover:border-gray-300 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Browse Library
          </button>
        </div>
        
        <div className="w-24 h-24 flex-shrink-0 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden relative group">
          {value ? (
            <>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZWVlIi8+CjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNlZWUiLz4KPC9zdmc+')] opacity-50 z-0" />
              <img src={toFullUrl(value)} alt={label} className="w-full h-full object-contain p-2 relative z-10 drop-shadow-sm" />
            </>
          ) : (
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          )}
        </div>
      </div>

      {showMediaLib && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowMediaLib(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full mx-4 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Select Image</h3>
              <button onClick={() => setShowMediaLib(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto min-h-[300px]">
              {mediaItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  <p className="text-gray-500 font-medium">Your media library is empty.</p>
                  <p className="text-sm text-gray-400 mt-1">Go to Media Library to upload images.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {mediaItems.map(m => (
                    <div 
                      key={m.id} 
                      className="group cursor-pointer rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm hover:shadow-md bg-gray-50 relative" 
                      onClick={() => { onSelect(m.url); setShowMediaLib(false); }}
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && (onSelect(m.url), setShowMediaLib(false))}
                    >
                      <div className="aspect-square relative">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZWVlIi8+CjxyZWN0IHg9IjQiIHk9IjQiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNlZWUiLz4KPC9zdmc+')] opacity-30 z-0" />
                        <img src={toFullUrl(m.url)} alt={m.alt_text} className="w-full h-full object-contain p-2 relative z-10" />
                        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center">
                          <span className="bg-white text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transform scale-90 group-hover:scale-100 transition-transform">Select</span>
                        </div>
                      </div>
                      <div className="p-2 border-t border-gray-100 bg-white">
                        <p className="text-xs text-gray-600 truncate font-medium">{m.original_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowMediaLib(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
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
  const [toast, setToast] = useState(null);

  useEffect(() => { load(); }, []);
  
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const load = async () => {
    try {
      const res = await brandingService.get();
      setForm(res.data || {});
    } catch {
      setToast({ type: 'error', message: 'Failed to load branding settings' });
    } finally { 
      setLoading(false); 
    }
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await brandingService.update(form);
      setToast({ type: 'success', message: 'Branding settings saved successfully' });
      load();
    } catch (err) { 
      setToast({ type: 'error', message: err.response?.data?.detail || 'Failed to save settings' });
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
            Branding & Identity
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store's public appearance, logos, and contact information.</p>
        </div>
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
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column - Forms */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Store Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <h2 className="text-lg font-bold text-gray-900">Store Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Store Name</label>
                  <input type="text" value={form.store_name || ''} onChange={e => handleChange('store_name', e.target.value)} placeholder="e.g. My Awesome Aquarium" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Tagline</label>
                  <input type="text" value={form.tagline || ''} onChange={e => handleChange('tagline', e.target.value)} placeholder="e.g. The best fish in town" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact Email</label>
                  <input type="email" value={form.contact_email || ''} onChange={e => handleChange('contact_email', e.target.value)} placeholder="hello@example.com" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact Phone</label>
                  <input type="text" value={form.contact_phone || ''} onChange={e => handleChange('contact_phone', e.target.value)} placeholder="+1 (555) 123-4567" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact Address</label>
                  <textarea value={form.contact_address || ''} onChange={e => handleChange('contact_address', e.target.value)} placeholder="123 Main St, City, Country" rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white resize-none" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Copyright Text</label>
                  <input type="text" value={form.copyright_text || ''} onChange={e => handleChange('copyright_text', e.target.value)} placeholder="© 2024 Your Company. All rights reserved." className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Media & Logos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <h2 className="text-lg font-bold text-gray-900">Logos & Favicon</h2>
            </div>
            <div className="p-6 space-y-8 divide-y divide-gray-100">
              <div className="pt-2">
                <MediaPicker 
                  label="Primary Store Logo" 
                  helperText="Used in the main header and email templates. Best size: 200x50px."
                  value={form.store_logo} 
                  onSelect={v => handleChange('store_logo', v)} 
                  onClear={() => handleChange('store_logo', null)} 
                />
              </div>
              <div className="pt-8">
                <MediaPicker 
                  label="Footer Logo (Optional)" 
                  helperText="Alternative logo displayed in the dark footer. Usually white or monochrome."
                  value={form.footer_logo} 
                  onSelect={v => handleChange('footer_logo', v)} 
                  onClear={() => handleChange('footer_logo', null)} 
                />
              </div>
              <div className="pt-8">
                <MediaPicker 
                  label="Favicon" 
                  helperText="The small icon shown in browser tabs. Must be a square image."
                  value={form.favicon} 
                  onSelect={v => handleChange('favicon', v)} 
                  onClear={() => handleChange('favicon', null)} 
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              <h2 className="text-lg font-bold text-gray-900">Social Media Links</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SOCIAL_FIELDS.map(f => (
                  <div key={f.key} className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">{f.label}</label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 text-gray-400 pointer-events-none">
                        {f.icon}
                      </div>
                      <input 
                        type="url" 
                        value={form[f.key] || ''} 
                        onChange={e => handleChange(f.key, e.target.value)} 
                        placeholder={f.placeholder}
                        className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column - Preview */}
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 pl-1">Live Preview</h3>
            
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform transition-all hover:scale-[1.01]">
              
              {/* Header Preview */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  {form.store_logo ? (
                    <img src={toFullUrl(form.store_logo)} alt="Logo" className="h-8 max-w-[120px] object-contain" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      {form.store_name ? form.store_name.charAt(0) : 'S'}
                    </div>
                  )}
                  {!form.store_logo && (
                    <span className="font-bold text-gray-900 truncate max-w-[120px]">{form.store_name || 'Store Name'}</span>
                  )}
                </div>
                <div className="flex gap-4 text-xs font-medium text-gray-500">
                  <span>Home</span>
                  <span>Shop</span>
                </div>
              </div>

              {/* Body Preview Area */}
              <div className="bg-gray-50 p-8 flex flex-col items-center justify-center min-h-[200px] text-center border-b border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{form.store_name || 'Store Name'}</h3>
                {form.tagline && <p className="text-sm text-gray-600 mb-4">{form.tagline}</p>}
                
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mt-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Preview Area
                </div>
              </div>

              {/* Footer Preview */}
              <div className="bg-slate-900 p-6 text-white">
                <div className="flex flex-col items-center text-center space-y-4">
                  {form.footer_logo ? (
                    <img src={toFullUrl(form.footer_logo)} alt="Footer Logo" className="h-8 object-contain" />
                  ) : form.store_logo ? (
                    <img src={toFullUrl(form.store_logo)} alt="Logo" className="h-8 object-contain brightness-0 invert opacity-90" />
                  ) : (
                    <span className="font-bold text-xl tracking-tight">{form.store_name || 'Store Name'}</span>
                  )}
                  
                  <div className="text-xs text-slate-400 space-y-1">
                    {form.contact_address && <p>{form.contact_address}</p>}
                    {(form.contact_email || form.contact_phone) && (
                      <p className="flex items-center justify-center gap-3">
                        {form.contact_email && <span>{form.contact_email}</span>}
                        {form.contact_phone && <span>{form.contact_phone}</span>}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center gap-4 pt-2">
                    {SOCIAL_FIELDS.filter(f => form[f.key]).map(f => (
                      <span key={f.key} className="text-slate-400 hover:text-white transition-colors cursor-pointer" title={f.label}>
                        {f.icon}
                      </span>
                    ))}
                  </div>

                  <div className="w-full h-px bg-slate-800 my-2" />
                  
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {form.copyright_text || `© ${new Date().getFullYear()} ${form.store_name || 'Store'}. All rights reserved.`}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BrandingSettings;
