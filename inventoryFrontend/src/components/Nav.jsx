import { useLocation } from 'react-router-dom';

const Nav = ({ showType, onShowTypeChange }) => {
  const location = useLocation();
  const isCoins = location.pathname === '/coins';
  const isMints = location.pathname === '/mintlocations';
};

export default Nav;
