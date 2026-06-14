import { useState, useEffect, useRef } from 'react';
import mediaService from '../../services/mediaService';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { API_BASE_URL } from '../../services/api';

const toFullUrl = (url) => {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return url;
};

export function MediaLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlForm, setUrlForm] = useState({ url: '', media_type: 'image', folder: '/' });
  const [lastUploaded, setLastUploaded] = useState(null);
  const dismissTimer = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter) params.media_type = filter;
      const res = await mediaService.list(params);
      setItems(res.data);
    } catch {} finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);
    try {
      let last;
      for (const file of files) {
        const res = await mediaService.upload(file);
        last = res.data;
      }
      if (last) {
        setLastUploaded(last);
        if (dismissTimer.current) clearTimeout(dismissTimer.current);
        dismissTimer.current = setTimeout(() => setLastUploaded(null), 8000);
      }
      await load();
    } catch (err) { alert('Upload failed'); }
    finally { setUploading(false); fileRef.current.value = ''; }
  };

  const handleSaveUrl = async () => {
    try {
      await mediaService.saveUrl(urlForm);
      setShowUrlModal(false);
      setUrlForm({ url: '', media_type: 'image', folder: '/' });
      await load();
    } catch (err) { alert('Failed to save URL'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await mediaService.delete(deleteTarget.id); setDeleteTarget(null); load(); } catch {}
  };

  const copyUrl = async (url) => {
    try {
      const full = toFullUrl(url);
      await navigator.clipboard.writeText(full);
      setCopiedId(full);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const getFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage images, videos, and documents.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="file" ref={fileRef} onChange={handleUpload} multiple accept="image/*,video/*" className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
          <button onClick={() => setShowUrlModal(true)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">
            Add URL
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['', 'image', 'video'].map(type => (
          <button key={type} onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm border ${filter === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-300 hover:bg-gray-50'}`}>
            {type || 'All'}
          </button>
        ))}
      </div>

      {showUrlModal && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-10 pb-10 overflow-y-auto" onClick={() => setShowUrlModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl p-5 md:p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Add Media URL</h2>
              <button onClick={() => setShowUrlModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">URL</label>
                <input type="url" value={urlForm.url} onChange={e => setUrlForm({...urlForm, url: e.target.value})} placeholder="https://example.com/image.jpg" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Type</label>
                <select value={urlForm.media_type} onChange={e => setUrlForm({...urlForm, media_type: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1 font-medium">Folder</label>
                <input type="text" value={urlForm.folder} onChange={e => setUrlForm({...urlForm, folder: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveUrl} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Save</button>
                <button onClick={() => setShowUrlModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {lastUploaded && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-700 truncate">{toFullUrl(lastUploaded.url)}</span>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => copyUrl(lastUploaded.url)} className="text-xs px-2.5 py-1 rounded bg-green-600 text-white hover:bg-green-700">
              {copiedId === toFullUrl(lastUploaded.url) ? 'Copied!' : 'Copy URL'}
            </button>
            <button onClick={() => setLastUploaded(null)} className="text-xs px-2 py-1 rounded text-green-600 hover:bg-green-100">Dismiss</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading media...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden group relative">
              {item.media_type === 'image' ? (
                <div className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img src={toFullUrl(item.url)} alt={item.alt_text} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ) : item.media_type === 'video' ? (
                <div className="h-32 bg-gray-100 flex items-center justify-center">
                  <video src={toFullUrl(item.url)} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-400">
                  <span className="text-3xl">&#x1F4C4;</span>
                </div>
              )}
              <div className="p-2">
                <p className="text-xs truncate">{item.original_name}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  {item.width && item.height && <span>{item.width}x{item.height}</span>}
                  {item.file_size && <span>{getFileSize(item.file_size)}</span>}
                </div>
                <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyUrl(item.url)} className="text-xs text-blue-600 hover:text-blue-700">
                    {copiedId === toFullUrl(item.url) ? 'Copied!' : 'Copy URL'}
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500">
              No media files yet. Upload images or add URLs to get started.
            </div>
          )}
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete Media" message={`Delete "${deleteTarget?.original_name}"? This cannot be undone.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

export default MediaLibrary;
