import React, { useState, useEffect } from 'react';
import Spinner from '../Spinner';
import api from '../../api/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import ImageUpload from '../ImageUpload';

const EditStamp = () => {
  const [country, setCountry] = useState('');
  const [denomination, setDenomination] = useState('');
  const [issueyear, setIssueYear] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [stampData, setStampData] = useState(null);
  const navigate = useNavigate();
  const {id} = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    api
    .get('/stamps/'+id)
    .then((response) => {
        setStampData(response.data);
        setCountry(response.data.country);
        setDenomination(response.data.denomination);
        setIssueYear(response.data.issueyear);
        setCondition(response.data.condition);
        setDescription(response.data.description || '');
        setLoading(false);
      }).catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error loading stamp', { variant: 'error' });
        console.log(error);
      });
  }, [id])
  
  const handleEditStamp = () => {
    const data = {
      country,
      denomination,
      issueyear,
      condition,
      description
    };
    setLoading(true);
    api
      .put('/stamps/'+id, data)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Stamp updated successfully', { variant: 'success' });
        navigate('/stamps');
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error', { variant: 'error' });
        console.log(error);
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center"><Spinner /></div>
      )}
      <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-auto shadow-2xl relative my-8'>
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-[#2c2c2c] pb-3 border-b usd-border-green">
          <h1 className='text-2xl usd-text-green font-semibold'>Edit Stamp</h1>
          <button
            onClick={() => navigate('/stamps')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Country</label>
          <input
            type='text'
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
          />
        </div>

        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Denomination</label>
          <input
            type='text'
            value={denomination}
            onChange={(e) => setDenomination(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
          />
        </div>

        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Issue Year</label>
          <input
            type='text'
            value={issueyear}
            onChange={(e) => setIssueYear(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
          />
        </div>

        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
          >
            <option value="Mint">Mint</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>

        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
            rows='4'
          />
        </div>

        {stampData && (
          <div className='my-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
            <ImageUpload
              coinId={id}
              existingImages={{
                image1: stampData.image1,
                image2: stampData.image2,
                image3: stampData.image3
              }}
              onUploadSuccess={(updatedStamp) => setStampData(updatedStamp)}
              apiEndpoint="/stamps"
            />
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            className='flex-1 p-3 usd-btn-green rounded hover:opacity-90 disabled:opacity-60'
            onClick={handleEditStamp}
            disabled={loading}
          >
            Save Changes
          </button>
          <button
            className='flex-1 p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-60'
            onClick={() => navigate('/stamps')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditStamp;
