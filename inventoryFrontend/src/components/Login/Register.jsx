import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../api/client';

const Register = () => {
  const { token } = useParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingInvite, setVerifyingInvite] = useState(true);
  const [inviteValid, setInviteValid] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const verifyInvite = async () => {
      if (!token) {
        enqueueSnackbar('Invalid invitation link', { variant: 'error' });
        setVerifyingInvite(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        const response = await api.get(`/invites/verify/${token}`);
        setEmail(response.data.email);
        setInviteValid(true);
      } catch (error) {
        console.error('Invite verification error:', error);
        const errorMessage = error.response?.data?.message || 'Invalid or expired invitation';
        enqueueSnackbar(errorMessage, { variant: 'error' });
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setVerifyingInvite(false);
      }
    };

    verifyInvite();
  }, [token, navigate, enqueueSnackbar]);

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
        password,
        inviteToken: token
      });

      // Registration successful
      if (response.data.accessToken && response.data.refreshToken) {
        enqueueSnackbar(
          response.data.message || 'Account created successfully!',
          { variant: 'success', autoHideDuration: 3000 }
        );
        // Redirect to login page
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (verifyingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center usd-bg">
        <div className="usd-panel border-2 usd-border-green rounded-xl p-8 w-full max-w-md shadow-2xl">
          <h1 className="text-2xl font-bold mb-4 usd-text-green text-center">Verifying Invitation...</h1>
          <p className="text-center usd-muted">Please wait while we verify your invitation.</p>
        </div>
      </div>
    );
  }

  if (!inviteValid) {
    return (
      <div className="min-h-screen flex items-center justify-center usd-bg">
        <div className="usd-panel border-2 border-red-500 rounded-xl p-8 w-full max-w-md shadow-2xl">
          <h1 className="text-2xl font-bold mb-4 text-red-500 text-center">Invalid Invitation</h1>
          <p className="text-center usd-muted">This invitation link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

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
              className="border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input bg-gray-100 dark:bg-gray-700"
              disabled
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
            {loading ? 'Creating Account...' : 'Create Account'}
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
