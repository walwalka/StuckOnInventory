import { Navigate, useLocation } from 'react-router-dom';
import useToken from '../components/useToken';

export default function RequireAuth({ children }) {
  const { token } = useToken();
  const location = useLocation();

  const isAuthed = typeof token === 'string' && token.trim().length > 0;
  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}