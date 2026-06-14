import { useEffect, useState } from 'react';
import couponService from '../../services/couponService';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export function CouponList() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: 0, max_uses: 0, starts_at: '', expires_at: '' });

  useEffect(() => { loadCoupons(); }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try { const res = await couponService.listCoupons(); setCoupons(res.data); } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, discount_value: parseFloat(form.discount_value), min_order_amount: parseFloat(form.min_order_amount) || 0, max_uses: parseInt(form.max_uses) || 0 };
      if (data.starts_at) data.starts_at = new Date(data.starts_at).toISOString();
      else delete data.starts_at;
      if (data.expires_at) data.expires_at = new Date(data.expires_at).toISOString();
      else delete data.expires_at;
      if (editing) { await couponService.updateCoupon(editing.id, data); }
      else { await couponService.createCoupon(data); }
      setShowForm(false); setEditing(null); loadCoupons();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await couponService.deleteCoupon(deleteTarget.id); setDeleteTarget(null); loadCoupons(); } catch {}
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '-';

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Coupons</h1>
        <button onClick={() => { setEditing(null); setForm({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: 0, max_uses: 0, starts_at: '', expires_at: '' }); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">+ New Coupon</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-10 pb-10 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-5 md:p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Coupon' : 'New Coupon'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <select value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option>
              </select>
              <input type="number" step="0.01" placeholder="Discount Value" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <input type="number" step="0.01" placeholder="Min Order Amount" value={form.min_order_amount} onChange={e => setForm({...form, min_order_amount: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <input type="number" placeholder="Max Uses (0 = unlimited)" value={form.max_uses} onChange={e => setForm({...form, max_uses: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><label className="block text-xs text-gray-500 mb-1">Start date</label><input type="datetime-local" value={form.starts_at} onChange={e => setForm({...form, starts_at: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Expiry date</label><input type="datetime-local" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Uses</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expires</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900 whitespace-nowrap">{c.code}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{c.discount_type}</td>
                  <td className="px-5 py-4 text-right text-sm font-medium">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`}</td>
                  <td className="px-5 py-4 text-right text-sm text-gray-500">{c.used_count}/{c.max_uses || '\u221E'}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(c.expires_at)}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${c.is_active ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-100 text-gray-500 ring-gray-500/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditing(c); setForm({ code: c.code, description: c.description || '', discount_type: c.discount_type, discount_value: c.discount_value, min_order_amount: c.min_order_amount, max_uses: c.max_uses, starts_at: c.starts_at ? new Date(c.starts_at).toISOString().slice(0, 16) : '', expires_at: c.expires_at ? new Date(c.expires_at).toISOString().slice(0, 16) : '' }); setShowForm(true); }}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Edit</button>
                      <button onClick={() => setDeleteTarget(c)} className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete Coupon" message={`Delete coupon "${deleteTarget?.code}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
