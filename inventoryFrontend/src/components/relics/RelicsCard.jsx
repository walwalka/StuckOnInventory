import { Link } from 'react-router-dom';
import RelicSingleCard from './RelicSingleCard';

const RelicsCard = ({ relics }) => {
  return (
    <div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {relics.map((item) => (
        <RelicSingleCard key={item.id} relic={item} />
      ))}
    </div>
  );
};

export default RelicsCard;
