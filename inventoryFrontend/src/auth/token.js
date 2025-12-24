/**
 * JWT Token Utilities
 * Handles access and refresh token storage and validation
 */

/**
 * Decode a JWT token without verification
 * @param {string} token - JWT token to decode
 * @returns {Object|null} - Decoded payload or null if invalid
 */
const decodeJWT = (token) => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    // Replace URL-safe characters
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if expired or invalid, false otherwise
 */
export const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);

  if (!decoded || !decoded.exp) {
    return true;
  }

  // JWT exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  return expirationTime < Date.now();
};

/**
 * Get access token from localStorage
 * @returns {string|null} - Access token or null if not found/expired
 */
export const getAccessToken = () => {
  const token = localStorage.getItem('accessToken');

  if (!token || token === 'null' || token === 'undefined') {
    return null;
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    localStorage.removeItem('accessToken');
    return null;
  }

  return token;
};

/**
 * Get refresh token from localStorage
 * @returns {string|null} - Refresh token or null if not found
 */
export const getRefreshToken = () => {
  const token = localStorage.getItem('refreshToken');

  if (!token || token === 'null' || token === 'undefined') {
    return null;
  }

  return token;
};

/**
 * Save both access and refresh tokens to localStorage
 * @param {string} accessToken - JWT access token
 * @param {string} refreshToken - JWT refresh token
 */
export const saveTokens = (accessToken, refreshToken) => {
  if (typeof accessToken === 'string' && accessToken.trim().length > 0) {
    localStorage.setItem('accessToken', accessToken);
  }

  if (typeof refreshToken === 'string' && refreshToken.trim().length > 0) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

/**
 * Save only the access token (used after token refresh)
 * @param {string} accessToken - JWT access token
 */
export const saveAccessToken = (accessToken) => {
  if (typeof accessToken === 'string' && accessToken.trim().length > 0) {
    localStorage.setItem('accessToken', accessToken);
  } else {
    localStorage.removeItem('accessToken');
  }
};

/**
 * Clear all tokens from localStorage
 */
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * DEPRECATED: Legacy function for backward compatibility
 * Use getAccessToken() instead
 */
export const getToken = () => {
  return getAccessToken();
};

/**
 * DEPRECATED: Legacy function for backward compatibility
 * Use clearTokens() instead
 */
export const clearToken = () => {
  clearTokens();
};
