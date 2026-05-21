import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const CART_ID_KEY = 'aquarium_cart_id';

export const cartService = {
  getCartId() {
    return localStorage.getItem(CART_ID_KEY);
  },

  setCartId(id) {
    localStorage.setItem(CART_ID_KEY, id);
  },

  clearCartId() {
    localStorage.removeItem(CART_ID_KEY);
  },

  async getCart(cartId) {
    const response = await api.get('/cart', { params: { cart_id: cartId } });
    return response.data;
  },

  async addItem(productId, quantity = 1) {
    const cartId = this.getCartId();
    const data = { product_id: productId, quantity };
    if (cartId) data.cart_id = cartId;
    const response = await api.post('/cart/items', data);
    if (!cartId) this.setCartId(response.data.id);
    return response.data;
  },

  async updateItem(itemId, quantity) {
    const cartId = this.getCartId();
    const response = await api.put(`/cart/items/${itemId}`, { cart_id: cartId, quantity });
    return response.data;
  },

  async removeItem(itemId) {
    const cartId = this.getCartId();
    const response = await api.delete(`/cart/items/${itemId}`, { params: { cart_id: cartId } });
    return response.data;
  },

  async clearCart() {
    const cartId = this.getCartId();
    if (!cartId) return null;
    const response = await api.delete('/cart/clear', { params: { cart_id: cartId } });
    this.clearCartId();
    return response.data;
  },
};

export default cartService;
