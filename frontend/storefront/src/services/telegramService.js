import api from './api';

export const telegramService = {
  getTelegramStatus() {
    return api.get('/telegram/status');
  },
  requestTelegramLinkToken() {
    return api.post('/telegram/link-token');
  },
};

export default telegramService;
