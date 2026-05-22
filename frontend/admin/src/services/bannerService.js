import api from './api';

export const bannerService = {
  listBanners() {
    return api.get('/banners');
  },

  getBanner(id) {
    return api.get(`/banners/${id}`);
  },

  createBanner(data) {
    return api.post('/banners', data);
  },

  updateBanner(id, data) {
    return api.put(`/banners/${id}`, data);
  },

  deleteBanner(id) {
    return api.delete(`/banners/${id}`);
  },
};

export default bannerService;
