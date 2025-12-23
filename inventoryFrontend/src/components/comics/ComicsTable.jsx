import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import heic2any from 'heic2any';
import moment from 'moment';

const ComicsTable = ({ comics }) => {
    const [imageMap, setImageMap] = useState({});

    const getImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http')) return imagePath;
      return `${window.location.origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    };

    useEffect(() => {
      let revokeList = [];
      const loadImages = async () => {
        const entries = await Promise.all(comics.map(async (comic) => {
          const path = comic.image1;
          if (!path) return [comic.id, null];
          const isHeic = /\.hei[c|f](?:$|\?)/i.test(path);
          const url = getImageUrl(path);
          if (!isHeic) return [comic.id, url];

          try {
            const res = await fetch(url);
            const blob = await res.blob();
            const converted = await heic2any({ blob, toType: 'image/jpeg', quality: 0.7 });
            const outBlob = Array.isArray(converted) ? converted[0] : converted;
            const objUrl = URL.createObjectURL(outBlob);
            revokeList.push(objUrl);
            return [comic.id, objUrl];
          } catch (err) {
            console.warn('HEIC convert failed, using original', err);
            return [comic.id, url];
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
    }, [comics]);

  return (
    <div className="overflow-x-auto rounded-lg border-2 usd-border-green shadow-sm">
      <table className='w-full border-collapse'>
        <thead className='usd-bg-green-light'>
          <tr>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold usd-text-green'>ID</th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold usd-text-green max-md:hidden'>Added Date</th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold usd-text-green'>Image</th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold usd-text-green'>Title</th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold usd-text-green max-md:hidden'>
              Publisher
            </th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold usd-text-green max-md:hidden'>
              Issue #
            </th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold usd-text-green max-md:hidden'>
              Year
            </th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold usd-text-green max-md:hidden'>
              Grade
            </th>
            <th className='border-b-2 usd-border-green px-4 py-3 text-center text-sm font-semibold usd-text-green'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {comics.map((comic, index) => (
            <tr key={comic.id} className='hover:bg-gray-50 transition-colors'>
              <td className='px-4 py-3 text-sm text-gray-700'>
                {index + 1}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 max-md:hidden'>
                {comic.added_date ? moment(comic.added_date).format("MM/DD/YYYY") : '-'}
              </td>
              <td className='px-4 py-3'>
                {comic.image1 ? (
                  <img
                    src={imageMap[comic.id] || getImageUrl(comic.image1)}
                    alt="Comic"
                    className="w-12 h-12 object-cover rounded border usd-border-silver"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No image</span>
                )}
              </td>
              <td className='px-4 py-3 text-sm text-gray-700 font-medium'>
                {comic.title}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 max-md:hidden'>
               {comic.publisher}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 max-md:hidden'>
                {comic.issuenumber}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 max-md:hidden'>
                {comic.publicationyear}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 max-md:hidden'>
                {comic.grade}
              </td>
              <td className='px-4 py-3'>
                <div className='flex justify-center gap-x-3'>
                  <Link to={`/comics/details/${comic.id}`} className="hover:scale-110 transition-transform">
                    <BsInfoCircle className='text-xl' style={{ color: 'var(--usd-green)' }} />
                  </Link>
                  <Link to={`/comics/edit/${comic.id}`} className="hover:scale-110 transition-transform">
                    <AiOutlineEdit className='text-xl' style={{ color: 'var(--usd-copper)' }} />
                  </Link>
                  <Link to={`/comics/delete/${comic.id}`} className="hover:scale-110 transition-transform">
                    <MdOutlineDelete className='text-xl' style={{ color: 'var(--usd-copper-dark)' }} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComicsTable;
