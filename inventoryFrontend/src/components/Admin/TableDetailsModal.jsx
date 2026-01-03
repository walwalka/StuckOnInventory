import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import GenericModal from '../shared/GenericModal.jsx';
import { MdDelete, MdAdd, MdVisibility, MdLock } from 'react-icons/md';

const TableDetailsModal = ({ isOpen, onClose, table, onUpdate }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [editingShared, setEditingShared] = useState(false);
  const [newPermissionEmail, setNewPermissionEmail] = useState('');
  const [newPermissionLevel, setNewPermissionLevel] = useState('view');

  // Fetch table permissions
  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['table-permissions', table.table_name],
    queryFn: async () => {
      const response = await api.get(`/tables/${table.table_name}/permissions`);
      return response.data.permissions;
    },
    enabled: isOpen
  });

  // Fetch table definition (fields)
  const { data: definition, isLoading: definitionLoading } = useQuery({
    queryKey: ['table-definition', table.table_name],
    queryFn: async () => {
      const response = await api.get(`/tables/${table.table_name}/definition`);
      return response.data;
    },
    enabled: isOpen
  });

  // Toggle shared status mutation
  const toggleSharedMutation = useMutation({
    mutationFn: async (isShared) => {
      await api.put(`/tables/${table.table_name}`, { is_shared: isShared });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'tables']);
      queryClient.invalidateQueries(['table-definition', table.table_name]);
      setEditingShared(false);
      enqueueSnackbar('Table visibility updated', { variant: 'success' });
      if (onUpdate) onUpdate();
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to update visibility',
        { variant: 'error' }
      );
    }
  });

  // Add permission mutation
  const addPermissionMutation = useMutation({
    mutationFn: async ({ email, permissionLevel }) => {
      await api.post(`/tables/${table.table_name}/permissions`, {
        user_email: email,
        permission_level: permissionLevel
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['table-permissions', table.table_name]);
      queryClient.invalidateQueries(['admin', 'tables']);
      setNewPermissionEmail('');
      setNewPermissionLevel('view');
      enqueueSnackbar('Permission added successfully', { variant: 'success' });
      if (onUpdate) onUpdate();
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to add permission',
        { variant: 'error' }
      );
    }
  });

  // Remove permission mutation
  const removePermissionMutation = useMutation({
    mutationFn: async (userId) => {
      await api.delete(`/tables/${table.table_name}/permissions/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['table-permissions', table.table_name]);
      queryClient.invalidateQueries(['admin', 'tables']);
      enqueueSnackbar('Permission removed successfully', { variant: 'success' });
      if (onUpdate) onUpdate();
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to remove permission',
        { variant: 'error' }
      );
    }
  });

  const handleAddPermission = () => {
    if (!newPermissionEmail.trim()) {
      enqueueSnackbar('Please enter a user email', { variant: 'warning' });
      return;
    }
    addPermissionMutation.mutate({
      email: newPermissionEmail,
      permissionLevel: newPermissionLevel
    });
  };

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Table: ${table.display_name}`}
      size="large"
    >
      <div className="space-y-6">
        {/* Table Info */}
        <div className="usd-panel p-4">
          <h3 className="font-bold text-lg mb-3 usd-text-green">Table Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="usd-muted">Table Name:</span>
              <div className="font-mono usd-text-copper">{table.table_name}</div>
            </div>
            <div>
              <span className="usd-muted">Display Name:</span>
              <div className="font-semibold">{table.display_name}</div>
            </div>
            <div>
              <span className="usd-muted">Owner:</span>
              <div>{table.creator_email}</div>
            </div>
            <div>
              <span className="usd-muted">Created:</span>
              <div>{new Date(table.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="mt-4 pt-4 border-t usd-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold mb-1">Table Visibility</div>
                <div className="text-sm usd-muted">
                  {table.is_shared
                    ? 'This table is visible to all users'
                    : 'This table is private to the owner and granted users'}
                </div>
              </div>
              {editingShared ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleSharedMutation.mutate(true)}
                    className={`px-3 py-1 rounded ${table.is_shared ? 'usd-btn-green' : 'usd-btn'}`}
                    disabled={toggleSharedMutation.isLoading}
                  >
                    <MdVisibility className="inline mr-1" /> Shared
                  </button>
                  <button
                    onClick={() => toggleSharedMutation.mutate(false)}
                    className={`px-3 py-1 rounded ${!table.is_shared ? 'usd-btn-copper' : 'usd-btn'}`}
                    disabled={toggleSharedMutation.isLoading}
                  >
                    <MdLock className="inline mr-1" /> Private
                  </button>
                  <button
                    onClick={() => setEditingShared(false)}
                    className="px-3 py-1 usd-btn rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingShared(true)}
                  className="px-4 py-2 usd-btn-green rounded"
                >
                  Change Visibility
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Fields */}
        <div className="usd-panel p-4">
          <h3 className="font-bold text-lg mb-3 usd-text-green">Fields ({definition?.fields?.length || 0})</h3>
          {definitionLoading ? (
            <div className="text-center py-4 usd-muted">Loading fields...</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {definition?.fields?.map((field) => (
                <div key={field.id} className="flex items-center justify-between p-2 rounded usd-bg-silver">
                  <div>
                    <span className="font-semibold">{field.field_label}</span>
                    <span className="ml-2 text-xs usd-muted">
                      ({field.field_type}
                      {field.is_required && ', required'}
                      {field.lookup_table_name && `, lookup: ${field.lookup_table_name}`})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="usd-panel p-4">
          <h3 className="font-bold text-lg mb-3 usd-text-green">User Permissions</h3>

          {/* Add Permission Form */}
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              value={newPermissionEmail}
              onChange={(e) => setNewPermissionEmail(e.target.value)}
              placeholder="User email"
              className="flex-1 px-3 py-2 border-2 usd-border rounded usd-input"
            />
            <select
              value={newPermissionLevel}
              onChange={(e) => setNewPermissionLevel(e.target.value)}
              className="px-3 py-2 border-2 usd-border rounded usd-input"
            >
              <option value="view">View</option>
              <option value="edit">Edit</option>
            </select>
            <button
              onClick={handleAddPermission}
              className="px-4 py-2 usd-btn-green rounded flex items-center gap-2"
              disabled={addPermissionMutation.isLoading}
            >
              <MdAdd /> Add
            </button>
          </div>

          {/* Permission List */}
          {permissionsLoading ? (
            <div className="text-center py-4 usd-muted">Loading permissions...</div>
          ) : permissions && permissions.length > 0 ? (
            <div className="space-y-2">
              {permissions.map((perm) => (
                <div key={perm.user_id} className="flex items-center justify-between p-3 rounded usd-bg-silver">
                  <div>
                    <div className="font-semibold">{perm.username || perm.email}</div>
                    <div className="text-sm usd-muted">{perm.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-sm ${
                      perm.permission_level === 'edit'
                        ? 'usd-bg-green usd-text-white'
                        : 'usd-bg-copper usd-text-white'
                    }`}>
                      {perm.permission_level}
                    </span>
                    <button
                      onClick={() => removePermissionMutation.mutate(perm.user_id)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      title="Remove permission"
                      disabled={removePermissionMutation.isLoading}
                    >
                      <MdDelete />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 usd-muted">
              No additional permissions granted. Only the owner has access.
            </div>
          )}
        </div>
      </div>
    </GenericModal>
  );
};

export default TableDetailsModal;
