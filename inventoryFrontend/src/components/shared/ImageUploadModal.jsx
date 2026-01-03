import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { MdDelete } from 'react-icons/md';
import LazyImage from './LazyImage';
import GenericModal from './GenericModal';
import heic2any from 'heic2any';

const ImageUploadModal = ({ isOpen, onClose, tableName, itemId, existingImages = {}, onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Debug logging
  React.useEffect(() => {
    console.log('[ImageUploadModal] Props changed:', {
      isOpen,
      tableName,
      itemId,
      existingImages
    });
  }, [isOpen, tableName, itemId, existingImages]);

  // Store refs to track preview data URLs (no cleanup needed for data URLs)
  const previewUrlsRef = React.useRef([]);

  const handleFileSelect = (e) => {
    console.log('File select triggered, files:', e.target.files);

    const newFiles = Array.from(e.target.files);
    console.log('New files array:', newFiles);

    // Validate files are images
    const validFiles = newFiles.filter(file => {
      const isImage = file.type.startsWith('image/') ||
                      file.name.toLowerCase().endsWith('.heic') ||
                      file.name.toLowerCase().endsWith('.heif');
      if (!isImage) {
        console.warn('Skipping non-image file:', file.name);
      }
      return isImage;
    });

    console.log('Valid image files:', validFiles);

    const combined = [...selectedFiles, ...validFiles];
    const limitedFiles = combined.slice(0, 3); // Limit to 3 files total
    setSelectedFiles(limitedFiles);

    // Create preview URLs, converting HEIC to JPEG if needed
    const previewPromises = limitedFiles.map(async (file, idx) => {
      try {
        let fileToRead = file;

        // Check if file is HEIC/HEIF format
        const isHEIC = file.type === 'image/heic' ||
                       file.type === 'image/heif' ||
                       file.name.toLowerCase().endsWith('.heic') ||
                       file.name.toLowerCase().endsWith('.heif');

        if (isHEIC) {
          console.log(`Converting HEIC file ${idx} to JPEG:`, file.name);
          try {
            // Convert HEIC to JPEG blob
            const convertedBlob = await heic2any({
              blob: file,
              toType: 'image/jpeg',
              quality: 0.9
            });

            // heic2any might return an array of blobs for multi-image HEICs
            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            fileToRead = blob;
            console.log(`HEIC conversion successful for file ${idx}`);
          } catch (conversionError) {
            console.error(`HEIC conversion failed for file ${idx}:`, conversionError);
            // Fall back to original file
            fileToRead = file;
          }
        }

        // Read file as data URL
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            console.log(`FileReader loaded file ${idx}:`, file.name, 'Data URL length:', e.target.result.length);
            resolve(e.target.result);
          };
          reader.onerror = (error) => {
            console.error(`FileReader failed for file ${idx}:`, file.name, error);
            reject(error);
          };
          reader.readAsDataURL(fileToRead);
        });
      } catch (error) {
        console.error(`Error processing file ${idx}:`, error);
        throw error;
      }
    });

    // Wait for all files to be read
    Promise.all(previewPromises)
      .then(previewUrls => {
        console.log('All preview data URLs created:', previewUrls.length);
        // Store URLs in ref for cleanup (though data URLs don't need revoking)
        previewUrlsRef.current = previewUrls;
        setPreviews(previewUrls);
        console.log('State updated with previews, length:', previewUrls.length);
      })
      .catch(error => {
        console.error('Failed to create preview URLs:', error);
      });

    // Clear the input so selecting the same file again triggers onChange
    e.target.value = '';
  };

  const removeFile = (indexToRemove) => {
    console.log('Removing file at index:', indexToRemove);

    const updated = selectedFiles.filter((_, idx) => idx !== indexToRemove);
    setSelectedFiles(updated);

    const updatedPreviews = previews.filter((_, idx) => idx !== indexToRemove);
    previewUrlsRef.current = updatedPreviews;
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
      console.log('[ImageUploadModal] Uploading to:', `/entities/${tableName}/upload/${itemId}`);
      const response = await api.post(`/entities/${tableName}/upload/${itemId}`, formData);
      console.log('[ImageUploadModal] Upload response:', response.data);

      // Clear preview data (no need to revoke data URLs)
      previewUrlsRef.current = [];
      setSelectedFiles([]);
      setPreviews([]);

      if (onUploadSuccess) {
        console.log('[ImageUploadModal] Calling onUploadSuccess callback');
        onUploadSuccess();
      }
    } catch (error) {
      console.error('[ImageUploadModal] Error uploading images:', error);
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
            <label className="block font-semibold mb-2 usd-text-green">
              Preview - New Images to Upload ({previews.length} file{previews.length !== 1 ? 's' : ''})
            </label>
            <div className="grid grid-cols-3 gap-3">
              {previews.map((preview, index) => {
                console.log(`Rendering preview ${index}:`, preview);
                return (
                  <div key={index} className="relative">
                    <div className="relative w-full h-32 border-2 border-green-500 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log(`Image ${index} loaded successfully from:`, preview)}
                        onError={(e) => console.error(`Image ${index} failed to load from:`, preview, 'Error:', e)}
                        style={{ pointerEvents: 'none' }}
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
                );
              })}
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
