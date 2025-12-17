import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';
import BackButton from '../BackButton';
import Spinner from '../Spinner';

const ShowCoinType = () => {
  const { id } = useParams();
  const [coinType, setCoinType] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/cointypes/${id}`)
      .then((response) => {
        setCoinType(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className='p-4'>
      <BackButton destination='/cointypes' />
      <h1 className='text-3xl my-4'>Coin Type</h1>
      {loading ? (
        <Spinner />
      ) : coinType ? (
        <div className='flex flex-col border-2 usd-border-green rounded-xl w-fit p-4 usd-panel'>
          <div className='my-2'>
            <span className='text-xl mr-4 usd-muted'>ID</span>
            <span>{coinType.id}</span>
          </div>
          <div className='my-2'>
            <span className='text-xl mr-4 usd-muted'>Name</span>
            <span>{coinType.name}</span>
          </div>
          <div className='my-2'>
            <span className='text-xl mr-4 usd-muted'>Face Value</span>
            <span>${Number(coinType.face_value).toFixed(2)}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ShowCoinType;
