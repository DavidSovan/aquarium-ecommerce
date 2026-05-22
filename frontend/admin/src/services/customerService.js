import api from './api';

export const customerService = {
  listCustomers(params = {}) {
    return api.get('/customers', { params });
  },

  getCustomer(id) {
    return api.get(`/customers/${id}`);
  },
};

export default customerService;
