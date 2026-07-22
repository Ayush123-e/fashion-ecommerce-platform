import React, { useState, useEffect } from 'react';

const FALLBACK_IMAGE_URL = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80';

const ProductImage = ({ src, alt, className, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE_URL);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(FALLBACK_IMAGE_URL);
      setHasError(true);
    }
  };

  // Update image source if prop changes
  useEffect(() => {
    setImgSrc(src || FALLBACK_IMAGE_URL);
    setHasError(false);
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default ProductImage;
