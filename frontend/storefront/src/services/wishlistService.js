import api from './api';

export const wishlistService = {
  getWishlist(wishlistId) {
    return api.get('/wishlist', { params: { wishlist_id: wishlistId } });
  },

  addItem(wishlistId, productId) {
    return api.post('/wishlist', { wishlist_id: wishlistId, product_id: productId });
  },

  removeItem(productId, wishlistId) {
    return api.delete(`/wishlist/${productId}`, { params: { wishlist_id: wishlistId } });
  },

  mergeWishlist(guestWishlistId) {
    return api.post('/wishlist/merge', { guest_wishlist_id: guestWishlistId });
  },
};

export default wishlistService;
