export const isTokenExpired = (token) => {
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.exp && decoded.exp < Date.now()) {
      return true;
    }
    return false;
  } catch (error) {
    // If token can't be decoded, treat it as expired
    return true;
  }
};

export const getToken = () => {
  const raw = localStorage.getItem('token');
  // Treat empty strings and the literal 'null'/'undefined' as no token
  if (!raw || raw === 'null' || raw === 'undefined') {
    return null;
  }

  // Check if token is expired
  if (isTokenExpired(raw)) {
    localStorage.removeItem('token');
    // Dispatch logout event
    window.dispatchEvent(new Event('auth:logout'));
    return null;
  }

  return raw;
};

export const saveToken = (token) => {
  if (typeof token === 'string' && token.trim().length > 0) {
    localStorage.setItem('token', token);
  } else {
    // Falsy or invalid token clears storage to avoid bad state
    localStorage.removeItem('token');
  }
};

export const clearToken = () => {
  localStorage.removeItem('token');
};