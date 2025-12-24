import React, { useState } from 'react';
import './Login.css';
import PropTypes from 'prop-types';
import api from '../../api/client';
import { useSnackbar } from 'notistack';
import { useNavigate, useLocation, Link } from 'react-router-dom';

async function loginUser(credentials) {
  return api.post('/auth/login', credentials).then((res) => res.data);
}

export default function Login( { setToken } ) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async e => {
    e.preventDefault();

    if (!email || !password) {
      enqueueSnackbar('Please enter email and password.', { variant: 'warning' });
      return;
    }

    try {
      const result = await loginUser({ email, password });

      // Handle new JWT response format (accessToken + refreshToken)
      if (result.accessToken && result.refreshToken) {
        setToken(result); // Pass entire response with both tokens
        enqueueSnackbar('Login successful!', { variant: 'success' });

        // Navigate to the page they were trying to access, or home
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        enqueueSnackbar('Invalid email or password.', { variant: 'error' });
      }
    } catch (err) {
      // Handle email not verified error
      if (err.response?.status === 403 && err.response?.data?.emailVerified === false) {
        enqueueSnackbar(err.response.data.message || 'Please verify your email before logging in.', { variant: 'warning' });
        // Optionally redirect to resend verification page after a delay
        setTimeout(() => navigate('/resend-verification'), 2000);
      } else {
        const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
      console.error('Login error:', err);
    }
  }

  return(
    <div className='min-h-[70vh] flex items-center justify-center p-6'>
      <div className='bg-stone-200 dark:bg-[#2c2c2c] border-2 usd-border-green rounded-xl shadow-xl max-w-md w-full p-8'>
        <div className='text-center mb-6'>
          <h1 className='text-3xl font-semibold usd-text-green mb-1'>Stuck On Inventory</h1>
          <p className='usd-muted'>Please sign in to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-semibold usd-text-green'>Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='border-2 usd-border-silver rounded px-3 py-2 w-full text-gray-800 dark:text-gray-100 usd-input focus:outline-none focus:border-[var(--usd-green)]'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-semibold usd-text-green'>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='border-2 usd-border-silver rounded px-3 py-2 w-full text-gray-800 dark:text-gray-100 usd-input focus:outline-none focus:border-[var(--usd-green)]'
            />
          </div>
          <button
            type="submit"
            className='w-full py-3 mt-2 rounded usd-btn-green font-semibold hover:opacity-90 transition'
          >
            Login
          </button>
        </form>
        <div className='mt-6 text-center'>
          <p className='usd-muted text-sm'>
            <Link to="/forgot-password" className='usd-text-green hover:underline'>
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired
}