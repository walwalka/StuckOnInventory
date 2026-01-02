import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import GenericModal from '../shared/GenericModal';
import GenericForm from '../shared/GenericForm';

const DynamicCreate = ({ tableName, config, onRefresh }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (formData) => {
    try {
      await api.post(`/entities/${tableName}`, formData);
      enqueueSnackbar(`${config.table.display_name} created successfully!`, { variant: 'success' });
      onRefresh();
      navigate(`/${tableName}`);
    } catch (error) {
      console.error('Error creating item:', error);
      enqueueSnackbar(
        error.response?.data?.message || `Failed to create ${config.table.display_name}`,
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
      title={`Create ${config.table.display_name}`}
    >
      <GenericForm
        fields={config.formFields}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        submitLabel="Create"
        entityName={tableName}
      />
    </GenericModal>
  );
};

export default DynamicCreate;
