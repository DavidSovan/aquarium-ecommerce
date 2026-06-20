import { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';

/**
 * Branded Bakong KHQR payment card.
 *
 * Uses the Bakong Outline Template as a card background and positions
 * a pure black-and-white QR code inside the template's scan frame.
 * No logo is overlaid inside the QR itself.
 *
 * Bracket frame measured from template (1470×2079):
 *   center-x: 50.2%   center-y: 42.9%
 *   width: 47.6%       height: 39.0%
 * QR fills ~75% of bracket width → ~35% of card width.
 */
export function BakongQRCode({ khqrString, amount, merchantName }) {
  const qrContainerRef = useRef(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!khqrString || !qrContainerRef.current) return;

    const qr = new QRCodeStyling({
      width: 500,
      height: 500,
      data: khqrString,
      margin: 10,
      type: 'svg',
      qrOptions: {
        errorCorrectionLevel: 'M',
      },
      dotsOptions: {
        color: '#000000',
        type: 'square',
      },
      backgroundOptions: {
        color: '#ffffff',
      },
      cornersSquareOptions: {
        color: '#000000',
        type: 'square',
      },
      cornersDotOptions: {
        color: '#000000',
        type: 'square',
      },
    });

    const el = qrContainerRef.current;
    el.innerHTML = '';
    setHasError(false);

    try {
      qr.append(el);
      // Ensure the generated svg or canvas scales to fit the container
      const child = el.firstChild;
      if (child) {
        child.style.width = '100%';
        child.style.height = '100%';
      }
    } catch {
      setHasError(true);
    }

    return () => {
      el.innerHTML = '';
    };
  }, [khqrString]);

  /* ── Loading state ──────────────────────────────────────────────── */
  if (!khqrString) {
    return (
      <div className="flex flex-col items-center justify-center p-6 w-full">
        <div
          className="rounded-xl flex items-center justify-center theme-text-secondary"
          style={{
            width: 300,
            height: 424,
            backgroundColor: 'color-mix(in srgb, var(--border), transparent 60%)',
          }}
        >
          <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  /* ── Rendered card ──────────────────────────────────────────────── */
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {merchantName && (
        <h3 className="text-lg font-bold theme-text-primary mb-1 text-center">{merchantName}</h3>
      )}
      {amount !== undefined && amount !== null && (
        <div className="text-center mb-4">
          <p className="text-xs theme-text-secondary uppercase tracking-wider mb-1">Amount</p>
          <p className="text-2xl font-bold theme-text-primary">${Number(amount).toFixed(2)}</p>
        </div>
      )}

      {/* Card wrapper — preserves 1470:2079 aspect ratio */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 340,
          aspectRatio: '1470 / 2079',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.08)',
        }}
      >
        {/* Background template image */}
        <img
          src="/images/Bakong Outline Template.png"
          alt="Bakong KHQR"
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />

        {/* .qr-frame */}
        <div
          style={{
            position: 'absolute',
            left: '26%',
            top: '28.5%',
            width: '48%',
            aspectRatio: '1 / 1',
          }}
        >
          {/* .qr */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '74%',
              aspectRatio: '1 / 1',
              transform: 'translate(-50%, -50%)',
              background: '#ffffff',
              borderRadius: 10,
              boxShadow: '0 2px 12px rgba(0,0,0,.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <div
              ref={qrContainerRef}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
          </div>
        </div>
      </div>

      {hasError && (
        <p className="text-xs theme-text-secondary mt-2">QR code could not be rendered.</p>
      )}
    </div>
  );
}
