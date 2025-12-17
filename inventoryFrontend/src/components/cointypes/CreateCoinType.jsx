import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import BackButton from '../BackButton';
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
    <div className='p-4'>
      <BackButton destination='/cointypes' />
      <h1 className='text-3xl my-4'>Create Coin Type</h1>
      {loading ? <Spinner /> : null}
      <div className='flex flex-col border-2 usd-border-green rounded-xl w-[500px] p-4 mx-auto usd-panel'>
        <div className='my-4'>
          <label className='text-xl mr-4 usd-muted'>Name</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 usd-muted'>Face Value (USD)</label>
          <input
            type='number'
            step='0.01'
            value={faceValue}
            onChange={(e) => setFaceValue(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full'
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
