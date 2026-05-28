import { API_BASE_URL } from './api';

const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.shouldReconnect = false;
    this._connectionTimeout = null;
  }

  connect(token) {
    this.url = `${WS_BASE_URL}/ws/orders?token=${token}`;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this._createConnection();
  }

  _createConnection() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this._connectionTimeout) {
      clearTimeout(this._connectionTimeout);
      this._connectionTimeout = null;
    }

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const handlers = this.listeners.get(data.event) || [];
        handlers.forEach(fn => fn(data));
        const allHandlers = this.listeners.get('*') || [];
        allHandlers.forEach(fn => fn(data));
      } catch (e) {
        console.error('WebSocket message parse error:', e);
      }
    };

    this.ws.onclose = () => {
      this.ws = null;
      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
        this._connectionTimeout = setTimeout(() => {
          this.reconnectAttempts++;
          this._createConnection();
        }, delay);
      }
    };

    this.ws.onerror = () => {};
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
    return () => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        const idx = handlers.indexOf(handler);
        if (idx !== -1) handlers.splice(idx, 1);
      }
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this._connectionTimeout) {
      clearTimeout(this._connectionTimeout);
      this._connectionTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

const wsService = new WebSocketService();
export default wsService;
