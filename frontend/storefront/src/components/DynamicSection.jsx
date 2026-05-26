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
      <section style={heroStyles} className="hero-dynamic">
        {section.hero_bg_video_url ? (
          <>
            <video
              src={mediaUrl(section.hero_bg_video_url)}
              autoPlay
              loop
              muted
              playsInline
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={overlayStyle} />
          </>
        ) : section.hero_bg_image ? (
          <>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${mediaUrl(section.hero_bg_image)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div style={overlayStyle} />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0c1445 0%, #1a3a8f 30%, #0e5a8a 65%, #0a2463 100%)' }} />
        )}

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 720, margin: '0 auto', padding: '0 1.5rem', textAlign: 'center' }}>
          {section.hero_badge_text && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: section.hero_text_color || '#a8d8f0', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '0.35rem 1rem', borderRadius: 999, marginBottom: '1.5rem' }}>
              {section.hero_badge_text}
            </div>
          )}

          {section.hero_title && (
            <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 800, lineHeight: 1.1, color: section.hero_text_color || '#ffffff', margin: '0 0 1.2rem', textShadow: '0 2px 20px rgba(0,0,0,0.35)', letterSpacing: '-0.02em' }}>
              {section.hero_title}
            </h1>
          )}

          {section.hero_subtitle && (
            <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: section.hero_text_color ? `${section.hero_text_color}CC` : 'rgba(255,255,255,0.78)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              {section.hero_subtitle}
            </p>
          )}

          {(section.hero_cta_text || section.content?.cta_text) && (
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link to={section.hero_cta_url || section.content?.cta_url || '/shop'}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.85rem 2rem', borderRadius: 'var(--button-radius)', fontSize: '1rem', fontWeight: 600, textDecoration: 'none', background: 'var(--button-bg)', color: 'var(--button-text)', boxShadow: 'var(--button-shadow)', border: 'none', cursor: 'pointer', transition: 'transform 0.18s ease, box-shadow 0.18s ease' }}>
                {section.hero_cta_text || section.content?.cta_text || 'Browse Shop'}
              </Link>
            </div>
          )}
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
      <section style={{ padding: 'var(--section-spacing) 1.5rem' }}>
        <div style={{ maxWidth: 'var(--container-width)', margin: '0 auto' }}>
          {section.hero_title && (
            <h2 style={{ fontSize: 'var(--heading-size)', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {section.hero_title}
            </h2>
          )}
          {section.hero_subtitle && (
            <p style={{ fontSize: 'var(--body-size)', textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {section.hero_subtitle}
            </p>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(250px, 1fr))`, gap: '1.5rem' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow)', padding: '1.5rem', textAlign: 'center', border: '1px solid var(--border)' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'var(--primary)', margin: '0 auto 1rem', opacity: 0.2 }} />
                <h3 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {section.section_type === 'featured_categories' ? 'Category Name' : 'Product Name'}
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {section.section_type === 'featured_categories' ? 'Shop the collection' : 'Starting from $XX.XX'}
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
      <section style={{ padding: 'var(--section-spacing) 1.5rem', backgroundColor: 'var(--surface)' }}>
        <div style={{ maxWidth: 'var(--container-width)', margin: '0 auto' }}>
          {section.hero_title && (
            <h2 style={{ fontSize: 'var(--heading-size)', fontWeight: 700, textAlign: 'center', marginBottom: '2rem', color: 'var(--text-primary)' }}>
              {section.hero_title}
            </h2>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ padding: '1.5rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  "Amazing products and excellent service. Highly recommended!"
                </p>
                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--primary)', opacity: 0.3 }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Happy Customer</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Verified Buyer</p>
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
