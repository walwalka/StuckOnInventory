import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import GenericModal from '../shared/GenericModal';
import GenericForm from '../shared/GenericForm';
import { stampsFormFields } from '../../config/stampsConfig';

const CreateStamps = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = async (formData, selectedFiles) => {
    setLoading(true);

    try {
      const data = {
        country: formData.country,
        denomination: formData.denomination,
        issueyear: formData.issueyear,
        condition: formData.condition,
        description: formData.description,
        quantity: parseInt(formData.quantity) || 1,
      };

      const response = await api.post('/stamps/', data);
      const newStampId = response.data.stampId;
      if (!newStampId) {
        throw new Error('Missing stamp id from create response');
      }

      if (selectedFiles.length > 0) {
        const formDataImages = new FormData();
        selectedFiles.forEach((file) => {
          formDataImages.append('images', file);
        });
        await api.post(`/stamps/upload/${newStampId}`, formDataImages);
      }

      setLoading(false);
      enqueueSnackbar('Stamp created successfully', { variant: 'success' });
      navigate('/stamps');
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('Error creating stamp', { variant: 'error' });
      console.log(error);
    }
  };

  return (
    <GenericModal
      isOpen={true}
      onClose={() => navigate('/stamps')}
      title="Create Stamp Record"
      loading={loading}
    >
      <GenericForm
        fields={stampsFormFields}
        initialValues={{ quantity: 1 }}
        onSubmit={handleSubmit}
        loading={loading}
        enableImages={true}
        submitLabel="Save"
      />
    </GenericModal>
  );
};

export default CreateStamps;
