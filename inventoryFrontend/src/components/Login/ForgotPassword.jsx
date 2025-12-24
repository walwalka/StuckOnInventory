import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email });
      setStatus('success');
      setMessage(response.data.message || 'Password reset email sent. Please check your inbox.');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to send password reset email. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading' || status === 'success'}
              />
            </div>
          </div>

          {message && (
            <div
              className={`rounded-md p-4 ${
                status === 'success'
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                  : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
              }`}
            >
              <p className="text-sm">{message}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white usd-btn-green hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Sending...' : 'Send reset link'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/login"
                className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
              >
                Back to login
              </Link>
            </div>
            <div className="text-sm">
              <Link
                to="/register"
                className="font-medium text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300"
              >
                Create account
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
