import { useEffect, useState } from 'react';
import { useProductAPI } from '../hooks/useProductAPI';
import { ProductTable } from '../components/ProductTable';
import { ProductForm } from '../components/ProductForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ImageGallery } from '../components/ImageGallery';
import categoryService from '../services/categoryService';

export function AdminProducts() {
  const {
    products,
    total,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    clearError,
  } = useProductAPI();

  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formMessage, setFormMessage] = useState(null);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async (newSkip = skip, newLimit = limit, newSearch = searchTerm, newSortBy = sortBy, newSortOrder = sortOrder) => {
    try {
      const params = { skip: newSkip, limit: newLimit, sort_by: newSortBy, sort_order: newSortOrder };
      if (newSearch) params.search = newSearch;
      await fetchProducts(params);
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handlePageChange = (newSkip, newLimit, newSearch, newSortBy, newSortOrder) => {
    setSkip(newSkip);
    setSearchTerm(newSearch || '');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    loadProducts(newSkip, newLimit, newSearch, newSortBy, newSortOrder);
  };

  const handleCreateNew = () => {
    setEditingProduct(null);
    setShowForm(true);
    clearError();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
    clearError();
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingProduct?.id) {
        const updated = await updateProduct(editingProduct.id, formData);
        setEditingProduct(updated);
        setFormMessage({ type: 'success', text: 'Product updated successfully!' });
      } else {
        const created = await createProduct(formData);
        setEditingProduct(created);
        setFormMessage({ type: 'success', text: 'Product created successfully!' });
      }
      await loadProducts(skip, limit, searchTerm, sortBy, sortOrder);
      setTimeout(() => setFormMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  const handleThumbnailChange = async (imageUrl) => {
    if (!editingProduct?.id) return;
    try {
      const updated = await updateProduct(editingProduct.id, { thumbnail: imageUrl });
      setEditingProduct(updated);
    } catch (err) {
      console.error('Failed to set thumbnail:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id);
      setFormMessage({ type: 'success', text: 'Product deleted successfully!' });
      setDeleteTarget(null);
      await loadProducts(skip, limit, searchTerm, sortBy, sortOrder);
      setTimeout(() => setFormMessage(null), 3000);
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Product Management</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-700 hover:text-red-900 font-bold">&#10005;</button>
          </div>
        )}

        {formMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            formMessage.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-blue-100 border border-blue-400 text-blue-700'
          }`}>
            {formMessage.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {showForm && (
            <div className="lg:col-span-1">
              <ProductForm
                product={editingProduct}
                categories={categories}
                onSubmit={handleFormSubmit}
                onCancel={() => { setShowForm(false); setEditingProduct(null); }}
                isLoading={loading}
              />
            </div>
          )}

          <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {loading && products.length === 0 && (
              <div className="flex items-center justify-center p-12 bg-white rounded-lg shadow">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                  <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
              </div>
            )}

            {!loading && (
              <ProductTable
                products={products}
                total={total}
                skip={skip}
                limit={limit}
                onEdit={handleEdit}
                onDelete={(p) => setDeleteTarget(p)}
                onCreateNew={handleCreateNew}
                onPageChange={handlePageChange}
                isLoading={loading}
              />
            )}

            {showForm && editingProduct?.id && (
              <div className="mt-8">
                <ImageGallery
                  productId={editingProduct.id}
                  thumbnail={editingProduct.thumbnail}
                  onThumbnailChange={handleThumbnailChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={loading}
      />
    </div>
  );
}
