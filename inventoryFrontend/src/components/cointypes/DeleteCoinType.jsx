import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import BackButton from '../BackButton';
import Spinner from '../Spinner';

const DeleteCoinType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    setLoading(true);
    api
      .delete(`/cointypes/${id}`)
      .then(() => {
        enqueueSnackbar('Coin type deleted', { variant: 'success' });
        queryClient.invalidateQueries({ queryKey: ['coinTypes'] });
        navigate('/cointypes');
      })
      .catch((error) => {
        console.log(error);
        enqueueSnackbar('Error deleting coin type', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-md w-full p-6 shadow-2xl relative'>
        <button
          onClick={() => navigate('/cointypes')}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold leading-none"
          aria-label="Close"
        >
          X
        </button>

        <h1 className='text-2xl mb-4 usd-text-green font-semibold'>Delete Coin Type</h1>
        {loading && <Spinner />}

        <div className='my-4'>
          <p className='text-lg text-center text-gray-700 dark:text-gray-300'>
            Are you sure you want to delete this coin type?
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            className='flex-1 p-3 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60'
            onClick={handleDelete}
            disabled={loading}
          >
            Yes, Delete it
          </button>
          <button
            className='flex-1 p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-60'
            onClick={() => navigate('/cointypes')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCoinType;
