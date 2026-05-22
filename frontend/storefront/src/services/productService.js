import api from './api';

export const productService = {
  getProducts(params = {}) {
    return api.get('/products', { params });
  },

  getFeaturedProducts() {
    return api.get('/products/featured');
  },

  getProduct(id) {
    return api.get(`/products/${id}`);
  },

  getProductBySlug(slug) {
    return api.get(`/products/slug/${slug}`);
  },
};

export default productService;
