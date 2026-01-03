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
        console.log('[TokenRefresh] No refresh token available - cannot refresh');
        return false;
      }

      console.log('[TokenRefresh] Attempting to refresh access token...');

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
        console.log('[TokenRefresh] Successfully refreshed access token');
        saveAccessToken(accessToken);

        // Dispatch event to notify other parts of the app
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('token:refreshed', {
            detail: { accessToken }
          }));
        }

        scheduleNextRefresh(accessToken);
        return true;
      }

      console.warn('[TokenRefresh] No access token in refresh response');
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
      console.log(`[TokenRefresh] Next refresh scheduled in ${refreshInMinutes} minutes (${new Date(Date.now() + timeUntilRefresh).toLocaleTimeString()})`);

      timerRef.current = setTimeout(() => {
        console.log('[TokenRefresh] Scheduled refresh timer triggered');
        refreshAccessToken();
      }, timeUntilRefresh);
    }
  };

  /**
   * Initialize token refresh on mount and monitor token changes
   */
  useEffect(() => {
    console.log('[TokenRefresh] Initializing token refresh hook');
    const accessToken = getAccessToken();

    if (accessToken) {
      const decoded = decodeJWT(accessToken);
      const expiresIn = decoded?.exp ? Math.floor((decoded.exp * 1000 - Date.now()) / 1000 / 60) : 'unknown';
      console.log(`[TokenRefresh] Found existing access token (expires in ${expiresIn} minutes)`);
      scheduleNextRefresh(accessToken);
    } else {
      console.log('[TokenRefresh] No access token found on initialization');
    }

    // Listen for storage events to detect token changes (cross-tab)
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken' && e.newValue) {
        console.log('[TokenRefresh] Access token changed in storage (cross-tab)');
        scheduleNextRefresh(e.newValue);
      }
    };

    // Listen for custom token refresh events (same tab)
    const handleTokenRefresh = (e) => {
      const newToken = e.detail?.accessToken || getAccessToken();
      if (newToken) {
        console.log('[TokenRefresh] Token refresh event received');
        scheduleNextRefresh(newToken);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('token:refreshed', handleTokenRefresh);

    // Set up an interval to check if token has changed
    // Fallback in case events don't fire
    const intervalId = setInterval(() => {
      const currentToken = getAccessToken();
      if (currentToken && !timerRef.current) {
        console.log('[TokenRefresh] Fallback interval: No active timer, re-scheduling refresh');
        scheduleNextRefresh(currentToken);
      }
    }, 60000); // Check every minute

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      clearInterval(intervalId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('token:refreshed', handleTokenRefresh);
    };
  }, []); // Run once on mount

  return {
    refreshAccessToken,
    scheduleNextRefresh
  };
};
