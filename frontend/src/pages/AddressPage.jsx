import { useEffect, useState } from 'react';
import addressService from '../services/addressService';

function AddressForm({ address, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    full_name: '', phone: '', country: '', city: '',
    district: '', address_line: '', postal_code: '', is_default: false,
  });

  useEffect(() => {
    if (address) {
      setForm({
        full_name: address.full_name || '',
        phone: address.phone || '',
        country: address.country || '',
        city: address.city || '',
        district: address.district || '',
        address_line: address.address_line || '',
        postal_code: address.postal_code || '',
        is_default: address.is_default || false,
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">
        {address ? 'Edit Address' : 'New Address'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input type="text" name="full_name" value={form.full_name} onChange={handleChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input type="text" name="phone" value={form.phone} onChange={handleChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
          <input type="text" name="country" value={form.country} onChange={handleChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <input type="text" name="city" value={form.city} onChange={handleChange} required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
          <input type="text" name="district" value={form.district} onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address Line *</label>
          <textarea name="address_line" value={form.address_line} onChange={handleChange} required rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
          <input type="text" name="postal_code" value={form.postal_code} onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center">
          <input type="checkbox" name="is_default" checked={form.is_default} onChange={handleChange}
            className="h-4 w-4 text-blue-600 rounded" />
          <label className="ml-2 text-sm text-gray-700">Set as default address</label>
        </div>
      </div>

      <div className="flex gap-3 mt-6 justify-end">
        <button type="button" onClick={onCancel} disabled={saving}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm hover:bg-gray-300 disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : address ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

export function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => { loadAddresses(); }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const response = await addressService.getAddresses();
      setAddresses(response.data.items);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (addr) => {
    setEditing(addr);
    setShowForm(true);
  };

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (editing) {
        await addressService.updateAddress(editing.id, formData);
        showMsg('Address updated');
      } else {
        await addressService.createAddress(formData);
        showMsg('Address created');
      }
      setShowForm(false);
      setEditing(null);
      await loadAddresses();
    } catch (err) {
      showMsg(err.response?.data?.detail || 'Failed to save address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await addressService.deleteAddress(id);
      showMsg('Address deleted');
      await loadAddresses();
    } catch (err) {
      showMsg('Failed to delete address', 'error');
    }
  };

  const handleSetDefault = async (addr) => {
    try {
      await addressService.updateAddress(addr.id, { is_default: true });
      showMsg('Default address updated');
      await loadAddresses();
    } catch (err) {
      showMsg('Failed to update default', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
          {!showForm && (
            <button onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium">
              + Add Address
            </button>
          )}
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.type === 'error'
              ? 'bg-red-100 border border-red-400 text-red-700'
              : 'bg-green-100 border border-green-400 text-green-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {showForm && (
            <div className="lg:col-span-1">
              <AddressForm
                address={editing}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditing(null); }}
                saving={saving}
              />
            </div>
          )}

          <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {loading ? (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">Loading addresses...</div>
            ) : addresses.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg mb-2">No addresses yet</p>
                <p className="text-gray-400 text-sm mb-6">Add an address for shipping</p>
                <button onClick={handleCreate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                  Add Address
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map(addr => (
                  <div key={addr.id} className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                    addr.is_default ? 'border-blue-500' : 'border-transparent'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900">{addr.full_name}</h3>
                          {addr.is_default && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">DEFAULT</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{addr.address_line}</p>
                        <p className="text-sm text-gray-600">
                          {addr.district ? `${addr.district}, ` : ''}{addr.city}, {addr.country}
                        </p>
                        {(addr.postal_code || addr.phone) && (
                          <p className="text-sm text-gray-500 mt-1">
                            {addr.postal_code && `Postal: ${addr.postal_code}`}
                            {addr.postal_code && addr.phone && ' | '}
                            {addr.phone && `Phone: ${addr.phone}`}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        {!addr.is_default && (
                          <button onClick={() => handleSetDefault(addr)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                            Set Default
                          </button>
                        )}
                        <button onClick={() => handleEdit(addr)}
                          className="text-xs text-gray-600 hover:text-gray-700 font-medium">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(addr.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-medium">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
