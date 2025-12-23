import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import Spinner from '../Spinner';

const CreateCoinType = () => {
  const [name, setName] = useState('');
  const [faceValue, setFaceValue] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSave = () => {
    if (!name || faceValue === '') {
      enqueueSnackbar('Name and face value are required', { variant: 'warning' });
      return;
    }

    const parsed = parseFloat(faceValue);
    if (Number.isNaN(parsed)) {
      enqueueSnackbar('Face value must be numeric', { variant: 'warning' });
      return;
    }

    setLoading(true);
    api
      .post('/cointypes', { name, face_value: parsed })
      .then(() => {
        enqueueSnackbar('Coin type created', { variant: 'success' });
        navigate('/cointypes');
      })
      .catch((error) => {
        console.log(error);
        enqueueSnackbar('Error creating coin type', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      <div className='flex flex-col border-2 usd-border-green bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-auto shadow-2xl relative my-8'>
        <button
          onClick={() => navigate('/cointypes')}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          ✕
        </button>

        <h1 className='text-3xl mb-6'>Create Coin Type</h1>
        {loading ? <Spinner /> : null}
        <div className='my-4'>
          <label className='text-xl mr-4 usd-muted'>Name</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded'
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 usd-muted'>Face Value (USD)</label>
          <input
            type='number'
            step='0.01'
            value={faceValue}
            onChange={(e) => setFaceValue(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded'
          />
        </div>
        <button className='p-2 usd-btn-green m-8 rounded hover:opacity-90' onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
};

export default CreateCoinType;
