import api from './api';

export const mediaService = {
  list(params) { return api.get('/media', { params }); },
  get(id) { return api.get(`/media/${id}`); },
  upload(file, folder, altText) {
    const form = new FormData();
    form.append('file', file);
    if (folder) form.append('folder', folder);
    if (altText) form.append('alt_text', altText);
    return api.post('/media/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  saveUrl(data) { return api.post('/media/url', data); },
  update(id, data) { return api.put(`/media/${id}`, data); },
  delete(id) { return api.delete(`/media/${id}`); },
};

export default mediaService;
