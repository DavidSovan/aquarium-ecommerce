import { useState, useEffect, useCallback } from 'react';
import homepageService from '../../services/homepageService';

const SECTION_TYPES = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'featured_categories', label: 'Featured Categories' },
  { value: 'featured_products', label: 'Featured Products' },
  { value: 'promotional', label: 'Promotional Section' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'banner', label: 'Banner Image' },
  { value: 'custom_content', label: 'Custom Content' },
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

function SectionEditor({ section, onChange, onDelete }) {
  const update = (key, value) => onChange(section.id, key, value);

  const renderHeroFields = () => (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-500 block mb-1">Hero Title</label>
        <input type="text" value={section.hero_title || ''} onChange={e => update('hero_title', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Hero Subtitle</label>
        <textarea value={section.hero_subtitle || ''} onChange={e => update('hero_subtitle', e.target.value)} rows={2} className="w-full px-3 py-2 border rounded text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">CTA Button Text</label>
          <input type="text" value={section.hero_cta_text || ''} onChange={e => update('hero_cta_text', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">CTA Button URL</label>
          <input type="text" value={section.hero_cta_url || ''} onChange={e => update('hero_cta_url', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Badge Text</label>
        <input type="text" value={section.hero_badge_text || ''} onChange={e => update('hero_badge_text', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Background Image URL</label>
        <input type="text" value={section.hero_bg_image || ''} onChange={e => update('hero_bg_image', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Background Video URL</label>
        <input type="text" value={section.hero_bg_video_url || ''} onChange={e => update('hero_bg_video_url', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" placeholder="MP4 or YouTube URL" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Overlay Color</label>
          <div className="flex gap-2">
            <input type="color" value={section.hero_overlay_color || '#0c1445'} onChange={e => update('hero_overlay_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
            <input type="text" value={section.hero_overlay_color || ''} onChange={e => update('hero_overlay_color', e.target.value)} className="flex-1 px-3 py-2 border rounded text-sm font-mono" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Overlay Opacity ({Math.round((section.hero_overlay_opacity || 0.6) * 100)}%)</label>
          <input type="range" min="0" max="1" step="0.05" value={section.hero_overlay_opacity || 0.6} onChange={e => update('hero_overlay_opacity', parseFloat(e.target.value))} className="w-full" />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">Text Color</label>
        <div className="flex gap-2">
          <input type="color" value={section.hero_text_color || '#ffffff'} onChange={e => update('hero_text_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
          <input type="text" value={section.hero_text_color || ''} onChange={e => update('hero_text_color', e.target.value)} className="flex-1 px-3 py-2 border rounded text-sm font-mono" />
        </div>
      </div>
    </div>
  );

  const renderGenericFields = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Background Type</label>
          <select value={section.bg_type || 'color'} onChange={e => update('bg_type', e.target.value)} className="w-full px-3 py-2 border rounded text-sm">
            <option value="color">Color</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>
        {section.bg_type === 'color' && (
          <div>
            <label className="text-xs text-gray-500 block mb-1">Background Color</label>
            <div className="flex gap-2">
              <input type="color" value={section.bg_color || '#f9fafb'} onChange={e => update('bg_color', e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
              <input type="text" value={section.bg_color || ''} onChange={e => update('bg_color', e.target.value)} className="flex-1 px-3 py-2 border rounded text-sm font-mono" />
            </div>
          </div>
        )}
      </div>
      {(section.bg_type === 'image') && (
        <div>
          <label className="text-xs text-gray-500 block mb-1">Background Image URL</label>
          <input type="text" value={section.bg_image || ''} onChange={e => update('bg_image', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
        </div>
      )}
      {(section.bg_type === 'video') && (
        <div>
          <label className="text-xs text-gray-500 block mb-1">Background Video URL</label>
          <input type="text" value={section.bg_video_url || ''} onChange={e => update('bg_video_url', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow mb-4 border-l-4" style={{ borderLeftColor: section.is_active ? '#3b82f6' : '#9ca3af' }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 cursor-move" title="Drag to reorder">⠿</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded font-medium">
              {SECTION_TYPES.find(t => t.value === section.section_type)?.label || section.section_type}
            </span>
            <span className="text-xs text-gray-400">Order: {section.sort_order}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-gray-500">
              <input type="checkbox" checked={section.is_active} onChange={e => update('is_active', e.target.checked)} />
              Active
            </label>
            <button onClick={onDelete} className="text-red-500 hover:text-red-700 text-sm px-2">Delete</button>
          </div>
        </div>

        {section.section_type === 'hero' ? renderHeroFields() : renderGenericFields()}
      </div>
    </div>
  );
}

export function HomepageBuilder() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSectionType, setNewSectionType] = useState('hero');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await homepageService.list();
      setSections(res.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSectionChange = useCallback((id, key, value) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s));
  }, []);

  const handleAddSection = async () => {
    try {
      const nextOrder = sections.length;
      const res = await homepageService.create({ ...EMPTY_SECTION, section_type: newSectionType, sort_order: nextOrder });
      setSections(prev => [...prev, res.data]);
      setShowAddModal(false);
    } catch {}
  };

  const handleDeleteSection = async (section) => {
    if (!confirm('Delete this section?')) return;
    try {
      await homepageService.delete(section.id);
      setSections(prev => prev.filter(s => s.id !== section.id));
    } catch {}
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const section of sections) {
        await homepageService.update(section.id, section);
      }
    } catch (err) { alert('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...sections];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    const reordered = updated.map((s, i) => ({ ...s, sort_order: i }));
    setSections(reordered);
  };

  const handleMoveDown = (index) => {
    if (index >= sections.length - 1) return;
    const updated = [...sections];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    const reordered = updated.map((s, i) => ({ ...s, sort_order: i }));
    setSections(reordered);
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading homepage sections...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Homepage Builder</h1>
          <p className="text-sm text-gray-500 mt-1">Drag to reorder, edit, and manage homepage sections.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Add Section</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No homepage sections yet.</p>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add Your First Section</button>
        </div>
      ) : (
        <div>
          {sections.map((section, index) => (
            <div key={section.id} className="flex items-start gap-2">
              <div className="flex flex-col gap-1 pt-4">
                <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▲</button>
                <button onClick={() => handleMoveDown(index)} disabled={index >= sections.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▼</button>
              </div>
              <div className="flex-1">
                <SectionEditor section={section} onChange={handleSectionChange} onDelete={() => handleDeleteSection(section)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4">Add Section</h2>
            <select value={newSectionType} onChange={e => setNewSectionType(e.target.value)} className="w-full px-3 py-2 border rounded-lg mb-4">
              {SECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={handleAddSection} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomepageBuilder;
