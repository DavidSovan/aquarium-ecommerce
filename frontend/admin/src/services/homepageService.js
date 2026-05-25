import api from './api';

export const homepageService = {
  list() { return api.get('/homepage/admin'); },
  create(data) { return api.post('/homepage', data); },
  update(id, data) { return api.put(`/homepage/${id}`, data); },
  delete(id) { return api.delete(`/homepage/${id}`); },
  reorder(data) { return api.put('/homepage/reorder/all', data); },
};

export default homepageService;
