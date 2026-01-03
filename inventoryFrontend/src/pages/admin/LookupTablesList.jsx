import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { MdAdd, MdEdit, MdFileDownload } from 'react-icons/md';

const LookupTablesList = () => {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['lookups'],
    queryFn: async () => {
      const response = await api.get('/tables/lookups');
      return response.data.lookups;
    }
  });

  const handleExport = async (lookupId, displayName) => {
    try {
      const response = await api.get(`/tables/lookups/${lookupId}/export`);
      const csvData = response.data.data;

      if (csvData.length === 0) {
        alert('No data to export');
        return;
      }

      // Convert JSONB objects to CSV
      const headers = Object.keys(csvData[0]);
      const csvRows = [headers.join(',')];

      csvData.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || '';
          // Escape values with commas or quotes
          if (value.toString().includes(',') || value.toString().includes('"')) {
            return `"${value.toString().replace(/"/g, '""')}"`;
          }
          return value;
        });
        csvRows.push(values.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${displayName.replace(/\s+/g, '_')}_export.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export lookup table');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg usd-muted">Loading lookup tables...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error loading lookup tables: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl">Lookup Tables</h1>
          <p className="usd-muted mt-2">Manage dropdown reference data for custom tables</p>
        </div>
        <button
          onClick={() => navigate('/admin/lookups/create')}
          className="usd-btn-green px-4 py-2 rounded flex items-center gap-2"
        >
          <MdAdd /> Create Lookup Table
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border-2 usd-border-green shadow-sm">
        {data && data.length === 0 ? (
          <div className="text-center py-12 usd-muted bg-white dark:bg-[#3c3c3c]">
            <p>No lookup tables found.</p>
            <p className="text-sm mt-2">Create your first lookup table to get started.</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 dark:bg-[#3c3c3c]">
              <tr>
                <th className="border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200">Display Name</th>
                <th className="border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200">Table Name</th>
                <th className="border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200">Values</th>
                <th className="border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200">Shared</th>
                <th className="border-b-2 usd-border-green px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-stone-200">Creator</th>
                <th className="border-b-2 usd-border-green px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-stone-200">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#3c3c3c] divide-y divide-gray-200 dark:divide-stone-700">
              {data?.map(lookup => (
                <tr key={lookup.id}>
                  <td className="p-3 font-semibold">{lookup.display_name}</td>
                  <td className="p-3 font-mono text-sm usd-muted">{lookup.table_name}</td>
                  <td className="p-3">{lookup.value_count || 0} entries</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${lookup.is_shared ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {lookup.is_shared ? 'Public' : 'Private'}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{lookup.creator_email}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => navigate(`/admin/lookups/${lookup.id}`)}
                      className="usd-btn-green px-3 py-1 rounded mr-2 inline-flex items-center gap-1"
                      title="Manage values"
                    >
                      <MdEdit /> Manage
                    </button>
                    <button
                      onClick={() => handleExport(lookup.id, lookup.display_name)}
                      className="usd-btn-copper px-3 py-1 rounded inline-flex items-center gap-1"
                      title="Export to CSV"
                    >
                      <MdFileDownload /> Export
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LookupTablesList;
