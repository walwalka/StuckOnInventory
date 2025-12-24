import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/client';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setStatus('error');
      setMessage('No reset token provided. Please use the link from your email.');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      setStatus('success');
      setMessage(response.data.message || 'Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to reset password. The link may be expired or invalid.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Set new password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please enter your new password below.
          </p>
        </div>

        {!token ? (
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
          </div>
        ) : status === 'success' ? (
          <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
            <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-2">
              Redirecting to login...
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="new-password" className="sr-only">
                  New password
                </label>
                <input
                  id="new-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="New password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={status === 'loading'}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={status === 'loading'}
                />
              </div>
            </div>

            {message && status === 'error' && (
              <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white usd-btn-green hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Resetting...' : 'Reset password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
