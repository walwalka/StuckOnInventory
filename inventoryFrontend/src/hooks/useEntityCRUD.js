import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import { useSnackbar } from 'notistack';

/**
 * Custom hook for entity CRUD operations with React Query
 * @param {string} endpoint - API endpoint (e.g., '/coins', '/stamps')
 * @param {string} queryKey - Unique query key for caching (e.g., 'coins', 'stamps')
 * @returns {Object} CRUD operations and query state
 */
export const useEntityCRUD = (endpoint, queryKey) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // Fetch all entities
  const {
    data: items = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const response = await api.get(endpoint);
      return response.data.data || [];
    },
  });

  // Fetch single entity
  const fetchOne = async (id) => {
    const response = await api.get(`${endpoint}/${id}`);
    return response.data.data;
  };

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (newItem) => {
      const response = await api.post(endpoint, newItem);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      enqueueSnackbar('Created successfully', { variant: 'success' });
    },
    onError: (error) => {
      console.error('Create error:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to create',
        { variant: 'error' }
      );
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`${endpoint}/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      enqueueSnackbar('Updated successfully', { variant: 'success' });
    },
    onError: (error) => {
      console.error('Update error:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to update',
        { variant: 'error' }
      );
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.delete(`${endpoint}/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      enqueueSnackbar('Deleted successfully', { variant: 'success' });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete',
        { variant: 'error' }
      );
    },
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const response = await api.post(`${endpoint}/upload/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      enqueueSnackbar('Image uploaded successfully', { variant: 'success' });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to upload image',
        { variant: 'error' }
      );
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async ({ id, slot }) => {
      const response = await api.delete(`${endpoint}/image/${id}/${slot}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      enqueueSnackbar('Image deleted successfully', { variant: 'success' });
    },
    onError: (error) => {
      console.error('Delete image error:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete image',
        { variant: 'error' }
      );
    },
  });

  return {
    // Data
    items,
    isLoading,
    isError,
    error,

    // Operations
    refetch,
    fetchOne,
    create: createMutation.mutate,
    update: updateMutation.mutate,
    remove: deleteMutation.mutate,
    uploadImage: uploadImageMutation.mutate,
    deleteImage: deleteImageMutation.mutate,

    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isUploadingImage: uploadImageMutation.isPending,
    isDeletingImage: deleteImageMutation.isPending,
  };
};
