import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import Spinner from '../Spinner';
import { Link } from 'react-router-dom';
import { MdOutlineAddBox } from 'react-icons/md';
import CoinsTable from './CoinsTable';
import CoinsCard from './CoinsCard';

const CoinsList = ({ showType, onShowTypeChange }) => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCoins = () => {
    setLoading(true);
    api
      .get('/coins/')
      .then((response) => {
        setCoins(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl my-8'>Coin Inventory</h1>
        <div className='flex gap-x-4 justify-end'>
          <Link to='/coins/create'>
            <MdOutlineAddBox className='text-4xl' style={{ color: 'var(--usd-copper)' }} />
          </Link>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : showType === 'table' ? (
        <CoinsTable coins={coins} onRefresh={fetchCoins} />
      ) : (
        <CoinsCard coins={coins} />
      )}
    </div>
  );
};

export default CoinsList;
