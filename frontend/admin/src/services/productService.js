import api from './api';

export const productService = {
  getProducts(params = {}) {
    return api.get('/products', { params });
  },

  getProduct(id) {
    return api.get(`/products/${id}`);
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

  getProductImages(productId) {
    return api.get(`/products/${productId}/images`);
  },

  uploadImage(productId, data) {
    return api.post(`/products/${productId}/images`, data);
  },

  deleteImage(imageId) {
    return api.delete(`/products/images/${imageId}`);
  },

  reorderImages(items) {
    return api.put('/products/images/reorder', { items });
  },

  toggleCustomizable(productId) {
    return api.put(`/products/${productId}/customizable`);
  },

  createOption(productId, data) {
    return api.post(`/products/${productId}/options`, data);
  },

  updateOption(optionId, data) {
    return api.put(`/products/options/${optionId}`, data);
  },

  deleteOption(optionId) {
    return api.delete(`/products/options/${optionId}`);
  },

  createOptionValue(optionId, data) {
    return api.post(`/products/options/${optionId}/values`, data);
  },

  updateOptionValue(valueId, data) {
    return api.put(`/products/options/values/${valueId}`, data);
  },

  deleteOptionValue(valueId) {
    return api.delete(`/products/options/values/${valueId}`);
  },
};

export default productService;
