import { useEffect, useState } from 'react';
import reportService from '../../services/reportService';
import { StatCard } from '../../components/StatCard';

export function ReportsPage() {
  const [sales, setSales] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [customerSummary, setCustomerSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportService.getSalesSummary(30),
      reportService.getTopProducts(30, 10),
      reportService.getCustomerSummary(),
    ]).then(([s, tp, cs]) => {
      setSales(s.data);
      setTopProducts(tp.data);
      setCustomerSummary(cs.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Orders (30d)" value={sales?.total_orders || 0} color="blue" />
        <StatCard title="Revenue (30d)" value={`$${(sales?.total_revenue || 0).toFixed(2)}`} color="green" />
        <StatCard title="Avg Order Value" value={`$${(sales?.average_order_value || 0).toFixed(2)}`} color="purple" />
        <StatCard title="Discounts" value={`$${(sales?.total_discount || 0).toFixed(2)}`} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Customer Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div><p className="text-2xl font-bold">{customerSummary?.total_customers || 0}</p><p className="text-sm text-gray-500">Total Customers</p></div>
            <div><p className="text-2xl font-bold">{customerSummary?.new_customers_30d || 0}</p><p className="text-sm text-gray-500">New (30d)</p></div>
            <div><p className="text-2xl font-bold">{customerSummary?.total_orders || 0}</p><p className="text-sm text-gray-500">Total Orders</p></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Top Products (30d)</h2>
          {topProducts.length === 0 ? <p className="text-gray-500">No data</p> : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.product_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 w-6">#{i + 1}</span>
                    <span className="font-medium text-sm">{p.product_name}</span>
                  </div>
                  <div className="text-right text-sm">
                    <span className="font-medium">{p.total_quantity} sold</span>
                    <span className="text-gray-500 ml-3">${p.total_revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
