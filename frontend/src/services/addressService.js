import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const USER_ID_KEY = 'aquarium_user_id';

function getUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export const addressService = {
  getAddresses() {
    return api.get('/addresses', { params: { user_id: getUserId() } });
  },

  getAddress(id) {
    return api.get(`/addresses/${id}`);
  },

  createAddress(data) {
    return api.post('/addresses', { ...data, user_id: getUserId() });
  },

  updateAddress(id, data) {
    return api.put(`/addresses/${id}`, data);
  },

  deleteAddress(id) {
    return api.delete(`/addresses/${id}`);
  },
};

export default addressService;
