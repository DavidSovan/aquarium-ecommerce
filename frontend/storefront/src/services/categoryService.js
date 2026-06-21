import api from './api';

export const categoryService = {
  getCategories() {
    return api.get('/categories');
  },
  getCategoryTree() {
    return api.get('/categories/tree');
  },
};

export default categoryService;
