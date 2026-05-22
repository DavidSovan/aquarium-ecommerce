import api from './api';

export const addressService = {
  getAddresses() {
    return api.get('/addresses');
  },

  getAddress(id) {
    return api.get(`/addresses/${id}`);
  },

  createAddress(data) {
    return api.post('/addresses', data);
  },

  updateAddress(id, data) {
    return api.put(`/addresses/${id}`, data);
  },

  deleteAddress(id) {
    return api.delete(`/addresses/${id}`);
  },
};

export default addressService;
