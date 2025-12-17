import React, { useState, useEffect } from 'react';
import Spinner from '../Spinner';
import api from '../../api/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import ImageUpload from '../ImageUpload';

const EditBunnykin = () => {
  const [name, setName] = useState('');
  const [series, setSeries] = useState('');
  const [productionyear, setProductionYear] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [bunnykinData, setBunnykinData] = useState(null);
  const navigate = useNavigate();
  const {id} = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    api
    .get('/bunnykins/'+id)
    .then((response) => {
        setBunnykinData(response.data);
        setName(response.data.name);
        setSeries(response.data.series);
        setProductionYear(response.data.productionyear);
        setCondition(response.data.condition);
        setDescription(response.data.description || '');
        setLoading(false);
      }).catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error loading bunnykin', { variant: 'error' });
        console.log(error);
      });
  }, [id])
  
  const handleEditBunnykin = () => {
    const data = {
      name,
      series,
      productionyear,
      condition,
      description
    };
    setLoading(true);
    api
      .put('/bunnykins/'+id, data)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Bunnykin updated successfully', { variant: 'success' });
        navigate('/bunnykins');
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error', { variant: 'error' });
        console.log(error);
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center"><Spinner /></div>
      )}
      <div className='flex flex-col border-2 usd-border-green bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-auto shadow-2xl relative my-8'>
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-3 border-b usd-border-green">
          <h1 className='text-2xl usd-text-green font-semibold'>Edit Bunnykin</h1>
          <button
            onClick={() => navigate('/bunnykins')}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Name</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='border-2 border-gray-300 rounded px-4 py-2 w-full focus:border-green-500 focus:outline-none'
          />
        </div>
        
        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Series</label>
          <input
            type='text'
            value={series}
            onChange={(e) => setSeries(e.target.value)}
            className='border-2 border-gray-300 rounded px-4 py-2 w-full focus:border-green-500 focus:outline-none'
          />
        </div>
        
        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Production Year</label>
          <input
            type='text'
            value={productionyear}
            onChange={(e) => setProductionYear(e.target.value)}
            className='border-2 border-gray-300 rounded px-4 py-2 w-full focus:border-green-500 focus:outline-none'
          />
        </div>
        
        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Condition</label>
          <select 
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className='border-2 border-gray-300 rounded px-4 py-2 w-full focus:border-green-500 focus:outline-none'
          >
            <option value="Mint in Box">Mint in Box</option>
            <option value="Mint">Mint</option>
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>
        
        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='border-2 border-gray-300 rounded px-4 py-2 w-full focus:border-green-500 focus:outline-none'
            rows='4'
          />
        </div>

        {bunnykinData && (
          <div className='my-4 pt-4 border-t border-gray-200'>
            <ImageUpload 
              coinId={id}
              existingImages={{
                image1: bunnykinData.image1,
                image2: bunnykinData.image2,
                image3: bunnykinData.image3
              }}
              onUploadSuccess={(updatedBunnykin) => setBunnykinData(updatedBunnykin)}
              apiEndpoint="/bunnykins"
            />
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
          <button 
            className='flex-1 p-3 usd-btn-green rounded hover:opacity-90 disabled:opacity-60' 
            onClick={handleEditBunnykin}
            disabled={loading}
          >
            Save Changes
          </button>
          <button 
            className='flex-1 p-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-60' 
            onClick={() => navigate('/bunnykins')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditBunnykin;
