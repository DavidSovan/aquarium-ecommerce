import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { mediaUrl } from '../utils/mediaUrl';

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
    <section className="relative flex items-center justify-center overflow-hidden" style={{ minHeight: '95vh', backgroundColor: 'var(--header-bg)' }}>
      {showMedia ? (
        isVideo ? (
          <>
            <video
              ref={videoRef}
              src={mediaUrl(backgroundVideoUrl)}
              autoPlay loop muted playsInline preload="auto"
              onCanPlay={() => setVideoReady(true)}
              onError={() => setVideoError(true)}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
              style={{ opacity: videoReady ? 1 : 0 }}
            />
            <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)' }} />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${mediaUrl(backgroundVideoUrl)})`, transform: 'scale(1.05)' }} />
            <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)' }} />
          </>
        )
      ) : (
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--header-bg) 0%, var(--primary) 40%, var(--accent) 100%)' }} />
      )}

      {/* Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full mix-blend-screen opacity-30 z-10 animate-[blob_20s_infinite_alternate]"
           style={{ background: 'var(--primary)', filter: 'blur(100px)' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full mix-blend-screen opacity-30 z-10 animate-[blob_25s_infinite_alternate-reverse]"
           style={{ background: 'var(--accent)', filter: 'blur(100px)' }}></div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
        <div className="max-w-4xl p-8 sm:p-14 rounded-[2.5rem]" style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)'
        }}>
          <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8"
            style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.3)'
            }}>
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }} />
            Premium Aquatic Collection
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 mb-8 drop-shadow-2xl"
            style={{ lineHeight: 1.05 }}>
            Welcome to <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              {storeName}
            </span>
          </h1>

          <p className="text-lg sm:text-2xl max-w-2xl mx-auto font-medium leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            Discover our handcrafted selection of aquatic wonders — <br className="hidden sm:block" />
            from vibrant fish to stunning live corals and rare invertebrates.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link to="/shop" 
              className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                color: '#fff',
                boxShadow: '0 10px 25px -5px color-mix(in srgb, var(--primary) 50%, transparent), inset 0 2px 0 rgba(255,255,255,0.2)',
              }}>
              <span>Browse Shop</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link to="/register" 
              className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
              }}>
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 z-10">
        <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--bg)" />
        </svg>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>
    </section>
  );
}

export default HeroSection;
