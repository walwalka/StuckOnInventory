import { Link } from 'react-router-dom';
import BunnykinSingleCard from './BunnykinSingleCard';

const BunnykinsCard = ({ bunnykins }) => {
  return (
    <div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {bunnykins.map((item) => (
        <BunnykinSingleCard key={item.id} bunnykin={item} />
      ))}
    </div>
  );
};

export default BunnykinsCard;
