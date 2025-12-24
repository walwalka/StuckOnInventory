import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdCheckCircle } from 'react-icons/md';
import api from '../../api/client';

const Logout = ({ clearToken }) => {
  const [logoutComplete, setLogoutComplete] = useState(false);

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Call backend logout endpoint to invalidate refresh token
        await api.post('/auth/logout');
      } catch (error) {
        // Log error but continue with client-side logout
        console.error('Logout error:', error);
      } finally {
        // Clear tokens from localStorage
        if (clearToken) {
          clearToken();
        }
        setLogoutComplete(true);
      }
    };

    performLogout();
  }, [clearToken]);

  return (
    <div className="min-h-screen flex items-center justify-center usd-bg">
      <div className="usd-panel border-2 usd-border-green rounded-xl p-8 w-full max-w-md shadow-2xl text-center">
        <div className="flex justify-center mb-6">
          <MdCheckCircle className="text-6xl" style={{ color: 'var(--usd-green)' }} />
        </div>
        <h1 className="text-3xl font-bold mb-4 usd-text-green">Logged Out Successfully</h1>
        <p className="text-lg mb-6 usd-muted">
          You have been successfully logged out of Stuck On Inventory.
        </p>
        <p className="text-sm mb-8 usd-muted">
          Thank you for using our inventory management system. Your session has ended securely.
        </p>
        <Link
          to="/login"
          className="inline-block w-full p-3 usd-btn-green rounded hover:opacity-90 text-lg font-semibold"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default Logout;
