import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../Spinner';
import moment from 'moment';
import heic2any from 'heic2any';

const ShowCoin = () => {
  const [coin, setCoin] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${window.location.origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    setLoading(true);
    api
      .get('/coins/'+id)
      .then((response) => {
        setCoin(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    let revokeUrls = [];
    const loadImages = async () => {
      const paths = [coin.image1, coin.image2, coin.image3];
      const results = await Promise.all(paths.map(async (path) => {
        if (!path) return null;
        const absoluteUrl = getImageUrl(path);
        const isHeic = /\.hei[c|f](?:$|\?)/i.test(path);

        if (!isHeic) return absoluteUrl;

        try {
          const res = await fetch(absoluteUrl);
          const blob = await res.blob();
          const converted = await heic2any({ blob, toType: 'image/jpeg', quality: 0.9 });
          const outBlob = Array.isArray(converted) ? converted[0] : converted;
          const url = URL.createObjectURL(outBlob);
          revokeUrls.push(url);
          return url;
        } catch (err) {
          console.warn('HEIC convert failed, showing original', err);
          return absoluteUrl;
        }
      }));
      setImageUrls(results);
    };

    loadImages();

    return () => {
      revokeUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [coin.image1, coin.image2, coin.image3]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center"><Spinner /></div>
      )}
      <div className='flex flex-col border-2 usd-border-green bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 mx-auto shadow-2xl relative my-8'>
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-3 border-b usd-border-green">
          <h1 className='text-2xl usd-text-green font-semibold'>Coin Details</h1>
          <button
            onClick={() => navigate('/coins')}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>ID</div>
            <div className='text-gray-700'>{coin.id}</div>
          </div>
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Type</div>
            <div className='text-gray-700'>{coin.type}</div>
          </div>
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Mint Location</div>
            <div className='text-gray-700'>{coin.mintlocation}</div>
          </div>
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Mint Year</div>
            <div className='text-gray-700'>{moment.utc(coin.mintyear).format("YYYY")}</div>
          </div>
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Circulated</div>
            <div className='text-gray-700'>{coin.circulation}</div>
          </div>
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Grade</div>
            <div className='text-gray-700'>{coin.grade}</div>
          </div>
        </div>

        {/* Coin Images */}
        {(coin.image1 || coin.image2 || coin.image3) && (
          <div className='mt-6'>
            <div className='text-lg font-semibold usd-text-green mb-3'>Images</div>
            <div className='grid grid-cols-3 gap-4'>
              {imageUrls[0] && (
                <img 
                  src={imageUrls[0]} 
                  alt="Coin 1" 
                  className="w-full h-48 object-cover rounded border-2 usd-border-silver hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(imageUrls[0], '_blank')}
                />
              )}
              {imageUrls[1] && (
                <img 
                  src={imageUrls[1]} 
                  alt="Coin 2" 
                  className="w-full h-48 object-cover rounded border-2 usd-border-silver hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(imageUrls[1], '_blank')}
                />
              )}
              {imageUrls[2] && (
                <img 
                  src={imageUrls[2]} 
                  alt="Coin 3" 
                  className="w-full h-48 object-cover rounded border-2 usd-border-silver hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(imageUrls[2], '_blank')}
                />
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200">
          <div className='py-2'>
            <div className='text-xs font-semibold text-gray-500 mb-1'>Created</div>
            <div className='text-sm text-gray-600'>{moment(coin.createdAt).format("MMM D, YYYY h:mm A")}</div>
          </div>
          <div className='py-2'>
            <div className='text-xs font-semibold text-gray-500 mb-1'>Last Updated</div>
            <div className='text-sm text-gray-600'>{moment(coin.updatedAt).format("MMM D, YYYY h:mm A")}</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
          <button 
            className='flex-1 p-3 usd-btn-copper rounded hover:opacity-90' 
            onClick={() => navigate(`/coins/edit/${id}`)}
          >
            Edit Coin
          </button>
          <button 
            className='flex-1 p-3 usd-btn-green rounded hover:opacity-90' 
            onClick={() => navigate('/coins')}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowCoin;
