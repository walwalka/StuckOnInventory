import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../api/client';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      enqueueSnackbar('All fields are required', { variant: 'warning' });
      return;
    }

    if (password !== confirmPassword) {
      enqueueSnackbar('Passwords do not match', { variant: 'warning' });
      return;
    }

    if (password.length < 6) {
      enqueueSnackbar('Password must be at least 6 characters', { variant: 'warning' });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        email,
        password
      });

      // Registration successful - tokens received but email not verified yet
      if (response.data.accessToken && response.data.refreshToken) {
        enqueueSnackbar(
          response.data.message || 'Registration successful! Please check your email to verify your account.',
          { variant: 'success', autoHideDuration: 6000 }
        );
        // Redirect to login page or show verification notice
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center usd-bg">
      <div className="usd-panel border-2 usd-border-green rounded-xl p-8 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 usd-text-green text-center">Create Account</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-lg mb-2 usd-muted">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input"
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-lg mb-2 usd-muted">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input"
              placeholder="At least 6 characters"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-lg mb-2 usd-muted">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input"
              placeholder="Re-enter password"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 usd-btn-green rounded hover:opacity-90 text-lg font-semibold"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="usd-muted">
            Already have an account?{' '}
            <Link to="/login" className="usd-text-green hover:underline font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
