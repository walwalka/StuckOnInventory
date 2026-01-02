import React, { useState } from 'react';
import { MdAdd, MdDelete, MdArrowUpward, MdArrowDownward } from 'react-icons/md';

const FieldBuilder = ({ fields, setFields, onNext, onBack }) => {
  const [currentField, setCurrentField] = useState({
    field_name: '',
    field_label: '',
    field_type: 'text',
    is_required: false,
    placeholder: '',
    options: [],
    show_in_table: true,
    show_in_mobile: true,
    is_bold: false,
    help_text: ''
  });

  const [errors, setErrors] = useState({});

  const validateField = () => {
    const newErrors = {};

    if (!currentField.field_name) {
      newErrors.field_name = 'Field name is required';
    } else if (!/^[a-z][a-z0-9_]*$/.test(currentField.field_name)) {
      newErrors.field_name = 'Field name must start with a lowercase letter and contain only lowercase letters, numbers, and underscores';
    } else if (fields.some(f => f.field_name === currentField.field_name)) {
      newErrors.field_name = 'Field name must be unique';
    }

    if (!currentField.field_label) {
      newErrors.field_label = 'Field label is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addField = () => {
    if (!validateField()) {
      return;
    }

    setFields([...fields, { ...currentField, display_order: fields.length }]);
    setCurrentField({
      field_name: '',
      field_label: '',
      field_type: 'text',
      is_required: false,
      placeholder: '',
      options: [],
      show_in_table: true,
      show_in_mobile: true,
      is_bold: false,
      help_text: ''
    });
    setErrors({});
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const moveField = (index, direction) => {
    const newFields = [...fields];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newFields.length) return;

    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    newFields.forEach((f, i) => f.display_order = i);

    setFields(newFields);
  };

  return (
    <div className="usd-panel p-6">
      <h2 className="text-2xl mb-4">Add Fields</h2>

      {/* Current field form */}
      <div className="border-2 usd-border-green rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">New Field</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-2">
              Field Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., artist_name"
              value={currentField.field_name}
              onChange={(e) => setCurrentField({ ...currentField, field_name: e.target.value.toLowerCase() })}
              className={`w-full p-2 border rounded ${errors.field_name ? 'border-red-500' : ''}`}
            />
            {errors.field_name && (
              <p className="text-red-500 text-sm mt-1">{errors.field_name}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-2">
              Field Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Artist Name"
              value={currentField.field_label}
              onChange={(e) => setCurrentField({ ...currentField, field_label: e.target.value })}
              className={`w-full p-2 border rounded ${errors.field_label ? 'border-red-500' : ''}`}
            />
            {errors.field_label && (
              <p className="text-red-500 text-sm mt-1">{errors.field_label}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-2">Field Type</label>
            <select
              value={currentField.field_type}
              onChange={(e) => setCurrentField({ ...currentField, field_type: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="currency">Currency</option>
              <option value="select">Dropdown</option>
              <option value="textarea">Text Area</option>
              <option value="date">Date</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">Placeholder</label>
            <input
              type="text"
              placeholder="Placeholder text"
              value={currentField.placeholder}
              onChange={(e) => setCurrentField({ ...currentField, placeholder: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        {currentField.field_type === 'select' && (
          <div className="mt-4">
            <label className="block font-semibold mb-2">Dropdown Options (comma-separated)</label>
            <input
              type="text"
              placeholder="Option 1, Option 2, Option 3"
              onChange={(e) => {
                const options = e.target.value.split(',').map(opt => opt.trim()).filter(opt => opt);
                setCurrentField({ ...currentField, options });
              }}
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        <div className="mt-4">
          <label className="block font-semibold mb-2">Help Text</label>
          <input
            type="text"
            placeholder="Optional help text for this field"
            value={currentField.help_text}
            onChange={(e) => setCurrentField({ ...currentField, help_text: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex gap-6 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentField.is_required}
              onChange={(e) => setCurrentField({ ...currentField, is_required: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Required</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentField.show_in_table}
              onChange={(e) => setCurrentField({ ...currentField, show_in_table: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Show in Table</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentField.show_in_mobile}
              onChange={(e) => setCurrentField({ ...currentField, show_in_mobile: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Show on Mobile</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentField.is_bold}
              onChange={(e) => setCurrentField({ ...currentField, is_bold: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Bold</span>
          </label>
        </div>

        <button
          onClick={addField}
          className="mt-4 usd-btn-green px-4 py-2 rounded flex items-center gap-2"
        >
          <MdAdd className="text-xl" /> Add Field
        </button>
      </div>

      {/* Field list */}
      <div className="mb-6">
        <h3 className="text-xl mb-3">Fields ({fields.length})</h3>

        {fields.length === 0 ? (
          <div className="text-center py-8 usd-muted">
            No fields added yet. Add at least one field to continue.
          </div>
        ) : (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="font-semibold">
                    {field.field_label}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <div className="text-sm usd-muted">
                    {field.field_name} ({field.field_type})
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => moveField(index, -1)}
                    disabled={index === 0}
                    className="p-2 hover:bg-gray-200 rounded disabled:opacity-30"
                    title="Move Up"
                  >
                    <MdArrowUpward />
                  </button>
                  <button
                    onClick={() => moveField(index, 1)}
                    disabled={index === fields.length - 1}
                    className="p-2 hover:bg-gray-200 rounded disabled:opacity-30"
                    title="Move Down"
                  >
                    <MdArrowDownward />
                  </button>
                  <button
                    onClick={() => removeField(index)}
                    className="p-2 hover:bg-red-100 text-red-500 rounded"
                    title="Delete"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="usd-btn-copper px-6 py-2 rounded"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={fields.length === 0}
          className="usd-btn-green px-6 py-2 rounded disabled:opacity-50"
        >
          Next: Preview
        </button>
      </div>
    </div>
  );
};

export default FieldBuilder;
