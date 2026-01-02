import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import GenericModal from '../shared/GenericModal';
import GenericForm from '../shared/GenericForm';
import Spinner from '../Spinner';

const DynamicEdit = ({ tableName, config, onRefresh }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['entity', tableName, id],
    queryFn: async () => {
      const response = await api.get(`/entities/${tableName}/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  const handleSubmit = async (formData) => {
    try {
      await api.put(`/entities/${tableName}/${id}`, formData);
      enqueueSnackbar(`${config.table.display_name} updated successfully!`, { variant: 'success' });
      onRefresh();
      navigate(`/${tableName}`);
    } catch (error) {
      console.error('Error updating item:', error);
      enqueueSnackbar(
        error.response?.data?.message || `Failed to update ${config.table.display_name}`,
        { variant: 'error' }
      );
    }
  };

  const handleClose = () => {
    navigate(`/${tableName}`);
  };

  return (
    <GenericModal
      isOpen={true}
      onClose={handleClose}
      title={`Edit ${config.table.display_name}`}
    >
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Error loading item details</p>
        </div>
      ) : (
        <GenericForm
          fields={config.formFields}
          initialData={item}
          onSubmit={handleSubmit}
          onCancel={handleClose}
          submitLabel="Update"
          entityName={tableName}
          entityId={id}
        />
      )}
    </GenericModal>
  );
};

export default DynamicEdit;
