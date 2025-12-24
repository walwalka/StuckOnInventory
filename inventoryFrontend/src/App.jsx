import React, { useEffect, useState } from 'react';
import RequireAuth from './auth/RequireAuth.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import Nav from './components/Nav.jsx';
import WaffleMenu from './components/WaffleMenu.jsx';
import { useSnackbar } from 'notistack';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { RiAdminLine } from 'react-icons/ri';
import { MdLogout } from "react-icons/md";
import Home from './pages/Home.jsx';
import CoinsList from './components/coins/CoinsList.jsx';
import CreateCoin from './components/coins/CreateCoins.jsx';
import ShowCoin from './components/coins/ShowCoin.jsx';
import EditCoin from './components/coins/EditCoin.jsx';
import DeleteCoin from './components/coins/DeleteCoin.jsx';
import RelicsList from './components/relics/RelicsList.jsx';
import CreateRelics from './components/relics/CreateRelics.jsx';
import ShowRelic from './components/relics/ShowRelic.jsx';
import EditRelic from './components/relics/EditRelic.jsx';
import DeleteRelic from './components/relics/DeleteRelic.jsx';
import StampsList from './components/stamps/StampsList.jsx';
import CreateStamps from './components/stamps/CreateStamps.jsx';
import ShowStamp from './components/stamps/ShowStamp.jsx';
import EditStamp from './components/stamps/EditStamp.jsx';
import DeleteStamp from './components/stamps/DeleteStamp.jsx';
import BunnykinsList from './components/bunnykins/BunnykinsList.jsx';
import CreateBunnykins from './components/bunnykins/CreateBunnykins.jsx';
import ShowBunnykin from './components/bunnykins/ShowBunnykin.jsx';
import EditBunnykin from './components/bunnykins/EditBunnykin.jsx';
import DeleteBunnykin from './components/bunnykins/DeleteBunnykin.jsx';
import ComicsList from './components/comics/ComicsList.jsx';
import CreateComics from './components/comics/CreateComics.jsx';
import ShowComic from './components/comics/ShowComic.jsx';
import EditComic from './components/comics/EditComic.jsx';
import DeleteComic from './components/comics/DeleteComic.jsx';
import Admin from './pages/Admin.jsx';
import CreateMint from './components/coins/CreateMints.jsx';
import Mints from './components/coins/Mints.jsx';
import ShowMint from './components/coins/ShowMint.jsx';
import EditMint from './components/coins/EditMint.jsx';
import SelectMint from './components/mints/mintSelect.jsx';
import DeleteMint from './components/coins/DeleteMint.jsx';
import Login from './components/Login/Login.jsx';
import Register from './components/Login/Register.jsx';
import Logout from './components/Login/Logout.jsx';
import useToken from './components/useToken.jsx';
import CoinTypesList from './components/cointypes/CoinTypesList.jsx';
import CreateCoinType from './components/cointypes/CreateCoinType.jsx';
import RelicTypesList from './components/relictypes/RelicTypesList.jsx';
import CreateRelicType from './components/relictypes/CreateRelicType.jsx';
import ShowRelicType from './components/relictypes/ShowRelicType.jsx';
import EditRelicType from './components/relictypes/EditRelicType.jsx';
import DeleteRelicType from './components/relictypes/DeleteRelicType.jsx';
import ComicPublishersList from './components/comicpublishers/ComicPublishersList.jsx';
import CreateComicPublisher from './components/comicpublishers/CreateComicPublisher.jsx';
import ShowComicPublisher from './components/comicpublishers/ShowComicPublisher.jsx';
import EditComicPublisher from './components/comicpublishers/EditComicPublisher.jsx';
import DeleteComicPublisher from './components/comicpublishers/DeleteComicPublisher.jsx';
import ShowCoinType from './components/cointypes/ShowCoinType.jsx';
import EditCoinType from './components/cointypes/EditCoinType.jsx';
import DeleteCoinType from './components/cointypes/DeleteCoinType.jsx';

