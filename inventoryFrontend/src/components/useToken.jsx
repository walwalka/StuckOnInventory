import { useState } from 'react';
import {
  getToken as getStoredToken,
  saveToken as persistToken,
  clearToken as removeToken
} from '../auth/token';

export default function useToken() {
  const [token, setToken] = useState(() => getStoredToken());

  const saveToken = (authResponse) => {
    const tokenValue =
      typeof authResponse === 'string'
        ? authResponse
        : authResponse?.token ?? null;
    persistToken(tokenValue);
    setToken(tokenValue);
  };

  const clear = () => {
    removeToken();
    setToken(null);
  };

  return {
    token,
    setToken: saveToken,
    clear
  };
}
