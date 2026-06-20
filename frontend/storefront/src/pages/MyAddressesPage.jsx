import { useEffect, useState } from 'react';
import addressService from '../services/addressService';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { LocationPicker } from '../components/LocationPicker';

export function MyAddressesPage() {
  const { storeName } = useSiteSettings();
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    document.title = `My Addresses - ${storeName}`;
  }, [storeName]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ full_name: '', phone: '', country: '', city: '', address_line: '', postal_code: '', is_default: false, latitude: null, longitude: null });

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
      setForm({ full_name: '', phone: '', country: '', city: '', address_line: '', postal_code: '', is_default: false, latitude: null, longitude: null });
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

  if (loading) {
    return (
      <div style={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
        <div style={{ width: 32, height: 32, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="theme-text-primary" style={{ fontSize: '1.75rem', fontWeight: 700 }}>My Addresses</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ full_name: '', phone: '', country: '', city: '', address_line: '', postal_code: '', is_default: false, latitude: null, longitude: null }); }}
          className="theme-btn-primary" style={{ border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem 1rem' }}>
          + Add Address
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setShowForm(false)}>
          <div className="theme-surface theme-border theme-rounded" style={{ padding: '1.5rem', maxWidth: 448, width: '100%', margin: '0 1rem' }} onClick={e => e.stopPropagation()}>
            <h2 className="theme-text-primary" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>{editing ? 'Edit Address' : 'New Address'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input placeholder="Full Name" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }} />
              <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input placeholder="Country" value={form.country} onChange={e => setForm({...form, country: e.target.value})} required
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }} />
                <input placeholder="City" value={form.city} onChange={e => setForm({...form, city: e.target.value})} required
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <input placeholder="Address Line" value={form.address_line} onChange={e => setForm({...form, address_line: e.target.value})} required
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none' }} />
              <input placeholder="Postal Code" value={form.postal_code} onChange={e => setForm({...form, postal_code: e.target.value})}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.875rem', background: 'var(--surface)', color: 'var(--text-primary)', outline: 'none', marginBottom: '0.5rem' }} />
              
              <LocationPicker 
                value={{ latitude: form.latitude, longitude: form.longitude }} 
                onChange={(val) => setForm({...form, latitude: val.latitude, longitude: val.longitude})} 
              />

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={form.is_default} onChange={e => setForm({...form, is_default: e.target.checked})} />
                Set as default address
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button type="submit" className="theme-btn-primary" style={{ flex: 1, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', padding: '0.5rem' }}>Save</button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ flex: 1, padding: '0.5rem', border: '1px solid var(--border)', borderRadius: 'var(--button-radius)', cursor: 'pointer', fontSize: '0.875rem', background: 'transparent', color: 'var(--text-secondary)' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addresses.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 0' }}>
          <p className="theme-text-secondary">No addresses saved</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {addresses.map(addr => (
            <div key={addr.id} className="theme-surface theme-border theme-rounded" style={{ padding: '1.5rem', position: 'relative' }}>
              {addr.is_default && (
                <span style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--primary)', color: '#ffffff', padding: '0.125rem 0.5rem', borderRadius: 999, fontWeight: 600 }}>
                  Default
                </span>
              )}
              <p className="theme-text-primary" style={{ fontWeight: 600 }}>{addr.full_name}</p>
              <p className="theme-text-secondary" style={{ fontSize: '0.875rem' }}>{addr.address_line}</p>
              <p className="theme-text-secondary" style={{ fontSize: '0.875rem' }}>{addr.city}, {addr.country}</p>
              <p className="theme-text-secondary" style={{ fontSize: '0.875rem' }}>{addr.phone}</p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button onClick={() => { setEditing(addr); setForm(addr); setShowForm(true); }} className="theme-text-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', padding: 0 }}>Edit</button>
                <button onClick={() => handleDelete(addr.id)} className="theme-danger" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', padding: 0 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
