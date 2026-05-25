import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';

const isVideoUrl = (url) => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);

export function HeroSection() {
  const { storeName, backgroundVideoEnabled, backgroundVideoUrl, loading } =
    useSiteSettings();

  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const isVideo = backgroundVideoUrl && isVideoUrl(backgroundVideoUrl);
  const showMedia = backgroundVideoEnabled && backgroundVideoUrl && !videoError;

  useEffect(() => {
    setVideoError(false);
    setVideoReady(false);
  }, [backgroundVideoUrl]);

  useEffect(() => {
    document.title = storeName;
  }, [storeName]);

  if (loading) {
    return (
      <div style={{ minHeight: '92vh', backgroundColor: 'var(--header-bg)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.6s infinite' }} />
      </div>
    );
  }

  return (
    <section style={{
      position: 'relative',
      minHeight: '92vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: 'var(--header-bg)',
    }}>
      {showMedia ? (
        isVideo ? (
          <>
            <video
              ref={videoRef}
              src={backgroundVideoUrl}
              autoPlay loop muted playsInline preload="auto"
              onCanPlay={() => setVideoReady(true)}
              onError={() => setVideoError(true)}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: videoReady ? 1 : 0, transition: 'opacity 0.8s ease' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(12,20,69,0.72) 0%, rgba(10,36,99,0.55) 50%, rgba(0,0,0,0.60) 100%)' }} />
          </>
        ) : (
          <>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${backgroundVideoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(12,20,69,0.72) 0%, rgba(10,36,99,0.55) 50%, rgba(0,0,0,0.60) 100%)' }} />
          </>
        )
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--header-bg) 0%, var(--primary) 30%, var(--accent) 65%, var(--secondary) 100%)' }} />
      )}

      <div style={{ position: 'relative', zIndex: 10, maxWidth: 720, margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#a8d8f0', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0.35rem 1rem', borderRadius: 999, marginBottom: '1.5rem' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
          Premium Aquatic Collection
        </div>

        <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 800, lineHeight: 1.1, color: '#ffffff', margin: '0 0 1.2rem', textShadow: '0 2px 20px rgba(0,0,0,0.35)', letterSpacing: '-0.02em' }}>
          Welcome to{' '}
          <span style={{ background: 'linear-gradient(90deg, var(--accent), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {storeName}
          </span>
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Discover our handcrafted selection of aquatic wonders —<br />
          from vibrant fish to stunning live corals and rare invertebrates.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
          <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: 'var(--button-padding)', borderRadius: 'var(--button-radius)', fontSize: '1rem', fontWeight: 600, textDecoration: 'none', background: 'var(--button-bg)', color: 'var(--button-text)', boxShadow: 'var(--button-shadow)', transition: 'transform 0.18s ease, box-shadow 0.18s ease', cursor: 'pointer' }}>
            Browse Shop
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: 'var(--button-padding)', borderRadius: 'var(--button-radius)', fontSize: '1rem', fontWeight: 600, textDecoration: 'none', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer' }}>
            Get Started
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 2, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)', borderRadius: 2 }} />
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, zIndex: 5 }}>
        <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--bg)" />
        </svg>
      </div>
    </section>
  );
}

export default HeroSection;
