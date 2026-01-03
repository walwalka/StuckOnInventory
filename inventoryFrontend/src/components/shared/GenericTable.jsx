import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import moment from 'moment';
import { useHeicImages } from '../../hooks/useHeicImages';

/**
 * GenericTable - Reusable table component for all entity types
 *
 * @param {Array} items - Array of items to display
 * @param {Array} columns - Column configuration
 * @param {string} entityName - Entity name for routing (e.g., 'coins', 'stamps')
 * @param {Array} customActions - Optional custom action buttons
 * @param {Function} onRefresh - Optional refresh callback
 */
const GenericTable = ({
  items = [],
  columns = [],
  entityName = '',
  customActions = [],
  onRefresh
}) => {
  const { imageMap, loading: imagesLoading } = useHeicImages(items, 'image1');

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${window.location.origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const renderCellValue = (item, column) => {
    const value = item[column.field];

    // Handle custom render function
    if (column.render) {
      return column.render(value, item);
    }

    // Handle different value types
    if (value === null || value === undefined) {
      return column.defaultValue || '-';
    }

    // Date formatting
    if (column.type === 'date') {
      return moment(value).format(column.format || 'MM/DD/YYYY');
    }

    // Currency formatting
    if (column.type === 'currency') {
      return `$${Number(value).toFixed(2)}`;
    }

    // Image handling
    if (column.type === 'image') {
      const imageUrl = imageMap[item.id] || getImageUrl(value);
      return imageUrl ? (
        <img
          src={imageUrl}
          alt={column.label}
          className="w-12 h-12 object-cover rounded border usd-border-silver"
        />
      ) : (
        <span className="text-xs text-gray-400 dark:text-stone-500">No image</span>
      );
    }

    return value;
  };

  return (
    <div className="overflow-x-auto rounded-lg border-2 usd-border-green shadow-sm">
      <table className='w-full border-collapse'>
        <thead className='bg-gray-100 dark:bg-[#3c3c3c]'>
          <tr>
            <th className='border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200'>
              ID
            </th>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200 ${
                  column.hideOnMobile ? 'max-md:hidden' : ''
                }`}
              >
                {column.label}
              </th>
            ))}
            <th className='border-b-2 usd-border-green px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-stone-200'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='bg-white dark:bg-[#3c3c3c] divide-y divide-gray-200 dark:divide-stone-700'>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 2}
                className='px-4 py-8 text-center text-sm text-gray-500 dark:text-stone-400'
              >
                No items found
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={item.id} className='hover:bg-gray-50 dark:hover:bg-[#4a4a4a] transition-colors'>
                <td className='px-4 py-3 text-sm text-gray-700 dark:text-stone-300'>
                  {index + 1}
                </td>
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-4 py-3 text-sm ${
                      column.bold ? 'font-medium' : ''
                    } text-gray-${column.bold ? '700' : '600'} dark:text-stone-300 ${
                      column.hideOnMobile ? 'max-md:hidden' : ''
                    }`}
                  >
                    {renderCellValue(item, column)}
                  </td>
                ))}
                <td className='px-4 py-3'>
                  <div className='flex justify-center gap-x-3'>
                    {/* Custom action buttons */}
                    {customActions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        onClick={() => action.onClick(item)}
                        disabled={action.disabled?.(item)}
                        className="hover:scale-110 transition-transform disabled:opacity-50"
                        title={action.title}
                      >
                        {action.icon}
                      </button>
                    ))}

                    {/* Standard action buttons */}
                    <Link
                      to={`/${entityName}/details/${item.id}`}
                      className="hover:scale-110 transition-transform"
                    >
                      <BsInfoCircle className='text-xl text-green-600 dark:text-green-400' />
                    </Link>
                    <Link
                      to={`/${entityName}/edit/${item.id}`}
                      className="hover:scale-110 transition-transform"
                    >
                      <AiOutlineEdit className='text-xl text-orange-600 dark:text-orange-400' />
                    </Link>
                    <Link
                      to={`/${entityName}/delete/${item.id}`}
                      className="hover:scale-110 transition-transform"
                    >
                      <MdOutlineDelete className='text-xl text-red-600 dark:text-red-400' />
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GenericTable;
