import React, { useState } from 'react';
import BackButton from '../BackButton';
import Spinner from '../Spinner';
import api from '../../api/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const DeleteComicPublisher = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const handleDeletePublisher = () => {
    setLoading(true);
    api
      .delete(`/comicpublishers/${id}`)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Comic publisher deleted successfully', { variant: 'success' });
        navigate('/comicpublishers');
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error deleting comic publisher', { variant: 'error' });
        console.log(error);
      });
  };

  return (
    <div className='p-4'>
      <BackButton destination='/comicpublishers' />
      <h1 className='text-3xl my-4'>Delete Comic Publisher</h1>
      {loading ? <Spinner /> : ''}
      <div className='flex flex-col items-center border-2 usd-border-green rounded-xl w-[600px] p-8 mx-auto usd-panel'>
        <h3 className='text-2xl'>Are you sure you want to delete this comic publisher?</h3>

        <button
          className='p-4 usd-btn-copper w-full rounded hover:opacity-90 m-8'
          onClick={handleDeletePublisher}
        >
          Yes, Delete it
        </button>
      </div>
    </div>
  );
};

export default DeleteComicPublisher;
