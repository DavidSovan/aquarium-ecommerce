import api from './api';

export const authService = {
  register(data) {
    return api.post('/auth/register', data);
  },

  login(data) {
    return api.post('/auth/login', data);
  },

  getMe() {
    return api.get('/auth/me');
  },
};

export default authService;
