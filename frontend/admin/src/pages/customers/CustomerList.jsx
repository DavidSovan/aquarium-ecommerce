import { useEffect, useState } from 'react';
import customerService from '../../services/customerService';

export function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const limit = 20;
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);

  useEffect(() => { loadCustomers(); }, [skip, search]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const params = { skip, limit };
      if (search) params.search = search;
      const res = await customerService.listCustomers(params);
      setCustomers(res.data.items);
      setTotal(res.data.total);
    } catch {} finally { setLoading(false); }
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;
  const formatDate = (d) => new Date(d).toLocaleDateString();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Customers</h1>

      <div className="mb-4">
        <input type="text" placeholder="Search by name or email..." value={search}
          onChange={e => { setSearch(e.target.value); setSkip(0); }}
          className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Active</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{c.first_name || c.last_name ? `${c.first_name || ''} ${c.last_name || ''}`.trim() : '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{c.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(c.created_at)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {c.is_active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={async () => {
                    try { const res = await customerService.getCustomer(c.id); setDetail(res.data); } catch {}
                  }} className="text-blue-600 hover:text-blue-700 text-sm">View</button>
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

      {detail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Customer Details</h2>
            <div className="space-y-3">
              <p><span className="text-gray-500">Name:</span> {detail.first_name || detail.last_name ? `${detail.first_name || ''} ${detail.last_name || ''}`.trim() : '-'}</p>
              <p><span className="text-gray-500">Email:</span> {detail.email}</p>
              <p><span className="text-gray-500">Joined:</span> {formatDate(detail.created_at)}</p>
              <p><span className="text-gray-500">Total Orders:</span> {detail.total_orders}</p>
              <p><span className="text-gray-500">Total Spent:</span> ${detail.total_spent?.toFixed(2)}</p>
              <button onClick={() => setDetail(null)} className="mt-4 px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
