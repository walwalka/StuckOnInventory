import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import heic2any from 'heic2any';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import QRCodeModal from '../shared/QRCodeModal';
import QRButton from '../shared/QRButton';

const StampsTable = ({ stamps, onRefresh }) => {
    const [imageMap, setImageMap] = useState({});
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
        const entries = await Promise.all(stamps.map(async (stamp) => {
          const path = stamp.image1;
          if (!path) return [stamp.id, null];
          const isHeic = /\.hei[c|f](?:$|\?)/i.test(path);
          const url = getImageUrl(path);
          if (!isHeic) return [stamp.id, url];

          try {
            const res = await fetch(url);
            const blob = await res.blob();
            const converted = await heic2any({ blob, toType: 'image/jpeg', quality: 0.7 });
            const outBlob = Array.isArray(converted) ? converted[0] : converted;
            const objUrl = URL.createObjectURL(outBlob);
            revokeList.push(objUrl);
            return [stamp.id, objUrl];
          } catch (err) {
            console.warn('HEIC convert failed, using original', err);
            return [stamp.id, url];
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
    }, [stamps]);

    const handleQRClick = (stamp) => {
      const qrCodeUrl = `${window.location.origin}/stamps/details/${stamp.id}`;
      setSelectedQR({ entityType: 'stamps', itemId: stamp.id, qrCodeUrl });
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
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200'>Quantity</th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200 max-md:hidden'>Added Date</th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200'>Image</th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200'>Country</th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200 max-md:hidden'>
              Denomination
            </th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200 max-md:hidden'>
              Issue Year
            </th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200 max-md:hidden'>
              Condition
            </th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-stone-200'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='bg-white dark:bg-[#3c3c3c] divide-y divide-gray-200 dark:divide-stone-700'>
          {stamps.map((stamp, index) => (
            <tr key={stamp.id} className='hover:bg-gray-50 dark:hover:bg-[#4a4a4a] transition-colors'>
              <td className='px-4 py-3 text-sm text-gray-700 dark:text-stone-300'>
                {index + 1}
              </td>
              <td className='px-4 py-3 text-sm text-gray-700 dark:text-stone-300 font-medium'>
                {stamp.quantity || 1}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 dark:text-stone-300 max-md:hidden'>
                {stamp.added_date ? moment(stamp.added_date).format("MM/DD/YYYY") : '-'}
              </td>
              <td className='px-4 py-3'>
                {stamp.image1 ? (
                  <img
                    src={imageMap[stamp.id] || getImageUrl(stamp.image1)}
                    alt="Stamp"
                    className="w-12 h-12 object-cover rounded border usd-border-silver"
                  />
                ) : (
                  <span className="text-xs text-gray-400 dark:text-stone-500">No image</span>
                )}
              </td>
              <td className='px-4 py-3 text-sm text-gray-700 dark:text-stone-300 font-medium'>
                {stamp.country}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 dark:text-stone-300 max-md:hidden'>
               {stamp.denomination}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 dark:text-stone-300 max-md:hidden'>
                {stamp.issueyear}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 dark:text-stone-300 max-md:hidden'>
                {stamp.condition}
              </td>
              <td className='px-4 py-3 text-sm text-gray-700 dark:text-stone-300 font-medium'>
                {stamp.quantity || 1}
              </td>
              <td className='px-4 py-3'>
                <div className='flex justify-center gap-x-3'>
                  <QRButton onClick={() => handleQRClick(stamp)} />
                  <Link to={`/stamps/details/${stamp.id}`} className="hover:scale-110 transition-transform">
                    <BsInfoCircle className='text-xl' style={{ color: 'var(--usd-green)' }} />
                  </Link>
                  <Link to={`/stamps/edit/${stamp.id}`} className="hover:scale-110 transition-transform">
                    <AiOutlineEdit className='text-xl' style={{ color: 'var(--usd-copper)' }} />
                  </Link>
                  <Link to={`/stamps/delete/${stamp.id}`} className="hover:scale-110 transition-transform">
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

export default StampsTable;
