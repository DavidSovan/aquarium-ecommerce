import api from './api';

export const deliveryService = {
  listSlots() {
    return api.get('/admin/delivery-slots');
  },

  getSlot(id) {
    return api.get(`/admin/delivery-slots/${id}`);
  },

  createSlot(data) {
    return api.post('/admin/delivery-slots', data);
  },

  updateSlot(id, data) {
    return api.put(`/admin/delivery-slots/${id}`, data);
  },

  deleteSlot(id) {
    return api.delete(`/admin/delivery-slots/${id}`);
  },

  toggleActive(id, isActive) {
    return api.patch(`/admin/delivery-slots/${id}/toggle-active`, { is_active: isActive });
  },
};

export default deliveryService;
