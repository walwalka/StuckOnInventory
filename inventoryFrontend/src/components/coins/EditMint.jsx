import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import Spinner from '../Spinner';

const EditMint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [usState, setUsState] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/mintlocations/mints/${id}`)
      .then((response) => {
        console.log('Mint data loaded:', response.data);
        setName(response.data.name || '');
        setCity(response.data.city || '');
        setUsState(response.data.state || '');
      })
      .catch((error) => {
        console.log('Error loading mint:', error);
        enqueueSnackbar('Error loading mint location', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  }, [id, enqueueSnackbar]);

  const handleUpdate = () => {
    if (!name) {
      enqueueSnackbar('Name is required', { variant: 'warning' });
      return;
    }

    const data = {
      name,
      city,
      state: usState,
    };

    setLoading(true);
    api
      .put(`/mintlocations/mints/${id}`, data)
      .then(() => {
        enqueueSnackbar('Mint location updated successfully', { variant: 'success' });
        navigate('/mintlocations');
      })
      .catch((error) => {
        console.log('Error updating mint:', error);
        enqueueSnackbar('Error updating mint location', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-auto shadow-2xl relative my-8'>
        <button
          onClick={() => navigate('/mintlocations')}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
        >
          ✕
        </button>

        <h1 className='text-3xl mb-6 usd-text-green'>Edit Mint Location</h1>
        {loading ? <Spinner /> : null}
        <div className='my-4'>
          <label className='text-xl mr-4 usd-muted'>Name</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 usd-muted'>City</label>
          <input
            type='text'
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 usd-muted'>State</label>
          <input
            type='text'
            value={usState}
            onChange={(e) => setUsState(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
          />
        </div>
        <button
          className='p-2 usd-btn-green m-8 rounded hover:opacity-90'
          onClick={handleUpdate}
          disabled={loading}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditMint;
