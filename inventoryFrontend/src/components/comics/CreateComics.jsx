import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import GenericModal from '../shared/GenericModal';
import GenericForm from '../shared/GenericForm';
import { comicsFormFields } from '../../config/comicsConfig';

const CreateComics = () => {
  const [loading, setLoading] = useState(false);
  const [formFields, setFormFields] = useState(comicsFormFields);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  useEffect(() => {
    api
      .get('/comicpublishers')
      .then((response) => {
        const updatedFields = formFields.map((field) => {
          if (field.name === 'publisher') {
            return {
              ...field,
              options: (response.data.data || []).map((pub) => pub.name),
            };
          }
          return field;
        });
        setFormFields(updatedFields);
      })
      .catch((error) => console.log('Error fetching comic publishers:', error));
  }, []);

  const handleSubmit = async (formData, selectedFiles) => {
    setLoading(true);

    try {
      const data = {
        title: formData.title,
        publisher: formData.publisher,
        series: formData.series,
        issuenumber: formData.issuenumber,
        publicationyear: formData.publicationyear,
        grade: formData.grade,
        condition: formData.condition,
        variant: formData.variant,
        description: formData.description,
        quantity: parseInt(formData.quantity) || 1,
      };

      const response = await api.post('/comics/', data);
      const newComicId = response.data.comicId;
      if (!newComicId) {
        throw new Error('Missing comic id from create response');
      }

      if (selectedFiles.length > 0) {
        const formDataImages = new FormData();
        selectedFiles.forEach((file) => {
          formDataImages.append('images', file);
        });
        await api.post(`/comics/upload/${newComicId}`, formDataImages);
      }

      setLoading(false);
      enqueueSnackbar('Comic created successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['comics'] });
      navigate('/comics');
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('Error creating comic', { variant: 'error' });
      console.log(error);
    }
  };

  return (
    <GenericModal
      isOpen={true}
      onClose={() => navigate('/comics')}
      title="Create Comic Book Record"
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

export default CreateComics;
