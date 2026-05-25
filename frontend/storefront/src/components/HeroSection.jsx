import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

const isVideoUrl = (url) => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);

/**
 * HeroSection — full-screen homepage hero with dynamic background video/image support.
 *
 * States:
 *  - Settings still loading   → skeleton shimmer
 *  - Video enabled + video URL → <video> autoplay/loop/muted with overlay
 *  - Video enabled + image URL → CSS background-image with overlay
 *  - Media error / disabled    → gradient fallback banner
 */
export function HeroSection() {
  const { storeName, backgroundVideoEnabled, backgroundVideoUrl, loading } =
    useSiteSettings();

  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const isVideo = backgroundVideoUrl && isVideoUrl(backgroundVideoUrl);
  const showMedia =
    backgroundVideoEnabled &&
    backgroundVideoUrl &&
    !videoError;

  // Reset error state whenever the URL changes so a new URL gets a fresh try.
  useEffect(() => {
    setVideoError(false);
    setVideoReady(false);
  }, [backgroundVideoUrl]);

  // Update document title
  useEffect(() => {
    document.title = storeName;
  }, [storeName]);

  // -------------------------------------------------------------------------
  // Skeleton while public settings are loading
  // -------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="hero-skeleton" aria-hidden="true">
        <div className="hero-skeleton__shimmer" />
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <section className="hero" aria-label="Homepage hero">
      {/* ── Background layer ─────────────────────────────────────────────── */}
      {showMedia ? (
        isVideo ? (
          <>
            <video
              ref={videoRef}
              className={`hero__video ${videoReady ? 'hero__video--ready' : ''}`}
              src={backgroundVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onCanPlay={() => setVideoReady(true)}
              onError={() => setVideoError(true)}
              aria-hidden="true"
            />
            <div className="hero__video-overlay" aria-hidden="true" />
          </>
        ) : (
          <>
            <div
              className="hero__image-bg"
              style={{ backgroundImage: `url(${backgroundVideoUrl})` }}
              aria-hidden="true"
            />
            <div className="hero__video-overlay" aria-hidden="true" />
          </>
        )
      ) : (
        <div className="hero__fallback-bg" aria-hidden="true" />
      )}

      {/* ── Content overlay ───────────────────────────────────────────────── */}
      <div className="hero__content">
        {/* Animated badge */}
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          Premium Aquatic Collection
        </div>

        <h1 className="hero__title">
          Welcome to{' '}
          <span className="hero__title-highlight">{storeName}</span>
        </h1>

        <p className="hero__tagline">
          Discover our handcrafted selection of aquatic wonders —<br />
          from vibrant fish to stunning live corals and rare invertebrates.
        </p>

        <div className="hero__actions">
          <Link to="/shop" className="hero__btn hero__btn--primary" id="hero-browse-shop">
            Browse Shop
            <svg className="hero__btn-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <Link to="/register" className="hero__btn hero__btn--secondary" id="hero-get-started">
            Get Started
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="hero__scroll-hint" aria-hidden="true">
          <span className="hero__scroll-dot" />
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="hero__wave" aria-hidden="true">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="#f9fafb"
          />
        </svg>
      </div>

      <style>{`
        /* ================================================================
           Hero — scoped styles (kept here for self-containment)
           ================================================================ */

        .hero {
          position: relative;
          min-height: 92vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #0c1445;
        }

        /* ── Skeleton ───────────────────────────────────────────────── */
        .hero-skeleton {
          min-height: 92vh;
          background: #0c1445;
          overflow: hidden;
          position: relative;
        }
        .hero-skeleton__shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.06) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: hero-shimmer 1.6s infinite;
        }
        @keyframes hero-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ── Video background ───────────────────────────────────────── */
        .hero__video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          transition: opacity 0.8s ease;
        }
        .hero__video--ready {
          opacity: 1;
        }
        .hero__video-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(12, 20, 69, 0.72) 0%,
            rgba(10, 36, 99, 0.55) 50%,
            rgba(0, 0, 0, 0.60) 100%
          );
        }

        /* ── Image background ────────────────────────────────────────── */
        .hero__image-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        /* ── Fallback gradient banner ────────────────────────────────── */
        .hero__fallback-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            #0c1445 0%,
            #1a3a8f 30%,
            #0e5a8a 65%,
            #0a2463 100%
          );
        }
        .hero__fallback-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(56, 182, 255, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(120, 80, 255, 0.12) 0%, transparent 50%);
        }

        /* ── Content ────────────────────────────────────────────────── */
        .hero__content {
          position: relative;
          z-index: 10;
          max-width: 720px;
          margin: 0 auto;
          padding: 0 1.5rem;
          text-align: center;
          animation: hero-fade-up 0.9s ease both;
        }
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hero__badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #a8d8f0;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.35rem 1rem;
          border-radius: 999px;
          margin-bottom: 1.5rem;
        }
        .hero__badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 8px #38bdf8;
          animation: hero-pulse 2s infinite;
        }
        @keyframes hero-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        .hero__title {
          font-size: clamp(2.4rem, 6vw, 4.2rem);
          font-weight: 800;
          line-height: 1.1;
          color: #ffffff;
          margin: 0 0 1.2rem;
          text-shadow: 0 2px 20px rgba(0,0,0,0.35);
          letter-spacing: -0.02em;
        }
        .hero__title-highlight {
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero__tagline {
          font-size: clamp(1rem, 2.5vw, 1.2rem);
          color: rgba(255, 255, 255, 0.78);
          line-height: 1.7;
          margin-bottom: 2.5rem;
        }

        .hero__actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }

        .hero__btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.85rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
          cursor: pointer;
        }
        .hero__btn:hover {
          transform: translateY(-2px);
        }
        .hero__btn-icon {
          width: 18px;
          height: 18px;
          transition: transform 0.18s ease;
        }
        .hero__btn:hover .hero__btn-icon {
          transform: translateX(3px);
        }

        .hero__btn--primary {
          background: linear-gradient(135deg, #2563eb, #4f46e5);
          color: #ffffff;
          box-shadow: 0 4px 24px rgba(37, 99, 235, 0.45);
        }
        .hero__btn--primary:hover {
          background: linear-gradient(135deg, #1d4ed8, #4338ca);
          box-shadow: 0 8px 32px rgba(37, 99, 235, 0.55);
        }

        .hero__btn--secondary {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(8px);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.25);
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
        }
        .hero__btn--secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        }

        /* ── Scroll hint ─────────────────────────────────────────────── */
        .hero__scroll-hint {
          display: flex;
          justify-content: center;
        }
        .hero__scroll-dot {
          width: 2px;
          height: 40px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.6), transparent);
          border-radius: 2px;
          animation: hero-scroll 2s ease-in-out infinite;
        }
        @keyframes hero-scroll {
          0%, 100% { transform: scaleY(1); opacity: 0.8; }
          50%       { transform: scaleY(0.5); opacity: 0.3; }
        }

        /* ── Wave ────────────────────────────────────────────────────── */
        .hero__wave {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
          z-index: 5;
        }
        .hero__wave svg {
          width: 100%;
          height: 100%;
        }

        /* ── Responsive ──────────────────────────────────────────────── */
        @media (max-width: 640px) {
          .hero {
            min-height: 100svh;
          }
          .hero__content {
            padding: 0 1.25rem;
          }
          .hero__actions {
            flex-direction: column;
            align-items: center;
          }
          .hero__btn {
            width: 100%;
            max-width: 280px;
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
}

export default HeroSection;
