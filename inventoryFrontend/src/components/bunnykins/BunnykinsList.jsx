import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import Spinner from '../Spinner';
import { Link } from 'react-router-dom';
import { MdOutlineAddBox } from 'react-icons/md';
import BunnykinsTable from './BunnykinsTable';
import BunnykinsCard from './BunnykinsCard';

const BunnykinsList = ({ showType, onShowTypeChange }) => {
  const [bunnykins, setBunnykins] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get('/bunnykins/')
      .then((response) => {
        setBunnykins(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl my-8'>Bunnykins Inventory</h1>
        <div className='flex gap-x-4 justify-end'>
          <Link to='/bunnykins/create'>
            <MdOutlineAddBox className='text-4xl' style={{ color: 'var(--usd-copper)' }} />
          </Link>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : showType === 'table' ? (
        <BunnykinsTable bunnykins={bunnykins} />
      ) : (
        <BunnykinsCard bunnykins={bunnykins} />
      )}
    </div>
  );
};

export default BunnykinsList;
