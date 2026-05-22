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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', parent_id: '', is_active: true }); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ New Category</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
              <input placeholder="Slug (optional)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-lg" />
              <select value={form.parent_id} onChange={e => setForm({...form, parent_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="">No parent (top level)</option>
                {categories.filter(c => c.id !== editing?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} /> Active</label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Slug</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Parent</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Active</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{c.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{c.slug}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{c.parent?.name || '-'}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {c.is_active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-3">
                  <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-700">Edit</button>
                  <button onClick={() => setDeleteTarget(c)} className="text-red-600 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete Category" message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
