import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import GenericModal from '../shared/GenericModal';
import Spinner from '../Spinner';
import moment from 'moment';

const DynamicShow = ({ tableName, config }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['entity', tableName, id],
    queryFn: async () => {
      const response = await api.get(`/entities/${tableName}/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  const handleClose = () => {
    navigate(`/${tableName}`);
  };

  const formatValue = (field, value) => {
    if (value === null || value === undefined) return '-';

    if (field.field_type === 'currency') {
      return `$${parseFloat(value).toFixed(2)}`;
    }

    if (field.field_type === 'date') {
      return moment.utc(value).format('MM/DD/YYYY');
    }

    if (field.field_type === 'textarea') {
      return value;
    }

    return value.toString();
  };

  return (
    <GenericModal
      isOpen={true}
      onClose={handleClose}
      title={`${config.table.display_name} Details`}
    >
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Error loading item details</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Display images if present */}
          {(item.image1 || item.image2 || item.image3) && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {item.image1 && (
                <img
                  src={item.image1}
                  alt="Image 1"
                  className="w-full h-32 object-cover rounded"
                />
              )}
              {item.image2 && (
                <img
                  src={item.image2}
                  alt="Image 2"
                  className="w-full h-32 object-cover rounded"
                />
              )}
              {item.image3 && (
                <img
                  src={item.image3}
                  alt="Image 3"
                  className="w-full h-32 object-cover rounded"
                />
              )}
            </div>
          )}

          {/* Display all fields */}
          {config.formFields.map((field) => (
            <div key={field.name} className="border-b pb-2">
              <label className="font-semibold usd-text-green">{field.label}:</label>
              <div className="usd-muted mt-1">
                {formatValue(field, item[field.name])}
              </div>
            </div>
          ))}

          {/* Display metadata */}
          <div className="border-b pb-2">
            <label className="font-semibold usd-text-green">Quantity:</label>
            <div className="usd-muted mt-1">{item.quantity || 1}</div>
          </div>

          <div className="border-b pb-2">
            <label className="font-semibold usd-text-green">Date Added:</label>
            <div className="usd-muted mt-1">
              {item.added_date ? moment.utc(item.added_date).format('MM/DD/YYYY') : '-'}
            </div>
          </div>

          {/* Display QR code if present */}
          {item.qr_code && (
            <div className="pt-4">
              <label className="font-semibold usd-text-green">QR Code:</label>
              <div className="mt-2">
                <img
                  src={item.qr_code}
                  alt="QR Code"
                  className="w-32 h-32"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </GenericModal>
  );
};

export default DynamicShow;
