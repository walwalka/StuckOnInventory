import React from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from '../Spinner';

/**
 * Generic modal component with consistent styling
 * @param {boolean} isOpen - Whether the modal is open
 * @param {Function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {ReactNode} children - Modal content
 * @param {boolean} loading - Show loading spinner
 * @param {string} size - Modal size ('sm', 'md', 'lg', 'xl')
 */
const GenericModal = ({
  isOpen,
  onClose,
  title,
  children,
  loading = false,
  size = 'lg',
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Blurred backdrop overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md"></div>

      {/* Content container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <Spinner />
          </div>
        )}

        {/* Modal content - solid background */}
        <div className={`flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl ${sizeClasses[size]} w-full max-h-[90vh] shadow-2xl relative my-8 z-10`}>
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#2c2c2c] border-b usd-border-green rounded-t-xl flex-shrink-0">
            <h1 className='text-2xl usd-text-green font-semibold'>{title}</h1>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-base font-semibold leading-none"
              aria-label="Close"
            >
              Close
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-6 bg-white dark:bg-[#2c2c2c] rounded-b-xl">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default GenericModal;
