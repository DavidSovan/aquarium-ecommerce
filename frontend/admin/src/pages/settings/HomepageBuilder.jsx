import { useState, useEffect, useCallback } from 'react';
import homepageService from '../../services/homepageService';
import mediaService from '../../services/mediaService';
import { toFullUrl } from '../../utils/mediaUrl';

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Section', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { value: 'featured_categories', label: 'Featured Categories', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { value: 'featured_products', label: 'Featured Products', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
  { value: 'promotional', label: 'Promotional', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg> },
  { value: 'testimonials', label: 'Testimonials', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
  { value: 'banner', label: 'Banner Image', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg> },
  { value: 'custom_content', label: 'Custom Content', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
];

const EMPTY_SECTION = {
  section_type: 'hero',
  sort_order: 0,
  is_active: true,
  hero_title: '',
  hero_subtitle: '',
  hero_cta_text: '',
  hero_cta_url: '',
  hero_bg_image: '',
  hero_bg_video_url: '',
  hero_overlay_color: '#0c1445',
  hero_overlay_opacity: 0.6,
  hero_text_color: '#ffffff',
  hero_badge_text: '',
  bg_type: 'color',
  bg_color: '#f9fafb',
  bg_image: '',
  bg_video_url: '',
  content: null,
};

function MediaPicker({ value, onSelect, onClear, placeholder }) {
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
          placeholder={placeholder || "https://example.com/image.jpg"} 
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
              <h3 className="text-xl font-bold text-gray-900">Select Image</h3>
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

function ColorPicker({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider truncate">{label}</label>
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
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 uppercase" 
        />
      </div>
    </div>
  );
}

function SectionEditor({ section, onChange, onDelete, isExpanded, onToggleExpand }) {
  const update = (key, value) => onChange(section.id, key, value);
  const sectionMeta = SECTION_TYPES.find(t => t.value === section.section_type) || { label: section.section_type, icon: null };

  const renderHeroFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Hero Title</label>
        <input type="text" value={section.hero_title || ''} onChange={e => update('hero_title', e.target.value)} placeholder="Catchy Main Headline" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Hero Subtitle</label>
        <textarea value={section.hero_subtitle || ''} onChange={e => update('hero_subtitle', e.target.value)} rows={2} placeholder="A short description to accompany the title" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white resize-none" />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">CTA Button Text</label>
        <input type="text" value={section.hero_cta_text || ''} onChange={e => update('hero_cta_text', e.target.value)} placeholder="e.g. Shop Now" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">CTA Button URL</label>
        <input type="text" value={section.hero_cta_url || ''} onChange={e => update('hero_cta_url', e.target.value)} placeholder="/shop" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Badge Text (Optional)</label>
        <input type="text" value={section.hero_badge_text || ''} onChange={e => update('hero_badge_text', e.target.value)} placeholder="e.g. NEW COLLECTION" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
      </div>
      
      <div className="md:col-span-2 my-2 border-b border-gray-100"></div>

      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Background Image URL</label>
        <MediaPicker value={section.hero_bg_image} onSelect={v => update('hero_bg_image', v)} onClear={() => update('hero_bg_image', '')} />
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Background Video URL (Optional)</label>
        <input type="text" value={section.hero_bg_video_url || ''} onChange={e => update('hero_bg_video_url', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" placeholder="MP4 or YouTube URL" />
      </div>
      
      <ColorPicker label="Overlay Color" value={section.hero_overlay_color} onChange={v => update('hero_overlay_color', v)} />
      
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Overlay Opacity: {Math.round((section.hero_overlay_opacity || 0.6) * 100)}%</label>
        <div className="h-10 flex items-center px-2 bg-gray-50/50 border border-gray-300 rounded-xl">
          <input type="range" min="0" max="1" step="0.05" value={section.hero_overlay_opacity || 0.6} onChange={e => update('hero_overlay_opacity', parseFloat(e.target.value))} className="w-full accent-blue-600" />
        </div>
      </div>

      <ColorPicker label="Text Color" value={section.hero_text_color} onChange={v => update('hero_text_color', v)} />
    </div>
  );

  const renderGenericFields = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Background Type</label>
        <select value={section.bg_type || 'color'} onChange={e => update('bg_type', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white">
          <option value="color">Solid Color</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>
      </div>
      
      {section.bg_type === 'color' && (
        <ColorPicker label="Background Color" value={section.bg_color} onChange={v => update('bg_color', v)} />
      )}
      
      {(section.bg_type === 'image') && (
        <div className="space-y-1 md:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Background Image URL</label>
          <MediaPicker value={section.bg_image} onSelect={v => update('bg_image', v)} onClear={() => update('bg_image', '')} />
        </div>
      )}
      
      {(section.bg_type === 'video') && (
        <div className="space-y-1 md:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Background Video URL</label>
          <input type="text" value={section.bg_video_url || ''} onChange={e => update('bg_video_url', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow bg-gray-50/50 focus:bg-white" />
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all duration-200 overflow-hidden ${section.is_active ? 'border-gray-200' : 'border-gray-200 opacity-75'}`}>
      {/* Header */}
      <div 
        className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors ${isExpanded ? 'border-b border-gray-100 bg-gray-50/50' : ''}`}
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg flex items-center justify-center ${section.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
            {sectionMeta.icon}
          </div>
          <div>
            <h3 className={`font-bold ${section.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
              {sectionMeta.label}
            </h3>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-600">ID: {section.id}</span>
              {section.section_type === 'hero' && section.hero_title && <span className="truncate max-w-[200px]">"{section.hero_title}"</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6" onClick={e => e.stopPropagation()}>
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`relative w-10 h-5 rounded-full transition-colors ${section.is_active ? 'bg-blue-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform transform ${section.is_active ? 'translate-x-5' : 'translate-x-0'} shadow-sm`} />
            </div>
            <input type="checkbox" className="hidden" checked={section.is_active} onChange={e => update('is_active', e.target.checked)} />
            <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 select-none">Active</span>
          </label>
          
          <div className="flex items-center gap-1 border-l border-gray-200 pl-4">
            <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Section">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
            <button onClick={onToggleExpand} className={`p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all ${isExpanded ? 'rotate-180' : ''}`} title="Expand/Collapse">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="p-6 bg-white animate-in slide-in-from-top-2 duration-200 fade-in">
          {section.section_type === 'hero' ? renderHeroFields() : renderGenericFields()}
        </div>
      )}
    </div>
  );
}

export function HomepageBuilder() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSectionType, setNewSectionType] = useState('hero');
  const [toast, setToast] = useState(null);
  const [expandedSectionId, setExpandedSectionId] = useState(null);

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
      const res = await homepageService.list();
      setSections(res.data);
      if (res.data.length > 0 && !expandedSectionId) {
        setExpandedSectionId(res.data[0].id);
      }
    } catch (err) {
      showToast('error', err.response?.data?.detail || err.message || 'Failed to load sections');
    } finally { setLoading(false); }
  };

  const handleSectionChange = useCallback((id, key, value) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s));
  }, []);

  const handleAddSection = async () => {
    try {
      const nextOrder = sections.length;
      const res = await homepageService.create({ ...EMPTY_SECTION, section_type: newSectionType, sort_order: nextOrder });
      setSections(prev => [...prev, res.data]);
      setExpandedSectionId(res.data.id);
      setShowAddModal(false);
      showToast('success', 'New section added');
    } catch (err) {
      showToast('error', err.response?.data?.detail || err.message || 'Failed to add section');
    }
  };

  const handleDeleteSection = async (section) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      await homepageService.delete(section.id);
      setSections(prev => prev.filter(s => s.id !== section.id));
      showToast('success', 'Section deleted');
    } catch (err) {
      showToast('error', err.response?.data?.detail || err.message || 'Failed to delete section');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Create an array of update promises
      const updates = sections.map((section, index) => {
        // Ensure sort_order is strictly tied to array index before saving
        return homepageService.update(section.id, { ...section, sort_order: index });
      });
      await Promise.all(updates);
      showToast('success', 'Homepage layout saved successfully');
    } catch (err) {
      showToast('error', err.response?.data?.detail || err.message || 'Failed to save layout');
    } finally { 
      setSaving(false); 
    }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...sections];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setSections(updated);
  };

  const handleMoveDown = (index) => {
    if (index >= sections.length - 1) return;
    const updated = [...sections];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setSections(updated);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
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
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>
            Homepage Builder
          </h1>
          <p className="text-sm text-gray-500 mt-1">Design your storefront homepage by adding, reordering, and customizing sections.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors shadow-sm">
            + Add Section
          </button>
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
            {saving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Sections Yet</h2>
          <p className="text-gray-500 mb-6 max-w-md text-center">Your homepage is currently empty. Add a Hero section to welcome your customers, or feature some of your best products.</p>
          <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            Add Your First Section
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={section.id} className="flex gap-4 group">
              {/* Reorder Controls */}
              <div className="flex flex-col items-center justify-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleMoveUp(index)} 
                  disabled={index === 0} 
                  className="p-1.5 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 rounded-lg disabled:opacity-30 disabled:hover:text-gray-500 disabled:hover:border-gray-200 transition-colors shadow-sm"
                  title="Move Up"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                </button>
                <div className="text-xs font-bold text-gray-400 py-1">{index + 1}</div>
                <button 
                  onClick={() => handleMoveDown(index)} 
                  disabled={index >= sections.length - 1} 
                  className="p-1.5 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 rounded-lg disabled:opacity-30 disabled:hover:text-gray-500 disabled:hover:border-gray-200 transition-colors shadow-sm"
                  title="Move Down"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              {/* Editor Card */}
              <div className="flex-1">
                <SectionEditor 
                  section={section} 
                  onChange={handleSectionChange} 
                  onDelete={() => handleDeleteSection(section)}
                  isExpanded={expandedSectionId === section.id}
                  onToggleExpand={() => setExpandedSectionId(expandedSectionId === section.id ? null : section.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Add New Section</h2>
            <p className="text-sm text-gray-500 mb-6">Choose the type of section you want to add to your homepage.</p>
            
            <div className="space-y-4 mb-6">
              {SECTION_TYPES.map(t => (
                <label 
                  key={t.value} 
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${newSectionType === t.value ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                >
                  <input 
                    type="radio" 
                    name="section_type" 
                    value={t.value} 
                    checked={newSectionType === t.value} 
                    onChange={e => setNewSectionType(e.target.value)}
                    className="hidden"
                  />
                  <div className={`p-2 rounded-lg ${newSectionType === t.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {t.icon}
                  </div>
                  <span className={`font-semibold ${newSectionType === t.value ? 'text-blue-900' : 'text-gray-700'}`}>{t.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 text-gray-600 font-medium rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={handleAddSection} className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">Add Section</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomepageBuilder;
