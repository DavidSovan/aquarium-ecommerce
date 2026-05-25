import api from './api';

export const settingsService = {
  getPublic() {
    return api.get('/settings/public');
  },
  getHomepageSettings() {
    return api.get('/settings/homepage');
  },
};

export default settingsService;
