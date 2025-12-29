import React, { useState, useEffect } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import Spinner from '../Spinner';
import heic2any from 'heic2any';

/**
 * GenericForm - Reusable form component for creating/editing entities
 *
 * @param {Array} fields - Field configuration array
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Submit handler
 * @param {Function} onFieldChange - Optional callback when field changes
 * @param {boolean} loading - Loading state
 * @param {boolean} enableImages - Enable image upload section
 * @param {string} submitLabel - Submit button label
 */
const GenericForm = ({
  fields = [],
  initialValues = {},
  onSubmit,
  onFieldChange,
  loading = false,
  enableImages = true,
  submitLabel = 'Save',
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});

  const handleChange = (fieldName, value) => {
    const newFormData = {
      ...formData,
      [fieldName]: value,
    };
    setFormData(newFormData);

    // Call optional change handler for field-specific logic
    if (onFieldChange) {
      onFieldChange(fieldName, value, newFormData, setFormData);
    }

    // Clear error for this field when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Cleanup preview URLs only on unmount (not on every preview change)
  useEffect(() => {
    return () => {
      // Only cleanup when component unmounts
      previews.forEach((url) => {
        if (url && typeof url === 'string') {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []); // Empty dependency array - only run on unmount

  const handleFileSelect = async (e) => {
    const newFiles = Array.from(e.target.files);
    const combined = [...selectedFiles, ...newFiles];
    const limitedFiles = combined.slice(0, 3);
    setSelectedFiles(limitedFiles);

    // Revoke old preview URLs before creating new ones
    previews.forEach((url) => {
      if (url && typeof url === 'string') {
        URL.revokeObjectURL(url);
      }
    });

    // Convert HEIC files and create preview URLs
    const previewUrls = await Promise.all(
      limitedFiles.map(async (file) => {
        const isHeic = file.type === 'image/heic' ||
                       file.type === 'image/heif' ||
                       file.name.toLowerCase().endsWith('.heic') ||
                       file.name.toLowerCase().endsWith('.heif');

        if (isHeic) {
          try {
            const convertedBlob = await heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.8,
            });
            return URL.createObjectURL(convertedBlob);
          } catch (error) {
            console.error('HEIC conversion failed:', error);
            return URL.createObjectURL(file); // Fallback to original
          }
        }

        return URL.createObjectURL(file);
      })
    );

    setPreviews(previewUrls);
    e.target.value = '';
  };

  const removeFile = (indexToRemove) => {
    const updated = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    setSelectedFiles(updated);

    // Revoke the URL being removed
    if (previews[indexToRemove]) {
      URL.revokeObjectURL(previews[indexToRemove]);
    }

    const updatedPreviews = previews.filter((_, idx) => idx !== indexToRemove);
    setPreviews(updatedPreviews);
  };

  const validateForm = () => {
    const newErrors = {};

    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }

      // Custom validation
      if (field.validate && formData[field.name]) {
        const validationError = field.validate(formData[field.name], formData);
        if (validationError) {
          newErrors[field.name] = validationError;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData, selectedFiles);
  };

  const renderField = (field) => {
    const commonClasses =
      'border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input';
    const errorClasses = errors[field.name]
      ? 'border-red-500 dark:border-red-500'
      : '';

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={field.type}
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`${commonClasses} ${errorClasses}`}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            disabled={field.disabled}
          />
        );

      case 'select':
        return (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`${commonClasses} ${errorClasses}`}
            disabled={field.disabled}
          >
            <option value="">
              {field.placeholder || 'Please Select a value'}
            </option>
            {field.options?.map((option, index) => (
              <option key={index} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`${commonClasses} ${errorClasses}`}
            rows={field.rows || 4}
            placeholder={field.placeholder}
            disabled={field.disabled}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={formData[field.name] || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            className={`${commonClasses} ${errorClasses}`}
            disabled={field.disabled}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {loading && <Spinner />}

      {fields.map((field, index) => (
        <div key={index} className="my-4">
          <label className="text-xl mr-4 usd-muted">
            {field.label} {field.required && '*'}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
          )}
          {field.helpText && (
            <p className="text-xs usd-muted mt-1">{field.helpText}</p>
          )}
        </div>
      ))}

      {enableImages && (
        <div className="my-4">
          <label className="text-xl mr-4 usd-muted">
            Images (Optional, up to 3)
          </label>
          <div className="flex items-center space-x-2 mt-2">
            <label className="flex items-center px-4 py-2 usd-btn-copper rounded cursor-pointer">
              <AiOutlineCloudUpload className="mr-2" size={20} />
              Select Images
              <input
                type="file"
                multiple
                accept="image/*,.heic,.heif"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <span className="text-sm usd-muted">
              {selectedFiles.length} file(s) selected
            </span>
          </div>
          <p className="text-xs usd-muted mt-1">
            JPEG, PNG, GIF, HEIC up to 10MB each.
          </p>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded border-2 usd-border-green"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 px-2 py-1 text-xs usd-btn-copper rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center mt-6 mb-4">
        <button
          type="submit"
          className="px-8 py-3 text-lg usd-btn-green rounded hover:opacity-90 disabled:opacity-50 min-w-[200px]"
          disabled={loading}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default GenericForm;
