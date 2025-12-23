import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';
import BackButton from '../BackButton';
import Spinner from '../Spinner';

const ShowRelicType = () => {
  const { id } = useParams();
  const [relicType, setRelicType] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/relictypes/${id}`)
      .then((response) => {
        setRelicType(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className='p-4'>
      <BackButton destination='/relictypes' />
      <h1 className='text-3xl my-4'>Relic Type</h1>
      {loading ? (
        <Spinner />
      ) : relicType ? (
        <div className='flex flex-col border-2 usd-border-green rounded-xl w-fit p-4 usd-panel'>
          <div className='my-2'>
            <span className='text-xl mr-4 usd-muted'>ID</span>
            <span>{relicType.id}</span>
          </div>
          <div className='my-2'>
            <span className='text-xl mr-4 usd-muted'>Name</span>
            <span>{relicType.name}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ShowRelicType;
