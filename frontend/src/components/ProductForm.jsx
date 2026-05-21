import { useState, useEffect } from 'react';

export function ProductForm({
  product = null,
  categories = [],
  onSubmit,
  onCancel,
  isLoading = false
}) {
  const [formData, setFormData] = useState({
    category_id: null,
    name: '',
    slug: '',
    sku: '',
    short_description: '',
    description: '',
    price: '',
    discount_price: '',
    stock_quantity: 0,
    thumbnail: '',
    brand: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    is_featured: false,
    is_active: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        category_id: product.category_id ?? null,
        name: product.name || '',
        slug: product.slug || '',
        sku: product.sku || '',
        short_description: product.short_description || '',
        description: product.description || '',
        price: product.price ?? '',
        discount_price: product.discount_price ?? '',
        stock_quantity: product.stock_quantity ?? 0,
        thumbnail: product.thumbnail || '',
        brand: product.brand || '',
        weight: product.weight ?? '',
        length: product.length ?? '',
        width: product.width ?? '',
        height: product.height ?? '',
        is_featured: product.is_featured ?? false,
        is_active: product.is_active ?? true,
      });
    }
  }, [product]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[-\s]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug === '' || prev.slug === generateSlug(prev.name)
        ? generateSlug(name)
        : prev.slug,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : value === ''
          ? (name === 'category_id' || name === 'stock_quantity' ? null : '')
          : (name === 'price' || name === 'discount_price' || name === 'weight' ||
             name === 'length' || name === 'width' || name === 'height')
            ? parseFloat(value) || 0
            : name === 'category_id' || name === 'stock_quantity'
              ? parseInt(value, 10) || 0
              : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (formData.discount_price && formData.discount_price >= formData.price) {
      newErrors.discount_price = 'Discount price must be less than regular price';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const data = {
      ...formData,
      category_id: formData.category_id || null,
      price: parseFloat(formData.price) || 0,
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      stock_quantity: parseInt(formData.stock_quantity, 10) || 0,
      weight: formData.weight ? parseFloat(formData.weight) : null,
      length: formData.length ? parseFloat(formData.length) : null,
      width: formData.width ? parseFloat(formData.width) : null,
      height: formData.height ? parseFloat(formData.height) : null,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {product?.id ? 'Edit Product' : 'Create New Product'}
      </h2>

      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <input
              type="text" name="name" value={formData.name} onChange={handleNameChange}
              placeholder="e.g., Blue Betta Fish"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
            <input type="text" name="slug" value={formData.slug} onChange={handleChange}
              placeholder="blue-betta-fish"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
            <input type="text" name="sku" value={formData.sku} onChange={handleChange}
              placeholder="FISH-001"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select name="category_id" value={formData.category_id ?? ''} onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">No Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
          <textarea name="short_description" value={formData.short_description} onChange={handleChange}
            placeholder="Brief description..." rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange}
            placeholder="Detailed product description..." rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange}
              step="0.01" min="0" placeholder="0.00"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price</label>
            <input type="number" name="discount_price" value={formData.discount_price} onChange={handleChange}
              step="0.01" min="0" placeholder="0.00"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.discount_price ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.discount_price && <p className="text-red-500 text-sm mt-1">{errors.discount_price}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
            <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange}
              min="0" placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
            <input type="text" name="brand" value={formData.brand} onChange={handleChange}
              placeholder="e.g., AquaWorld"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
          <input type="url" name="thumbnail" value={formData.thumbnail} onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {formData.thumbnail && (
            <div className="mt-3 border rounded-lg p-2 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2 font-medium">Preview:</p>
              <img src={formData.thumbnail} alt="Product preview"
                className="max-h-48 w-full rounded-md object-contain mx-auto"
                onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dimensions & Weight</label>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange}
                step="0.01" min="0" placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Length (cm)</label>
              <input type="number" name="length" value={formData.length} onChange={handleChange}
                step="0.1" min="0" placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Width (cm)</label>
              <input type="number" name="width" value={formData.width} onChange={handleChange}
                step="0.1" min="0" placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Height (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange}
                step="0.1" min="0" placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center">
            <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded" />
            <span className="ml-2 text-sm text-gray-700">Featured product</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange}
              className="h-4 w-4 text-blue-600 rounded" />
            <span className="ml-2 text-sm text-gray-700">Active (visible in store)</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 mt-8 justify-end border-t pt-4">
        <button type="button" onClick={onCancel} disabled={isLoading}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? 'Saving...' : product?.id ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
