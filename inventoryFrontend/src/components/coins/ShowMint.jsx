import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../Spinner';

// Setting the const for the environments url
// Uses shared API client baseURL

// Shows coin page, this code leverages axios to populate the coin object within the elements in the UI. 

const ShowMint = () => {
  const [mint, setMint] = useState({});
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .get('/mintlocations/mints/'+id)
      .then((response) => {
        setMint(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 mx-auto shadow-2xl relative my-8'>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-[#2c2c2c] pb-3 border-b usd-border-green">
          <h1 className='text-2xl usd-text-green font-semibold'>Mint Location Details</h1>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="block text-sm usd-muted mb-1">ID</span>
            <span className="text-lg">{mint.id}</span>
          </div>
          <div>
            <span className="block text-sm usd-muted mb-1">Name</span>
            <span className="text-lg">{mint.name}</span>
          </div>
          <div>
            <span className="block text-sm usd-muted mb-1">City</span>
            <span className="text-lg">{mint.city}</span>
          </div>
          <div>
            <span className="block text-sm usd-muted mb-1">State</span>
            <span className="text-lg">{mint.state}</span>
          </div>
          <div>
            <span className="block text-sm usd-muted mb-1">Created At</span>
            <span className="text-lg">{mint.createdAt ? new Date(mint.createdAt).toLocaleString() : 'N/A'}</span>
          </div>
          <div>
            <span className="block text-sm usd-muted mb-1">Last Updated</span>
            <span className="text-lg">{mint.updatedAt ? new Date(mint.updatedAt).toLocaleString() : 'N/A'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShowMint;
