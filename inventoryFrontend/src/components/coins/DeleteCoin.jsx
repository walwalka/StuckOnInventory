import React, { useState } from 'react';
import Spinner from '../Spinner';
import api from '../../api/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

// Setting the const for the environments url
// Uses shared API client baseURL

// Shows delete coin toast allowing for deletion.
const DeleteCoin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteCoin = () => {
    setLoading(true);
    api
      .delete('/coins/'+id)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Coin deleted', { variant: 'success' });
        navigate('/coins');
      })
      .catch((error) => {
        setLoading(false);
        alert('An error happened. Please Check with your administrator');
        enqueueSnackbar('Error', { variant: 'error' });
        console.log(error);
      });
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center"><Spinner /></div>
      )}
      <div className='flex flex-col items-center border-2 usd-border-copper bg-white rounded-xl w-[420px] p-8 mx-auto shadow-2xl relative'>
        <h1 className='text-2xl mb-3 usd-text-green'>Delete Coin</h1>
        <p className='text-center text-sm usd-muted mb-6'>Are you sure you want to delete this coin? This action cannot be undone.</p>

        <div className='w-full space-y-3'>
          <button
            className='p-3 w-full usd-btn-copper rounded hover:opacity-90 disabled:opacity-60'
            onClick={handleDeleteCoin}
            disabled={loading}
          >
            Yes, delete it
          </button>
          <button
            className='p-3 w-full usd-btn-green rounded hover:opacity-90 disabled:opacity-60'
            onClick={() => navigate('/coins')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteCoin;
