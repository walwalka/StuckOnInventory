import React, { useState, useEffect } from 'react';
import Spinner from '../Spinner';
import api from '../../api/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const EditComicPublisher = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    api
      .get(`/comicpublishers/${id}`)
      .then((response) => {
        console.log('Comic publisher data loaded:', response.data);
        setName(response.data.name || '');
      })
      .catch((error) => {
        console.log('Error loading comic publisher:', error);
        enqueueSnackbar('Error loading comic publisher', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  }, [id, enqueueSnackbar]);

  const handleEditPublisher = () => {
    if (!name) {
      enqueueSnackbar('Please enter a name', { variant: 'warning' });
      return;
    }

    const data = { name };
    setLoading(true);

    api
      .put(`/comicpublishers/${id}`, data)
      .then(() => {
        enqueueSnackbar('Comic publisher updated successfully', { variant: 'success' });
        navigate('/comicpublishers');
      })
      .catch((error) => {
        enqueueSnackbar('Error updating comic publisher', { variant: 'error' });
        console.log(error);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-auto shadow-2xl relative my-8'>
        <button
          onClick={() => navigate('/comicpublishers')}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
        >
          ✕
        </button>

        <h1 className='text-3xl mb-6 usd-text-green'>Edit Comic Publisher</h1>
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
        <button
          className='p-2 usd-btn-green m-8 rounded hover:opacity-90'
          onClick={handleEditPublisher}
          disabled={loading}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditComicPublisher;
