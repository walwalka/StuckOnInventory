import React, { useState } from 'react';
import { MdCheckCircle } from 'react-icons/md';

const TablePreview = ({ tableDef, fields, onCreate, onBack }) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    await onCreate();
    // onCreate handles navigation, so we don't need to setIsCreating(false)
  };

  return (
    <div className="usd-panel p-6">
      <h2 className="text-2xl mb-6">Review Your Table</h2>

      {/* Table Information */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 usd-text-green">Table Information</h3>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="font-semibold">Table Name:</div>
            <div className="col-span-2 usd-muted">{tableDef.table_name}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-semibold">Display Name:</div>
            <div className="col-span-2 usd-muted">{tableDef.display_name}</div>
          </div>
          {tableDef.description && (
            <div className="grid grid-cols-3 gap-4">
              <div className="font-semibold">Description:</div>
              <div className="col-span-2 usd-muted">{tableDef.description}</div>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div className="font-semibold">Icon:</div>
            <div className="col-span-2 usd-muted">{tableDef.icon}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="font-semibold">Visibility:</div>
            <div className="col-span-2 usd-muted">
              {tableDef.is_shared ? (
                <span className="text-green-600">Public (Shared with all users)</span>
              ) : (
                <span className="text-blue-600">Private (Only you)</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fields Preview */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3 usd-text-green">Fields ({fields.length})</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="usd-panel">
              <tr>
                <th className="border px-4 py-2 text-left">#</th>
                <th className="border px-4 py-2 text-left">Label</th>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Type</th>
                <th className="border px-4 py-2 text-center">Required</th>
                <th className="border px-4 py-2 text-center">In Table</th>
                <th className="border px-4 py-2 text-center">Mobile</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{index + 1}</td>
                  <td className="border px-4 py-2 font-semibold">{field.field_label}</td>
                  <td className="border px-4 py-2 usd-muted">{field.field_name}</td>
                  <td className="border px-4 py-2">
                    <span className="px-2 py-1 usd-btn-green rounded text-sm">
                      {field.field_type}
                    </span>
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {field.is_required && (
                      <MdCheckCircle className="inline text-green-600" />
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {field.show_in_table && (
                      <MdCheckCircle className="inline text-green-600" />
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {field.show_in_mobile && (
                      <MdCheckCircle className="inline text-green-600" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standard Fields Note */}
      <div className="mb-6 p-4 usd-panel border usd-border-green rounded">
        <h4 className="font-semibold mb-2">Automatically Included Fields:</h4>
        <p className="text-sm usd-muted">
          Your table will also include these standard fields: <strong>ID</strong>, <strong>Created By</strong>,{' '}
          <strong>Quantity</strong>, <strong>Date Added</strong>, <strong>QR Code</strong>, and{' '}
          <strong>Images (3)</strong>.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isCreating}
          className="usd-btn-copper px-6 py-2 rounded disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="usd-btn-green px-6 py-2 rounded disabled:opacity-50 flex items-center gap-2"
        >
          {isCreating ? 'Creating...' : 'Create Table'}
        </button>
      </div>
    </div>
  );
};

export default TablePreview;
