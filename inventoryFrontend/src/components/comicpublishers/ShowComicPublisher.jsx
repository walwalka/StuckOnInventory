import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';
import BackButton from '../BackButton';
import Spinner from '../Spinner';

const ShowComicPublisher = () => {
  const { id } = useParams();
  const [publisher, setPublisher] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/comicpublishers/${id}`)
      .then((response) => {
        setPublisher(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className='p-4'>
      <BackButton destination='/comicpublishers' />
      <h1 className='text-3xl my-4'>Comic Publisher</h1>
      {loading ? (
        <Spinner />
      ) : publisher ? (
        <div className='flex flex-col border-2 usd-border-green rounded-xl w-fit p-4 usd-panel'>
          <div className='my-2'>
            <span className='text-xl mr-4 usd-muted'>ID</span>
            <span>{publisher.id}</span>
          </div>
          <div className='my-2'>
            <span className='text-xl mr-4 usd-muted'>Name</span>
            <span>{publisher.name}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ShowComicPublisher;
