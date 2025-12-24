import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useToken from '../components/useToken';
import { isTokenExpired } from './token';

export default function RequireAuth({ children }) {
  const { token, clear } = useToken();
  const location = useLocation();

  // Check token expiration on mount and periodically
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      clear();
      return;
    }

    // Check every minute
    const interval = setInterval(() => {
      if (token && isTokenExpired(token)) {
        clear();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [token, clear]);

  const isAuthed = typeof token === 'string' && token.trim().length > 0;
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}