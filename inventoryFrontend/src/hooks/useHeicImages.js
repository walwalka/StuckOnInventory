import { useState, useEffect } from 'react';
import heic2any from 'heic2any';

/**
 * Custom hook to handle HEIC image conversion and loading
 * @param {Array} items - Array of items with image fields
 * @param {string} imageField - Name of the image field to process (default: 'image1')
 * @param {number} quality - JPEG conversion quality 0-1 (default: 0.7)
 * @returns {Object} { imageMap, loading }
 */
export const useHeicImages = (items = [], imageField = 'image1', quality = 0.7) => {
  const [imageMap, setImageMap] = useState({});
  const [loading, setLoading] = useState(true);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${window.location.origin}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    if (!items || items.length === 0) {
      setImageMap({});
      setLoading(false);
      return;
    }

    let revokeList = [];

    const loadImages = async () => {
      setLoading(true);

      const entries = await Promise.all(items.map(async (item) => {
        const path = item[imageField];
        if (!path) return [item.id, null];

        const isHeic = /\.hei[c|f](?:$|\?)/i.test(path);
        const url = getImageUrl(path);

        if (!isHeic) return [item.id, url];

        try {
          const res = await fetch(url);
          const blob = await res.blob();
          const converted = await heic2any({
            blob,
            toType: 'image/jpeg',
            quality,
          });
          const outBlob = Array.isArray(converted) ? converted[0] : converted;
          const objUrl = URL.createObjectURL(outBlob);
          revokeList.push(objUrl);
          return [item.id, objUrl];
        } catch (err) {
          console.warn(`HEIC conversion failed for ${imageField}:`, err);
          return [item.id, url];
        }
      }));

      const mapped = entries.reduce((acc, [id, url]) => {
        acc[id] = url;
        return acc;
      }, {});

      setImageMap(mapped);
      setLoading(false);
    };

    loadImages();

    return () => {
      revokeList.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [items, imageField, quality]);

  return { imageMap, loading };
};
