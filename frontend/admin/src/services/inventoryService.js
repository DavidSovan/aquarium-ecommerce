import api from './api';

export const inventoryService = {
  getLowStockAlerts(threshold) {
    const params = threshold !== undefined ? { threshold } : {};
    return api.get('/inventory/low-stock', { params });
  },

  getLogs(params = {}) {
    return api.get('/inventory/logs', { params });
  },

  adjustStock(data) {
    return api.post('/inventory/adjustments', data);
  },
};

export default inventoryService;
