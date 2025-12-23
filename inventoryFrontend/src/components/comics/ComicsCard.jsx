import { Link } from 'react-router-dom';
import ComicSingleCard from './ComicSingleCard';

const ComicsCard = ({ comics }) => {
  return (
    <div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {comics.map((item) => (
        <ComicSingleCard key={item.id} comic={item} />
      ))}
    </div>
  );
};

export default ComicsCard;
