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

      <div className="overflow-x-auto rounded-lg border-2 usd-border-green shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 dark:bg-[#3c3c3c]">
            <tr>
              <th className="border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200">Table Name</th>
              <th className="border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200">Display Name</th>
              <th className="border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200">Owner</th>
              <th className="border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200">Fields</th>
              <th className="border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200">Permissions</th>
              <th className="border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200">Visibility</th>
              <th className="border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200">Created</th>
              <th className="border-b-2 usd-border-green px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-stone-200">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#3c3c3c] divide-y divide-gray-200 dark:divide-stone-700">
            {tables?.map((table) => (
              <tr key={table.id}>
                  <td className="p-4">
                    <code className="text-sm usd-text-copper">{table.table_name}</code>
                  </td>
                  <td className="p-4 font-semibold">{table.display_name}</td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="usd-muted">{table.creator_email}</div>
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
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleViewDetails(table)}
                      className="usd-btn-green px-3 py-1 rounded mr-2 inline-flex items-center gap-1"
                      title="View & Edit"
                    >
                      <MdEdit /> Manage
                    </button>
                    <button
                      onClick={() => handleDelete(table)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition inline-flex items-center gap-1"
                      title="Delete Table"
                      disabled={deleteMutation.isLoading}
                    >
                      <MdDelete /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!tables || tables.length === 0) && (
            <div className="text-center py-12 usd-muted bg-white dark:bg-[#3c3c3c]">
              No custom tables found in the system.
            </div>
          )}
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
