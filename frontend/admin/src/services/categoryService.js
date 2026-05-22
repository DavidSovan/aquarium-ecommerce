import api from './api';

export const categoryService = {
  getCategories() {
    return api.get('/categories');
  },

  getCategoryTree() {
    return api.get('/categories/tree');
  },

  getCategory(id) {
    return api.get(`/categories/${id}`);
  },

  createCategory(data) {
    return api.post('/categories', data);
  },

  updateCategory(id, data) {
    return api.put(`/categories/${id}`, data);
  },

  deleteCategory(id) {
    return api.delete(`/categories/${id}`);
  },
};

export default categoryService;
