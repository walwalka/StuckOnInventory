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
import CreateCoin from './components/coins/CreateCoins.jsx';
import RelicsList from './components/relics/RelicsList.jsx';
import CreateRelics from './components/relics/CreateRelics.jsx';
import StampsList from './components/stamps/StampsList.jsx';
import CreateStamps from './components/stamps/CreateStamps.jsx';
import BunnykinsList from './components/bunnykins/BunnykinsList.jsx';
import CreateBunnykins from './components/bunnykins/CreateBunnykins.jsx';
import ComicsList from './components/comics/ComicsList.jsx';
import CreateComics from './components/comics/CreateComics.jsx';
import Admin from './pages/Admin.jsx';
import CreateMint from './components/coins/CreateMints.jsx';
import MintsList from './components/mints/MintsList.jsx';
import SelectMint from './components/mints/mintSelect.jsx';
import Login from './components/Login/Login.jsx';
import Register from './components/Login/Register.jsx';
import Logout from './components/Login/Logout.jsx';
import VerifyEmail from './components/Login/VerifyEmail.jsx';
import InviteManagement from './components/Admin/InviteManagement.jsx';
import ForgotPassword from './components/Login/ForgotPassword.jsx';
import ResetPassword from './components/Login/ResetPassword.jsx';
import ResendVerification from './components/Login/ResendVerification.jsx';
import useToken from './components/useToken.jsx';
import CoinTypesList from './components/cointypes/CoinTypesList.jsx';
import CreateCoinType from './components/cointypes/CreateCoinType.jsx';
import RelicTypesList from './components/relictypes/RelicTypesList.jsx';
import CreateRelicType from './components/relictypes/CreateRelicType.jsx';
import ComicPublishersList from './components/comicpublishers/ComicPublishersList.jsx';
import CreateComicPublisher from './components/comicpublishers/CreateComicPublisher.jsx';

// creating routes to each of the pages   
const App = () => {
  const { token, setToken, clear } = useToken();
  const { enqueueSnackbar } = useSnackbar();
  const [showType, setShowType] = useState('table');
  const location = useLocation();
  const authRoutes = ['/login', '/register', '/logout', '/verify-email', '/forgot-password', '/reset-password', '/resend-verification'];
  const isLoginRoute = authRoutes.includes(location.pathname);

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
          <Route path='/coins/create' element={<CreateCoin />} />
          <Route path='/coins/*' element={<CoinsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/relics/create' element={<CreateRelics />} />
          <Route path='/relics/*' element={<RelicsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/stamps/create' element={<CreateStamps />} />
          <Route path='/stamps/*' element={<StampsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/bunnykins/create' element={<CreateBunnykins />} />
          <Route path='/bunnykins/*' element={<BunnykinsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/comics/create' element={<CreateComics />} />
          <Route path='/comics/*' element={<ComicsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/admin' element={<Admin />} />
          <Route path='/admin/invites' element={<RequireAuth><InviteManagement /></RequireAuth>} />
          <Route path='/mintlocations/create' element={<CreateMint />} />
          <Route path='/mintlocations/*' element={<MintsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/mintselect' element={<SelectMint />} />
          <Route path='/cointypes/*' element={<CoinTypesList />} />
          <Route path='/cointypes/create' element={<CreateCoinType />} />
          <Route path='/relictypes/*' element={<RelicTypesList />} />
          <Route path='/relictypes/create' element={<CreateRelicType />} />
          <Route path='/comicpublishers/*' element={<ComicPublishersList />} />
          <Route path='/comicpublishers/create' element={<CreateComicPublisher />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
