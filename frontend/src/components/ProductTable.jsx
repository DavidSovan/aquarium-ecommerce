import { useState } from 'react';

export function ProductTable({ products, total, skip, limit, onEdit, onDelete, onCreateNew, onPageChange, isLoading = false }) {
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;

  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    onPageChange(0, limit, searchTerm, field, newOrder);
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onPageChange(0, limit, term, sortBy, sortOrder);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span className="text-gray-400 ml-1">&#8597;</span>;
    return sortOrder === 'asc'
      ? <span className="text-blue-600 ml-1">&#8593;</span>
      : <span className="text-blue-600 ml-1">&#8595;</span>;
  };

  const formatPrice = (price) => {
    return `$${Number(price).toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <button
            onClick={onCreateNew}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            + New Product
          </button>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">&#128269;</span>
          <input
            type="text"
            placeholder="Search products by name, description or SKU..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-500 text-lg">No products found</p>
          <button
            onClick={onCreateNew}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Create the first product
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Image</th>
                  <th onClick={() => handleSort('name')} className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100">
                    <div className="flex items-center">Name <SortIcon field="name" /></div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th onClick={() => handleSort('price')} className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100">
                    <div className="flex items-center">Price <SortIcon field="price" /></div>
                  </th>
                  <th onClick={() => handleSort('stock_quantity')} className="px-6 py-3 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100">
                    <div className="flex items-center">Stock <SortIcon field="stock_quantity" /></div>
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {product.thumbnail ? (
                        <img src={product.thumbnail} alt={product.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <span className="text-gray-400 text-xs text-center px-1">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      <div>{product.name}</div>
                      <div className="text-xs text-gray-500 mt-1">SKU: {product.sku || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {product.category?.name || product.category_id || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium">{formatPrice(product.price)}</div>
                      {product.discount_price && (
                        <div className="text-xs text-red-600 line-through">{formatPrice(product.discount_price)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-medium ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-block w-fit px-3 py-1 rounded-full text-xs font-medium ${
                          product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {product.is_featured && (
                          <span className="inline-block w-fit px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-2">
                      <button onClick={() => onEdit(product)} disabled={isLoading}
                        className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50">
                        Edit
                      </button>
                      <button onClick={() => onDelete(product)} disabled={isLoading}
                        className="text-red-600 hover:text-red-700 font-medium disabled:opacity-50">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Showing {skip + 1}-{Math.min(skip + limit, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange(Math.max(0, skip - limit), limit, searchTerm, sortBy, sortOrder)}
                  disabled={currentPage <= 1 || isLoading}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => onPageChange((page - 1) * limit, limit, searchTerm, sortBy, sortOrder)}
                    disabled={isLoading}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => onPageChange(skip + limit, limit, searchTerm, sortBy, sortOrder)}
                  disabled={currentPage >= totalPages || isLoading}
                  className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
