import { useEffect, useState } from 'react';
import inventoryService from '../../services/inventoryService';
import productService from '../../services/productService';

export function InventoryMgmt() {
  const [products, setProducts] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [logs, setLogs] = useState([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [skip, setSkip] = useState(0);
  const limit = 20;
  const [filterProductId, setFilterProductId] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('increase');
  const [quantityChange, setQuantityChange] = useState('');
  const [reason, setReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    productService.getProducts({ limit: 100 }).then(res => {
      const items = res.data.items;
      setProducts(items);
      setProductMap(Object.fromEntries(items.map(p => [p.id, p.name])));
    }).catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, [skip, filterProductId, filterType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logRes, lowRes] = await Promise.all([
        inventoryService.getLogs({ skip, limit, product_id: filterProductId || undefined, adjustment_type: filterType || undefined }),
        inventoryService.getLowStockAlerts(),
      ]);
      setLogs(logRes.data.items);
      setLogsTotal(logRes.data.total);
      setLowStock(lowRes.data);
    } catch {} finally { setLoading(false); }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    const qty = parseInt(quantityChange, 10);
    if (!selectedProductId || !qty) return;
    setAdjusting(true);
    setError(null);
    setSuccess(null);
    try {
      await inventoryService.adjustStock({ product_id: parseInt(selectedProductId), adjustment_type: adjustmentType, quantity_change: qty, reason: reason || null });
      setSuccess('Stock adjusted!');
      setQuantityChange('');
      setReason('');
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError(err.response?.data?.detail || 'Failed'); } finally { setAdjusting(false); }
  };

  const totalPages = Math.ceil(logsTotal / limit);
  const currentPage = Math.floor(skip / limit) + 1;
  const formatDateTime = (d) => new Date(d).toLocaleString();
  const badgeColor = (t) => ({ increase: 'bg-green-100 text-green-800', decrease: 'bg-red-100 text-red-800', correction: 'bg-yellow-100 text-yellow-800', initial: 'bg-blue-100 text-blue-800' }[t] || 'bg-gray-100');

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Inventory Management</h1>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{error} <button onClick={() => setError(null)} className="float-right font-bold">&times;</button></div>}
      {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-bold mb-4">Adjust Stock</h2>
            <form onSubmit={handleAdjust} className="space-y-4">
              <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Select product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>)}
              </select>
              <select value={adjustmentType} onChange={e => setAdjustmentType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="increase">Increase</option><option value="decrease">Decrease</option>
                <option value="correction">Correction</option><option value="initial">Initial</option>
              </select>
              <input type="number" min="1" placeholder="Quantity" value={quantityChange} onChange={e => setQuantityChange(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <input type="text" placeholder="Reason (optional)" value={reason} onChange={e => setReason(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <button type="submit" disabled={adjusting} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">{adjusting ? 'Adjusting...' : 'Submit'}</button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h2 className="text-lg font-bold mb-4">Low Stock Alerts</h2>
            {lowStock.length === 0 ? <p className="text-gray-500 text-sm">All products have sufficient stock</p> : (
              <div className="space-y-2">
                {lowStock.map(a => (
                  <div key={a.product_id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex justify-between items-center">
                    <span className="font-medium text-sm text-gray-900">{a.product_name}</span>
                    <span className="text-sm font-semibold text-orange-600">{a.current_stock}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold mb-4">Inventory Logs</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <select value={filterProductId} onChange={e => { setFilterProductId(e.target.value); setSkip(0); }} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">All Products</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select value={filterType} onChange={e => { setFilterType(e.target.value); setSkip(0); }} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">All Types</option>
                  <option value="increase">Increase</option><option value="decrease">Decrease</option>
                  <option value="correction">Correction</option><option value="initial">Initial</option>
                </select>
              </div>
            </div>
            {loading ? <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Change</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">After</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{productMap[log.product_id] || `#${log.product_id}`}</td>
                        <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeColor(log.adjustment_type)}`}>{log.adjustment_type}</span></td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{log.adjustment_type === 'decrease' ? '-' : '+'}{log.quantity_change}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-500">{log.quantity_after}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{log.reason || '\u2014'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2 p-4 border-t border-gray-100">
                <button onClick={() => setSkip(Math.max(0, skip - limit))} disabled={currentPage <= 1} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let p;
                  if (totalPages <= 5) {
                    p = i + 1;
                  } else if (currentPage <= 3) {
                    p = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    p = totalPages - 4 + i;
                  } else {
                    p = currentPage - 2 + i;
                  }
                  return (
                    <button key={p} onClick={() => setSkip((p - 1) * limit)}
                      className={`px-3 py-1.5 text-sm border rounded-lg ${currentPage === p ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}>{p}</button>
                  );
                })}
                <button onClick={() => setSkip(skip + limit)} disabled={currentPage >= totalPages} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
