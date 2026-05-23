import { useEffect, useState } from 'react';
import addressService from '../services/addressService';
import { useSiteSettings } from '../context/SiteSettingsContext';

export function MyAddressesPage() {
  const { storeName } = useSiteSettings();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    document.title = `My Addresses - ${storeName}`;
  }, [storeName]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ full_name: '', phone: '', country: '', city: '', address_line: '', postal_code: '', is_default: false });

  useEffect(() => { loadAddresses(); }, []);

  const loadAddresses = async () => {
    try {
      const res = await addressService.getAddresses();
      setAddresses(res.data.items);
    } catch {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await addressService.updateAddress(editing.id, form);
      } else {
        await addressService.createAddress(form);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ full_name: '', phone: '', country: '', city: '', address_line: '', postal_code: '', is_default: false });
      loadAddresses();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save address');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await addressService.deleteAddress(id);
      loadAddresses();
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ full_name: '', phone: '', country: '', city: '', address_line: '', postal_code: '', is_default: false }); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Add Address</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing ? 'Edit Address' : 'New Address'}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input placeholder="Full Name" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Country" value={form.country} onChange={e => setForm({...form, country: e.target.value})} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <input placeholder="Address Line" value={form.address_line} onChange={e => setForm({...form, address_line: e.target.value})} required className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input placeholder="Postal Code" value={form.postal_code} onChange={e => setForm({...form, postal_code: e.target.value})} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_default} onChange={e => setForm({...form, is_default: e.target.checked})} />
                Set as default address
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addresses.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No addresses saved</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(addr => (
            <div key={addr.id} className="bg-white rounded-lg shadow p-6 relative">
              {addr.is_default && <span className="absolute top-2 right-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Default</span>}
              <p className="font-medium">{addr.full_name}</p>
              <p className="text-sm text-gray-600">{addr.address_line}</p>
              <p className="text-sm text-gray-600">{addr.city}, {addr.country}</p>
              <p className="text-sm text-gray-600">{addr.phone}</p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => { setEditing(addr); setForm(addr); setShowForm(true); }} className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                <button onClick={() => handleDelete(addr.id)} className="text-red-500 hover:text-red-600 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
