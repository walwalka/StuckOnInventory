import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import Spinner from '../Spinner';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineAddBox, MdOutlineDelete, MdAssuredWorkload, MdOutlineBubbleChart } from 'react-icons/md';
import MintsCard from '../mints/MintsCard';
import MintsTable from '../mints/MintsTable';

// Setting the const for the environments url
// Uses shared API client baseURL

// Shows coin table on page, this code leverages axios to populate the coin object within the elements in the UI. 
const Mint = ({ showType, onShowTypeChange }) => {
  const [mints, setMints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get('/mintlocations/mints')
      .then((response) => {
        setMints(response.data.data.rows);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
       setLoading(false);
      });
  }, []);

  return (
    <div className='p-4'>
      <div className='flex justify-inbetween items-center'>
        <h1 className='text-3xl my-8'>mintList</h1>
        <div className='flex gap-x-4 justify-end'>
        <Link to='/mintlocations/create'>
            <MdOutlineAddBox className='text-4xl' style={{ color: 'var(--usd-green)' }} />
          </Link>
      </div>
      </div>

      {loading ? (
        <Spinner />
      ) : showType === 'table' ? (
        <MintsTable mints={mints} />
      ) : (
        <MintsCard mints={mints} />
      )}
    </div>
  );
};

export default Mint;
