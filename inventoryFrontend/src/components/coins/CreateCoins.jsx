import React, { useState, useEffect } from 'react';
import Spinner from '../Spinner';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import api from '../../api/client';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

// Setting the const for the environments url
// Uses shared API client baseURL

// creation of the coin object
const CreateCoins = () => {
  const years = Array.from({ length: 400 }, (_, i) => 1700 + i);
  const [type, setType] = useState('');
  const [mintlocation, setMintLocation] = useState('');
  const [mintyear, setMintYear] = useState('');
  const [circulation, setCirculation] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [optionList,setOptionList] = useState([]);
  const [coinTypes, setCoinTypes] = useState([]);
  const [faceValue, setFaceValue] = useState('');
  const [quantity, setQuantity] = useState(1);
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

  const handleSaveCoin = async () => {
    // Validate required fields
    if (!type || !mintlocation || !mintyear || !circulation || !grade) {
      enqueueSnackbar('Please fill in all required fields', { variant: 'warning' });
      return;
    }

    // Ensure year is 4 digits
    if (!/^\d{4}$/.test(mintyear)) {
      enqueueSnackbar('Enter a 4-digit year (e.g., 1999)', { variant: 'warning' });
      return;
    }
    
    const data = {
      type,
      mintlocation,
      mintyear: `${mintyear}-01-01`,
      circulation,
      grade,
      face_value: faceValue === '' ? null : parseFloat(faceValue),
      quantity: parseInt(quantity) || 1,
    };
    setLoading(true);
    
    try {
      // Create coin first
      const response = await api.post('/coins/', data);
      const newCoinId = response.data.coinId;
      if (!newCoinId) {
        throw new Error('Missing coin id from create response');
      }
      
      // Upload images if any were selected
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });
        
        await axios.post(`/api/coins/upload/${newCoinId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      setLoading(false);
      enqueueSnackbar('Coin Created successfully', { variant: 'success' });
      navigate('/coins');
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('Error creating coin', { variant: 'error' });
      console.log(error);
    }
  };

  const fetchData = () => {
    Promise.all([
      api.get('/mintlocations/locations'),
      api.get('/cointypes')
    ])
      .then(([mintsResp, typesResp]) => {
        if (mintsResp.status === 200) {
          setOptionList(mintsResp.data.name.rows);
        }
        if (typesResp.status === 200) {
          setCoinTypes(typesResp.data.data || []);
        }
      })
      .catch((error) => console.log(error));
  };

  useEffect(()=>{
    fetchData();
  },[])

  const handleTypeChange = (value) => {
    setType(value);
    const selected = coinTypes.find((ct) => ct.name === value);
    if (selected) {
      setFaceValue(selected.face_value);
    } else {
      setFaceValue('');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-auto shadow-2xl relative my-8'>
        <button
          onClick={() => navigate('/coins')}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
        >
          ✕
        </button>

        <h1 className='text-3xl mb-6'>Create Coin Record</h1>
        {loading ? <Spinner /> : ''}
          <div className='my-4'>
            <label className='text-xl mr-4 usd-muted'>Type *</label>
            <select
              label="Type of Coin"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
            >
              <option value="">Please Select a value</option>
              {coinTypes.map((ct) => (
                <option key={ct.id} value={ct.name}>
                  {ct.name}
                </option>
              ))}
            </select>
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 usd-muted'>Mint Location *</label>
            <select
              disabled={false}
              value={mintlocation}
              onChange={(e) => setMintLocation(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
          >
              <option value="">Please Select a mint location</option>
              {optionList.map((item, value) => (
              <option key={value} value={item.name}>
                  {item.name}
              </option>
              ))}
          </select>
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 usd-muted'>Mint Year *</label>
            <select
              value={mintyear}
              onChange={(e) => setMintYear(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              required
            >
              <option value=''>Select year</option>
              {years.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
          <div className='my-4'>
          <label className='text-xl mr-4 usd-muted'>Circulation *</label>
            <select
              label="Circulated?"
              value={circulation}
              onChange={(e) => setCirculation(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
            >
              <option value="">Please Select a value</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="Unsure">Unsure</option>
            </select>
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 usd-muted'>Grade *</label>
            <input
              type='text'
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              placeholder="e.g., MS-65, AU-50, VF-20, Good-4"
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 usd-muted'>Face Value (USD)</label>
            <input
              type='number'
              step='0.01'
              value={faceValue}
              onChange={(e) => setFaceValue(e.target.value)}
              className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              placeholder='Auto-filled from coin type'
            />
          </div>
          <div className='my-4'>
            <label className='text-xl mr-4 usd-muted'>Quantity *</label>
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
          <div className='my-4'>
            <label className='text-xl mr-4 usd-muted'>Coin Images (Optional, up to 3)</label>
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
            <p className="text-xs usd-muted mt-1">JPEG, PNG, GIF, HEIC up to 10MB each. Click multiple times to add more.</p>
          
            {/* Previews */}
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

          <button className='p-2 usd-btn-green m-8 rounded hover:opacity-90' onClick={handleSaveCoin}>
            Save
          </button>
      </div>
    </div>
  );
}

export default CreateCoins