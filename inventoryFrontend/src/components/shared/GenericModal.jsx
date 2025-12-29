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
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 overflow-y-auto">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      <div className={`flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl ${sizeClasses[size]} w-full max-h-[90vh] mx-auto shadow-2xl relative my-8 overflow-hidden`}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 sticky top-0 bg-white dark:bg-[#2c2c2c] border-b usd-border-green z-10 rounded-t-xl">
          <h1 className='text-2xl usd-text-green font-semibold'>{title}</h1>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold leading-none"
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-6">{children}</div>
      </div>
    </div>
  );
};

export default GenericModal;
