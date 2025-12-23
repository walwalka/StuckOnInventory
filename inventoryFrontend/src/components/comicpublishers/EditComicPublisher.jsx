import React, { useState, useEffect } from 'react';
import BackButton from '../BackButton';
import Spinner from '../Spinner';
import api from '../../api/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const EditComicPublisher = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    api
      .get(`/comicpublishers/${id}`)
      .then((response) => {
        setName(response.data.name);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error loading comic publisher', { variant: 'error' });
        console.log(error);
      });
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
        setLoading(false);
        enqueueSnackbar('Comic publisher updated successfully', { variant: 'success' });
        navigate('/comicpublishers');
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error updating comic publisher', { variant: 'error' });
        console.log(error);
      });
  };

  return (
    <div className='p-4'>
      <BackButton destination='/comicpublishers' />
      <h1 className='text-3xl my-4'>Edit Comic Publisher</h1>
      {loading ? <Spinner /> : ''}
      <div className='flex flex-col border-2 usd-border-green rounded-xl w-[600px] p-4 mx-auto usd-panel'>
        <div className='my-4'>
          <label className='text-xl mr-4 usd-muted'>Name</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded'
          />
        </div>
        <button className='p-2 usd-btn-green m-8 rounded hover:opacity-90' onClick={handleEditPublisher}>
          Save
        </button>
      </div>
    </div>
  );
};

export default EditComicPublisher;
