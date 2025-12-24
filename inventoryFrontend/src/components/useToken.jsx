import { useState } from 'react';
import {
  getAccessToken,
  getRefreshToken,
  saveTokens,
  clearTokens
} from '../auth/token';

export default function useToken() {
  const [accessToken, setAccessTokenState] = useState(() => getAccessToken());
  const [refreshToken, setRefreshTokenState] = useState(() => getRefreshToken());

  const setToken = (authResponse) => {
    // Handle different response formats
    if (typeof authResponse === 'string') {
      // Legacy: single token string (treat as access token)
      saveTokens(authResponse, '');
      setAccessTokenState(authResponse);
    } else if (authResponse?.accessToken && authResponse?.refreshToken) {
      // New format: object with both tokens
      saveTokens(authResponse.accessToken, authResponse.refreshToken);
      setAccessTokenState(authResponse.accessToken);
      setRefreshTokenState(authResponse.refreshToken);
    } else if (authResponse?.token) {
      // Backward compatibility: object with single 'token' property
      saveTokens(authResponse.token, '');
      setAccessTokenState(authResponse.token);
    }
  };

  const clear = () => {
    clearTokens();
    setAccessTokenState(null);
    setRefreshTokenState(null);
  };

  return {
    token: accessToken, // For backward compatibility
    accessToken,
    refreshToken,
    setToken,
    clear
  };
}
