import { useEffect, useState } from 'react';
import { useCategoryAPI } from '../hooks/useCategoryAPI';
import { CategoryList } from '../components/CategoryList';
import { CategoryTree } from '../components/CategoryTree';
import { CategoryForm } from '../components/CategoryForm';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function AdminCategories() {
  const {
    categories,
    categoryTree,
    loading,
    error,
    fetchCategories,
    fetchCategoryTree,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
  } = useCategoryAPI();

  const [activeTab, setActiveTab] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formMessage, setFormMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await fetchCategories();
      await fetchCategoryTree();
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleCreateNew = () => {
    setEditingCategory(null);
    setShowForm(true);
    clearError();
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
    clearError();
  };

  const handleAddChild = (parentCategory) => {
    setEditingCategory({
      parent_id: parentCategory.id,
      name: '',
      slug: '',
      description: '',
      image: '',
      is_active: true,
    });
    setShowForm(true);
    clearError();
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingCategory?.id) {
        await updateCategory(editingCategory.id, formData);
        setFormMessage({ type: 'success', text: 'Category updated successfully!' });
      } else {
        await createCategory(formData);
        setFormMessage({ type: 'success', text: 'Category created successfully!' });
      }
      setShowForm(false);
      setEditingCategory(null);
      await loadData();
      setTimeout(() => setFormMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id);
      setFormMessage({ type: 'success', text: 'Category deleted successfully!' });
      setDeleteTarget(null);
      await loadData();
      setTimeout(() => setFormMessage(null), 3000);
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Category Management</h1>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-red-700 hover:text-red-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Message */}
        {formMessage && (
          <div className={`mb-6 p-4 rounded-lg ${
            formMessage.type === 'success'
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-blue-100 border border-blue-400 text-blue-700'
          }`}>
            {formMessage.text}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Form */}
          {showForm && (
            <div className="lg:col-span-1">
              <CategoryForm
                category={editingCategory}
                allCategories={categories.filter(c => c.id !== editingCategory?.id)}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                }}
                isLoading={loading}
              />
            </div>
          )}

          {/* Right Side - List/Tree */}
          <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'list'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setActiveTab('tree')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'tree'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Tree View
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="inline-block">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                  <p className="mt-4 text-gray-600">Loading categories...</p>
                </div>
              </div>
            )}

            {/* Content */}
            {!loading && (
              <>
                {activeTab === 'list' && (
                  <CategoryList
                    categories={categories}
                    onEdit={handleEdit}
                    onDelete={(cat) => setDeleteTarget(cat)}
                    onCreateNew={handleCreateNew}
                    isLoading={loading}
                  />
                )}

                {activeTab === 'tree' && (
                  <CategoryTree
                    tree={categoryTree}
                    onEdit={handleEdit}
                    onDelete={(cat) => setDeleteTarget(cat)}
                    onAddChild={handleAddChild}
                    isLoading={loading}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={loading}
      />
    </div>
  );
}
