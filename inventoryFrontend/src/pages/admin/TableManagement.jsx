import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import { MdEdit, MdDelete, MdShare, MdVisibility, MdLock } from 'react-icons/md';
import TableDetailsModal from '../../components/Admin/TableDetailsModal.jsx';

const TableManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Fetch all tables
  const { data: tables, isLoading } = useQuery({
    queryKey: ['admin', 'tables'],
    queryFn: async () => {
      const response = await api.get('/tables/admin/all');
      return response.data.tables;
    }
  });

  // Delete table mutation
  const deleteMutation = useMutation({
    mutationFn: async (tableName) => {
      await api.delete(`/tables/${tableName}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'tables']);
      enqueueSnackbar('Table deleted successfully', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete table',
        { variant: 'error' }
      );
    }
  });

  const handleDelete = (table) => {
    if (window.confirm(
      `Are you sure you want to delete "${table.display_name}"?\n\nThis will permanently delete:\n- The table and all its data\n- All associated images and QR codes\n- All field definitions\n\nThis action CANNOT be undone!`
    )) {
      deleteMutation.mutate(table.table_name);
    }
  };

  const handleViewDetails = (table) => {
    setSelectedTable(table);
    setDetailsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="text-center py-8">Loading tables...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Table Management</h1>
          <p className="usd-muted mt-1">Manage all custom tables in the system</p>
        </div>
      </div>

      <div className="usd-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="usd-bg-silver">
              <tr>
                <th className="text-left p-4">Table Name</th>
                <th className="text-left p-4">Display Name</th>
                <th className="text-left p-4">Owner</th>
                <th className="text-left p-4">Fields</th>
                <th className="text-left p-4">Permissions</th>
                <th className="text-left p-4">Visibility</th>
                <th className="text-left p-4">Created</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tables?.map((table) => (
                <tr key={table.id} className="border-b usd-border hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-4">
                    <code className="text-sm usd-text-copper">{table.table_name}</code>
                  </td>
                  <td className="p-4 font-semibold">{table.display_name}</td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div>{table.creator_username || 'Unknown'}</div>
                      <div className="usd-muted text-xs">{table.creator_email}</div>
                    </div>
                  </td>
                  <td className="p-4 text-center">{table.field_count}</td>
                  <td className="p-4 text-center">
                    {table.permission_count > 0 ? (
                      <span className="usd-text-green">{table.permission_count} users</span>
                    ) : (
                      <span className="usd-muted">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {table.is_shared ? (
                        <>
                          <MdVisibility className="usd-text-green" />
                          <span className="text-sm usd-text-green">Shared</span>
                        </>
                      ) : (
                        <>
                          <MdLock className="usd-text-copper" />
                          <span className="text-sm usd-muted">Private</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm usd-muted">
                    {new Date(table.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(table)}
                        className="p-2 usd-btn-green rounded hover:opacity-80 transition"
                        title="View & Edit"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(table)}
                        className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        title="Delete Table"
                        disabled={deleteMutation.isLoading}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!tables || tables.length === 0) && (
            <div className="text-center py-12 usd-muted">
              No custom tables found in the system.
            </div>
          )}
        </div>
      </div>

      {/* Table Details Modal */}
      {selectedTable && (
        <TableDetailsModal
          isOpen={detailsModalOpen}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedTable(null);
          }}
          table={selectedTable}
          onUpdate={() => {
            queryClient.invalidateQueries(['admin', 'tables']);
          }}
        />
      )}
    </div>
  );
};

export default TableManagement;
