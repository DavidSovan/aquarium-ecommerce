import { useState } from 'react';

export function CategoryList({ categories, onEdit, onDelete, onCreateNew, isLoading = false }) {
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedCategories = [...filteredCategories].sort((a, b) => {
    const aVal = a[sortBy] || '';
    const bVal = b[sortBy] || '';
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="text-gray-400">↕</span>;
    return sortOrder === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Categories</h2>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            + New Category
          </button>
        </div>
        
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search categories by name, slug or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-500 text-lg">No categories yet</p>
          <button
            onClick={onCreateNew}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Create the first category
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          No categories found matching "{searchTerm}"
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Image
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Name <SortIcon field="name" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('slug')}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Slug <SortIcon field="slug" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Parent
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedCategories.map(category => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <span className="text-gray-400 text-xs text-center px-1">No image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {category.slug}
                    </code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {category.parent?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm space-x-2">
                    <button
                      onClick={() => onEdit(category)}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(category)}
                      disabled={isLoading}
                      className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
