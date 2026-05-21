import { useEffect, useState, useMemo } from 'react';
import inventoryService from '../services/inventoryService';
import { useProductAPI } from '../hooks/useProductAPI';

export function AdminInventory() {
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const { products, fetchProducts, loading: productsLoading } = useProductAPI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [skip, setSkip] = useState(0);
  const [limit] = useState(20);
  const [filterProductId, setFilterProductId] = useState('');
  const [filterType, setFilterType] = useState('');

  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('increase');
  const [quantityChange, setQuantityChange] = useState('');
  const [reason, setReason] = useState('');
  const [adjustedBy, setAdjustedBy] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    fetchProducts({ limit: 100 });
  }, [fetchProducts]);

  useEffect(() => {
    loadLowStockAlerts();
    loadLogs();
  }, [skip, filterProductId, filterType]);

  const productMap = useMemo(() => {
    return Object.fromEntries(products.map(p => [p.id, p.name]));
  }, [products]);

  const loadLowStockAlerts = async () => {
    try {
      const response = await inventoryService.getLowStockAlerts();
      setLowStockAlerts(response.data);
    } catch (err) {
      console.error('Failed to load low stock alerts:', err);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = { skip, limit };
      if (filterProductId) params.product_id = filterProductId;
      if (filterType) params.adjustment_type = filterType;
      const response = await inventoryService.getLogs(params);
      setLogs(response.data.items);
      setLogsTotal(response.data.total);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load inventory logs');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    const qty = parseInt(quantityChange, 10);
    if (!selectedProductId || !qty || qty < 1) return;

    setAdjusting(true);
    setError(null);
    setSuccess(null);
    try {
      await inventoryService.adjustStock({
        product_id: parseInt(selectedProductId, 10),
        adjustment_type: adjustmentType,
        quantity_change: qty,
        reason: reason || null,
        adjusted_by: adjustedBy || null,
      });
      setSuccess('Stock adjusted successfully!');
      setQuantityChange('');
      setReason('');
      setAdjustedBy('');
      loadLowStockAlerts();
      loadLogs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to adjust stock');
    } finally {
      setAdjusting(false);
    }
  };

  const totalPages = Math.ceil(logsTotal / limit);
  const currentPage = Math.floor(skip / limit) + 1;

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  const badgeColor = (type) => {
    switch (type) {
      case 'increase': return 'bg-green-100 text-green-800';
      case 'decrease': return 'bg-red-100 text-red-800';
      case 'correction': return 'bg-yellow-100 text-yellow-800';
      case 'initial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Inventory Management</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900 font-bold">&#10005;</button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stock Adjustment Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Adjust Stock</h2>
              <form onSubmit={handleAdjust} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    required
                    disabled={productsLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                  >
                    <option value="">{productsLoading ? 'Loading products...' : 'Select a product'}</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="increase">Increase</option>
                    <option value="decrease">Decrease</option>
                    <option value="correction">Correction</option>
                    <option value="initial">Initial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantityChange}
                    onChange={(e) => setQuantityChange(e.target.value)}
                    required
                    placeholder="Enter quantity"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Optional reason"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adjusted By</label>
                  <input
                    type="text"
                    value={adjustedBy}
                    onChange={(e) => setAdjustedBy(e.target.value)}
                    placeholder="Optional name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adjusting || productsLoading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {adjusting ? 'Adjusting...' : 'Submit Adjustment'}
                </button>
              </form>
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Low Stock Alerts</h2>
              {lowStockAlerts.length === 0 ? (
                <p className="text-gray-500">No low stock products</p>
              ) : (
                <div className="space-y-3">
                  {lowStockAlerts.map(alert => (
                    <div key={alert.product_id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{alert.product_name}</p>
                        <p className="text-sm text-gray-600">Stock: {alert.current_stock} / Threshold: {alert.threshold}</p>
                      </div>
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Low
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Inventory Logs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Inventory Logs</h2>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <select
                      value={filterProductId}
                      onChange={(e) => { setFilterProductId(e.target.value); setSkip(0); }}
                      disabled={productsLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
                    >
                      <option value="">{productsLoading ? 'Loading products...' : 'All Products'}</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      value={filterType}
                      onChange={(e) => { setFilterType(e.target.value); setSkip(0); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="increase">Increase</option>
                      <option value="decrease">Decrease</option>
                      <option value="correction">Correction</option>
                      <option value="initial">Initial</option>
                    </select>
                  </div>
                </div>
              </div>

              {loading && logs.length === 0 ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600">Loading logs...</p>
                  </div>
                </div>
              ) : logs.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 text-lg">No inventory logs found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Change</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Before</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">After</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reason</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">By</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {logs.map(log => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                              {formatDateTime(log.created_at)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                              {productMap[log.product_id] || `Product #${log.product_id}`}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${badgeColor(log.adjustment_type)}`}>
                                {log.adjustment_type}
                              </span>
                            </td>
                            <td className={`px-6 py-4 text-sm text-right font-medium ${log.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {log.adjustment_type === 'decrease' ? '-' : '+'}{log.quantity_change}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 text-right">{log.quantity_before}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{log.quantity_after}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-[150px] truncate">{log.reason || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{log.adjusted_by || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Showing {skip + 1}-{Math.min(skip + limit, logsTotal)} of {logsTotal}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSkip(Math.max(0, skip - limit))}
                          disabled={currentPage <= 1 || loading}
                          className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setSkip((page - 1) * limit)}
                            disabled={loading}
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
                          onClick={() => setSkip(skip + limit)}
                          disabled={currentPage >= totalPages || loading}
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
          </div>
        </div>
      </div>
    </div>
  );
}
