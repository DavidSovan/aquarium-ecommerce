import api from './api';

export const inventoryService = {
  getLowStockAlerts(threshold = 5) {
    return api.get('/inventory/low-stock', { params: { threshold } });
  },

  getLogs(params = {}) {
    return api.get('/inventory/logs', { params });
  },

  adjustStock(data) {
    return api.post('/inventory/adjustments', data);
  },
};

export default inventoryService;
