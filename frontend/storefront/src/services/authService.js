import api from './api';

export const authService = {
  register(data) {
    return api.post('/auth/register', data);
  },

  login(data) {
    return api.post('/auth/login', data);
  },

  googleLogin(credential, isRegister = false) {
    return api.post('/auth/google', { credential, is_register: isRegister });
  },

  getMe() {
    return api.get('/auth/me');
  },
};

export default authService;
