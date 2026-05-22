import { Link } from 'react-router-dom';

export function CartDrawer({ cart, isOpen, onClose, onUpdateQuantity, onRemoveItem }) {
  if (!isOpen) return null;

  const formatPrice = (p) => `$${Number(p).toFixed(2)}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">Cart ({cart?.total_items || 0})</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(100vh - 180px)' }}>
          {!cart?.items?.length ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            cart.items.map(item => (
              <div key={item.id} className="flex gap-4 border-b pb-4">
                {item.product?.thumbnail && (
                  <img src={item.product.thumbnail} alt={item.product.name} className="w-20 h-20 object-cover rounded" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.product?.name}</p>
                  <p className="text-blue-600 font-medium">{formatPrice(item.unit_price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 border rounded flex items-center justify-center text-sm"
                      disabled={item.quantity <= 1}
                    >-</button>
                    <span className="text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 border rounded flex items-center justify-center text-sm"
                    >+</button>
                    <button onClick={() => onRemoveItem(item.id)} className="ml-auto text-red-500 text-sm">Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart?.items?.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <Link
              to="/cart"
              onClick={onClose}
              className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
