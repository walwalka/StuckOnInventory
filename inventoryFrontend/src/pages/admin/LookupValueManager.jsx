import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import { MdAdd, MdDelete, MdEdit, MdFileUpload, MdSave, MdCancel, MdArrowBack } from 'react-icons/md';

const LookupValueManager = () => {
  const { lookupId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newValue, setNewValue] = useState({});
  const [editingValueId, setEditingValueId] = useState(null);
  const [editingValue, setEditingValue] = useState({});

  // Fetch lookup table with values
  const { data: lookup, isLoading, error } = useQuery({
    queryKey: ['lookup', lookupId],
    queryFn: async () => {
      const response = await api.get(`/tables/lookups/${lookupId}`);
      return response.data;
    }
  });

  // Add value mutation
  const addValueMutation = useMutation({
    mutationFn: async (valueData) => {
      await api.post(`/tables/lookups/${lookupId}/values`, { value_data: valueData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lookup', lookupId]);
      setShowAddForm(false);
      setNewValue({});
      enqueueSnackbar('Value added successfully', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(`Failed to add value: ${error.response?.data?.error || error.message}`, { variant: 'error' });
    }
  });

  // Update value mutation
  const updateValueMutation = useMutation({
    mutationFn: async ({ valueId, valueData }) => {
      await api.put(`/tables/lookups/${lookupId}/values/${valueId}`, { value_data: valueData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lookup', lookupId]);
      setEditingValueId(null);
      setEditingValue({});
      enqueueSnackbar('Value updated successfully', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(`Failed to update value: ${error.response?.data?.error || error.message}`, { variant: 'error' });
    }
  });

  // Delete value mutation
  const deleteValueMutation = useMutation({
    mutationFn: async (valueId) => {
      await api.delete(`/tables/lookups/${lookupId}/values/${valueId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lookup', lookupId]);
      enqueueSnackbar('Value deleted successfully', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(`Failed to delete value: ${error.response?.data?.error || error.message}`, { variant: 'error' });
    }
  });

  // CSV Import mutation
  const importCsvMutation = useMutation({
    mutationFn: async (csvData) => {
      await api.post(`/tables/lookups/${lookupId}/import`, { csv_data: csvData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lookup', lookupId]);
      enqueueSnackbar('CSV imported successfully', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(`Failed to import CSV: ${error.response?.data?.error || error.message}`, { variant: 'error' });
    }
  });

  const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          enqueueSnackbar('CSV file is empty or invalid', { variant: 'error' });
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const csvData = lines.slice(1).map(line => {
          // Handle quoted values with commas
          const values = [];
          let currentValue = '';
          let insideQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
              values.push(currentValue.trim().replace(/^"|"$/g, ''));
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue.trim().replace(/^"|"$/g, ''));

          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });

        importCsvMutation.mutate(csvData);
      } catch (err) {
        console.error('CSV parsing error:', err);
        enqueueSnackbar('Failed to parse CSV file', { variant: 'error' });
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  };

  const handleAddValue = () => {
    if (Object.keys(newValue).length === 0) {
      enqueueSnackbar('Please fill in at least one field', { variant: 'warning' });
      return;
    }
    addValueMutation.mutate(newValue);
  };

  const handleStartEdit = (value) => {
    setEditingValueId(value.id);
    setEditingValue({ ...value.value_data });
  };

  const handleSaveEdit = () => {
    updateValueMutation.mutate({ valueId: editingValueId, valueData: editingValue });
  };

  const handleCancelEdit = () => {
    setEditingValueId(null);
    setEditingValue({});
  };

  const handleDelete = (valueId, valueName) => {
    if (window.confirm(`Are you sure you want to delete "${valueName}"?`)) {
      deleteValueMutation.mutate(valueId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg usd-muted">Loading lookup table...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Error loading lookup table: {error.message}</div>
      </div>
    );
  }

  // Get schema from first value if exists
  const schema = lookup?.values?.length > 0 ? Object.keys(lookup.values[0].value_data) : [];

  return (
    <div className="p-4">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/lookups')}
          className="usd-btn-copper px-3 py-2 rounded flex items-center gap-2 mb-4"
        >
          <MdArrowBack /> Back to Lookup Tables
        </button>
        <h1 className="text-3xl">Manage: {lookup?.display_name}</h1>
        <p className="usd-muted mt-2">Table: <span className="font-mono">{lookup?.table_name}</span></p>
      </div>

      <div className="mb-4 flex gap-4">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="usd-btn-green px-4 py-2 rounded flex items-center gap-2"
        >
          <MdAdd /> {showAddForm ? 'Cancel' : 'Add Value'}
        </button>

        <label className="usd-btn-copper px-4 py-2 rounded flex items-center gap-2 cursor-pointer">
          <MdFileUpload /> Import CSV
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            className="hidden"
          />
        </label>
      </div>

      {showAddForm && (
        <div className="usd-panel p-4 mb-4">
          <h3 className="text-lg font-semibold mb-4">Add New Value</h3>
          {schema.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schema.map(key => (
                  <div key={key}>
                    <label className="block mb-1 font-semibold">{key}</label>
                    <input
                      type="text"
                      value={newValue[key] || ''}
                      onChange={(e) => setNewValue({ ...newValue, [key]: e.target.value })}
                      className="w-full p-2 border rounded"
                      placeholder={`Enter ${key}...`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAddValue}
                  className="usd-btn-green px-4 py-2 rounded"
                  disabled={addValueMutation.isPending}
                >
                  {addValueMutation.isPending ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewValue({});
                  }}
                  className="usd-btn-copper px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div>
              <p className="usd-muted mb-4">Define the schema for this lookup table by entering field names and values.</p>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Field Name</label>
                <input
                  type="text"
                  placeholder="e.g., name, code, description"
                  className="w-full p-2 border rounded mb-2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const fieldName = e.target.value.trim();
                      if (fieldName && !newValue.hasOwnProperty(fieldName)) {
                        setNewValue({ ...newValue, [fieldName]: '' });
                        e.target.value = '';
                      }
                    }
                  }}
                />
                <p className="text-sm usd-muted">Press Enter to add a field</p>
              </div>
              {Object.keys(newValue).map(key => (
                <div key={key} className="mb-2">
                  <label className="block mb-1 font-semibold">{key}</label>
                  <input
                    type="text"
                    value={newValue[key] || ''}
                    onChange={(e) => setNewValue({ ...newValue, [key]: e.target.value })}
                    className="w-full p-2 border rounded"
                  />
                </div>
              ))}
              {Object.keys(newValue).length > 0 && (
                <button
                  onClick={handleAddValue}
                  className="usd-btn-green px-4 py-2 rounded mt-2"
                  disabled={addValueMutation.isPending}
                >
                  {addValueMutation.isPending ? 'Saving...' : 'Save First Value'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="usd-panel">
        {lookup?.values?.length === 0 ? (
          <div className="text-center py-12 usd-muted">
            <p>No values in this lookup table yet.</p>
            <p className="text-sm mt-2">Add your first value to get started.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {schema.map(key => (
                  <th key={key} className="text-left p-3 capitalize">{key}</th>
                ))}
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lookup?.values?.map(value => (
                <tr key={value.id} className="border-b hover:bg-gray-50">
                  {schema.map(key => (
                    <td key={key} className="p-3">
                      {editingValueId === value.id ? (
                        <input
                          type="text"
                          value={editingValue[key] || ''}
                          onChange={(e) => setEditingValue({ ...editingValue, [key]: e.target.value })}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        <span>{value.value_data[key]}</span>
                      )}
                    </td>
                  ))}
                  <td className="p-3 text-right">
                    {editingValueId === value.id ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-800 p-1 mr-2"
                          title="Save changes"
                          disabled={updateValueMutation.isPending}
                        >
                          <MdSave size={20} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-800 p-1"
                          title="Cancel"
                        >
                          <MdCancel size={20} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStartEdit(value)}
                          className="text-blue-600 hover:text-blue-800 p-1 mr-2"
                          title="Edit"
                        >
                          <MdEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(value.id, value.value_data[schema[0]])}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <MdDelete size={20} />
                        </button>
                      </>
                    )}
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

export default LookupValueManager;
