import api from './api';

export const categoryService = {
  getCategories() {
    return api.get('/categories');
  },
};

export default categoryService;
