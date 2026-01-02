import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import GenericModal from './GenericModal';
import { MdDelete, MdPersonAdd } from 'react-icons/md';
import Spinner from '../Spinner';

const TablePermissionsModal = ({ isOpen, onClose, tableName, tableDisplayName }) => {
  const [email, setEmail] = useState('');
  const [permissionLevel, setPermissionLevel] = useState('view');
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Fetch current permissions
  const { data: permissions = [], isLoading, refetch } = useQuery({
    queryKey: ['tablePermissions', tableName],
    queryFn: async () => {
      // We need to add a backend endpoint to list permissions
      // For now, return empty array
      try {
        const response = await api.get(`/tables/${tableName}/permissions`);
        return response.data.permissions || [];
      } catch (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }
    },
    enabled: isOpen && !!tableName
  });

  // Grant permission mutation
  const grantPermissionMutation = useMutation({
    mutationFn: async ({ email, permission_level }) => {
      // First, get user ID by email
      const userResponse = await api.get(`/users/by-email/${email}`);
      const userId = userResponse.data.id;

      // Then grant permission
      await api.post(`/tables/${tableName}/permissions`, {
        user_id: userId,
        permission_level
      });
    },
    onSuccess: () => {
      enqueueSnackbar('Permission granted successfully!', { variant: 'success' });
      setEmail('');
      refetch();
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to grant permission',
        { variant: 'error' }
      );
    }
  });

  // Revoke permission mutation
  const revokePermissionMutation = useMutation({
    mutationFn: async (userId) => {
      await api.delete(`/tables/${tableName}/permissions/${userId}`);
    },
    onSuccess: () => {
      enqueueSnackbar('Permission revoked successfully!', { variant: 'success' });
      refetch();
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to revoke permission',
        { variant: 'error' }
      );
    }
  });

  const handleGrantPermission = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      enqueueSnackbar('Please enter an email address', { variant: 'warning' });
      return;
    }

    grantPermissionMutation.mutate({
      email: email.trim(),
      permission_level: permissionLevel
    });
  };

  const handleRevokePermission = (userId) => {
    if (window.confirm('Are you sure you want to revoke access for this user?')) {
      revokePermissionMutation.mutate(userId);
    }
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Access - ${tableDisplayName}`}
    >
      <div className="p-4">
        {/* Grant permission form */}
        <form onSubmit={handleGrantPermission} className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Grant Access</h3>
          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-2">User Email</label>
              <input
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={grantPermissionMutation.isPending}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Permission Level</label>
              <select
                value={permissionLevel}
                onChange={(e) => setPermissionLevel(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={grantPermissionMutation.isPending}
              >
                <option value="view">View Only - Can view items but not modify</option>
                <option value="edit">Edit - Can create, edit, and delete items</option>
                <option value="admin">Admin - Full control including permissions</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={grantPermissionMutation.isPending}
              className="usd-btn-green px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
            >
              <MdPersonAdd className="text-xl" />
              {grantPermissionMutation.isPending ? 'Granting...' : 'Grant Access'}
            </button>
          </div>
        </form>

        {/* Current permissions list */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Current Access</h3>

          {isLoading ? (
            <Spinner />
          ) : permissions.length === 0 ? (
            <p className="text-sm usd-muted text-center py-4">
              No users have been granted access yet.
            </p>
          ) : (
            <div className="space-y-2">
              {permissions.map((perm) => (
                <div
                  key={perm.user_id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{perm.email}</div>
                    <div className="text-sm usd-muted">
                      {perm.permission_level === 'view' && 'View Only'}
                      {perm.permission_level === 'edit' && 'Can Edit'}
                      {perm.permission_level === 'admin' && 'Admin'}
                    </div>
                    <div className="text-xs usd-muted">
                      Granted {new Date(perm.granted_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokePermission(perm.user_id)}
                    disabled={revokePermissionMutation.isPending}
                    className="p-2 hover:bg-red-100 text-red-500 rounded disabled:opacity-50"
                    title="Revoke Access"
                  >
                    <MdDelete className="text-xl" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="usd-btn-copper px-6 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </GenericModal>
  );
};

export default TablePermissionsModal;
