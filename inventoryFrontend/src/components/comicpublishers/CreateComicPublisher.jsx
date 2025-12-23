import React, { useState } from 'react';
import Spinner from '../Spinner';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const CreateComicPublisher = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSavePublisher = () => {
    if (!name) {
      enqueueSnackbar('Please enter a name', { variant: 'warning' });
      return;
    }

    const data = { name };
    setLoading(true);

    api
      .post('/comicpublishers', data)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Comic publisher created successfully', { variant: 'success' });
        navigate('/comicpublishers');
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error creating comic publisher', { variant: 'error' });
        console.log(error);
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      <div className='flex flex-col border-2 usd-border-green bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-auto shadow-2xl relative my-8'>
        <button
          onClick={() => navigate('/comicpublishers')}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          ✕
        </button>

        <h1 className='text-3xl mb-6'>Create Comic Publisher</h1>
        {loading ? <Spinner /> : ''}
        <div className='my-4'>
          <label className='text-xl mr-4 usd-muted'>Name</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded'
            placeholder='e.g., Marvel, DC Comics, Image Comics'
          />
        </div>
        <button className='p-2 usd-btn-green m-8 rounded hover:opacity-90' onClick={handleSavePublisher}>
          Save
        </button>
      </div>
    </div>
  );
};

export default CreateComicPublisher;
