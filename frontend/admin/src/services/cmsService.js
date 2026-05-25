import api from './api';

export const cmsService = {
  list() { return api.get('/cms-blocks'); },
  get(id) { return api.get(`/cms-blocks/${id}`); },
  create(data) { return api.post('/cms-blocks', data); },
  update(id, data) { return api.put(`/cms-blocks/${id}`, data); },
  delete(id) { return api.delete(`/cms-blocks/${id}`); },
  reorder(data) { return api.put('/cms-blocks/reorder/all', data); },
};

export default cmsService;
