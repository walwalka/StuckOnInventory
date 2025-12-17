import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineAddBox, MdOutlineDelete } from 'react-icons/md';

const MintsTable = ({ mints }) => {
  return (
    <div className="overflow-x-auto rounded-lg border-2 usd-border-silver shadow-sm">
      <table className='w-full border-collapse'>
        <thead className='bg-gray-100'>
          <tr>
            <th className='border-b-2 usd-border-silver px-4 py-3 text-left text-sm font-semibold text-gray-700'>ID</th>
            <th className='border-b-2 usd-border-silver px-4 py-3 text-left text-sm font-semibold text-gray-700 max-md:hidden'>
              Name
            </th>
            <th className='border-b-2 usd-border-silver px-4 py-3 text-left text-sm font-semibold text-gray-700 max-md:hidden'>
              City
            </th>
            <th className='border-b-2 usd-border-silver px-4 py-3 text-left text-sm font-semibold text-gray-700 max-md:hidden'>
              State
            </th>
            <th className='border-b-2 usd-border-silver px-4 py-3 text-center text-sm font-semibold text-gray-700'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {mints.map((mint, index) => (
            <tr key={mint.id} className='hover:bg-gray-50 transition-colors'>
              <td className='px-4 py-3 text-sm text-gray-700'>
                {index + 1}
              </td>
              <td className='px-4 py-3 text-sm text-gray-700 font-medium'>
                {mint.name}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 max-md:hidden'>
                {mint.city}
              </td>
              <td className='px-4 py-3 text-sm text-gray-600 max-md:hidden'>
                {mint.state}
              </td>
              <td className='px-4 py-3'>
                <div className='flex justify-center gap-x-3'>
                  <Link to={`/mintlocations/details/${mint.id}`} className="hover:scale-110 transition-transform">
                    <BsInfoCircle className='text-xl' style={{ color: 'var(--usd-green)' }} />
                  </Link>
                  <Link to={`/mintlocations/edit/${mint.id}`} className="hover:scale-110 transition-transform">
                    <AiOutlineEdit className='text-xl' style={{ color: 'var(--usd-copper)' }} />
                  </Link>
                  <Link to={`/mintlocations/delete/${mint.id}`} className="hover:scale-110 transition-transform">
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

export default MintsTable;
