import { useEffect, useState } from 'react';
import bannerService from '../../services/bannerService';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export function BannerList() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ title: '', subtitle: '', image_url: '', link_url: '', position: 'hero', sort_order: 0, is_active: true });

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    setLoading(true);
    try { const res = await bannerService.listBanners(); setBanners(res.data); } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, sort_order: parseInt(form.sort_order) };
      if (editing) { await bannerService.updateBanner(editing.id, data); }
      else { await bannerService.createBanner(data); }
      setShowForm(false); setEditing(null); loadBanners();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await bannerService.deleteBanner(deleteTarget.id); setDeleteTarget(null); loadBanners(); } catch {}
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
        <button onClick={() => { setEditing(null); setForm({ title: '', subtitle: '', image_url: '', link_url: '', position: 'hero', sort_order: 0, is_active: true }); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ New Banner</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Banner' : 'New Banner'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input placeholder="Subtitle" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input placeholder="Image URL" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
              <input placeholder="Link URL" value={form.link_url} onChange={e => setForm({...form, link_url: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.position} onChange={e => setForm({...form, position: e.target.value})} className="px-3 py-2 border rounded-lg">
                  <option value="hero">Hero</option><option value="sidebar">Sidebar</option><option value="bottom">Bottom</option>
                </select>
                <input type="number" placeholder="Sort order" value={form.sort_order} onChange={e => setForm({...form, sort_order: e.target.value})} className="px-3 py-2 border rounded-lg" />
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} /> Active</label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map(b => (
          <div key={b.id} className="bg-white rounded-lg shadow overflow-hidden">
            {b.image_url && <img src={b.image_url} alt={b.title} className="w-full h-40 object-cover" />}
            <div className="p-4">
              <h3 className="font-bold">{b.title || 'Untitled'}</h3>
              {b.subtitle && <p className="text-sm text-gray-600">{b.subtitle}</p>}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span>{b.position}</span>
                <span>Order: {b.sort_order}</span>
                <span className={`px-2 py-0.5 rounded-full ${b.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {b.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={() => { setEditing(b); setForm({ title: b.title || '', subtitle: b.subtitle || '', image_url: b.image_url, link_url: b.link_url || '', position: b.position, sort_order: b.sort_order, is_active: b.is_active }); setShowForm(true); }}
                  className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                <button onClick={() => setDeleteTarget(b)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete Banner" message={`Delete "${deleteTarget?.title || 'this banner'}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
