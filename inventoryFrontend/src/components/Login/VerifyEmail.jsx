import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import Spinner from '../Spinner';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('No verification token provided.');
        return;
      }

      try {
        const response = await api.post('/auth/verify-email', { token });
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Verification failed. The link may be expired or invalid.'
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Email Verification
          </h2>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-6 shadow rounded-lg">
          {status === 'verifying' && (
            <div className="text-center">
              <Spinner />
              <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Success!</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white usd-btn-green hover:opacity-90"
                >
                  Go to Login
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                <svg className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">Verification Failed</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => navigate('/resend-verification')}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white usd-btn-green hover:opacity-90"
                >
                  Request New Verification Email
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
