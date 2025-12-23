import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';

const CoinTypesTable = ({ coinTypes }) => {
  return (
    <div className="overflow-x-auto rounded-lg border-2 usd-border-silver shadow-sm">
      <table className='w-full border-collapse'>
        <thead className='bg-gray-100 dark:bg-[#3c3c3c]'>
          <tr>
            <th className='border-b-2 usd-border-silver px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200'>#</th>
            <th className='border-b-2 usd-border-silver px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200'>Name</th>
            <th className='border-b-2 usd-border-silver px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200'>Face Value (USD)</th>
            <th className='border-b-2 usd-border-silver px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-stone-200'>Actions</th>
          </tr>
        </thead>
        <tbody className='bg-white dark:bg-[#3c3c3c] divide-y divide-gray-200 dark:divide-stone-700'>
          {coinTypes.map((type, index) => (
            <tr key={type.id} className='hover:bg-gray-50 dark:hover:bg-[#4a4a4a] transition-colors'>
              <td className='px-4 py-3 text-sm text-gray-700 dark:text-stone-300'>{index + 1}</td>
              <td className='px-4 py-3 text-sm text-gray-700 dark:text-stone-300 font-medium'>{type.name}</td>
              <td className='px-4 py-3 text-sm text-gray-700 dark:text-stone-300 font-medium'>${Number(type.face_value).toFixed(2)}</td>
              <td className='px-4 py-3'>
                <div className='flex justify-center gap-x-3'>
                  <Link to={`/cointypes/details/${type.id}`} className="hover:scale-110 transition-transform">
                    <BsInfoCircle className='text-xl' style={{ color: 'var(--usd-green)' }} />
                  </Link>
                  <Link to={`/cointypes/edit/${type.id}`} className="hover:scale-110 transition-transform">
                    <AiOutlineEdit className='text-xl' style={{ color: 'var(--usd-copper)' }} />
                  </Link>
                  <Link to={`/cointypes/delete/${type.id}`} className="hover:scale-110 transition-transform">
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

export default CoinTypesTable;
