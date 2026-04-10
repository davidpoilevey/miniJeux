import { useState, useEffect } from 'react';

export const usePreloadedImages = (imageSources) => {
  const [images, setImages] = useState({});

  useEffect(() => {
    const loaded = {};
    let remaining = Object.keys(imageSources).length;

    Object.entries(imageSources).forEach(([key, src]) => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        loaded[key] = img;
        remaining--;
        if (remaining === 0) {
          setImages(loaded);
        }
      };
      img.onerror = () => {
        console.error(`Erreur chargement image: ${src}`);
        remaining--;
        if (remaining === 0) {
          setImages(loaded);
        }
      };
    });
  }, [imageSources]);

  return images;
};
