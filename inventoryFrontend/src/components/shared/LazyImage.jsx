import React, { useState, useEffect, useRef } from 'react';

/**
 * Lazy loading image component with loading placeholder
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text
 * @param {string} className - CSS classes
 * @param {boolean} eager - If true, skip lazy loading (default: false)
 * @param {string} placeholder - Placeholder color or image while loading
 */
const LazyImage = ({
  src,
  alt = '',
  className = '',
  eager = false,
  placeholder = 'bg-gray-200 dark:bg-gray-700',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (eager) {
      setIsInView(true);
      return;
    }

    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [eager]);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e) => {
    setHasError(true);
    if (onError) onError(e);
  };

  // Determine image source based on browser support
  const getOptimizedSrc = () => {
    if (!src) return null;

    // Check for WebP support (most modern browsers)
    const supportsWebP = document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0;

    // If source has a WebP version available and browser supports it, use WebP
    if (supportsWebP && src.endsWith('.jpg')) {
      return src.replace('.jpg', '.webp');
    }

    return src;
  };

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Placeholder - shown while loading or if not in view */}
      {!isLoaded && !hasError && (
        <div
          className={`absolute inset-0 ${placeholder} animate-pulse rounded`}
          aria-hidden="true"
        />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Failed to load
          </span>
        </div>
      )}

      {/* Actual image - only render when in view */}
      {isInView && src && (
        <picture>
          {/* WebP source for browsers that support it */}
          {src.endsWith('.jpg') && (
            <source
              srcSet={src.replace('.jpg', '.webp')}
              type="image/webp"
            />
          )}

          {/* Fallback to original format */}
          <img
            src={src}
            alt={alt}
            className={`${className} transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            {...props}
          />
        </picture>
      )}
    </div>
  );
};

export default LazyImage;
