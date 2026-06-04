import api from './api';

export const deliveryService = {
  getAvailableSlots(deliveryDate) {
    return api.get('/delivery/slots', { params: { delivery_date: deliveryDate } });
  },

  getDeliverySettings() {
    return api.get('/delivery/settings');
  },
};

export default deliveryService;
