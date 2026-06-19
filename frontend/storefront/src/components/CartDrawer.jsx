import { Link } from 'react-router-dom';
import { mediaUrl } from '../utils/mediaUrl';

export function CartDrawer({ cart, isOpen, onClose, onUpdateQuantity, onRemoveItem }) {
  if (!isOpen) return null;

  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-[fadeIn_0.3s_ease-out]" 
        onClick={onClose}
      ></div>
      
      {/* Drawer */}
      <div 
        className="relative h-full w-full max-w-md theme-surface shadow-[0_0_40px_rgba(0,0,0,0.2)] border-l border-[color-mix(in_srgb,var(--border),transparent_50%)] flex flex-col animate-[slideInRight_0.4s_cubic-bezier(0.16,1,0.3,1)]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[color-mix(in_srgb,var(--border),transparent_70%)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] flex items-center justify-center text-[var(--primary)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Your Cart <span className="text-[var(--text-secondary)] font-medium text-base ml-1">({cart?.total_items || 0})</span>
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_10%,transparent)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {!cart?.items?.length ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
              <div className="w-24 h-24 mb-6 rounded-full bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] flex items-center justify-center text-[var(--primary)]">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Your cart is empty</h3>
              <p className="text-[var(--text-secondary)]">Looks like you haven't added anything yet.</p>
              <button onClick={onClose} className="mt-8 px-8 py-3 rounded-xl font-bold text-white transition-all hover:-translate-y-1 hover:shadow-lg" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}>
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map(item => (
                <div key={item.id} className="group flex gap-4 p-4 rounded-2xl border border-[color-mix(in_srgb,var(--border),transparent_70%)] hover:border-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_5%,transparent)] transition-all">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)]">
                    {item.product?.thumbnail ? (
                      <img src={mediaUrl(item.product.thumbnail)} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
                        <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-bold text-[var(--text-primary)] line-clamp-2 leading-tight">{item.product?.name}</p>
                      <button onClick={() => onRemoveItem(item.id)} className="shrink-0 text-[var(--text-secondary)] hover:text-[var(--error)] transition-colors" title="Remove item">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <p className="text-[var(--primary)] font-bold mt-1">{formatPrice(item.unit_price)}</p>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center bg-[color-mix(in_srgb,var(--text-primary)_5%,transparent)] rounded-lg p-0.5 border border-[color-mix(in_srgb,var(--border),transparent_50%)]">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_10%,transparent)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-[var(--text-primary)]">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-[var(--text-primary)] hover:bg-[color-mix(in_srgb,var(--text-primary)_10%,transparent)] transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart?.items?.length > 0 && (
          <div className="p-6 border-t border-[color-mix(in_srgb,var(--border),transparent_70%)] bg-[color-mix(in_srgb,var(--surface)_95%,transparent)]">
            <div className="flex justify-between items-end mb-6">
              <span className="text-[var(--text-secondary)] font-medium">Subtotal</span>
              <span className="text-2xl font-black text-[var(--text-primary)]">{formatPrice(cart.subtotal)}</span>
            </div>
            <Link
              to="/cart"
              onClick={onClose}
              className="group relative flex w-full items-center justify-center px-8 py-4 rounded-xl font-bold text-white overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)' }}></div>
              <span className="relative z-10 flex items-center gap-2">
                Checkout Now
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </Link>
            <p className="text-center text-xs text-[var(--text-secondary)] mt-4">
              Taxes and shipping calculated at checkout.
            </p>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: color-mix(in srgb, var(--text-secondary) 30%, transparent);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: color-mix(in srgb, var(--text-secondary) 50%, transparent);
        }
      `}} />
    </div>
  );
}
