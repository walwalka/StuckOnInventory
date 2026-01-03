import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import GenericModal from '../shared/GenericModal';
import GenericForm from '../shared/GenericForm';

const DynamicCreate = ({ tableName, config, onRefresh }) => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (formData, selectedFiles = []) => {
    try {
      console.log('[DynamicCreate] Creating item with data:', formData);
      console.log('[DynamicCreate] Selected files:', selectedFiles.length);

      // First create the item
      const createResponse = await api.post(`/entities/${tableName}`, formData);
      const newItemId = createResponse.data.itemId;
      console.log('[DynamicCreate] Item created with ID:', newItemId);

      // If there are images, upload them
      if (selectedFiles.length > 0) {
        console.log('[DynamicCreate] Uploading images for item:', newItemId);
        const uploadFormData = new FormData();
        selectedFiles.forEach(file => {
          uploadFormData.append('images', file);
        });

        try {
          const uploadResponse = await api.post(`/entities/${tableName}/upload/${newItemId}`, uploadFormData);
          console.log('[DynamicCreate] Images uploaded:', uploadResponse.data);
        } catch (uploadError) {
          console.error('[DynamicCreate] Error uploading images:', uploadError);
          // Don't fail the whole creation, just warn the user
          enqueueSnackbar('Item created but image upload failed. You can add images later.', { variant: 'warning' });
        }
      }

      enqueueSnackbar(`${config.table.display_name} created successfully!`, { variant: 'success' });
      onRefresh();
      navigate(`/${tableName}`);
    } catch (error) {
      console.error('[DynamicCreate] Error creating item:', error);
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
