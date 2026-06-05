import api from './api';

export const driverService = {
  listDrivers() {
    return api.get('/auth/drivers');
  },

  assignDriver(orderId, driverId) {
    return api.put(`/orders/${orderId}/assign-driver`, { driver_id: driverId });
  },
};

export default driverService;
