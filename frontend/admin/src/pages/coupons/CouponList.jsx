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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
        <button onClick={() => { setEditing(null); setForm({ code: '', description: '', discount_type: 'percentage', discount_value: '', min_order_amount: 0, max_uses: 0, starts_at: '', expires_at: '' }); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ New Coupon</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Coupon' : 'New Coupon'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
              <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <select value={form.discount_type} onChange={e => setForm({...form, discount_type: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option>
              </select>
              <input type="number" step="0.01" placeholder="Discount Value" value={form.discount_value} onChange={e => setForm({...form, discount_value: e.target.value})} required className="w-full px-3 py-2 border rounded-lg" />
              <input type="number" step="0.01" placeholder="Min Order Amount" value={form.min_order_amount} onChange={e => setForm({...form, min_order_amount: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <input type="number" placeholder="Max Uses (0 = unlimited)" value={form.max_uses} onChange={e => setForm({...form, max_uses: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm text-gray-600">Start date</label><input type="datetime-local" value={form.starts_at} onChange={e => setForm({...form, starts_at: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
                <div><label className="text-sm text-gray-600">Expiry date</label><input type="datetime-local" value={form.expires_at} onChange={e => setForm({...form, expires_at: e.target.value})} className="w-full px-3 py-2 border rounded-lg" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">{editing ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Value</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Uses</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Expires</th>
              <th className="px-6 py-3 text-center text-sm font-semibold">Active</th>
              <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{c.code}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{c.discount_type}</td>
                <td className="px-6 py-4 text-right text-sm">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value}`}</td>
                <td className="px-6 py-4 text-right text-sm">{c.used_count}/{c.max_uses || '\u221E'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(c.expires_at)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {c.is_active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-3">
                  <button onClick={() => { setEditing(c); setForm({ code: c.code, description: c.description || '', discount_type: c.discount_type, discount_value: c.discount_value, min_order_amount: c.min_order_amount, max_uses: c.max_uses, starts_at: c.starts_at ? new Date(c.starts_at).toISOString().slice(0, 16) : '', expires_at: c.expires_at ? new Date(c.expires_at).toISOString().slice(0, 16) : '' }); setShowForm(true); }}
                    className="text-blue-600 hover:text-blue-700">Edit</button>
                  <button onClick={() => setDeleteTarget(c)} className="text-red-600 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete Coupon" message={`Delete coupon "${deleteTarget?.code}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
