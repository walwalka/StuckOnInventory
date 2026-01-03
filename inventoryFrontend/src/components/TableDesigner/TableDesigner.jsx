import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import api from '../../api/client';
import TemplateSelector from './TemplateSelector';
import FieldBuilder from './FieldBuilder';
import TablePreview from './TablePreview';

const TableDesigner = () => {
  const [tableDef, setTableDef] = useState({
    table_name: '',
    display_name: '',
    description: '',
    icon: 'MdFolder',
    is_shared: false
  });

  const [fields, setFields] = useState([]);
  const [step, setStep] = useState(0); // 0: Template, 1: Basic Info, 2: Fields, 3: Preview
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleSelectTemplate = (template) => {
    setTableDef(template.table);
    setFields(template.fields);
    setStep(1); // Move to basic info step
  };

  const validateBasicInfo = () => {
    const newErrors = {};

    if (!tableDef.table_name) {
      newErrors.table_name = 'Table name is required';
    } else if (!/^[a-z][a-z0-9_]*$/.test(tableDef.table_name)) {
      newErrors.table_name = 'Table name must start with a lowercase letter and contain only lowercase letters, numbers, and underscores';
    }

    if (!tableDef.display_name) {
      newErrors.display_name = 'Display name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextToFields = () => {
    if (validateBasicInfo()) {
      setStep(2);
    }
  };

  const handleCreateTable = async () => {
    try {
      const response = await api.post('/tables', {
        table: tableDef,
        fields
      });

      enqueueSnackbar('Table created successfully!', { variant: 'success' });

      // Navigate to the new table
      navigate(`/${tableDef.table_name}`);
    } catch (error) {
      console.error('Error creating table:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to create table',
        { variant: 'error' }
      );
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl mb-6">Create Custom Table</h1>

      {/* Step indicator - only show after template selection */}
      {step > 0 && (
        <div className="flex justify-between mb-8">
          {['Basic Info', 'Add Fields', 'Preview'].map((label, idx) => (
            <div
              key={idx}
              className={`flex-1 text-center pb-2 ${
                step === idx + 1
                  ? 'font-bold border-b-2 usd-border-green usd-text-green'
                  : 'usd-muted border-b-2 border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step === idx + 1
                      ? 'usd-btn-green text-white'
                      : step > idx + 1
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-300'
                  }`}
                >
                  {idx + 1}
                </span>
                <span>{label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 0: Template Selection */}
      {step === 0 && (
        <TemplateSelector
          onSelectTemplate={handleSelectTemplate}
          onCancel={() => navigate('/')}
        />
      )}

      {/* Step 1: Basic table information */}
      {step === 1 && (
        <div className="usd-panel p-6">
          <h2 className="text-2xl mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-2">
                Table Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., vinyl_records"
                value={tableDef.table_name}
                onChange={(e) => setTableDef({ ...tableDef, table_name: e.target.value.toLowerCase() })}
                className={`w-full p-2 border rounded usd-input usd-text ${errors.table_name ? 'border-red-500' : ''}`}
              />
              {errors.table_name && (
                <p className="text-red-500 text-sm mt-1">{errors.table_name}</p>
              )}
              <p className="text-sm usd-muted mt-1">
                Internal name (lowercase letters, numbers, underscores only)
              </p>
            </div>

            <div>
              <label className="block font-semibold mb-2">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Vinyl Records"
                value={tableDef.display_name}
                onChange={(e) => setTableDef({ ...tableDef, display_name: e.target.value })}
                className={`w-full p-2 border rounded usd-input usd-text ${errors.display_name ? 'border-red-500' : ''}`}
              />
              {errors.display_name && (
                <p className="text-red-500 text-sm mt-1">{errors.display_name}</p>
              )}
              <p className="text-sm usd-muted mt-1">Friendly name shown in the UI</p>
            </div>

            <div>
              <label className="block font-semibold mb-2">Description</label>
              <textarea
                placeholder="Brief description of this collection"
                value={tableDef.description}
                onChange={(e) => setTableDef({ ...tableDef, description: e.target.value })}
                className="w-full p-2 border rounded usd-input usd-text"
                rows={3}
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Icon</label>
              <input
                type="text"
                placeholder="e.g., MdAlbum, GiVinylRecord"
                value={tableDef.icon}
                onChange={(e) => setTableDef({ ...tableDef, icon: e.target.value })}
                className="w-full p-2 border rounded usd-input usd-text"
              />
              <p className="text-sm usd-muted mt-1">
                Icon name from react-icons (optional)
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tableDef.is_shared}
                  onChange={(e) => setTableDef({ ...tableDef, is_shared: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="font-semibold">Make this table public (shared with all users)</span>
              </label>
              <p className="text-sm usd-muted mt-1 ml-6">
                If unchecked, only you will be able to access this table
              </p>
            </div>
          </div>

          <div className="flex justify-between gap-4 mt-6">
            <button
              onClick={() => setStep(0)}
              className="usd-btn-copper px-6 py-2 rounded"
            >
              Back to Templates
            </button>
            <button
              onClick={handleNextToFields}
              className="usd-btn-green px-6 py-2 rounded"
            >
              Next: Add Fields
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Field builder */}
      {step === 2 && (
        <FieldBuilder
          fields={fields}
          setFields={setFields}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {/* Step 3: Preview and confirm */}
      {step === 3 && (
        <TablePreview
          tableDef={tableDef}
          fields={fields}
          onCreate={handleCreateTable}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  );
};

export default TableDesigner;
