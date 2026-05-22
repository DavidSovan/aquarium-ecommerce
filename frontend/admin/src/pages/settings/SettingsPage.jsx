import { useEffect, useState } from 'react';
import settingsService from '../../services/settingsService';

export function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    setLoading(true);
    try { const res = await settingsService.listSettings(); setSettings(res.data); } catch {} finally { setLoading(false); }
  };

  const handleSave = async (key) => {
    try {
      await settingsService.updateSetting(key, { value: editValue });
      setEditingKey(null);
      loadSettings();
    } catch (err) { alert(err.response?.data?.detail || 'Failed'); }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Key</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Value</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {settings.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-sm">{s.key}</td>
                <td className="px-6 py-4">
                  {editingKey === s.key ? (
                    <div className="flex gap-2">
                      <input value={editValue} onChange={e => setEditValue(e.target.value)} className="flex-1 px-2 py-1 border rounded text-sm" />
                      <button onClick={() => handleSave(s.key)} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Save</button>
                      <button onClick={() => setEditingKey(null)} className="px-3 py-1 bg-gray-200 text-sm rounded hover:bg-gray-300">Cancel</button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-600">{s.value || '-'}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{s.description || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setEditingKey(s.key); setEditValue(s.value || ''); }} className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
