import { useEffect, useState, useRef } from 'react';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import { ConfirmDialog } from '../../components/ConfirmDialog';

const TYPE_ICONS = {
  dropdown: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
    </svg>
  ),
  color: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  text: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  dimensions: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  ),
};

const TYPE_BADGE_COLORS = {
  dropdown: 'bg-blue-100 text-blue-700',
  color: 'bg-pink-100 text-pink-700',
  text: 'bg-amber-100 text-amber-700',
  dimensions: 'bg-purple-100 text-purple-700',
};

function CustomizationManager({ productId, onClose }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newOption, setNewOption] = useState({ name: '', type: 'dropdown', is_required: false });
  const [editingOption, setEditingOption] = useState(null);
  const [newValue, setNewValue] = useState({ optionId: null, value: '', price_modifier: 0, image_url: '' });
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteValue, setConfirmDeleteValue] = useState(null);
  const inputRef = useRef(null);

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
  useEffect(() => { if (!loading) inputRef.current?.focus(); }, [loading]);

  const handleAddOption = async () => {
    if (!newOption.name.trim() || saving) return;
    setSaving(true);
    setError('');
    try {
      await productService.createOption(productId, newOption);
      setNewOption({ name: '', type: 'dropdown', is_required: false });
      loadOptions();
      inputRef.current?.focus();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to create option'); }
    finally { setSaving(false); }
  };

  const handleUpdateOption = async (optionId, data) => {
    try {
      await productService.updateOption(optionId, data);
      setEditingOption(null);
      loadOptions();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to update option'); }
  };

  const handleDeleteOption = async () => {
    if (!confirmDelete) return;
    try {
      await productService.deleteOption(confirmDelete.id);
      setConfirmDelete(null);
      loadOptions();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to delete option'); }
  };

  const handleAddValue = async () => {
    if (!newValue.value.trim() || !newValue.optionId || saving) return;
    setSaving(true);
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
    finally { setSaving(false); }
  };

  const handleDeleteValue = async () => {
    if (!confirmDeleteValue) return;
    try {
      await productService.deleteOptionValue(confirmDeleteValue);
      setConfirmDeleteValue(null);
      loadOptions();
    } catch (err) { setError(err.response?.data?.detail || 'Failed to delete value'); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Customization Options</h3>
          <p className="text-sm text-gray-500 mt-0.5">Define options like color, size, or material for customers to choose from</p>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Close">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}

      {/* Add option form */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">New Option</h4>
        <div className="flex gap-2.5 flex-wrap items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              ref={inputRef}
              placeholder="e.g. Material, Color, Size"
              value={newOption.name}
              onChange={e => setNewOption({...newOption, name: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && handleAddOption()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </div>
          <div className="min-w-[130px]">
            <label className="block text-xs text-gray-500 mb-1">Type</label>
            <select
              value={newOption.type}
              onChange={e => setNewOption({...newOption, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="dropdown">Dropdown</option>
              <option value="color">Color Swatches</option>
              <option value="text">Text Input</option>
              <option value="dimensions">Dimensions</option>
            </select>
          </div>
          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => setNewOption({...newOption, is_required: !newOption.is_required})}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                newOption.is_required
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {newOption.is_required ? 'Required' : 'Optional'}
            </button>
          </div>
          <button
            onClick={handleAddOption}
            disabled={saving || !newOption.name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {saving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            )}
            Add Option
          </button>
        </div>
      </div>

      {/* Options list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : options.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
          <p className="text-sm text-gray-500 font-medium">No options yet</p>
          <p className="text-xs text-gray-400 mt-1">Add your first customization option above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {options.map((opt, idx) => (
            <div key={opt.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm">
              {/* Option header */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                {editingOption === opt.id ? (
                  <InlineEditOption
                    option={opt}
                    onSave={(data) => handleUpdateOption(opt.id, data)}
                    onCancel={() => setEditingOption(null)}
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">{idx + 1}</span>
                      <div className="min-w-0">
                        <span className="font-semibold text-sm text-gray-900 truncate block">{opt.name}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE_COLORS[opt.type] || 'bg-gray-100 text-gray-600'}`}>
                            {TYPE_ICONS[opt.type]}
                            {opt.type.charAt(0).toUpperCase() + opt.type.slice(1)}
                          </span>
                          {opt.is_required && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                              Required
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{opt.values?.length || 0} value{(opt.values?.length || 0) !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setEditingOption(opt.id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => setConfirmDelete(opt)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Values */}
              <div className="px-4 py-3">
                {opt.values?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {opt.values.map(val => (
                      <div key={val.id} className="group relative flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:border-gray-300 transition-colors">
                        {opt.type === 'color' && (
                          <span className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: val.value }} />
                        )}
                        <span className="text-gray-700">{val.value}</span>
                        {val.price_modifier !== 0 && (
                          <span className={`text-xs font-medium ${val.price_modifier > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {val.price_modifier > 0 ? '+' : ''}${Math.abs(val.price_modifier).toFixed(2)}
                          </span>
                        )}
                        {val.image_url && (
                          <span className="flex-shrink-0 w-4 h-4 rounded overflow-hidden" title={val.image_url}>
                            <img src={val.image_url} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                          </span>
                        )}
                        <button
                          onClick={() => setConfirmDeleteValue(val.id)}
                          className="opacity-0 group-hover:opacity-100 absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
                        >
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {newValue.optionId === opt.id ? (
                  <div className="flex gap-2 flex-wrap">
                    <input
                      placeholder="Value name"
                      value={newValue.value}
                      onChange={e => setNewValue({...newValue, value: e.target.value})}
                      onKeyDown={e => e.key === 'Enter' && handleAddValue()}
                      className="flex-1 min-w-[120px] px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={newValue.price_modifier}
                        onChange={e => setNewValue({...newValue, price_modifier: e.target.value})}
                        className="w-24 pl-6 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    {opt.type !== 'text' && (
                      <input
                        placeholder="Image URL (optional)"
                        value={newValue.image_url}
                        onChange={e => setNewValue({...newValue, image_url: e.target.value})}
                        className="flex-1 min-w-[120px] px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    )}
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleAddValue}
                        disabled={saving || !newValue.value.trim()}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                      >
                        {saving ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        )}
                        Add
                      </button>
                      <button
                        onClick={() => setNewValue({ optionId: null, value: '', price_modifier: 0, image_url: '' })}
                        className="px-3 py-1.5 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setNewValue({ ...newValue, optionId: opt.id })}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    Add Value
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation dialogs */}
      {confirmDelete && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Option"
          message={`Delete "${confirmDelete.name}" and all its values? This can't be undone.`}
          confirmLabel="Delete Option"
          onConfirm={handleDeleteOption}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {confirmDeleteValue && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Value"
          message="Delete this value from the option?"
          confirmLabel="Delete"
          onConfirm={handleDeleteValue}
          onCancel={() => setConfirmDeleteValue(null)}
        />
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
    <div className="flex items-center gap-2 flex-wrap w-full">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSave()}
        className="flex-1 min-w-[120px] px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        autoFocus
      />
      <select
        value={type}
        onChange={e => setType(e.target.value)}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="dropdown">Dropdown</option>
        <option value="color">Color</option>
        <option value="text">Text</option>
        <option value="dimensions">Dimensions</option>
      </select>
      <button
        onClick={() => setIsRequired(!isRequired)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
          isRequired
            ? 'bg-red-50 border-red-200 text-red-600'
            : 'bg-gray-50 border-gray-200 text-gray-500'
        }`}
      >
        {isRequired ? 'Required' : 'Optional'}
      </button>
      <button onClick={handleSave} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">Save</button>
      <button onClick={onCancel} className="px-3 py-1.5 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium transition-colors">Cancel</button>
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
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally { setLoading(false); }
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
