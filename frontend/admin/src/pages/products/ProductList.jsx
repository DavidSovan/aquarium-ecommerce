import { useEffect, useState } from 'react';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import { ConfirmDialog } from '../../components/ConfirmDialog';

function CustomizationManager({ productId, onClose }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOption, setNewOption] = useState({ name: '', type: 'dropdown', is_required: false });
  const [editingOption, setEditingOption] = useState(null);
  const [newValue, setNewValue] = useState({ optionId: null, value: '', price_modifier: 0, image_url: '' });
  const [error, setError] = useState('');

  const loadOptions = async () => {
    setLoading(true);
    try {
      const res = await productService.getProduct(productId);
      setOptions(res.data.options || []);
    } catch (err) {
      console.error('Failed to load customization options:', err);
      setError('Failed to load options');
    } finally { setLoading(false); }
  };

  useEffect(() => { loadOptions(); }, [productId]);

  const handleAddOption = async () => {
    if (!newOption.name.trim()) return;
    setError('');
    try {
      await productService.createOption(productId, newOption);
      setNewOption({ name: '', type: 'dropdown', is_required: false });
      loadOptions();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to create option'); }
  };

  const handleUpdateOption = async (optionId, data) => {
    try {
      await productService.updateOption(optionId, data);
      setEditingOption(null);
      loadOptions();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to update option'); }
  };

  const handleDeleteOption = async (optionId) => {
    try {
      await productService.deleteOption(optionId);
      loadOptions();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to delete option'); }
  };

  const handleAddValue = async () => {
    if (!newValue.value.trim() || !newValue.optionId) return;
    setError('');
    try {
      await productService.createOptionValue(newValue.optionId, {
        value: newValue.value,
        price_modifier: parseFloat(newValue.price_modifier) || 0,
        image_url: newValue.image_url || null,
      });
      setNewValue({ optionId: null, value: '', price_modifier: 0, image_url: '' });
      loadOptions();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to add value'); }
  };

  const handleDeleteValue = async (valueId) => {
    try {
      await productService.deleteOptionValue(valueId);
      loadOptions();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to delete value'); }
  };

  const handleToggleCustomizable = async () => {
    try {
      await productService.toggleCustomizable(productId);
      loadOptions();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to toggle customization'); }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Customization Options</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">Close</button>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {/* Add option form */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          placeholder="Option name (e.g. Color)"
          value={newOption.name}
          onChange={e => setNewOption({...newOption, name: e.target.value})}
          className="flex-1 min-w-[140px] px-3 py-1.5 border rounded text-sm"
        />
        <select
          value={newOption.type}
          onChange={e => setNewOption({...newOption, type: e.target.value})}
          className="px-3 py-1.5 border rounded text-sm"
        >
          <option value="dropdown">Dropdown</option>
          <option value="color">Color</option>
          <option value="text">Text</option>
          <option value="dimensions">Dimensions</option>
        </select>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={newOption.is_required}
            onChange={e => setNewOption({...newOption, is_required: e.target.checked})}
          />
          Required
        </label>
        <button onClick={handleAddOption} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">+ Add</button>
      </div>

      {/* Options list */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : options.length === 0 ? (
        <p className="text-sm text-gray-500">No customization options yet. Add one above.</p>
      ) : (
        <div className="space-y-3">
          {options.map(opt => (
            <div key={opt.id} className="bg-white rounded border p-3">
              {editingOption === opt.id ? (
                <InlineEditOption
                  option={opt}
                  onSave={(data) => handleUpdateOption(opt.id, data)}
                  onCancel={() => setEditingOption(null)}
                />
              ) : (
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-sm">{opt.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({opt.type})</span>
                    {opt.is_required && <span className="ml-2 text-xs text-red-500">*required</span>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingOption(opt.id)} className="text-xs text-blue-600 hover:text-blue-700">Edit</button>
                    <button onClick={() => handleDeleteOption(opt.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
                  </div>
                </div>
              )}

              {/* Values */}
              <div className="ml-4 space-y-1">
                {opt.values?.map(val => (
                  <div key={val.id} className="flex items-center justify-between text-sm py-1 px-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span>{val.value}</span>
                      {val.price_modifier !== 0 && (
                        <span className={`text-xs font-medium ${val.price_modifier > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {val.price_modifier > 0 ? '+' : ''}{val.price_modifier}
                        </span>
                      )}
                      {val.image_url && <span className="text-xs text-blue-500">img</span>}
                    </div>
                    <button onClick={() => handleDeleteValue(val.id)} className="text-xs text-red-500 hover:text-red-700">&times;</button>
                  </div>
                ))}
                {newValue.optionId === opt.id ? (
                  <div className="flex gap-1 mt-1">
                    <input
                      placeholder="Value"
                      value={newValue.value}
                      onChange={e => setNewValue({...newValue, value: e.target.value})}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="$ mod"
                      value={newValue.price_modifier}
                      onChange={e => setNewValue({...newValue, price_modifier: e.target.value})}
                      className="w-20 px-2 py-1 border rounded text-sm"
                    />
                    <input
                      placeholder="Image URL"
                      value={newValue.image_url}
                      onChange={e => setNewValue({...newValue, image_url: e.target.value})}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                    <button onClick={handleAddValue} className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">Add</button>
                    <button onClick={() => setNewValue({ optionId: null, value: '', price_modifier: 0, image_url: '' })} className="px-2 py-1 text-xs text-gray-500">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setNewValue({ ...newValue, optionId: opt.id })}
                    className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                  >
                    + Add value
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InlineEditOption({ option, onSave, onCancel }) {
  const [name, setName] = useState(option.name);
  const [type, setType] = useState(option.type);
  const [isRequired, setIsRequired] = useState(option.is_required);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name, type, is_required: isRequired });
  };

  return (
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      <input value={name} onChange={e => setName(e.target.value)} className="flex-1 min-w-[100px] px-2 py-1 border rounded text-sm" />
      <select value={type} onChange={e => setType(e.target.value)} className="px-2 py-1 border rounded text-sm">
        <option value="dropdown">Dropdown</option>
        <option value="color">Color</option>
        <option value="text">Text</option>
        <option value="dimensions">Dimensions</option>
      </select>
      <label className="flex items-center gap-1 text-sm">
        <input type="checkbox" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} />
        Required
      </label>
      <button onClick={handleSave} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Save</button>
      <button onClick={onCancel} className="px-2 py-1 text-xs text-gray-500">Cancel</button>
    </div>
  );
}

export function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [customizeTarget, setCustomizeTarget] = useState(null);
  const [form, setForm] = useState({
    name: '', price: '', stock_quantity: '', category_id: '', sku: '',
    short_description: '', description: '', thumbnail: '', brand: '',
    is_featured: false, is_active: true, is_customizable: false,
  });

  useEffect(() => {
    categoryService.getCategories().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => { loadProducts(); }, [skip, searchTerm, sortBy, sortOrder]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { skip, limit, sort_by: sortBy, sort_order: sortOrder };
      if (searchTerm) params.search = searchTerm;
      const res = await productService.getProducts(params);
      setProducts(res.data.items);
      setTotal(res.data.total);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock_quantity),
      };
      if (data.category_id) data.category_id = parseInt(data.category_id);
      else delete data.category_id;
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, data);
      } else {
        await productService.createProduct(data);
      }
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (err) { alert(err.response?.data?.detail || 'Failed to save'); }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name, price: product.price, stock_quantity: product.stock_quantity,
      category_id: product.category_id || '', sku: product.sku || '',
      short_description: product.short_description || '',
      description: product.description || '', thumbnail: product.thumbnail || '',
      brand: product.brand || '',
      is_featured: product.is_featured, is_active: product.is_active,
      is_customizable: product.is_customizable || false,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await productService.deleteProduct(deleteTarget.id); setDeleteTarget(null); loadProducts(); } catch {}
  };

  const resetForm = () => setForm({
    name: '', price: '', stock_quantity: '', category_id: '', sku: '',
    short_description: '', description: '', thumbnail: '', brand: '',
    is_featured: false, is_active: true, is_customizable: false,
  });

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;
  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button onClick={() => { setEditingProduct(null); resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ New Product</button>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Search products..." value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setSkip(0); }}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><input type="number" step="0.01" placeholder="Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><input type="number" placeholder="Stock" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><input placeholder="SKU" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div><input placeholder="Brand" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="col-span-2"><input placeholder="Thumbnail URL" value={form.thumbnail} onChange={e => setForm({...form, thumbnail: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="col-span-2"><textarea placeholder="Short description" value={form.short_description} onChange={e => setForm({...form, short_description: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div className="col-span-2"><textarea placeholder="Full description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full px-3 py-2 border rounded-lg" /></div>
              <div>
                <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} /> Featured</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} /> Active</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_customizable} onChange={e => setForm({...form, is_customizable: e.target.checked})} /> Customizable</label>
              </div>
              <div className="col-span-2 flex gap-3 pt-2">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editingProduct ? 'Update' : 'Create'}</button>
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
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">SKU</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Price</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Stock</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Active</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Custom.</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.thumbnail && <img src={p.thumbnail} alt="" className="w-10 h-10 object-cover rounded" />}
                    <span className="font-medium text-gray-900">{p.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.sku || '-'}</td>
                <td className="px-6 py-4 text-sm text-right font-medium">{formatPrice(p.price)}</td>
                <td className="px-6 py-4 text-sm text-right">{p.stock_quantity}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.category?.name || '-'}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {p.is_active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${p.is_customizable ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {p.is_customizable ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-3">
                  <button onClick={() => handleEdit(p)} className="text-blue-600 hover:text-blue-700">Edit</button>
                  <button onClick={() => setDeleteTarget(p)} className="text-red-600 hover:text-red-700">Delete</button>
                  {p.is_customizable && (
                    <button onClick={() => setCustomizeTarget(p)} className="text-purple-600 hover:text-purple-700">Options</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setSkip(Math.max(0, skip - limit))} disabled={currentPage <= 1} className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setSkip((p - 1) * limit)}
              className={`px-4 py-2 border rounded ${currentPage === p ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}>{p}</button>
          ))}
          <button onClick={() => setSkip(skip + limit)} disabled={currentPage >= totalPages} className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete Product" message={`Delete "${deleteTarget?.name}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />

      {customizeTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setCustomizeTarget(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <CustomizationManager productId={customizeTarget.id} onClose={() => setCustomizeTarget(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
