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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Blurred backdrop overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md"></div>

      {/* Content container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <Spinner />
          </div>
        )}

        {/* Modal content - solid background */}
        <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-2xl w-full max-h-[90vh] shadow-2xl relative my-8 z-10'>
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#2c2c2c] border-b usd-border-green rounded-t-xl flex-shrink-0">
            <h1 className='text-2xl usd-text-green font-semibold'>Edit Mint Location</h1>
            <button
              onClick={() => navigate('/mintlocations')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-base font-semibold leading-none"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          <div className="overflow-y-auto px-6 py-6 bg-white dark:bg-[#2c2c2c] rounded-b-xl">
            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Name</label>
              <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              />
            </div>

            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>City</label>
              <input
                type='text'
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              />
            </div>

            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>State</label>
              <input
                type='text'
                value={usState}
                onChange={(e) => setUsState(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              />
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                className='flex-1 p-3 usd-btn-green rounded hover:opacity-90 disabled:opacity-60'
                onClick={handleUpdate}
                disabled={loading}
              >
                Save Changes
              </button>
              <button
                className='flex-1 p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-60'
                onClick={() => navigate('/mintlocations')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMint;
