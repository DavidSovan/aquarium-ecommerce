import api from './api';

export const couponService = {
  listCoupons(params = {}) {
    return api.get('/coupons', { params });
  },

  getCoupon(id) {
    return api.get(`/coupons/${id}`);
  },

  createCoupon(data) {
    return api.post('/coupons', data);
  },

  updateCoupon(id, data) {
    return api.put(`/coupons/${id}`, data);
  },

  deleteCoupon(id) {
    return api.delete(`/coupons/${id}`);
  },
};

export default couponService;
