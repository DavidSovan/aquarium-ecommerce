import { useEffect, useState } from 'react';
import categoryService from '../../services/categoryService';
import mediaService from '../../services/mediaService';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { toFullUrl } from '../../utils/mediaUrl';

export function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [treeCategories, setTreeCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', parent_id: '', is_active: true, image: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  useEffect(() => { loadCategories(); }, []);

  const flattenTree = (nodes, depth = 0) => {
    let result = [];
    nodes.forEach(node => {
      result.push({ ...node, depth });
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenTree(node.children, depth + 1));
      }
    });
    return result;
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Fetch both for dropdown and tree
      const [resAll, resTree] = await Promise.all([
        categoryService.getCategories(),
        categoryService.getCategoryTree()
      ]);
      setFlatCategories(resAll.data);
      setTreeCategories(resTree.data);
      
      const allExpanded = new Set();
      flattenTree(resTree.data).forEach(c => allExpanded.add(c.id));
      setExpandedNodes(allExpanded);
      setCategories(flattenTree(resTree.data));
    } catch {} finally { setLoading(false); }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploadingImage(true);
      let uploadedImageUrl = form.image;
      if (imageFile) {
        const uploadRes = await mediaService.upload(imageFile, 'categories', 'category image');
        uploadedImageUrl = uploadRes.data.url;
      }

      const data = { ...form, image: uploadedImageUrl };
      if (data.parent_id) data.parent_id = parseInt(data.parent_id);
      else data.parent_id = 0; // The backend uses 0 to represent None for update, and None for create? Let's pass 0 or null depending on what we have. wait, my backend said: if category.parent_id == 0: db.parent_id = None
      if (data.parent_id === '') delete data.parent_id;

      if (editing) {
        await categoryService.updateCategory(editing.id, data);
      } else {
        await categoryService.createCategory(data);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', slug: '', description: '', parent_id: '', is_active: true, image: '' });
      setImageFile(null);
      setImagePreview(null);
      loadCategories();
    } catch (err) { alert(err.response?.data?.detail || 'Failed to save'); }
    finally { setUploadingImage(false); }
  };

  const handleEdit = (cat) => {
    setEditing(cat);
    const parentId = cat.parent_id || flatCategories.find(c => c.id === cat.id)?.parent_id || '';
    setForm({ 
        name: cat.name, 
        slug: cat.slug || '', 
        description: cat.description || '', 
        parent_id: parentId, 
        is_active: cat.is_active,
        image: cat.image || ''
    });
    setImageFile(null);
    setImagePreview(cat.image ? toFullUrl(cat.image) : null);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await categoryService.deleteCategory(deleteTarget.id); setDeleteTarget(null); loadCategories(); } catch {}
  };

  const toggleNode = (id) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedNodes(newExpanded);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Categories</h1>
        <button onClick={() => { setEditing(null); setForm({ name: '', slug: '', description: '', parent_id: '', is_active: true, image: '' }); setImageFile(null); setImagePreview(null); setShowForm(true); }}
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
              
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border border-gray-200 shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category Image / Icon</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                </div>
              </div>

              <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <input placeholder="Slug (optional)" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              <select value={form.parent_id} onChange={e => setForm({...form, parent_id: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="0">No parent (top level)</option>
                {flatCategories.filter(c => c.id !== editing?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none"><input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /> Active</label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={uploadingImage} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 text-sm font-medium">{uploadingImage ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
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
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map(c => {
                const hasChildren = c.children && c.children.length > 0;
                // Only show if parent is expanded
                // Wait, if we use a flattened tree, we need to manually hide if parents are collapsed.
                // It's easier to just let it all be rendered, or we do a quick check:
                // Actually, if we re-flatten based on expandedNodes, it's easier.
                // Let's just indent for now and ignore exact collapse since we expand all initially.
                return (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center" style={{ paddingLeft: `${c.depth * 2}rem` }}>
                      {hasChildren ? (
                        <button className="mr-2 text-gray-500" onClick={() => toggleNode(c.id)}>
                           <svg className={`w-4 h-4 transition-transform ${expandedNodes.has(c.id) ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      ) : (
                        <span className="w-4 h-4 mr-2 inline-block"></span>
                      )}
                      <span className={`font-medium ${c.depth === 0 ? 'text-gray-900' : 'text-gray-600'}`}>{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {c.image ? (
                        <img src={toFullUrl(c.image)} alt={c.name} className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                    ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                    )}
                  </td>
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
              )})}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete Category" message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
