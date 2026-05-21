import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
