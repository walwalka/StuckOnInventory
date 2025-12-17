import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import Spinner from '../Spinner';
import { Link } from 'react-router-dom';
import { MdOutlineAddBox } from 'react-icons/md';
import StampsTable from './StampsTable';
import StampsCard from './StampsCard';

const StampsList = ({ showType, onShowTypeChange }) => {
  const [stamps, setStamps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get('/stamps/')
      .then((response) => {
        setStamps(response.data.data);
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
        <h1 className='text-3xl my-8'>Stamps Inventory</h1>
        <div className='flex gap-x-4 justify-end'>
          <Link to='/stamps/create'>
            <MdOutlineAddBox className='text-4xl' style={{ color: 'var(--usd-copper)' }} />
          </Link>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : showType === 'table' ? (
        <StampsTable stamps={stamps} />
      ) : (
        <StampsCard stamps={stamps} />
      )}
    </div>
  );
};

export default StampsList;
