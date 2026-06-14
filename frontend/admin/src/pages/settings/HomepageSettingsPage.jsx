import { useEffect, useState, useCallback } from 'react';
import settingsService from '../../services/settingsService';

const isVideoUrl = (url) => /\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i.test(url);
const isImageUrl = (url) => /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|$)/i.test(url);

/**
 * HomepageSettingsPage — Admin panel page for configuring the homepage
 * background video feature (enable toggle + URL input).
 */
export function HomepageSettingsPage() {
  const [enabled, setEnabled] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }
  const [urlError, setUrlError] = useState('');

  // -------------------------------------------------------------------
  // Load current settings
  // -------------------------------------------------------------------
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingsService.getHomepageSettings();
      setEnabled(!!res.data.background_video_enabled);
      setVideoUrl(res.data.background_video_url || '');
    } catch {
      showToast('error', 'Failed to load homepage settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  // -------------------------------------------------------------------
  // Toast helpers
  // -------------------------------------------------------------------
  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // -------------------------------------------------------------------
  // Client-side URL validation (mirrors backend rules)
  // -------------------------------------------------------------------
  const validateUrl = (url) => {
    if (!url || url.trim() === '') return '';
    const trimmed = url.trim();
    if (trimmed.length > 1000) return 'URL must not exceed 1000 characters.';
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return 'URL must start with http:// or https://';
    }
    if (/[<>"]/u.test(trimmed)) return 'URL contains invalid characters.';
    return '';
  };

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setVideoUrl(val);
    setUrlError(validateUrl(val));
  };

  // -------------------------------------------------------------------
  // Save
  // -------------------------------------------------------------------
  const handleSave = async () => {
    const err = validateUrl(videoUrl);
    if (err) { setUrlError(err); return; }

    setSaving(true);
    try {
      await settingsService.updateHomepageSettings({
        background_video_enabled: enabled,
        background_video_url: videoUrl.trim() || null,
      });
      showToast('success', 'Homepage settings saved successfully!');
    } catch (ex) {
      const detail = ex.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d) => d.msg).join(' ')
        : detail || 'Failed to save settings.';
      showToast('error', msg);
    } finally {
      setSaving(false);
    }
  };

  // -------------------------------------------------------------------
  // Render helpers
  // -------------------------------------------------------------------
  if (loading) {
    return (
      <div className="hsp-loading" aria-busy="true">
        <div className="hsp-spinner" />
        <span>Loading homepage settings…</span>
      </div>
    );
  }

  return (
    <div className="hsp">
      {/* ── Toast ────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`hsp-toast hsp-toast--${toast.type}`} role="alert">
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      <div className="hsp-header">
        <h2 className="hsp-title">Homepage Settings</h2>
        <p className="hsp-subtitle">
          Configure the background video displayed on the storefront homepage.
          Changes are reflected immediately after saving.
        </p>
      </div>

      {/* ── Card: Video Toggle ────────────────────────────────────────── */}
      <div className="hsp-card">
        <div className="hsp-card__header">
          <div className="hsp-card__icon">🎬</div>
          <div>
            <h3 className="hsp-card__title">Background Media</h3>
            <p className="hsp-card__desc">
              Show a full-screen video or image behind the hero section.
            </p>
          </div>
          {/* Toggle */}
          <button
            id="homepage-video-toggle"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled((v) => !v)}
            className={`hsp-toggle ${enabled ? 'hsp-toggle--on' : ''}`}
          >
            <span className="hsp-toggle__thumb" />
            <span className="sr-only">{enabled ? 'Disable' : 'Enable'} background video</span>
          </button>
        </div>

        {/* ── URL input ─────────────────────────────────────────────── */}
        <div className={`hsp-url-section ${enabled ? 'hsp-url-section--visible' : ''}`}>
          <label htmlFor="homepage-video-url" className="hsp-label">
            Background Media URL
          </label>
          <input
            id="homepage-video-url"
            type="url"
            value={videoUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/video.mp4 or https://example.com/image.jpg"
            className={`hsp-input ${urlError ? 'hsp-input--error' : ''}`}
            disabled={!enabled}
          />
          {urlError && (
            <p className="hsp-error-msg" role="alert">{urlError}</p>
          )}
          <p className="hsp-hint">
            Supports direct links to video files (MP4, WebM, OGG) or image files (JPG, PNG, GIF, WebP).
            The URL must start with http:// or https://.
          </p>

          {/* Live preview thumbnail */}
          {enabled && videoUrl && !urlError && (
            <div className="hsp-preview">
              <p className="hsp-preview__label">Preview</p>
              {isVideoUrl(videoUrl) ? (
                <video
                  key={videoUrl}
                  className="hsp-preview__media"
                  src={videoUrl}
                  muted
                  autoPlay
                  loop
                  playsInline
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const errEl = e.currentTarget.parentElement.querySelector('.hsp-preview__err');
                    if (errEl) errEl.style.display = 'block';
                  }}
                />
              ) : (
                <img
                  key={videoUrl}
                  className="hsp-preview__media hsp-preview__media--img"
                  src={videoUrl}
                  alt="Background preview"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const errEl = e.currentTarget.parentElement.querySelector('.hsp-preview__err');
                    if (errEl) errEl.style.display = 'block';
                  }}
                />
              )}
              <p className="hsp-preview__err" style={{ display: 'none' }}>
                ⚠ Could not load media — check the URL.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Save button ───────────────────────────────────────────────── */}
      <div className="hsp-actions">
        <button
          id="homepage-settings-save"
          onClick={handleSave}
          disabled={saving || !!urlError}
          className="hsp-save-btn"
        >
          {saving ? (
            <><span className="hsp-spinner hsp-spinner--sm" /> Saving…</>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>

      <style>{`
        /* ================================================================
           HomepageSettingsPage — scoped styles
           ================================================================ */
        .sr-only {
          position: absolute; width: 1px; height: 1px;
          padding: 0; margin: -1px; overflow: hidden;
          clip: rect(0,0,0,0); white-space: nowrap; border-width: 0;
        }

        .hsp-loading {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 2rem; color: #6b7280; font-size: 0.95rem;
        }

        .hsp-spinner {
          width: 20px; height: 20px;
          border: 2px solid #e5e7eb;
          border-top-color: #2563eb;
          border-radius: 50%;
          animation: hsp-spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        .hsp-spinner--sm { width: 14px; height: 14px; border-width: 2px; }
        @keyframes hsp-spin { to { transform: rotate(360deg); } }

        .hsp-toast {
          position: fixed; top: 1.25rem; right: 1.5rem; z-index: 9999;
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          font-size: 0.9rem; font-weight: 500;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          animation: hsp-slide-in 0.3s ease;
        }
        .hsp-toast--success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
        .hsp-toast--error   { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
        @keyframes hsp-slide-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hsp { max-width: 720px; padding: 0 4px; }

        .hsp-header { margin-bottom: 1.5rem; }
        .hsp-title { font-size: 1.35rem; font-weight: 700; color: #111827; margin: 0 0 0.3rem; }
        .hsp-subtitle { font-size: 0.9rem; color: #6b7280; margin: 0; }

        .hsp-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 6px rgba(0,0,0,0.06);
        }

        .hsp-card__header {
          display: flex; align-items: center; gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          flex-wrap: wrap;
        }
        .hsp-card__icon { font-size: 1.6rem; flex-shrink: 0; }
        .hsp-card__title { font-size: 1rem; font-weight: 600; color: #111827; margin: 0; }
        .hsp-card__desc { font-size: 0.82rem; color: #6b7280; margin: 0.15rem 0 0; }
        .hsp-card__header > :nth-child(2) { flex: 1; }

        /* Toggle switch */
        .hsp-toggle {
          position: relative;
          width: 48px; height: 26px;
          background: #d1d5db;
          border: none; border-radius: 999px;
          cursor: pointer;
          transition: background 0.2s ease;
          flex-shrink: 0;
        }
        .hsp-toggle--on { background: #2563eb; }
        .hsp-toggle__thumb {
          position: absolute;
          top: 3px; left: 3px;
          width: 20px; height: 20px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          transition: transform 0.2s ease;
        }
        .hsp-toggle--on .hsp-toggle__thumb { transform: translateX(22px); }

        /* URL section */
        .hsp-url-section {
          padding: 0 1.5rem;
          max-height: 0; overflow: hidden;
          transition: max-height 0.35s ease, padding 0.2s ease;
        }
        .hsp-url-section--visible {
          max-height: 600px;
          padding: 1.25rem 1.5rem;
        }

        .hsp-label {
          display: block;
          font-size: 0.875rem; font-weight: 600;
          color: #374151; margin-bottom: 0.4rem;
        }
        .hsp-input {
          width: 100%;
          padding: 0.6rem 0.875rem;
          border: 1.5px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.9rem; color: #111827;
          outline: none; transition: border-color 0.18s ease, box-shadow 0.18s ease;
          box-sizing: border-box;
        }
        .hsp-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }
        .hsp-input--error { border-color: #dc2626; }
        .hsp-input:disabled { background: #f9fafb; cursor: not-allowed; color: #9ca3af; }

        .hsp-error-msg {
          margin: 0.3rem 0 0;
          font-size: 0.8rem; color: #dc2626;
        }
        .hsp-hint {
          margin: 0.45rem 0 0;
          font-size: 0.8rem; color: #6b7280; line-height: 1.5;
        }

        /* Preview */
        .hsp-preview { margin-top: 1rem; }
        .hsp-preview__label {
          font-size: 0.8rem; font-weight: 600; color: #374151;
          margin: 0 0 0.4rem; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .hsp-preview__media {
          width: 100%; max-height: 200px;
          object-fit: cover; border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #000;
        }
        .hsp-preview__media--img {
          object-fit: contain;
          background: #f3f4f6;
        }
        .hsp-preview__err {
          font-size: 0.85rem; color: #b45309;
          padding: 0.5rem 0.75rem;
          background: #fffbeb; border: 1px solid #fde68a;
          border-radius: 6px; margin-top: 0.5rem;
        }

        /* Save button */
        .hsp-actions { display: flex; }
        .hsp-save-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.65rem 1.75rem;
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: #fff; border: none; border-radius: 10px;
          font-size: 0.95rem; font-weight: 600;
          cursor: pointer; transition: opacity 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
          box-shadow: 0 3px 12px rgba(37,99,235,0.35);
        }
        .hsp-save-btn:hover:not(:disabled) {
          opacity: 0.92; transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(37,99,235,0.4);
        }
        .hsp-save-btn:disabled {
          opacity: 0.55; cursor: not-allowed; transform: none;
        }
      `}</style>
    </div>
  );
}

export default HomepageSettingsPage;
