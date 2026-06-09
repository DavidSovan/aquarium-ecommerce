import api from './api';

export const resetService = {
  resetDatabase(data) {
    return api.post('/admin/reset-database', data);
  },
};

export default resetService;