// creating routes to each of the pages   
const App = () => {
  const { token, setToken, clear } = useToken();
  const { enqueueSnackbar } = useSnackbar();
  const [showType, setShowType] = useState('table');
  const location = useLocation();
  const isLoginRoute = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/logout';

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
                to='/admin'
                className='px-4 py-2 rounded usd-btn-green hover:opacity-90 transition flex items-center gap-2'
                title='Admin Panel'
              >
                <RiAdminLine className='text-xl' />
                <span>Admin</span>
              </Link>
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
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout clearToken={clear} />} />
          <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path='/coins' element={<CoinsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/coins/create' element={<CreateCoin />} />
          <Route path='/coins/details/:id' element={<ShowCoin />} />
          <Route path='/coins/edit/:id' element={<EditCoin />} />
          <Route path='/coins/delete/:id' element={<DeleteCoin />} />
          <Route path='/relics' element={<RelicsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/relics/create' element={<CreateRelics />} />
          <Route path='/relics/details/:id' element={<ShowRelic />} />
          <Route path='/relics/edit/:id' element={<EditRelic />} />
          <Route path='/relics/delete/:id' element={<DeleteRelic />} />
          <Route path='/stamps' element={<StampsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/stamps/create' element={<CreateStamps />} />
          <Route path='/stamps/details/:id' element={<ShowStamp />} />
          <Route path='/stamps/edit/:id' element={<EditStamp />} />
          <Route path='/stamps/delete/:id' element={<DeleteStamp />} />
          <Route path='/bunnykins' element={<BunnykinsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/bunnykins/create' element={<CreateBunnykins />} />
          <Route path='/bunnykins/details/:id' element={<ShowBunnykin />} />
          <Route path='/bunnykins/edit/:id' element={<EditBunnykin />} />
          <Route path='/bunnykins/delete/:id' element={<DeleteBunnykin />} />
          <Route path='/comics' element={<ComicsList showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/comics/create' element={<CreateComics />} />
          <Route path='/comics/details/:id' element={<ShowComic />} />
          <Route path='/comics/edit/:id' element={<EditComic />} />
          <Route path='/comics/delete/:id' element={<DeleteComic />} />
          <Route path='/admin' element={<Admin />} />
          <Route path='/mintlocations' element={<Mints showType={showType} onShowTypeChange={setShowType} />} />
          <Route path='/mintlocations/create' element={<CreateMint />} />
          <Route path='/mintlocations/details/:id' element={<ShowMint />} />
          <Route path='/mintlocations/edit/:id' element={<EditMint />} />
          <Route path='/mintselect' element={<SelectMint />} />
          <Route path='/mintlocations/delete/:id' element={<DeleteMint />} />
          <Route path='/cointypes' element={<CoinTypesList />} />
          <Route path='/cointypes/create' element={<CreateCoinType />} />
          <Route path='/cointypes/details/:id' element={<ShowCoinType />} />
          <Route path='/cointypes/edit/:id' element={<EditCoinType />} />
          <Route path='/cointypes/delete/:id' element={<DeleteCoinType />} />
          <Route path='/relictypes' element={<RelicTypesList />} />
          <Route path='/relictypes/create' element={<CreateRelicType />} />
          <Route path='/relictypes/details/:id' element={<ShowRelicType />} />
          <Route path='/relictypes/edit/:id' element={<EditRelicType />} />
          <Route path='/relictypes/delete/:id' element={<DeleteRelicType />} />
          <Route path='/comicpublishers' element={<ComicPublishersList />} />
          <Route path='/comicpublishers/create' element={<CreateComicPublisher />} />
          <Route path='/comicpublishers/details/:id' element={<ShowComicPublisher />} />
          <Route path='/comicpublishers/edit/:id' element={<EditComicPublisher />} />
          <Route path='/comicpublishers/delete/:id' element={<DeleteComicPublisher />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
