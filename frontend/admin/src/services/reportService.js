import api from './api';

export const reportService = {
  getSalesSummary(days = 30) {
    return api.get('/reports/sales', { params: { days } });
  },

  getDailySales(days = 30) {
    return api.get('/reports/sales/daily', { params: { days } });
  },

  getTopProducts(days = 30, limit = 10) {
    return api.get('/reports/products/top', { params: { days, limit } });
  },

  getCustomerSummary() {
    return api.get('/reports/customers');
  },
};

export default reportService;
