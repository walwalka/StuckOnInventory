import React, { useState } from 'react';
import Spinner from '../Spinner';
import api from '../../api/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const DeleteBunnykin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const handleDeleteBunnykin = () => {
    setLoading(true);
    api
      .delete('/bunnykins/'+id)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Bunnykin deleted', { variant: 'success' });
        navigate('/bunnykins');
      })
      .catch((error) => {
        setLoading(false);
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
        <h1 className='text-2xl mb-3 usd-text-green'>Delete Bunnykin</h1>
        <p className='text-center text-sm usd-muted mb-6'>Are you sure you want to delete this bunnykin? This action cannot be undone.</p>

        <div className='w-full space-y-3'>
          <button
            className='p-3 w-full usd-btn-copper rounded hover:opacity-90 disabled:opacity-60'
            onClick={handleDeleteBunnykin}
            disabled={loading}
          >
            Yes, delete it
          </button>
          <button
            className='p-3 w-full usd-btn-green rounded hover:opacity-90 disabled:opacity-60'
            onClick={() => navigate('/bunnykins')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteBunnykin;
