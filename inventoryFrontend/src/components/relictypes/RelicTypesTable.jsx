import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';

const RelicTypesTable = ({ relicTypes }) => {
  const [selectedType, setSelectedType] = useState(null);

  const handleDetailsClick = (type) => {
    setSelectedType(type);
  };

  const closeModal = () => {
    setSelectedType(null);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-lg border-2 usd-border-green shadow-sm">
        <table className='w-full border-collapse'>
          <thead className='bg-gray-100 dark:bg-[#3c3c3c]'>
            <tr>
              <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200'>ID</th>
              <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200'>
                Name
              </th>
              <th className='border-b-2 usd-border-green px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-stone-200'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white dark:bg-[#3c3c3c] divide-y divide-gray-200 dark:divide-stone-700'>
            {relicTypes.map((relicType, index) => (
              <tr key={relicType.id} className='hover:bg-gray-50 dark:hover:bg-[#4a4a4a] transition-colors'>
                <td className='px-4 py-3 text-sm text-gray-700 dark:text-stone-300'>
                  {index + 1}
                </td>
                <td className='px-4 py-3 text-sm text-gray-700 dark:text-stone-300 font-medium'>
                  {relicType.name}
                </td>
                <td className='px-4 py-3'>
                  <div className='flex justify-center gap-x-3'>
                    <button onClick={() => handleDetailsClick(relicType)} className="hover:scale-110 transition-transform">
                      <BsInfoCircle className='text-xl' style={{ color: 'var(--usd-green)' }} />
                    </button>
                    <Link to={`/relictypes/edit/${relicType.id}`} className="hover:scale-110 transition-transform">
                      <AiOutlineEdit className='text-xl' style={{ color: 'var(--usd-copper)' }} />
                    </Link>
                    <Link to={`/relictypes/delete/${relicType.id}`} className="hover:scale-110 transition-transform">
                      <MdOutlineDelete className='text-xl' style={{ color: 'var(--usd-copper-dark)' }} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedType && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
          <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-md w-full p-6 shadow-2xl'>
            <div className="flex items-center justify-between mb-4">
              <h1 className='text-2xl usd-text-green font-semibold'>Relic Type Details</h1>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold leading-none"
                aria-label="Close"
              >
                X
              </button>
            </div>
            <div className='my-2'>
              <span className='text-xl mr-4 usd-muted'>ID</span>
              <span className='text-gray-900 dark:text-gray-100'>{selectedType.id}</span>
            </div>
            <div className='my-2'>
              <span className='text-xl mr-4 usd-muted'>Name</span>
              <span className='text-gray-900 dark:text-gray-100'>{selectedType.name}</span>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                className='w-full p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600'
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RelicTypesTable;
