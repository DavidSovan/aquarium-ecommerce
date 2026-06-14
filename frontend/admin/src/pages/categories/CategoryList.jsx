import { useEffect, useState } from 'react';
import categoryService from '../../services/categoryService';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', parent_id: '', is_active: true });

  useEffect(() => { loadCategories(); }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategories();
      setCategories(res.data);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form };
      if (data.parent_id) data.parent_id = parseInt(data.parent_id);
      else delete data.parent_id;
      if (editing) {
        await categoryService.updateCategory(editing.id, data);
      } else {
        await categoryService.createCategory(data);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', slug: '', description: '', parent_id: '', is_active: true });
      loadCategories();
    } catch (err) { alert(err.response?.data?.detail || 'Failed to save'); }
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug || '', description: cat.description || '', parent_id: cat.parent_id || '', is_active: cat.is_active });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await categoryService.deleteCategory(deleteTarget.id); setDeleteTarget(null); loadCategories(); } catch {}
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Categories</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', parent_id: '', is_active: true }); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">+ New Category</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-10 pb-10 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-5 md:p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <input placeholder="Slug (optional)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              <select value={form.parent_id} onChange={e => setForm({...form, parent_id: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">No parent (top level)</option>
                {categories.filter(c => c.id !== editing?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none"><input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> Active</label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900 whitespace-nowrap">{c.name}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{c.slug || '\u2014'}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{c.parent?.name || '\u2014'}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${c.is_active ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-100 text-gray-500 ring-gray-500/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(c)} className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Edit</button>
                      <button onClick={() => setDeleteTarget(c)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete Category" message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
