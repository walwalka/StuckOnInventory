import { useEffect, useRef } from 'react';
import { getAccessToken, getRefreshToken, decodeJWT, saveAccessToken } from '../auth/token';
import axios from 'axios';

/**
 * Custom hook for automatic token refresh
 * Refreshes the access token proactively before it expires
 *
 * @param {Object} options - Configuration options
 * @param {number} options.refreshBuffer - Time in milliseconds before expiry to refresh (default: 2 minutes)
 * @param {Function} options.onRefreshError - Callback when refresh fails
 */
export const useTokenRefresh = ({ refreshBuffer = 2 * 60 * 1000, onRefreshError } = {}) => {
  const timerRef = useRef(null);

  /**
   * Refresh the access token using the refresh token
   */
  const refreshAccessToken = async () => {
    try {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        console.log('[TokenRefresh] No refresh token available');
        return false;
      }

      console.log('[TokenRefresh] Refreshing access token...');

      // Call refresh endpoint directly (without axios interceptors)
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
        console.log('[TokenRefresh] Access token refreshed successfully');
        scheduleNextRefresh(accessToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[TokenRefresh] Failed to refresh token:', error);

      if (onRefreshError) {
        onRefreshError(error);
      }

      return false;
    }
  };

  /**
   * Schedule the next token refresh based on token expiry
   */
  const scheduleNextRefresh = (token) => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!token) {
      return;
    }

    const decoded = decodeJWT(token);

    if (!decoded || !decoded.exp) {
      console.warn('[TokenRefresh] Cannot decode token or missing expiry');
      return;
    }

    // Calculate time until token expires (in milliseconds)
    const expiryTime = decoded.exp * 1000;
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    // Schedule refresh before expiry (using refreshBuffer)
    const timeUntilRefresh = timeUntilExpiry - refreshBuffer;

    if (timeUntilRefresh <= 0) {
      // Token is already expired or about to expire, refresh immediately
      console.log('[TokenRefresh] Token expired or expiring soon, refreshing immediately');
      refreshAccessToken();
    } else {
      // Schedule refresh for later
      const refreshInMinutes = Math.floor(timeUntilRefresh / 60000);
      console.log(`[TokenRefresh] Next refresh scheduled in ${refreshInMinutes} minutes`);

      timerRef.current = setTimeout(() => {
        refreshAccessToken();
      }, timeUntilRefresh);
    }
  };

  /**
   * Initialize token refresh on mount and when token changes
   */
  useEffect(() => {
    const accessToken = getAccessToken();

    if (accessToken) {
      console.log('[TokenRefresh] Initializing automatic token refresh');
      scheduleNextRefresh(accessToken);
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []); // Run once on mount

  return {
    refreshAccessToken,
    scheduleNextRefresh
  };
};
