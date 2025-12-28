import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Spinner from '../Spinner';
import api from '../../api/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import ImageUpload from '../ImageUpload';

const EditCoin = () => {
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
  const [coinData, setCoinData] = useState(null);
  const navigate = useNavigate();
  const {id} = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    api
    .get('/coins/'+id)
    .then((response) => {
        setCoinData(response.data);
        setMintLocation(response.data.mintlocation);
        const yearVal = response.data.mintyear ? moment.utc(response.data.mintyear).format('YYYY') : '';
        setMintYear(yearVal)
        setType(response.data.type)
        setCirculation(response.data.circulation)
        setGrade(response.data.grade)
        setFaceValue(response.data.face_value ?? '');
        setQuantity(response.data.quantity || 1);
        setLoading(false);
      }).catch((error) => {
        setLoading(false);
        alert('An error happened. Please Chack console');
        console.log(error);
      });
  }, [id])
  
  const handleEditCoin = () => {
    if (!mintyear || !/^\d{4}$/.test(mintyear)) {
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
    api
      .put('/coins/'+id, data)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Coin updated successfully', { variant: 'success' });
        navigate('/coins');
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error', { variant: 'error' });
        console.log(error);
      });
  };

  const fetchData = () => {
    Promise.all([
      api.get('/mintlocations/locations'),
      api.get('/cointypes')
    ])
      .then(([mintsResp, typesResp]) => {
        if (mintsResp.status === 200) {
          setOptionList(mintsResp.data.name.rows)
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
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center"><Spinner /></div>
      )}
      <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 mx-auto shadow-2xl relative my-8'>
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-[#2c2c2c] pb-3 border-b usd-border-green">
          <h1 className='text-2xl usd-text-green font-semibold'>Edit Coin</h1>
          <button
            onClick={() => navigate('/coins')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold leading-none"
            aria-label="Close"
          >
            X
          </button>
        </div>

        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Type</label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
          >
            {coinTypes.length === 0 && type ? (
              <option value={type}>{type}</option>
            ) : null}
            {coinTypes.map((ct) => (
              <option key={ct.id} value={ct.name}>
                {ct.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Mint Location</label>
          <select
            value={mintlocation}
            onChange={(e) => setMintLocation(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
          >
            {optionList.map((item, value) => (
            <option key={value} value={item.name}>
                {item.name}
            </option>
            ))}
          </select>
        </div>
        
        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Mint Year</label>
          <select
            value={mintyear}
            onChange={(e) => setMintYear(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
          >
            <option value=''>Select year</option>
            {years.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
        
        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Circulated</label>
          <select
            value={circulation}
            onChange={(e) => setCirculation(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Unsure">Unsure</option>
          </select>
        </div>
        
        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Grade</label>
          <input
            type='text'
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
          />
        </div>

        <div className='my-4'>
          <label className='text-sm font-semibold usd-text-green mb-2 block'>Face Value (USD)</label>
          <input
            type='number'
            step='0.01'
            value={faceValue}
            onChange={(e) => setFaceValue(e.target.value)}
            className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
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
          />
        </div>

        {/* Image Upload Section */}
        {coinData && (
          <div className='my-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
            <ImageUpload
              coinId={id}
              existingImages={{
                image1: coinData.image1,
                image2: coinData.image2,
                image3: coinData.image3
              }}
              onUploadSuccess={(updatedCoin) => setCoinData(updatedCoin)}
            />
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            className='flex-1 p-3 usd-btn-green rounded hover:opacity-90 disabled:opacity-60'
            onClick={handleEditCoin}
            disabled={loading}
          >
            Save Changes
          </button>
          <button
            className='flex-1 p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-60'
            onClick={() => navigate('/coins')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditCoin
