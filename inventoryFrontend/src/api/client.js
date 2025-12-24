import axios from 'axios';
import { getAccessToken, getRefreshToken, saveAccessToken, clearTokens } from '../auth/token';

const api = axios.create({
  // Use relative /api so Nginx can proxy to backend
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers = [];

/**
 * Add failed request to queue to be retried after token refresh
 */
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

/**
 * Retry all queued requests with new access token
 */
const onTokenRefreshed = (newAccessToken) => {
  refreshSubscribers.forEach((callback) => callback(newAccessToken));
  refreshSubscribers = [];
};

/**
 * Clear all queued requests
 */
const onTokenRefreshFailed = () => {
  refreshSubscribers = [];
};

/**
 * Attempt to refresh the access token using the refresh token
 * @returns {Promise<string|null>} - New access token or null if refresh failed
 */
const refreshAccessToken = async () => {
  try {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    // Call refresh endpoint WITHOUT interceptors to avoid infinite loop
    const response = await axios.post(
      '/api/auth/refresh',
      { refreshToken },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000,
      }
    );

    const { accessToken } = response.data;

    if (accessToken) {
      saveAccessToken(accessToken);
      return accessToken;
    }

    return null;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    return null;
  }
};

// Attach auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
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

// Response interceptor with automatic token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
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

    // Handle 401 errors with token refresh
    if (res && res.status === 401 && !cfg._retry) {
      cfg._retry = true; // Mark this request as retried

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            // Successfully refreshed token
            isRefreshing = false;
            onTokenRefreshed(newAccessToken);

            // Retry the original request with new token
            cfg.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(cfg);
          } else {
            // Refresh failed - logout user
            isRefreshing = false;
            onTokenRefreshFailed();
            clearTokens();

            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth:logout'));
              alert('Your session has expired. Please log in again.');
            }

            return Promise.reject(error);
          }
        } catch (refreshError) {
          isRefreshing = false;
          onTokenRefreshFailed();
          clearTokens();

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:logout'));
          }

          return Promise.reject(refreshError);
        }
      } else {
        // Another request is already refreshing the token
        // Queue this request to be retried after refresh completes
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newAccessToken) => {
            cfg.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(api(cfg));
          });
        });
      }
    }

    // Log all errors
    if (res) {
      // Server responded with a non-2xx code
      console.error('[API][response] HTTP error', log);
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
