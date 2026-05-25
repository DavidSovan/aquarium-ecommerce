import { Link } from 'react-router-dom';

export function CartDrawer({ cart, isOpen, onClose, onUpdateQuantity, onRemoveItem }) {
  if (!isOpen) return null;

  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full max-w-md theme-surface shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 theme-border" style={{ borderBottomWidth: 1, borderBottomStyle: 'solid' }}>
          <h2 className="text-lg font-bold theme-text-primary">Cart ({cart?.total_items || 0})</h2>
          <button onClick={onClose} className="theme-text-secondary hover:theme-text-primary text-xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100vh - 180px)' }}>
          {!cart?.items?.length ? (
            <p className="theme-text-secondary text-center py-8">Your cart is empty</p>
          ) : (
            cart.items.map(item => (
              <div key={item.id} className="flex gap-4 pb-4 theme-border" style={{ borderBottomWidth: 1, borderBottomStyle: 'solid' }}>
                {item.product?.thumbnail && (
                  <img src={item.product.thumbnail} alt={item.product.name} className="w-20 h-20 object-cover rounded" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm theme-text-primary">{item.product?.name}</p>
                  <p className="theme-text-link font-medium">{formatPrice(item.unit_price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 theme-border rounded flex items-center justify-center text-sm theme-text-primary"
                      disabled={item.quantity <= 1}
                    >-</button>
                    <span className="text-sm font-medium theme-text-primary">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 theme-border rounded flex items-center justify-center text-sm theme-text-primary"
                    >+</button>
                    <button onClick={() => onRemoveItem(item.id)} className="ml-auto theme-danger text-sm">Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart?.items?.length > 0 && (
          <div className="theme-border p-4 space-y-3" style={{ borderTopWidth: 1, borderTopStyle: 'solid' }}>
            <div className="flex justify-between font-bold text-lg theme-text-primary">
              <span>Total</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <Link
              to="/cart"
              onClick={onClose}
              className="block w-full text-center theme-btn-primary font-medium no-underline"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
