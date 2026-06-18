import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mediaUrl } from '../utils/mediaUrl';

const isVideoUrl = (url) => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
const isYoutubeUrl = (url) => /(youtube\.com|youtu\.be)/i.test(url);

export function DynamicSection({ section }) {
  const heroStyles = useMemo(() => {
    if (section.section_type !== 'hero') return {};
    const overlayColor = section.hero_overlay_color || '#0c1445';
    const opacity = section.hero_overlay_opacity ?? 0.6;
    return {
      position: 'relative',
      minHeight: '92vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      color: section.hero_text_color || '#ffffff',
    };
  }, [section]);

  const overlayStyle = useMemo(() => {
    if (section.section_type !== 'hero') return {};
    return {
      position: 'absolute',
      inset: 0,
      backgroundColor: section.hero_overlay_color || '#0c1445',
      opacity: section.hero_overlay_opacity ?? 0.6,
    };
  }, [section]);

  const contentStyle = useMemo(() => {
    return {
      color: section.hero_text_color || (section.section_type === 'hero' ? '#ffffff' : 'inherit'),
    };
  }, [section]);

  if (!section.is_active) return null;

  if (section.section_type === 'hero') {
    return (
      <section className="relative flex items-center justify-center overflow-hidden hero-dynamic" style={{ minHeight: '95vh', backgroundColor: 'var(--header-bg)' }}>
        {section.hero_bg_video_url ? (
          <>
            <video
              src={mediaUrl(section.hero_bg_video_url)}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-10" style={overlayStyle} />
          </>
        ) : section.hero_bg_image ? (
          <>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${mediaUrl(section.hero_bg_image)})`, transform: 'scale(1.05)' }} />
            <div className="absolute inset-0 z-10" style={overlayStyle} />
          </>
        ) : (
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--header-bg) 0%, var(--primary) 40%, var(--accent) 100%)' }} />
        )}

        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full mix-blend-screen opacity-30 z-10 animate-[blob_20s_infinite_alternate]"
             style={{ background: section.hero_overlay_color || 'var(--primary)', filter: 'blur(100px)' }}></div>
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
            {section.hero_badge_text && (
              <div className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  color: section.hero_text_color || '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 10px rgba(0,0,0,0.3)'
                }}>
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }} />
                {section.hero_badge_text}
              </div>
            )}

            {section.hero_title && (
              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-8 drop-shadow-2xl"
                style={{ color: section.hero_text_color || '#ffffff', lineHeight: 1.05 }}>
                {section.hero_title}
              </h1>
            )}

            {section.hero_subtitle && (
              <p className="text-lg sm:text-2xl max-w-2xl mx-auto font-medium leading-relaxed mb-10" style={{ color: section.hero_text_color ? `${section.hero_text_color}EE` : 'rgba(255,255,255,0.85)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {section.hero_subtitle}
              </p>
            )}

            {(section.hero_cta_text || section.content?.cta_text) && (
              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                <Link to={section.hero_cta_url || section.content?.cta_url || '/shop'}
                  className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider transition-all hover:-translate-y-1"
                  style={{
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px color-mix(in srgb, var(--primary) 50%, transparent), inset 0 2px 0 rgba(255,255,255,0.2)',
                  }}>
                  <span>{section.hero_cta_text || section.content?.cta_text || 'Browse Shop'}</span>
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-24 z-10">
          <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--bg)" />
          </svg>
        </div>
      </section>
    );
  }

  if (section.section_type === 'banner' || section.section_type === 'promotional') {
    return (
      <section style={{ padding: 'var(--section-spacing) 1.5rem', backgroundColor: section.bg_color || 'var(--surface)' }}>
        <div style={{ maxWidth: 'var(--container-width)', margin: '0 auto' }}>
          {section.hero_title && (
            <h2 style={{ fontSize: 'var(--heading-size)', fontWeight: 700, textAlign: 'center', marginBottom: '2rem', color: 'var(--text-primary)' }}>
              {section.hero_title}
            </h2>
          )}
          {section.hero_subtitle && (
            <p style={{ fontSize: 'var(--body-size)', textAlign: 'center', maxWidth: 600, margin: '0 auto 2rem', color: 'var(--text-secondary)' }}>
              {section.hero_subtitle}
            </p>
          )}
          {(section.hero_bg_image || section.bg_image) && (
            <div style={{ textAlign: 'center' }}>
              <img src={mediaUrl(section.hero_bg_image || section.bg_image)} alt={section.hero_title || ''} style={{ maxWidth: '100%', height: 'auto', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow)' }} />
            </div>
          )}
        </div>
      </section>
    );
  }

  if (section.section_type === 'featured_categories' || section.section_type === 'featured_products') {
    return (
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: 'var(--primary)' }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            {section.hero_title && (
              <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {section.hero_title}
              </h2>
            )}
            {section.hero_subtitle && (
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                {section.hero_subtitle}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="group relative theme-surface rounded-3xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-[color-mix(in_srgb,var(--border),transparent_50%)]">
                {/* Hover gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                
                <div className="relative z-10 w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-inner" style={{ background: 'color-mix(in srgb, var(--primary) 10%, var(--surface))' }}>
                  <svg className="w-10 h-10 text-[var(--primary)] transition-transform group-hover:scale-110 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold mb-2 transition-colors group-hover:text-[var(--primary)]" style={{ color: 'var(--text-primary)' }}>
                  {section.section_type === 'featured_categories' ? 'Category Name' : 'Premium Product'}
                </h3>
                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {section.section_type === 'featured_categories' ? 'Explore collection →' : 'Starting from $XX.XX'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section.section_type === 'testimonials') {
    return (
      <section className="py-24 px-6 relative" style={{ backgroundColor: 'color-mix(in srgb, var(--surface) 50%, var(--bg))' }}>
        <div className="max-w-7xl mx-auto">
          {section.hero_title && (
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {section.hero_title}
              </h2>
              <div className="w-24 h-1 mt-6 mx-auto rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"></div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="theme-surface rounded-3xl p-8 relative shadow-lg border border-[color-mix(in_srgb,var(--border),transparent_50%)] transition-transform hover:-translate-y-1">
                {/* Quote Icon */}
                <svg className="absolute top-6 right-8 w-12 h-12 opacity-10" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary)' }}>
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-lg font-medium leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                  "Amazing products and excellent service. The quality is unmatched and shipping was incredibly fast. Highly recommended!"
                </p>
                
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full shadow-md flex items-center justify-center font-bold text-lg text-white" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}>
                    HC
                  </div>
                  <div>
                    <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Happy Customer</p>
                    <p className="text-xs font-medium uppercase tracking-wider mt-0.5" style={{ color: 'var(--primary)' }}>Verified Buyer</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section.section_type === 'custom_content') {
    return (
      <section style={{ padding: 'var(--section-spacing) 1.5rem', backgroundColor: section.bg_color || 'var(--surface)' }}>
        <div style={{ maxWidth: 'var(--container-width)', margin: '0 auto' }}>
          {section.hero_title && (
            <h2 style={{ fontSize: 'var(--heading-size)', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              {section.hero_title}
            </h2>
          )}
          <div style={{ color: 'var(--text-primary)', lineHeight: 'var(--line-height)' }}>
            {typeof section.content === 'string' ? (
              <p>{section.content}</p>
            ) : section.content?.html ? (
              <div dangerouslySetInnerHTML={{ __html: section.content.html }} />
            ) : section.hero_subtitle ? (
              <p>{section.hero_subtitle}</p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return null;
}

export default DynamicSection;
