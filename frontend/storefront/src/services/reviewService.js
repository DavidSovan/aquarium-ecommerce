import api from './api';

export const reviewService = {
  getProductReviews(productId, params = {}) {
    return api.get(`/reviews/product/${productId}`, { params });
  },

  createReview(productId, data) {
    return api.post(`/reviews/product/${productId}`, data);
  },

  updateReview(id, data) {
    return api.put(`/reviews/${id}`, data);
  },

  deleteReview(id) {
    return api.delete(`/reviews/${id}`);
  },
};

export default reviewService;
