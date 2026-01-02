import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import GenericModal from '../shared/GenericModal';

const DynamicDelete = ({ tableName, onRefresh }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/entities/${tableName}/${id}`);
      enqueueSnackbar('Item deleted successfully!', { variant: 'success' });
      onRefresh();
      navigate(`/${tableName}`);
    } catch (error) {
      console.error('Error deleting item:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete item',
        { variant: 'error' }
      );
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      navigate(`/${tableName}`);
    }
  };

  return (
    <GenericModal
      isOpen={true}
      onClose={handleClose}
      title="Confirm Deletion"
    >
      <div className="p-4">
        <p className="mb-6">
          Are you sure you want to delete this item? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="usd-btn-copper px-4 py-2 rounded disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </GenericModal>
  );
};

export default DynamicDelete;
