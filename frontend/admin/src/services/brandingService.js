import api from './api';

export const brandingService = {
  get() { return api.get('/settings/branding'); },
  update(data) { return api.put('/settings/branding', data); },
};

export default brandingService;
