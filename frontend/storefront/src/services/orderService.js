import api from './api';

export const orderService = {
  getOrders(params = {}) {
    return api.get('/orders', { params });
  },

  getOrder(id) {
    return api.get(`/orders/${id}`);
  },

  checkout(data) {
    return api.post('/checkout', data);
  },

  cancelOrder(id) {
    return api.delete(`/orders/${id}`);
  },

  confirmDelivery(id) {
    return api.post(`/orders/${id}/confirm-delivery`);
  },

  checkPayment(id) {
    return api.post(`/orders/${id}/check-payment`);
  },

  getPaymentStatus(id) {
    return api.get(`/orders/${id}/payment-status`);
  },
};

export default orderService;
