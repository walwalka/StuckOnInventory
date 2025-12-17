import axios from 'axios';
import { getToken, clearToken } from '../auth/token';

const api = axios.create({
  // Use relative /api so Nginx can proxy to backend
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// Attach auth token and any request-wide headers
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Request configuration error
    console.error('[API][request] error configuring request', {
      message: error?.message,
    });
    return Promise.reject(error);
  }
);

// Unified response/error handling and logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const cfg = error?.config || {};
    const res = error?.response;
    const log = {
      when: new Date().toISOString(),
      method: cfg.method,
      url: cfg.baseURL ? `${cfg.baseURL}${cfg.url}` : cfg.url,
      status: res?.status,
      statusText: res?.statusText,
      message: error?.message,
      data: res?.data,
    };

    if (res) {
      // Server responded with a non-2xx code
      console.error('[API][response] HTTP error', log);
      if (res.status === 401) {
        // Clear invalid/expired token and signal app to show Login gate
        clearToken();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      }
    } else if (error?.request) {
      // No response received (network error, CORS, timeout, etc.)
      console.error('[API][response] no response received', log);
    } else {
      // Something else happened setting up the request
      console.error('[API][response] request setup error', log);
    }

    return Promise.reject(error);
  }
);

export default api;