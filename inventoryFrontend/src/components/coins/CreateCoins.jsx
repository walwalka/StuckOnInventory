import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import GenericModal from '../shared/GenericModal';
import GenericForm from '../shared/GenericForm';
import { coinsFormFields } from '../../config/coinsConfig';

const CreateCoins = () => {
  const [loading, setLoading] = useState(false);
  const [formFields, setFormFields] = useState(coinsFormFields);
  const [coinTypes, setCoinTypes] = useState([]);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Fetch mint locations and coin types
    Promise.all([
      api.get('/mintlocations/locations'),
      api.get('/cointypes'),
    ])
      .then(([mintsResp, typesResp]) => {
        const types = typesResp.data.data || [];
        setCoinTypes(types);

        const updatedFields = formFields.map((field) => {
          if (field.name === 'mintlocation' && mintsResp.status === 200) {
            return {
              ...field,
              options: mintsResp.data.name.rows.map((m) => m.name),
            };
          }
          if (field.name === 'type' && typesResp.status === 200) {
            return {
              ...field,
              options: types.map((ct) => ct.name),
            };
          }
          return field;
        });
        setFormFields(updatedFields);
      })
      .catch((error) => console.log(error));
  }, []);

  const handleFieldChange = (fieldName, value, formData, setFormData) => {
    // Auto-populate face_value when coin type changes
    if (fieldName === 'type') {
      const selectedType = coinTypes.find((ct) => ct.name === value);
      if (selectedType && selectedType.face_value) {
        setFormData((prev) => ({
          ...prev,
          face_value: selectedType.face_value,
        }));
      }
    }
  };

  const handleSubmit = async (formData, selectedFiles) => {
    setLoading(true);

    try {
      // Prepare data
      const data = {
        type: formData.type,
        mintlocation: formData.mintlocation,
        mintyear: `${formData.mintyear}-01-01`,
        circulation: formData.circulation,
        grade: formData.grade,
        face_value:
          formData.face_value === '' ? null : parseFloat(formData.face_value),
        quantity: parseInt(formData.quantity) || 1,
      };

      // Create coin
      const response = await api.post('/coins/', data);
      const newCoinId = response.data.coinId;
      if (!newCoinId) {
        throw new Error('Missing coin id from create response');
      }

      // Upload images if any
      if (selectedFiles.length > 0) {
        const formDataImages = new FormData();
        selectedFiles.forEach((file) => {
          formDataImages.append('images', file);
        });
        await api.post(`/coins/upload/${newCoinId}`, formDataImages);
      }

      setLoading(false);
      enqueueSnackbar('Coin created successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['coins'] });
      navigate('/coins');
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('Error creating coin', { variant: 'error' });
      console.log(error);
    }
  };

  return (
    <GenericModal
      isOpen={true}
      onClose={() => navigate('/coins')}
      title="Create Coin Record"
      loading={loading}
    >
      <GenericForm
        fields={formFields}
        initialValues={{ quantity: 1 }}
        onSubmit={handleSubmit}
        onFieldChange={handleFieldChange}
        loading={loading}
        enableImages={true}
        submitLabel="Save"
      />
    </GenericModal>
  );
};

export default CreateCoins;
