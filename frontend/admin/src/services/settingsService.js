import api from './api';

export const settingsService = {
  listSettings() {
    return api.get('/settings');
  },

  getSetting(key) {
    return api.get(`/settings/${key}`);
  },

  createSetting(data) {
    return api.post('/settings', data);
  },

  updateSetting(key, data) {
    return api.put(`/settings/${key}`, data);
  },

  deleteSetting(key) {
    return api.delete(`/settings/${key}`);
  },
};

export default settingsService;
