import api from './api';

export const themeService = {
  listThemes() { return api.get('/settings/theme'); },
  getTheme(id) { return api.get(`/settings/theme/${id}`); },
  createTheme(data) { return api.post('/settings/theme', data); },
  updateTheme(id, data) { return api.put(`/settings/theme/${id}`, data); },
  deleteTheme(id) { return api.delete(`/settings/theme/${id}`); },
  duplicateTheme(id) { return api.post(`/settings/theme/${id}/duplicate`); },
  getActiveCSS() { return api.get('/settings/theme/active'); },
};

export default themeService;
