import React, { useState } from 'react';
import './Login.css';
import PropTypes from 'prop-types';
import api from '../../api/client';
import { useSnackbar } from 'notistack';
import { useNavigate, useLocation } from 'react-router-dom';

async function loginUser(credentials) {
  return api.post('/login', credentials).then((res) => res.data);
}

export default function Login( { setToken } ) {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!username || !password) {
      enqueueSnackbar('Please enter username and password.', { variant: 'warning' });
      return;
    }
    
    try {
      const result = await loginUser({ username, password });
      const tokenValue = typeof result === 'string' ? result : result?.token;

      if (typeof tokenValue === 'string' && tokenValue.trim().length > 0) {
        // Persist valid token (useToken accepts both string or { token })
        setToken(tokenValue);
        enqueueSnackbar('Login successful!', { variant: 'success' });
        
        // Navigate to the page they were trying to access, or home
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        enqueueSnackbar('Invalid username or password.', { variant: 'error' });
      }
    } catch (err) {
      enqueueSnackbar('Login failed. Please try again.', { variant: 'error' });
      console.error('Login error:', err);
    }
  }

  return(
    <div className='min-h-[70vh] flex items-center justify-center p-6'>
      <div className='bg-stone-200 border-2 usd-border-green rounded-xl shadow-xl max-w-md w-full p-8'>
        <div className='text-center mb-6'>
          <h1 className='text-3xl font-semibold usd-text-green mb-1'>Stuck On Inventory</h1>
          <p className='usd-muted'>Please sign in to continue.</p>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-semibold usd-text-green'>Username</label>
            <input 
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUserName(e.target.value)}
              className='border-2 usd-border-silver rounded px-3 py-2 w-full bg-white text-gray-800 focus:outline-none focus:border-[var(--usd-green)]'
            />
          </div>
          <div className='space-y-2'>
            <label className='text-sm font-semibold usd-text-green'>Password</label>
            <input 
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='border-2 usd-border-silver rounded px-3 py-2 w-full bg-white text-gray-800 focus:outline-none focus:border-[var(--usd-green)]'
            />
          </div>
          <button 
            type="submit" 
            className='w-full py-3 mt-2 rounded usd-btn-green font-semibold hover:opacity-90 transition'
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

Login.propTypes = {
  setToken: PropTypes.func.isRequired
}