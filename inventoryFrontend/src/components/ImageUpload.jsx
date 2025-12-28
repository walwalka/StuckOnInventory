import React, { useState } from 'react';
import axios from 'axios';
import { AiOutlineCloudUpload } from 'react-icons/ai';

const ImageUpload = ({ coinId, existingImages = {}, onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    const combined = [...selectedFiles, ...newFiles];
    const limitedFiles = combined.slice(0, 3); // Limit to 3 files total
    setSelectedFiles(limitedFiles);

    // Create preview URLs for all files
    const previewUrls = limitedFiles.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
    
    // Clear the input so selecting the same file again triggers onChange
    e.target.value = '';
  };

  const removeFile = (indexToRemove) => {
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
      const response = await axios.post(`/api/coins/upload/${coinId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSelectedFiles([]);
      setPreviews([]);
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      const serverMsg = error?.response?.data?.error;
      setErrorMsg(serverMsg || 'Failed to upload images. Allowed: JPEG, PNG, GIF, HEIC. Max 10MB each, max 3 files.');
    } finally {
      setUploading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${window.location.origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium usd-muted">
          Coin Images (up to 3)
        </label>
        
        {/* Existing Images */}
        {(existingImages.image1 || existingImages.image2 || existingImages.image3) && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {['image1','image2','image3'].map((slot, idx) => (
              existingImages[slot] ? (
                <div key={slot} className="flex flex-col items-center space-y-1">
                  <img 
                    src={getImageUrl(existingImages[slot])} 
                    alt={`Coin ${idx + 1}`} 
                    className="w-full h-24 object-cover rounded border-2 usd-border-silver"
                  />
                  <button
                    type="button"
                    className="text-xs px-2 py-1 usd-btn-copper rounded"
                    onClick={async () => {
                      try {
                        await axios.delete(`/api/coins/image/${coinId}/${slot}`);
                        // Refresh after delete
                        if (onUploadSuccess) {
                          // Fetch updated coin
                          const res = await axios.get(`/api/coins/${coinId}`);
                          onUploadSuccess(res.data);
                        }
                      } catch (err) {
                        console.error('Delete failed', err);
                        alert('Failed to delete image');
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <div key={slot} />
              )
            ))}
          </div>
        )}

        {/* File Input */}
        <div className="flex items-center space-x-2">
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
        <p className="text-xs usd-muted">JPEG, PNG, GIF, HEIC up to 10MB each. Max 3 files. Click multiple times to add more.</p>

        {errorMsg && (
          <div className="text-sm text-red-600">{errorMsg}</div>
        )}

        {/* Previews */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
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

        {/* Upload Button */}
        {selectedFiles.length > 0 && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 usd-btn-green rounded disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
