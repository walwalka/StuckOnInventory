import { Link } from 'react-router-dom';
import { MdLocationCity, MdLocationOn } from 'react-icons/md';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';

const MintSingleCard = ({ mint }) => {
  return (
    <div className='border-2 usd-border-silver rounded-lg px-4 py-2 m-4 relative hover:shadow-xl usd-panel'>
      <h4 className='my-2 usd-muted'>{mint.id}</h4>
      <div className='flex justify-start items-center gap-x-2 my-3'>
        <MdLocationCity className='text-2xl' style={{ color: 'var(--usd-copper)' }} />
        <h2 className='text-xl font-bold'>{mint.name}</h2>
      </div>
      <div className='flex justify-start items-center gap-x-2'>
        <MdLocationOn className='text-2xl' style={{ color: 'var(--usd-copper)' }} />
        <h2 className='my-1'>{mint.city}, {mint.state}</h2>
      </div>
      <div className='flex justify-between items-center gap-x-2 mt-4 p-4'>
        <Link to={`/mintlocations/details/${mint.id}`}>
          <BsInfoCircle className='text-2xl' style={{ color: 'var(--usd-green)' }} />
        </Link>
        <Link to={`/mintlocations/edit/${mint.id}`}>
          <AiOutlineEdit className='text-2xl' style={{ color: 'var(--usd-copper)' }} />
        </Link>
        <Link to={`/mintlocations/delete/${mint.id}`}>
          <MdOutlineDelete className='text-2xl' style={{ color: 'var(--usd-copper-dark)' }} />
        </Link>
      </div>
    </div>
  );
};

export default MintSingleCard;
