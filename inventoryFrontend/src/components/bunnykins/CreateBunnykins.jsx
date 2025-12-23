import React, { useState } from 'react';
import Spinner from '../Spinner';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import api from '../../api/client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const CreateBunnykins = () => {
  const [name, setName] = useState('');
  const [series, setSeries] = useState('');
  const [productionyear, setProductionYear] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    const combined = [...selectedFiles, ...newFiles];
    const limitedFiles = combined.slice(0, 3);
    setSelectedFiles(limitedFiles);

    const previewUrls = limitedFiles.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
    
    e.target.value = '';
  };

  const removeFile = (indexToRemove) => {
    const updated = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    setSelectedFiles(updated);
    
    const updatedPreviews = previews.filter((_, idx) => idx !== indexToRemove);
    setPreviews(updatedPreviews);
  };

  const handleSaveBunnykin = async () => {
    if (!name || !series || !productionyear || !condition) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'warning' });
      return;
    }
    
    const data = {
      name,
      series,
      productionyear,
      condition,
      description,
    };
    setLoading(true);
    
    try {
      const response = await api.post('/bunnykins/', data);
      const newBunnykinId = response.data.bunnykinId;
      if (!newBunnykinId) {
        throw new Error('Missing bunnykin id from create response');
      }
      
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });
        
        await axios.post(`/api/bunnykins/upload/${newBunnykinId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      setLoading(false);
      enqueueSnackbar('Bunnykin created successfully', { variant: 'success' });
      navigate('/bunnykins');
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('Error creating bunnykin', { variant: 'error' });
      console.log(error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-auto shadow-2xl relative my-8'>
        <button
          onClick={() => navigate('/bunnykins')}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
        >
          ✕
        </button>

        <h1 className='text-3xl mb-6'>Create Bunnykins Record</h1>
        {loading ? <Spinner /> : ''}
          <div className='my-4'>
            <label className='text-xl mr-4 usd-muted'>Name *</label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              placeholder="e.g., Teacher Bunnykins, etc."
            />
          </div>

          <div className='my-4'>
            <label className='text-xl mr-4 usd-muted'>Series *</label>
            <input
              type='text'
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              placeholder="e.g., Royal Doulton, Bunnykins Series 1, etc."
            />
          </div>

          <div className='my-4'>
            <label className='text-xl mr-4 usd-muted'>Production Year *</label>
            <input
              type='text'
              value={productionyear}
              onChange={(e) => setProductionYear(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              placeholder="e.g., 1990, 1985-1995, etc."
            />
          </div>

          <div className='my-4'>
            <label className='text-xl mr-4 usd-muted'>Condition *</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
            >
              <option value="">Please Select a value</option>
              <option value="Mint in Box">Mint in Box</option>
              <option value="Mint">Mint</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>
          
          <div className='my-4'>
            <label className='text-xl mr-4 usd-muted'>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              rows='4'
              placeholder="Additional details about the Bunnykins figurine..."
            />
          </div>
        
          <div className='my-4'>
            <label className='text-xl mr-4 usd-muted'>Bunnykins Images (Optional, up to 3)</label>
            <div className="flex items-center space-x-2 mt-2">
              <label className="flex items-center px-4 py-2 usd-btn-copper rounded cursor-pointer">
                <AiOutlineCloudUpload className="mr-2" size={20} />
                Select Images
                <input
                  type="file"
                  multiple
                  accept="image/*,.heic,.heif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
              <span className="text-sm usd-muted">
                {selectedFiles.length} file(s) selected
              </span>
            </div>
            <p className="text-xs usd-muted mt-1">JPEG, PNG, GIF, HEIC up to 10MB each.</p>
          
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded border-2 usd-border-green"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 px-2 py-1 text-xs usd-btn-copper rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className='p-2 usd-btn-green m-8 rounded hover:opacity-90' onClick={handleSaveBunnykin}>
            Save
          </button>
      </div>
    </div>
  );
}

export default CreateBunnykins;
