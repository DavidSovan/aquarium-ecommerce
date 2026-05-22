import api from './api';

export const bannerService = {
  getActiveBanners() {
    return api.get('/banners/active');
  },
};

export default bannerService;
