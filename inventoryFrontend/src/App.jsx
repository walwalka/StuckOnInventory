import { useEffect, useState } from 'react';
import RequireAuth from './auth/RequireAuth.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import WaffleMenu from './components/WaffleMenu.jsx';
import { useSnackbar } from 'notistack';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { RiAdminLine } from 'react-icons/ri';
import { MdLogout } from "react-icons/md";
import Home from './pages/Home.jsx';
import CoinsList from './components/coins/CoinsList.jsx';
import RelicsList from './components/relics/RelicsList.jsx';
import StampsList from './components/stamps/StampsList.jsx';
import BunnykinsList from './components/bunnykins/BunnykinsList.jsx';
import ComicsList from './components/comics/ComicsList.jsx';
import Admin from './pages/Admin.jsx';
import MintsList from './components/mints/MintsList.jsx';
import SelectMint from './components/mints/mintSelect.jsx';
import Login from './components/Login/Login.jsx';
import Register from './components/Login/Register.jsx';
import Logout from './components/Login/Logout.jsx';
import VerifyEmail from './components/Login/VerifyEmail.jsx';
import UserManagement from './components/Admin/UserManagement.jsx';
import ForgotPassword from './components/Login/ForgotPassword.jsx';
import ResetPassword from './components/Login/ResetPassword.jsx';
import ResendVerification from './components/Login/ResendVerification.jsx';
import useToken from './components/useToken.jsx';
import CoinTypesList from './components/cointypes/CoinTypesList.jsx';
import RelicTypesList from './components/relictypes/RelicTypesList.jsx';
import ComicPublishersList from './components/comicpublishers/ComicPublishersList.jsx';
import { useTokenRefresh } from './hooks/useTokenRefresh.js';

// creating routes to each of the pages
const App = () => {
  const { token, setToken, clear } = useToken();
  const { enqueueSnackbar } = useSnackbar();
  const [showType, setShowType] = useState('table');
  const location = useLocation();
  const authRoutes = ['/login', '/register', '/logout', '/verify-email', '/forgot-password', '/reset-password', '/resend-verification'];
  const isLoginRoute = authRoutes.includes(location.pathname);

  // Automatic token refresh - refreshes token 2 minutes before expiry
  useTokenRefresh({
    refreshBuffer: 2 * 60 * 1000, // Refresh 2 minutes before expiry
    onRefreshError: (error) => {
      console.error('Token refresh failed:', error);
      enqueueSnackbar('Session expired. Please sign in again.', { variant: 'warning' });
      clear();
    }
  });

  // Listen for auth logout events (e.g., 401 from API client)
  useEffect(() => {
    const handler = () => {
      enqueueSnackbar('Session expired. Please sign in again.', { variant: 'warning' });
      clear();
    };
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [clear, enqueueSnackbar]);

  return (
    <div className="min-h-screen usd-bg usd-text">
      {!isLoginRoute && (
        <header className="p-4 usd-header">
          <div className="flex items-center justify-between">
            <Link to='/' className="text-2xl font-bold hover:opacity-80">Stuck On Inventory</Link>
            <div className="flex items-center gap-x-4">
              <WaffleMenu />
              <ThemeToggle />
              <Link
                to='/logout'
                className='px-4 py-2 rounded usd-btn-copper hover:opacity-90 transition flex items-center gap-2'
                title='Logout'
              >
                <MdLogout className='text-xl' />
                <span>Logout</span>
              </Link>
            </div>
          </div>
        </header>
      )}
      <main className={isLoginRoute ? "p-8" : "p-4"}>
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/invite/:token" element={<Register />} />
          <Route path="/logout" element={<Logout clearToken={clear} />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path='/coins/*' element={<CoinsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/relics/*' element={<RelicsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/stamps/*' element={<StampsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/bunnykins/*' element={<BunnykinsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/comics/*' element={<ComicsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/admin' element={<Admin />} />
          <Route path='/admin/users' element={<RequireAuth><UserManagement /></RequireAuth>} />
          <Route path='/mintlocations/*' element={<MintsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/mintselect' element={<SelectMint />} />
          <Route path='/cointypes/*' element={<CoinTypesList />} />
          <Route path='/relictypes/*' element={<RelicTypesList />} />
          <Route path='/comicpublishers/*' element={<ComicPublishersList />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
