import { useState } from 'react';
import resetService from '../services/resetService';

export function ResetDatabaseModal({ isOpen, onClose, onSuccess }) {
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = typed === 'RESET' && checked && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      await resetService.resetDatabase({ confirmation: 'RESET', backup: true });
      onSuccess();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setTyped('');
    setChecked(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-red-100 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-red-600">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-800">Reset Database</h2>
              <p className="text-sm text-red-600">This action cannot be undone.</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-700 leading-relaxed">
              This will permanently delete <strong>all</strong> data including products, orders, customers, settings, and media.
              The database will be restored to its original default seed state. A backup will be created before the reset.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Type <span className="font-mono font-bold text-red-600">RESET</span> to confirm:
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type RESET"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono
                         focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400
                         placeholder:text-gray-300"
              autoFocus
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-red-600
                         focus:ring-red-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-xs text-gray-600 group-hover:text-gray-800 leading-relaxed select-none">
              I understand this will permanently delete all data
            </span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200
                       rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 rounded-lg
                       hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                       flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Resetting...' : 'Reset Database'}
          </button>
        </div>
      </div>
    </div>
  );
}
