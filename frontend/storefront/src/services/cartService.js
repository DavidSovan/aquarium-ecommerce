import api from './api';

export const cartService = {
  getCart(cartId) {
    return api.get('/cart', { params: { cart_id: cartId } });
  },

  addItem(cartId, productId, quantity) {
    return api.post('/cart/items', { cart_id: cartId, product_id: productId, quantity });
  },

  updateItem(itemId, cartId, quantity) {
    return api.put(`/cart/items/${itemId}`, { cart_id: cartId, quantity });
  },

  removeItem(itemId, cartId) {
    return api.delete(`/cart/items/${itemId}`, { params: { cart_id: cartId } });
  },

  clearCart(cartId) {
    return api.delete('/cart/clear', { params: { cart_id: cartId } });
  },

  mergeCart(guestCartId) {
    return api.post('/cart/merge', { guest_cart_id: guestCartId });
  },
};

export default cartService;
