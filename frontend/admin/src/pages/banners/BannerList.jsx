import { useEffect, useState } from 'react';
import bannerService from '../../services/bannerService';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  video_url: '',
  video_type: '',
  button_text: '',
  button_link: '',
  position: 'hero',
  sort_order: 0,
  is_active: true,
  start_date: '',
  end_date: '',
};

export function BannerList() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => { loadBanners(); }, []);

  const loadBanners = async () => {
    setLoading(true);
    try { const res = await bannerService.listBanners(); setBanners(res.data); } catch {} finally { setLoading(false); }
  };

  const resetForm = () => setForm({ ...EMPTY_FORM });

  const handleEdit = (b) => {
    setEditing(b);
    setForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      description: b.description || '',
      image_url: b.image_url || '',
      video_url: b.video_url || '',
      video_type: b.video_type || '',
      button_text: b.button_text || '',
      button_link: b.button_link || '',
      position: b.position || 'hero',
      sort_order: b.sort_order ?? 0,
      is_active: b.is_active ?? true,
      start_date: b.start_date ? b.start_date.slice(0, 16) : '',
      end_date: b.end_date ? b.end_date.slice(0, 16) : '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        sort_order: parseInt(form.sort_order) || 0,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      };
      if (editing) { await bannerService.updateBanner(editing.id, data); }
      else { await bannerService.createBanner(data); }
      setShowForm(false); setEditing(null); resetForm(); loadBanners();
    } catch (err) { alert(err.response?.data?.detail || 'Failed to save banner'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await bannerService.deleteBanner(deleteTarget.id); setDeleteTarget(null); loadBanners(); } catch {}
  };

  const isActive = (b) => {
    if (!b.is_active) return false;
    const now = new Date();
    if (b.start_date && new Date(b.start_date) > now) return false;
    if (b.end_date && new Date(b.end_date) < now) return false;
    return true;
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading banners...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
        <button onClick={() => { setEditing(null); resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ New Banner</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto py-8" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Banner' : 'New Banner'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Title</label>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Subtitle</label>
                  <input value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Image URL</label>
                  <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Video URL</label>
                  <input value={form.video_url} onChange={e => setForm({...form, video_url: e.target.value})} className="w-full px-3 py-2 border rounded-lg" placeholder="MP4 or YouTube URL" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Button Text</label>
                  <input value={form.button_text} onChange={e => setForm({...form, button_text: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Button Link</label>
                  <input value={form.button_link} onChange={e => setForm({...form, button_link: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Position</label>
                  <select value={form.position} onChange={e => setForm({...form, position: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                    <option value="hero">Hero</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="bottom">Bottom</option>
                    <option value="promo">Promo</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="rounded" />
                    Active
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Start Date</label>
                  <input type="datetime-local" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">End Date</label>
                  <input type="datetime-local" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>

              {(form.image_url || form.video_url) && (
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-2">Preview</p>
                  {form.image_url && <img src={form.image_url} alt="" className="h-28 object-cover rounded" onError={e => e.target.style.display = 'none'} />}
                  {form.video_url && <video src={form.video_url} className="h-28 object-cover rounded" controls onError={e => e.target.style.display = 'none'} />}
                </div>
              )}

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
            {b.image_url && <img src={b.image_url} alt={b.title} className="w-full h-36 object-cover" />}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{b.title || 'Untitled'}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full ${isActive(b) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                  {isActive(b) ? 'Active' : 'Inactive'}
                </span>
              </div>
              {b.subtitle && <p className="text-sm text-gray-600 mt-1">{b.subtitle}</p>}
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span className="bg-gray-100 px-1.5 py-0.5 rounded">{b.position}</span>
                <span>Order: {b.sort_order}</span>
                {b.video_url && <span className="text-blue-500">Has Video</span>}
                {b.button_text && <span>Btn: {b.button_text}</span>}
              </div>
              {(b.start_date || b.end_date) && (
                <p className="text-xs text-gray-400 mt-1">
                  {b.start_date && <>From: {new Date(b.start_date).toLocaleDateString()} </>}
                  {b.end_date && <>To: {new Date(b.end_date).toLocaleDateString()}</>}
                </p>
              )}
              <div className="flex gap-3 mt-3">
                <button onClick={() => handleEdit(b)} className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
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

export default BannerList;
