import api from './api';

export const settingsService = {
  getPublic() {
    return api.get('/settings/public');
  },
  getHomepageSettings() {
    return api.get('/settings/homepage');
  },
  getBranding() {
    return api.get('/settings/branding/public');
  },
  getHomepage() {
    return api.get('/homepage');
  },
  getActiveCMSBlocks() {
    return api.get('/cms-blocks/active');
  },
};

export default settingsService;
