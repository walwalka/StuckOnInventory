import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import GenericModal from '../shared/GenericModal';
import GenericForm from '../shared/GenericForm';
import { relicsFormFields } from '../../config/relicsConfig.jsx';

const CreateRelics = () => {
  const [loading, setLoading] = useState(false);
  const [formFields, setFormFields] = useState(relicsFormFields);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  useEffect(() => {
    api
      .get('/relictypes')
      .then((response) => {
        const updatedFields = formFields.map((field) => {
          if (field.name === 'type') {
            return {
              ...field,
              options: (response.data.data || []).map((rt) => rt.name),
            };
          }
          return field;
        });
        setFormFields(updatedFields);
      })
      .catch((error) => console.log('Error fetching relic types:', error));
  }, []);

  const handleSubmit = async (formData, selectedFiles) => {
    setLoading(true);

    try {
      const data = {
        type: formData.type,
        origin: formData.origin,
        era: formData.era,
        condition: formData.condition,
        description: formData.description,
        quantity: parseInt(formData.quantity) || 1,
      };

      const response = await api.post('/relics/', data);
      const newRelicId = response.data.relicId;
      if (!newRelicId) {
        throw new Error('Missing relic id from create response');
      }

      if (selectedFiles.length > 0) {
        const formDataImages = new FormData();
        selectedFiles.forEach((file) => {
          formDataImages.append('images', file);
        });
        await api.post(`/relics/upload/${newRelicId}`, formDataImages);
      }

      setLoading(false);
      enqueueSnackbar('Relic created successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['relics'] });
      navigate('/relics');
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('Error creating relic', { variant: 'error' });
      console.log(error);
    }
  };

  return (
    <GenericModal
      isOpen={true}
      onClose={() => navigate('/relics')}
      title="Create Indian Relic Record"
      loading={loading}
    >
      <GenericForm
        fields={formFields}
        initialValues={{ quantity: 1 }}
        onSubmit={handleSubmit}
        loading={loading}
        enableImages={true}
        submitLabel="Save"
      />
    </GenericModal>
  );
};

export default CreateRelics;
