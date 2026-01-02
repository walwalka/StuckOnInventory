import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { MdDelete } from 'react-icons/md';
import LazyImage from './LazyImage';
import GenericModal from './GenericModal';

const ImageUploadModal = ({ isOpen, onClose, tableName, itemId, existingImages = {}, onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileSelect = (e) => {
    // Revoke old preview URLs
    previews.forEach(url => URL.revokeObjectURL(url));

    const newFiles = Array.from(e.target.files);
    const combined = [...selectedFiles, ...newFiles];
    const limitedFiles = combined.slice(0, 3); // Limit to 3 files total
    setSelectedFiles(limitedFiles);

    // Create preview URLs for all files
    const previewUrls = limitedFiles.map(file => {
      const url = URL.createObjectURL(file);
      return url;
    });
    setPreviews(previewUrls);

    // Clear the input so selecting the same file again triggers onChange
    e.target.value = '';
  };

  const removeFile = (indexToRemove) => {
    // Revoke the URL for the removed file
    if (previews[indexToRemove]) {
      URL.revokeObjectURL(previews[indexToRemove]);
    }

    const updated = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    setSelectedFiles(updated);

    const updatedPreviews = previews.filter((_, idx) => idx !== indexToRemove);
    setPreviews(updatedPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setUploading(true);
    setErrorMsg('');
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      await api.post(`/entities/${tableName}/upload/${itemId}`, formData);

      setSelectedFiles([]);
      setPreviews([]);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      const serverMsg = error?.response?.data?.error;
      setErrorMsg(serverMsg || 'Failed to upload images. Allowed: JPEG, PNG, GIF, HEIC. Max 10MB each, max 3 files.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (slot) => {
    try {
      await api.delete(`/entities/${tableName}/image/${itemId}/${slot}`);
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete image');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${window.location.origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <GenericModal isOpen={isOpen} onClose={onClose} title="Manage Images">
      <div className="space-y-4">
        {/* Existing Images - Always show */}
        <div>
          <label className="block font-semibold mb-2 usd-text-green">Current Images</label>
          <div className="grid grid-cols-3 gap-3">
            {['image1', 'image2', 'image3'].map((slot, idx) => (
              existingImages[slot] ? (
                <div key={slot} className="flex flex-col items-center space-y-2">
                  <div className="relative w-full">
                    <LazyImage
                      src={getImageUrl(existingImages[slot])}
                      alt={`Image ${idx + 1}`}
                      className="w-full h-32 object-cover rounded border-2 usd-border-silver shadow-sm"
                    />
                  </div>
                  <button
                    type="button"
                    className="w-full text-xs px-3 py-1.5 usd-btn-copper rounded hover:opacity-90 transition"
                    onClick={() => handleDeleteImage(slot)}
                  >
                    Delete Image {idx + 1}
                  </button>
                </div>
              ) : (
                <div key={slot} className="flex flex-col items-center space-y-2">
                  <div className="w-full h-32 border-2 border-dashed usd-border rounded flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                    <span className="font-semibold">Slot {idx + 1}</span>
                    <span className="text-xs">Empty</span>
                  </div>
                  <div className="w-full h-7"></div> {/* Spacer to align with delete button */}
                </div>
              )
            ))}
          </div>
        </div>

        {/* File Selection */}
        <div>
          <label className="block font-semibold mb-2 usd-text-green">Upload New Images</label>
          <div className="flex items-center space-x-2 mb-2">
            <label className="flex items-center px-4 py-2 usd-btn-copper rounded cursor-pointer">
              <AiOutlineCloudUpload className="mr-2" size={20} />
              Select Images
              <input
                type="file"
                multiple
                accept="image/*,.heic,.heif"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <span className="text-sm usd-muted">
              {selectedFiles.length} file(s) selected
            </span>
          </div>
          <p className="text-xs usd-muted">JPEG, PNG, GIF, HEIC up to 10MB each. Max 3 files.</p>

          {errorMsg && (
            <div className="text-sm text-red-600 mt-2">{errorMsg}</div>
          )}
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div>
            <label className="block font-semibold mb-2 usd-text-green">Preview - New Images to Upload</label>
            <div className="grid grid-cols-3 gap-3">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div className="relative w-full h-32 border-2 border-green-500 rounded overflow-hidden">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Preview image failed to load:', preview);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full text-red-500 text-xs">Failed to load preview</div>';
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition shadow-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full px-4 py-2 usd-btn-green rounded disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        )}
      </div>
    </GenericModal>
  );
};

export default ImageUploadModal;
