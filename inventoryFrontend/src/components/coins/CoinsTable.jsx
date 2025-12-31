// QR Code feature added - includes button in actions column
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle, BsQrCode } from 'react-icons/bs';
import { MdOutlineAddBox, MdOutlineDelete } from 'react-icons/md';
import { BiSolidMagicWand } from 'react-icons/bi';
import moment from 'moment';
import heic2any from 'heic2any';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import QRCodeModal from '../shared/QRCodeModal';

const CoinsTable = ({ coins, onRefresh }) => {
    const [imageMap, setImageMap] = useState({});
    const [estimating, setEstimating] = useState({});
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedQR, setSelectedQR] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    const getImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http')) return imagePath;
      return `${window.location.origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    useEffect(() => {
      let revokeList = [];
      const loadImages = async () => {
        const entries = await Promise.all(coins.map(async (coin) => {
          const path = coin.image1;
          if (!path) return [coin.id, null];
          const isHeic = /\.hei[c|f](?:$|\?)/i.test(path);
          const url = getImageUrl(path);
          if (!isHeic) return [coin.id, url];

          try {
            const res = await fetch(url);
            const blob = await res.blob();
            const converted = await heic2any({ blob, toType: 'image/jpeg', quality: 0.7 });
            const outBlob = Array.isArray(converted) ? converted[0] : converted;
            const objUrl = URL.createObjectURL(outBlob);
            revokeList.push(objUrl);
            return [coin.id, objUrl];
          } catch (err) {
            console.warn('HEIC convert failed, using original', err);
            return [coin.id, url];
          }
        }));

        const mapped = entries.reduce((acc, [id, url]) => {
          acc[id] = url;
          return acc;
        }, {});
        setImageMap(mapped);
      };

      loadImages();

      return () => {
        revokeList.forEach((u) => URL.revokeObjectURL(u));
      };
    }, [coins]);

    const handleGetEstimate = async (coinId) => {
      setEstimating((prev) => ({ ...prev, [coinId]: true }));
      try {
        const { data } = await axios.post(`/api/coins/estimate/${coinId}`);
        const valNum = typeof data?.estimated_value === 'number' ? data.estimated_value : null;
        const val = valNum !== null ? valNum.toFixed(2) : 'N/A';
        enqueueSnackbar(`Estimated value: $${val}`, { variant: valNum !== null ? 'success' : 'warning' });
        if (onRefresh) {
          onRefresh();
        }
      } catch (err) {
        console.error('Estimate error', err);
        enqueueSnackbar('Failed to get estimate', { variant: 'error' });
      } finally {
        setEstimating((prev) => ({ ...prev, [coinId]: false }));
      }
    };

    const handleQRClick = (coin) => {
      const qrCodeUrl = `${window.location.origin}/coins/details/${coin.id}`;
      setSelectedQR({ entityType: 'coins', itemId: coin.id, qrCodeUrl });
      setQrModalOpen(true);
    };

    const handleQRRegenerate = () => {
      enqueueSnackbar('QR code regenerated successfully', { variant: 'success' });
      setQrModalOpen(false);
      if (onRefresh) {
        onRefresh();
      }
    };

  return (
    <div className="overflow-x-auto rounded-lg border-2 usd-border-green shadow-sm">
      <table className='w-full border-collapse'>
        <thead className='bg-gray-100 dark:bg-[#3c3c3c]'>
          <tr>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200'>ID</th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200 max-md:hidden'>Quantity</th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200 max-md:hidden'>Added Date</th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200'>Image</th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200'>Type</th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200 max-md:hidden'>
              Mint Location
            </th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200 max-md:hidden'>
              Minted Year
            </th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200 max-md:hidden'>
              Circulated
            </th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200 max-md:hidden'>
              Grade
            </th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200 max-md:hidden'>
              Face Value
            </th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200 max-md:hidden'>
              Est. Value
            </th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-stone-200'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='bg-white dark:bg-[#3c3c3c] divide-y divide-gray-200 dark:divide-stone-700'>
          {coins.map((coin, index) => (
            <tr key={coin.id} className='hover:bg-gray-50 dark:hover:bg-[#4a4a4a] transition-colors'>
              <td className='px-4 py-3 text-sm text-gray-700 dark:text-stone-300'>
                {index + 1}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 dark:text-stone-300 max-md:hidden'>
                {coin.quantity || 1}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 dark:text-stone-300 max-md:hidden'>
                {coin.added_date ? moment(coin.added_date).format("MM/DD/YYYY") : '-'}
              </td>
              <td className='px-4 py-3'>
                {coin.image1 ? (
                  <img
                    src={imageMap[coin.id] || getImageUrl(coin.image1)}
                    alt="Coin"
                    className="w-12 h-12 object-cover rounded border usd-border-silver"
                  />
                ) : (
                  <span className="text-xs text-gray-400 dark:text-stone-500">No image</span>
                )}
              </td>
              <td className='px-4 py-3 text-sm text-gray-700 dark:text-stone-300 font-medium'>
                {coin.type}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 dark:text-stone-300 max-md:hidden'>
               {coin.mintlocation}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 dark:text-stone-300 max-md:hidden'>
              {moment.utc(coin.mintyear).format("YYYY")}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 dark:text-stone-300 max-md:hidden'>
                {coin.circulation}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 dark:text-stone-300 max-md:hidden'>
                {coin.grade}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 dark:text-stone-300 max-md:hidden'>
                {coin.face_value != null ? `$${Number(coin.face_value).toFixed(2)}` : '-'}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 dark:text-stone-300 max-md:hidden'>
                {coin.estimated_value ? `$${Number(coin.estimated_value).toFixed(2)}` : '-'}
              </td>
              <td className='px-4 py-3'>
                <div className='flex justify-center gap-x-3'>
                  <button
                    onClick={() => handleQRClick(coin)}
                    className="hover:scale-110 transition-transform"
                    title="View QR Code"
                  >
                    <BsQrCode className='text-xl' style={{ color: 'var(--usd-green)' }} />
                  </button>
                  <button
                    onClick={() => handleGetEstimate(coin.id)}
                    disabled={estimating[coin.id]}
                    className="hover:scale-110 transition-transform disabled:opacity-50"
                    title="Get AI value estimate"
                  >
                    <BiSolidMagicWand className='text-xl' style={{ color: 'var(--usd-green)' }} />
                  </button>
                  <Link to={`/coins/details/${coin.id}`} className="hover:scale-110 transition-transform">
                    <BsInfoCircle className='text-xl' style={{ color: 'var(--usd-green)' }} />
                  </Link>
                  <Link to={`/coins/edit/${coin.id}`} className="hover:scale-110 transition-transform">
                    <AiOutlineEdit className='text-xl' style={{ color: 'var(--usd-copper)' }} />
                  </Link>
                  <Link to={`/coins/delete/${coin.id}`} className="hover:scale-110 transition-transform">
                    <MdOutlineDelete className='text-xl' style={{ color: 'var(--usd-copper-dark)' }} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {qrModalOpen && selectedQR && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          entityType={selectedQR.entityType}
          itemId={selectedQR.itemId}
          qrCodeUrl={selectedQR.qrCodeUrl}
          onRegenerate={handleQRRegenerate}
        />
      )}
    </div>
  );
};

export default CoinsTable;
