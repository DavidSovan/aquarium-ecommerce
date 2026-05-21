import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const WISHLIST_ID_KEY = 'aquarium_wishlist_id';

export const wishlistService = {
  getWishlistId() {
    return localStorage.getItem(WISHLIST_ID_KEY);
  },

  setWishlistId(id) {
    localStorage.setItem(WISHLIST_ID_KEY, id);
  },

  clearWishlistId() {
    localStorage.removeItem(WISHLIST_ID_KEY);
  },

  async getWishlist(wishlistId) {
    const response = await api.get('/wishlist', { params: { wishlist_id: wishlistId } });
    return response.data;
  },

  async addItem(productId) {
    const wishlistId = this.getWishlistId();
    const data = { product_id: productId };
    if (wishlistId) data.wishlist_id = wishlistId;
    const response = await api.post('/wishlist', data);
    if (!wishlistId) this.setWishlistId(response.data.id);
    return response.data;
  },

  async removeItem(productId) {
    const wishlistId = this.getWishlistId();
    const response = await api.delete(`/wishlist/${productId}`, { params: { wishlist_id: wishlistId } });
    return response.data;
  },
};

export default wishlistService;
