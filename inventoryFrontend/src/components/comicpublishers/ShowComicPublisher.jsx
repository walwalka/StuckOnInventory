import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import Spinner from '../Spinner';

const ShowComicPublisher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/comicpublishers/${id}`)
      .then((response) => {
        setPublisher(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-md w-full p-6 shadow-2xl'>
        <div className="flex items-center justify-between mb-4">
          <h1 className='text-3xl dark:text-gray-100'>Comic Publisher</h1>
          <button
            onClick={() => navigate('/comicpublishers')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold leading-none"
          >
            ✕
          </button>
        </div>
        {loading ? (
          <Spinner />
        ) : publisher ? (
          <>
            <div className='my-2'>
              <span className='text-xl mr-4 usd-muted dark:text-gray-400'>ID</span>
              <span className='dark:text-gray-100'>{publisher.id}</span>
            </div>
            <div className='my-2 mb-4'>
              <span className='text-xl mr-4 usd-muted dark:text-gray-400'>Name</span>
              <span className='dark:text-gray-100'>{publisher.name}</span>
            </div>
            <button
              onClick={() => navigate('/comicpublishers')}
              className='w-full p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600'
            >
              Close
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ShowComicPublisher;
