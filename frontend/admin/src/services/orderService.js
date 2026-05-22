import api from './api';

export const orderService = {
  listOrders(params = {}) {
    return api.get('/orders', { params });
  },

  getOrder(id) {
    return api.get(`/orders/${id}`);
  },

  updateOrderStatus(id, data) {
    return api.put(`/orders/${id}/status`, data);
  },

  cancelOrder(id) {
    return api.delete(`/orders/${id}`);
  },
};

export default orderService;
