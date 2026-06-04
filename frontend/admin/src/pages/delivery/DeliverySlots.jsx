import { useEffect, useState, useCallback, useRef } from 'react';
import deliveryService from '../../services/deliveryService';
import settingsService from '../../services/settingsService';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const DEFAULT_START = '08:00';
const DEFAULT_END = '12:00';

export function DeliverySlots() {
  const { reload } = useSiteSettings();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [featureEnabled, setFeatureEnabled] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const [form, setForm] = useState({
    name: '',
    start_time: DEFAULT_START,
    end_time: DEFAULT_END,
    max_capacity: 10,
    is_active: true,
  });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  useEffect(() => {
    loadSlots();
    loadFeatureSetting();
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const res = await deliveryService.listSlots();
      setSlots(res.data);
    } catch { showToast('Failed to load delivery slots', 'error'); }
    finally { setLoading(false); }
  };

  const loadFeatureSetting = async () => {
    try {
      const res = await settingsService.listSettings();
      const setting = res.data.find(s => s.key === 'enable_delivery_scheduling');
      if (setting) setFeatureEnabled(setting.value === 'true');
    } catch {}
  };

  const handleToggleFeature = async () => {
    const newValue = featureEnabled ? 'false' : 'true';
    try {
      await settingsService.updateSetting('enable_delivery_scheduling', { value: newValue });
      setFeatureEnabled(!featureEnabled);
      showToast(`Delivery scheduling ${!featureEnabled ? 'enabled' : 'disabled'}`);
      reload();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to update setting', 'error');
    }
  };

  const resetForm = () => {
    setForm({ name: '', start_time: DEFAULT_START, end_time: DEFAULT_END, max_capacity: 10, is_active: true });
    setEditingSlot(null);
    setShowForm(false);
  };

  const handleEdit = (slot) => {
    setForm({
      name: slot.name,
      start_time: slot.start_time.slice(0, 5),
      end_time: slot.end_time.slice(0, 5),
      max_capacity: slot.max_capacity,
      is_active: slot.is_active,
    });
    setEditingSlot(slot);
    setShowForm(true);
  };

  const handleDelete = async (slot) => {
    if (!window.confirm(`Delete delivery slot "${slot.name}"?`)) return;
    try {
      await deliveryService.deleteSlot(slot.id);
      showToast(`Slot "${slot.name}" deleted`);
      loadSlots();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to delete slot', 'error');
    }
  };

  const handleToggleActive = async (slot) => {
    try {
      await deliveryService.toggleActive(slot.id, !slot.is_active);
      showToast(`Slot "${slot.name}" ${!slot.is_active ? 'activated' : 'deactivated'}`);
      loadSlots();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to toggle slot', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('Name is required', 'error'); return; }
    setSaving(true);
    try {
      if (editingSlot) {
        await deliveryService.updateSlot(editingSlot.id, form);
        showToast(`Slot "${form.name}" updated`);
      } else {
        await deliveryService.createSlot(form);
        showToast(`Slot "${form.name}" created`);
      }
      resetForm();
      loadSlots();
    } catch (err) {
      showToast(err.response?.data?.detail || 'Failed to save slot', 'error');
    } finally { setSaving(false); }
  };

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all animate-in slide-in-from-right ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {toast.type === 'error' ? '\u26A0 ' : '\u2713 '}{toast.message}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Scheduling</h1>
        <span className="text-sm text-gray-500">{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Feature Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Enable Delivery Scheduling</h3>
            <p className="text-sm text-gray-500 mt-1">Allow customers to select delivery date and time slot during checkout</p>
          </div>
          <button
            onClick={handleToggleFeature}
            className={`relative w-14 h-7 rounded-full transition-colors ${featureEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${featureEnabled ? 'translate-x-7' : ''}`} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Status: <span className={featureEnabled ? 'text-green-600 font-medium' : 'text-gray-500'}>{featureEnabled ? 'Enabled' : 'Disabled'}</span>
        </p>
      </div>

      {/* Create Slot Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Create Delivery Slot
        </button>
      )}

      {/* Slot Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">{editingSlot ? 'Edit Delivery Slot' : 'Create Delivery Slot'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slot Name</label>
              <input
                type="text" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Morning"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time" value={form.start_time}
                onChange={e => setForm({ ...form, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time" value={form.end_time}
                onChange={e => setForm({ ...form, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label>
              <input
                type="number" value={form.max_capacity}
                onChange={e => setForm({ ...form, max_capacity: parseInt(e.target.value) || 1 })}
                min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {saving ? 'Saving...' : editingSlot ? 'Update Slot' : 'Create Slot'}
              </button>
              <button type="button" onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slots Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-sm">No delivery slots created yet.</p>
            <p className="text-gray-400 text-xs mt-1">Create your first slot to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Slot</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Capacity</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {slots.map(slot => (
                  <tr key={slot.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-900">{slot.name}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{slot.max_capacity}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleActive(slot)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset ${
                          slot.is_active
                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                            : 'bg-gray-100 text-gray-500 ring-gray-400/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${slot.is_active ? 'bg-green-400' : 'bg-gray-400'}`} />
                        {slot.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(slot)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(slot)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
