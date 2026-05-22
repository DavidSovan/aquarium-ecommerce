import api from './api';

export const authService = {
  login(data) {
    return api.post('/auth/login', data);
  },

  getMe() {
    return api.get('/auth/me');
  },
};

export default authService;
