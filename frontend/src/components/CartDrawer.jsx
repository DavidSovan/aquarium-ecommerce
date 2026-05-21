import { Link } from 'react-router-dom';

export function CartDrawer({ cart, isOpen, onClose, onUpdateQuantity, onRemoveItem }) {
  const formatPrice = (price) => `$${Number(price).toFixed(2)}`;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Cart {cart ? `(${cart.total_items})` : ''}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {!cart || cart.items.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                <Link
                  to="/shop"
                  onClick={onClose}
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Shop
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100">
                    <Link
                      to={`/product/${item.product.slug}`}
                      onClick={onClose}
                      className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden"
                    >
                      {item.product.thumbnail ? (
                        <img src={item.product.thumbnail} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.product.slug}`}
                        onClick={onClose}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">{formatPrice(item.unit_price)}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                        >
                          &minus;
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock_quantity}
                          className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                        >
                          +
                        </button>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="ml-auto text-xs text-red-500 hover:text-red-600 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(item.total_price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart && cart.items.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base text-gray-600">Subtotal</span>
                <span className="text-xl font-bold text-gray-900">{formatPrice(cart.subtotal)}</span>
              </div>
              <Link
                to="/cart"
                onClick={onClose}
                className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 font-medium"
              >
                View Cart
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
