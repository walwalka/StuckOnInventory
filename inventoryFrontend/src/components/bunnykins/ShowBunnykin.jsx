import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from '../Spinner';
import heic2any from 'heic2any';
import { BsQrCode } from 'react-icons/bs';
import QRCode from 'react-qr-code';

const ShowBunnykin = () => {
  const [bunnykin, setBunnykin] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [showQR, setShowQR] = useState(false);
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
      .get('/bunnykins/'+id)
      .then((response) => {
        setBunnykin(response.data);
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
      const paths = [bunnykin.image1, bunnykin.image2, bunnykin.image3];
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
  }, [bunnykin.image1, bunnykin.image2, bunnykin.image3]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center"><Spinner /></div>
      )}
      <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto mx-auto shadow-2xl relative my-8'>
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#2c2c2c] border-b usd-border-green rounded-t-xl flex-shrink-0">
          <h1 className='text-2xl usd-text-green font-semibold'>Bunnykin Details</h1>
          <button
            onClick={() => navigate('/bunnykins')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-base font-semibold leading-none"
            aria-label="Close"
          >
            Close
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 bg-white dark:bg-[#2c2c2c] rounded-b-xl">
          <div className="grid grid-cols-2 gap-4">
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>ID</div>
            <div className='text-gray-700 dark:text-gray-100'>{bunnykin.id}</div>
          </div>
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Name</div>
            <div className='text-gray-700 dark:text-gray-100'>{bunnykin.name}</div>
          </div>
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Series</div>
            <div className='text-gray-700 dark:text-gray-100'>{bunnykin.series}</div>
          </div>
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Production Year</div>
            <div className='text-gray-700 dark:text-gray-100'>{bunnykin.productionyear}</div>
          </div>
          <div className='py-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Condition</div>
            <div className='text-gray-700 dark:text-gray-100'>{bunnykin.condition}</div>
          </div>
          <div className='py-2 col-span-2'>
            <div className='text-sm font-semibold usd-text-green mb-1'>Description</div>
            <div className='text-gray-700 dark:text-gray-100'>{bunnykin.description || 'No description provided'}</div>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowQR(!showQR)}
            className="flex items-center gap-2 px-4 py-2 usd-btn-green text-white rounded hover:opacity-90 transition"
          >
            <BsQrCode className="text-lg" />
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </button>
          {showQR && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-[#3a3a3a] rounded-lg border usd-border-green">
              <div className="flex flex-col items-center">
                <div className="bg-white p-3 rounded mb-2">
                  <QRCode
                    value={`${window.location.origin}/bunnykins/details/${id}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Scan to view this bunnykin's details
                </p>
              </div>
            </div>
          )}
        </div>

        {(bunnykin.image1 || bunnykin.image2 || bunnykin.image3) && (
          <div className='mt-6'>
            <div className='text-lg font-semibold usd-text-green mb-3'>Images</div>
            <div className='grid grid-cols-3 gap-4'>
              {imageUrls[0] && (
                <img
                  src={imageUrls[0]}
                  alt="Bunnykin 1"
                  className="w-full h-48 object-cover rounded border-2 usd-border-silver dark:border-gray-700 hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(imageUrls[0], '_blank')}
                />
              )}
              {imageUrls[1] && (
                <img
                  src={imageUrls[1]}
                  alt="Bunnykin 2"
                  className="w-full h-48 object-cover rounded border-2 usd-border-silver dark:border-gray-700 hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(imageUrls[1], '_blank')}
                />
              )}
              {imageUrls[2] && (
                <img
                  src={imageUrls[2]}
                  alt="Bunnykin 3"
                  className="w-full h-48 object-cover rounded border-2 usd-border-silver dark:border-gray-700 hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => window.open(imageUrls[2], '_blank')}
                />
              )}
            </div>
          </div>
        )}

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              className='w-full p-3 usd-btn-green rounded hover:opacity-90'
              onClick={() => navigate(`/bunnykins/${id}/edit`)}
            >
              Edit Bunnykin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowBunnykin;
