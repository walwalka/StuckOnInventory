import MintSingleCard from './MintSingleCard';

const MintsCard = ({ mints }) => {
  return (
    <div className='grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {mints.map((item) => (
        <MintSingleCard key={item.id} mint={item} />
      ))}
    </div>
  );
};

export default MintsCard;
