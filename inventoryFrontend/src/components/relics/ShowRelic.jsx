import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../Spinner';
import heic2any from 'heic2any';

const ShowRelic = () => {
  const [relic, setRelic] = useState({});
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
      .get('/relics/'+id)
      .then((response) => {
        setRelic(response.data);
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
      const paths = [relic.image1, relic.image2, relic.image3];
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
  }, [relic.image1, relic.image2, relic.image3]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center"><Spinner /></div>
      )}
      <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 mx-auto shadow-2xl relative my-8'>
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-[#2c2c2c] pb-3 border-b usd-border-green dark:border-gray-700">
          <h1 className='text-2xl usd-text-green font-semibold'>Relic Details</h1>
          <button
            onClick={() => navigate('/relics')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold leading-none"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>ID</div>
            <div className='text-gray-700 dark:text-gray-100'>{relic.id}</div>
          </div>
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Type</div>
            <div className='text-gray-700 dark:text-gray-100'>{relic.type}</div>
          </div>
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Origin</div>
            <div className='text-gray-700 dark:text-gray-100'>{relic.origin}</div>
          </div>
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Era</div>
            <div className='text-gray-700 dark:text-gray-100'>{relic.era}</div>
          </div>
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Condition</div>
            <div className='text-gray-700 dark:text-gray-100'>{relic.condition}</div>
          </div>
          <div className='py-2 col-span-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Description</div>
            <div className='text-gray-700 dark:text-gray-100'>{relic.description || 'No description provided'}</div>
          </div>
        </div>

        {/* Relic Images */}
        {(relic.image1 || relic.image2 || relic.image3) && (
          <div className='mt-6'>
            <div className='text-lg font-semibold usd-text-green mb-3'>Images</div>
            <div className='grid grid-cols-3 gap-4'>
              {imageUrls[0] && (
                <img
                  src={imageUrls[0]}
                  alt="Relic 1"
                  className="w-full h-48 object-cover rounded border-2 usd-border-silver dark:border-gray-700 hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(imageUrls[0], '_blank')}
                />
              )}
              {imageUrls[1] && (
                <img
                  src={imageUrls[1]}
                  alt="Relic 2"
                  className="w-full h-48 object-cover rounded border-2 usd-border-silver dark:border-gray-700 hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(imageUrls[1], '_blank')}
                />
              )}
              {imageUrls[2] && (
                <img
                  src={imageUrls[2]}
                  alt="Relic 3"
                  className="w-full h-48 object-cover rounded border-2 usd-border-silver dark:border-gray-700 hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(imageUrls[2], '_blank')}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowRelic;
