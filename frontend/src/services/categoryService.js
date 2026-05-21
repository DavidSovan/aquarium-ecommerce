import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const categoryService = {
  getCategories(skip = 0, limit = 100) {
    return api.get('/categories', { params: { skip, limit } });
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
