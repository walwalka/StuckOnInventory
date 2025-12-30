import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import GenericModal from '../shared/GenericModal';
import GenericForm from '../shared/GenericForm';
import { bunnykinsFormFields } from '../../config/bunnykinsConfig';

const CreateBunnykins = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const handleSubmit = async (formData, selectedFiles) => {
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        series: formData.series,
        productionyear: formData.productionyear,
        condition: formData.condition,
        description: formData.description,
        quantity: parseInt(formData.quantity) || 1,
      };

      const response = await api.post('/bunnykins/', data);
      const newBunnykinId = response.data.bunnykinId;
      if (!newBunnykinId) {
        throw new Error('Missing bunnykin id from create response');
      }

      if (selectedFiles.length > 0) {
        const formDataImages = new FormData();
        selectedFiles.forEach((file) => {
          formDataImages.append('images', file);
        });
        await api.post(`/bunnykins/upload/${newBunnykinId}`, formDataImages);
      }

      setLoading(false);
      enqueueSnackbar('Bunnykin created successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['bunnykins'] });
      navigate('/bunnykins');
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('Error creating bunnykin', { variant: 'error' });
      console.log(error);
    }
  };

  return (
    <GenericModal
      isOpen={true}
      onClose={() => navigate('/bunnykins')}
      title="Create Bunnykins Record"
      loading={loading}
    >
      <GenericForm
        fields={bunnykinsFormFields}
        initialValues={{ quantity: 1 }}
        onSubmit={handleSubmit}
        loading={loading}
        enableImages={true}
        submitLabel="Save"
      />
    </GenericModal>
  );
};

export default CreateBunnykins;
