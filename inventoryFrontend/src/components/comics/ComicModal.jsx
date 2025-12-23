import { AiOutlineClose } from 'react-icons/ai';
import { PiBookOpenTextLight } from 'react-icons/pi';
import { BiUserCircle } from 'react-icons/bi';

const ComicModal = ({ comic, onClose }) => {
  return (
    <div
      className='fixed bg-black bg-opacity-60 top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center'
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className='w-[600px] max-w-full h-[400px] usd-panel rounded-xl p-4 flex flex-col relative border usd-border-green'
      >
        <AiOutlineClose
          className='absolute right-6 top-6 text-3xl cursor-pointer'
          style={{ color: 'var(--usd-copper-dark)' }}
          onClick={onClose}
        />
        <h2 className='w-fit px-4 py-1 usd-btn-copper rounded-lg'>
          {comic.grade}
        </h2>
        <h4 className='my-2 usd-muted'>{comic._id}</h4>
        <div className='flex justify-start items-center gap-x-2'>
          <PiBookOpenTextLight className='text-2xl' style={{ color: 'var(--usd-copper)' }} />
          <h2 className='my-1'>{comic.title}</h2>
        </div>
        <div className='flex justify-start items-center gap-x-2'>
          <BiUserCircle className='text-2xl' style={{ color: 'var(--usd-copper)' }} />
          <h2 className='my-1'>{comic.publisher} - Issue #{comic.issuenumber}</h2>
        </div>
        <div className='flex justify-start items-center gap-x-2'>
          <BiUserCircle className='text-2xl' style={{ color: 'var(--usd-copper)' }} />
          <h2 className='my-1'>{comic.publicationyear} - {comic.condition}</h2>
        </div>
        <p className='mt-4'>{comic.description || 'No description provided'}</p>
      </div>
    </div>
  );
};

export default ComicModal;
