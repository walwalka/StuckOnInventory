import { Link } from 'react-router-dom';
import { PiBookOpenTextLight } from 'react-icons/pi';
import { BiUserCircle, BiShow } from 'react-icons/bi';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import { useState } from 'react';
import ComicModal from './ComicModal';

const ComicSingleCard = ({ comic }) => {
  const [showModal, setShowModal] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${window.location.origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <div className='border-2 usd-border-silver rounded-lg px-4 py-2 m-4 relative hover:shadow-xl usd-panel'>
            {/* Comic Image */}
            {comic.image1 && (
              <div className='w-full h-48 mb-4 overflow-hidden rounded-lg'>
                <img
                  src={getImageUrl(comic.image1)}
                  alt={comic.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

      <h2 className='absolute top-1 right-2 px-4 py-1 usd-btn-copper rounded-lg'>
        {comic.grade}
      </h2>
      <h4 className='my-2 usd-muted'>{comic._id}</h4>
      <div className='flex justify-start items-center gap-x-2'>
        <PiBookOpenTextLight className='text-2xl' style={{ color: 'var(--usd-copper)' }} />
        <h2 className='my-1'>{comic.title}</h2>
      </div>
      <div className='flex justify-start items-center gap-x-2'>
        <BiUserCircle className='text-2xl' style={{ color: 'var(--usd-copper)' }} />
        <h2 className='my-1'>{comic.publisher}</h2>
      </div>
      <div className='flex justify-start items-center gap-x-2'>
        <BiUserCircle className='text-2xl' style={{ color: 'var(--usd-copper)' }} />
        <h2 className='my-1'>Issue #{comic.issuenumber}</h2>
      </div>
      <div className='flex justify-between items-center gap-x-2 mt-4 p-4'>
        <BiShow
          className='text-3xl cursor-pointer'
          style={{ color: 'var(--usd-green)' }}
          onClick={() => setShowModal(true)}
        />
        <Link to={`/comics/details/${comic.id}`}>
          <BsInfoCircle className='text-2xl text-green-800 hover:text-black' />
        </Link>
        <Link to={`/comics/edit/${comic.id}`}>
          <AiOutlineEdit className='text-2xl text-yellow-600 hover:text-black' />
        </Link>
        <Link to={`/comics/delete/${comic.id}`}>
          <MdOutlineDelete className='text-2xl text-red-600 hover:text-black' />
        </Link>
      </div>
      {showModal && (
        <ComicModal comic={comic} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default ComicSingleCard;
