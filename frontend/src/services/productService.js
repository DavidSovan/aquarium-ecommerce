import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

  createProduct(data) {
    return api.post('/products', data);
  },

  updateProduct(id, data) {
    return api.put(`/products/${id}`, data);
  },

  deleteProduct(id) {
    return api.delete(`/products/${id}`);
  },
};

export default productService;
