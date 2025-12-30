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
    <div className='p-4'>
      <BackButton destination='/cointypes' />
      <h1 className='text-3xl my-4'>Delete Coin Type</h1>
      {loading ? <Spinner /> : null}
      <div className='flex flex-col items-center border-2 usd-border-green rounded-xl w-[500px] p-8 mx-auto usd-panel'>
        <h3 className='text-2xl text-center mb-6'>Are you sure you want to delete this coin type?</h3>
        <button
          className='p-3 bg-red-600 text-white w-full rounded hover:opacity-90'
          onClick={handleDelete}
          disabled={loading}
        >
          Yes, delete it
        </button>
      </div>
    </div>
  );
};

export default DeleteCoinType;
