import { useState, useEffect } from 'react';
import cmsService from '../../services/cmsService';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const BLOCK_TYPES = [
  { value: 'text', label: 'Text Block' },
  { value: 'image', label: 'Image Block' },
  { value: 'video', label: 'Video Block' },
  { value: 'html', label: 'HTML Block' },
  { value: 'product_showcase', label: 'Product Showcase' },
  { value: 'category_showcase', label: 'Category Showcase' },
];

const EMPTY_FORM = {
  title: '',
  slug: '',
  block_type: 'text',
  content: null,
  sort_order: 0,
  is_active: true,
  publish_at: null,
  unpublish_at: null,
};

function ContentEditor({ blockType, content, onChange }) {
  const updateContent = (key, value) => {
    onChange({ ...(content || {}), [key]: value });
  };

  switch (blockType) {
    case 'text':
      return (
        <div>
          <label className="text-xs text-gray-500 block mb-1">Text Content</label>
          <textarea value={content?.body || ''} onChange={e => updateContent('body', e.target.value)} rows={6} className="w-full px-3 py-2 border rounded text-sm" placeholder="Enter text content..." />
        </div>
      );
    case 'image':
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Image URL</label>
            <input type="text" value={content?.url || ''} onChange={e => updateContent('url', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Alt Text</label>
            <input type="text" value={content?.alt_text || ''} onChange={e => updateContent('alt_text', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
          </div>
          {content?.url && <img src={content.url} alt={content.alt_text} className="h-24 object-contain border rounded" />}
        </div>
      );
    case 'video':
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Video URL (MP4 or YouTube)</label>
            <input type="text" value={content?.url || ''} onChange={e => updateContent('url', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Autoplay</label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={content?.autoplay || false} onChange={e => updateContent('autoplay', e.target.checked)} />
              Autoplay
            </label>
          </div>
        </div>
      );
    case 'html':
      return (
        <div>
          <label className="text-xs text-gray-500 block mb-1">HTML Content</label>
          <textarea value={content?.html || ''} onChange={e => updateContent('html', e.target.value)} rows={6} className="w-full px-3 py-2 border rounded text-sm font-mono" placeholder="<div>Your HTML here</div>" />
        </div>
      );
    case 'product_showcase':
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Title</label>
            <input type="text" value={content?.title || ''} onChange={e => updateContent('title', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Product IDs (comma separated)</label>
            <input type="text" value={content?.product_ids || ''} onChange={e => updateContent('product_ids', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" placeholder="1, 2, 3" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Layout</label>
            <select value={content?.layout || 'grid'} onChange={e => updateContent('layout', e.target.value)} className="w-full px-3 py-2 border rounded text-sm">
              <option value="grid">Grid</option>
              <option value="carousel">Carousel</option>
              <option value="list">List</option>
            </select>
          </div>
        </div>
      );
    case 'category_showcase':
      return (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Title</label>
            <input type="text" value={content?.title || ''} onChange={e => updateContent('title', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Category IDs (comma separated)</label>
            <input type="text" value={content?.category_ids || ''} onChange={e => updateContent('category_ids', e.target.value)} className="w-full px-3 py-2 border rounded text-sm" placeholder="1, 2, 3" />
          </div>
        </div>
      );
    default:
      return null;
  }
}

export function CMSBlockList() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const res = await cmsService.list(); setBlocks(res.data); } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await cmsService.update(editing.id, form);
      } else {
        await cmsService.create(form);
      }
      setShowForm(false);
      setEditing(null);
      load();
    } catch (err) { alert(err.response?.data?.detail || 'Failed to save'); }
  };

  const handleEdit = (block) => {
    setEditing(block);
    setForm({
      title: block.title,
      slug: block.slug,
      block_type: block.block_type,
      content: block.content,
      sort_order: block.sort_order,
      is_active: block.is_active,
      publish_at: block.publish_at,
      unpublish_at: block.unpublish_at,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await cmsService.delete(deleteTarget.id); setDeleteTarget(null); load(); } catch {}
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const updated = [...blocks];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    const reordered = updated.map((b, i) => ({ id: b.id, sort_order: i }));
    try { await cmsService.reorder(reordered); load(); } catch {}
  };

  const handleMoveDown = async (index) => {
    if (index >= blocks.length - 1) return;
    const updated = [...blocks];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    const reordered = updated.map((b, i) => ({ id: b.id, sort_order: i }));
    try { await cmsService.reorder(reordered); load(); } catch {}
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading CMS blocks...</div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">CMS Blocks</h1>
        <button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">+ New Block</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-10 pb-10 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-5 md:p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Block' : 'New CMS Block'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Slug</label>
                <input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="my-block-slug" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Block Type</label>
                <select value={form.block_type} onChange={e => setForm({...form, block_type: e.target.value, content: null})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                  {BLOCK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <ContentEditor blockType={form.block_type} content={form.content} onChange={v => setForm({...form, content: v})} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1 font-medium">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1 font-medium">Publish Date</label>
                  <input type="datetime-local" value={form.publish_at ? form.publish_at.slice(0, 16) : ''} onChange={e => setForm({...form, publish_at: e.target.value ? new Date(e.target.value).toISOString() : null})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Unpublish Date</label>
                <input type="datetime-local" value={form.unpublish_at ? form.unpublish_at.slice(0, 16) : ''} onChange={e => setForm({...form, unpublish_at: e.target.value ? new Date(e.target.value).toISOString() : null})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                Active
              </label>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div key={block.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 transition-shadow hover:shadow-sm">
            <div className="flex sm:flex-col gap-1">
              <button onClick={() => handleMoveUp(index)} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▲</button>
              <button onClick={() => handleMoveDown(index)} disabled={index >= blocks.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▼</button>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-gray-900">{block.title}</h3>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{block.block_type}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${block.is_active ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-gray-100 text-gray-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${block.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {block.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Slug: {block.slug} | Order: {block.sort_order}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => handleEdit(block)} className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Edit</button>
              <button onClick={() => setDeleteTarget(block)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        ))}
        {blocks.length === 0 && <p className="text-center py-10 text-gray-500">No CMS blocks yet.</p>}
      </div>

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete CMS Block" message={`Delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

export default CMSBlockList;
