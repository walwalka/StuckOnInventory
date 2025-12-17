import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import BackButton from '../BackButton';
import Spinner from '../Spinner';

const EditCoinType = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [name, setName] = useState('');
  const [faceValue, setFaceValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/cointypes/${id}`)
      .then((response) => {
        setName(response.data.name);
        setFaceValue(response.data.face_value);
      })
      .catch((error) => {
        console.log(error);
        enqueueSnackbar('Error loading coin type', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = () => {
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
      .put(`/cointypes/${id}`, { name, face_value: parsed })
      .then(() => {
        enqueueSnackbar('Coin type updated', { variant: 'success' });
        navigate('/cointypes');
      })
      .catch((error) => {
        console.log(error);
        enqueueSnackbar('Error updating coin type', { variant: 'error' });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className='p-4'>
      <BackButton destination='/cointypes' />
      <h1 className='text-3xl my-4'>Edit Coin Type</h1>
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
        <button className='p-2 usd-btn-green m-8 rounded hover:opacity-90' onClick={handleUpdate} disabled={loading}>
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditCoinType;
