export const getToken = () => {
  const raw = localStorage.getItem('token');
  // Treat empty strings and the literal 'null'/'undefined' as no token
  if (!raw || raw === 'null' || raw === 'undefined') {
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