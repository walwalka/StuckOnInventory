import { Link } from 'react-router-dom';
import { PiBookOpenTextLight } from 'react-icons/pi';
import { BiUserCircle, BiShow } from 'react-icons/bi';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import { useState } from 'react';
import StampModal from './StampModal';

const StampSingleCard = ({ stamp }) => {
  const [showModal, setShowModal] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${window.location.origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <div className='border-2 usd-border-silver rounded-lg px-4 py-2 m-4 relative hover:shadow-xl usd-panel'>
            {stamp.image1 && (
              <div className='w-full h-48 mb-4 overflow-hidden rounded-lg'>
                <img 
                  src={getImageUrl(stamp.image1)} 
                  alt={stamp.country} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
      
      <h2 className='absolute top-1 right-2 px-4 py-1 usd-btn-copper rounded-lg'>
        {stamp.condition}
      </h2>
      <h4 className='my-2 usd-muted'>{stamp._id}</h4>
      <div className='flex justify-start items-center gap-x-2'>
        <PiBookOpenTextLight className='text-2xl' style={{ color: 'var(--usd-copper)' }} />
        <h2 className='my-1'>{stamp.country}</h2>
      </div>
      <div className='flex justify-start items-center gap-x-2'>
        <BiUserCircle className='text-2xl' style={{ color: 'var(--usd-copper)' }} />
        <h2 className='my-1'>{stamp.denomination}</h2>
      </div>
      <div className='flex justify-start items-center gap-x-2'>
        <BiUserCircle className='text-2xl' style={{ color: 'var(--usd-copper)' }} />
        <h2 className='my-1'>{stamp.issueyear}</h2>
      </div>
      <div className='flex justify-start items-center gap-x-2'>
        <PiBookOpenTextLight className='text-2xl' style={{ color: 'var(--usd-copper)' }} />
        <h2 className='my-1'>Qty: {stamp.quantity || 1}</h2>
      </div>
      <div className='flex justify-between items-center gap-x-2 mt-4 p-4'>
        <BiShow
          className='text-3xl cursor-pointer'
          style={{ color: 'var(--usd-green)' }}
          onClick={() => setShowModal(true)}
        />
        <Link to={`/stamps/details/${stamp.id}`}>
          <BsInfoCircle className='text-2xl text-green-800 hover:text-black' />
        </Link>
        <Link to={`/stamps/edit/${stamp.id}`}>
          <AiOutlineEdit className='text-2xl text-yellow-600 hover:text-black' />
        </Link>
        <Link to={`/stamps/delete/${stamp.id}`}>
          <MdOutlineDelete className='text-2xl text-red-600 hover:text-black' />
        </Link>
      </div>
      {showModal && (
        <StampModal stamp={stamp} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default StampSingleCard;
