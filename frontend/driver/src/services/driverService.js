import api from './api';

export const driverService = {
  getAssignedOrders(params = {}) {
    return api.get('/driver/orders', { params });
  },

  getOrder(id) {
    return api.get(`/driver/orders/${id}`);
  },

  confirmDelivery(id) {
    return api.post(`/driver/orders/${id}/confirm-delivery`);
  },
};

export default driverService;
