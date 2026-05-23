import api from './api';

export const settingsService = {
  getPublic() {
    return api.get('/settings/public');
  },
};

export default settingsService;
