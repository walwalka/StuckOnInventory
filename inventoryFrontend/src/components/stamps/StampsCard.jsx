import { Link } from 'react-router-dom';
import StampSingleCard from './StampSingleCard';

const StampsCard = ({ stamps }) => {
  return (
    <div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {stamps.map((item) => (
        <StampSingleCard key={item.id} stamp={item} />
      ))}
    </div>
  );
};

export default StampsCard;
