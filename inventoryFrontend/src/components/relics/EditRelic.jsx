import React, { useState, useEffect } from 'react';
import Spinner from '../Spinner';
import api from '../../api/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import ImageUpload from '../ImageUpload';

const EditRelic = () => {
  const [type, setType] = useState('');
  const [origin, setOrigin] = useState('');
  const [era, setEra] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [relicData, setRelicData] = useState(null);
  const navigate = useNavigate();
  const {id} = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    api
    .get('/relics/'+id)
    .then((response) => {
        setRelicData(response.data);
        setType(response.data.type);
        setOrigin(response.data.origin);
        setEra(response.data.era);
        setCondition(response.data.condition);
        setDescription(response.data.description || '');
        setQuantity(response.data.quantity || 1);
        setLoading(false);
      }).catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error loading relic', { variant: 'error' });
        console.log(error);
      });
  }, [id])
  
  const handleEditRelic = () => {
    const data = {
      type,
      origin,
      era,
      condition,
      description,
      quantity: parseInt(quantity) || 1
    };
    setLoading(true);
    api
      .put('/relics/'+id, data)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Relic updated successfully', { variant: 'success' });
        navigate('/relics');
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error', { variant: 'error' });
        console.log(error);
      });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Blurred backdrop overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md"></div>

      {/* Content container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <Spinner />
          </div>
        )}

        {/* Modal content - solid background */}
        <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-2xl w-full max-h-[90vh] shadow-2xl relative my-8 z-10'>
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#2c2c2c] border-b usd-border-green rounded-t-xl flex-shrink-0">
            <h1 className='text-2xl usd-text-green font-semibold'>Edit Relic</h1>
            <button
              onClick={() => navigate('/relics')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-base font-semibold leading-none"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          <div className="overflow-y-auto px-6 py-6 bg-white dark:bg-[#2c2c2c] rounded-b-xl">
            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              >
                <option value="Arrowhead">Arrowhead</option>
                <option value="Pottery">Pottery</option>
                <option value="Tool">Tool</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Weapon">Weapon</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Origin</label>
              <input
                type='text'
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              />
            </div>

            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Era</label>
              <input
                type='text'
                value={era}
                onChange={(e) => setEra(e.target.value)}
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

            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Quantity</label>
              <input
                type='number'
                min='1'
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
                placeholder='Number of items'
              />
            </div>

            {/* Image Upload Section */}
            {relicData && (
              <div className='my-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
                <ImageUpload
                  coinId={id}
                  existingImages={{
                    image1: relicData.image1,
                    image2: relicData.image2,
                    image3: relicData.image3
                  }}
                  onUploadSuccess={(updatedRelic) => setRelicData(updatedRelic)}
                  apiEndpoint="/relics"
                />
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                className='flex-1 p-3 usd-btn-green rounded hover:opacity-90 disabled:opacity-60'
                onClick={handleEditRelic}
                disabled={loading}
              >
                Save Changes
              </button>
              <button
                className='flex-1 p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-60'
                onClick={() => navigate('/relics')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditRelic;
