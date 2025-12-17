import React, { useState } from 'react';
import BackButtonMints from '../mints/BackButtonMints';
import Spinner from '../Spinner';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import CustomListDropDown from '../mints/mintSelect';
import MintName from '../mints/mintSelect'

// Setting the const for the environments url
// Uses shared API client baseURL

// creation of the mint object
const CreateMint = () => {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [usState, setusState] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSaveMint = () => {
    const data = {
      name,
      city,
      usState,
    };
    setLoading(true);
    api
      .post('/mintlocations/mints/create', data)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Mint Created successfully', { variant: 'success' });
        navigate('/mintlocations');
      })
      .catch((error) => {
        setLoading(false);
        alert('An error happened. Please Check with your administrator');
        enqueueSnackbar('Error', { variant: 'error' });
        console.log(error);
      });
  };

  return (
    <div className='p-4'>
      <BackButtonMints />
      <h1 className='text-3xl my-4'>Create Mint location Record</h1>
      {loading ? <Spinner /> : ''}
      <div className='flex flex-col border-2 usd-border-green rounded-xl w-[600px] p-4 mx-auto usd-panel'>
        <div className='my-4'>
          <label className='text-xl mr-4 usd-muted'>Name</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2  w-full '
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 usd-muted'>City</label>
          <input
            type='text'
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2  w-full '
          />
        </div>
        <div className='my-4'>
          <label className='text-xl mr-4 usd-muted'>State</label>
          <input
            type='text'
            value={usState}
            onChange={(e) => setusState(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2  w-full '
          />
        </div>
        <button className='p-2 usd-btn-green m-8 rounded hover:opacity-90' onClick={handleSaveMint}>
          Save
        </button>
      </div>
    </div>
  );
}

export default CreateMint