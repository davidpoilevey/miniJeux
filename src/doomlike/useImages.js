// Chargement des images (PNG) et recadrage automatique sur leurs pixels visibles
import { useEffect, useState } from 'react';

export const useImage = (src) => {
  const [img, setImg] = useState(null);
  useEffect(() => {
    const i = new window.Image();
    i.onload = () => setImg(i);
    i.src = src;
  }, [src]);
  return img;
};

// boîte englobante des pixels visibles : les PNG ont souvent beaucoup de vide autour de l'objet
export const opaqueBox = (img) => {
  const cv = document.createElement('canvas');
  cv.width = img.width;
  cv.height = img.height;
  const cx = cv.getContext('2d');
  cx.drawImage(img, 0, 0);
  const { data } = cx.getImageData(0, 0, img.width, img.height);
  let x0 = img.width, y0 = img.height, x1 = 0, y1 = 0;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (data[(y * img.width + x) * 4 + 3] > 20) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return { x: x0, y: y0, w: Math.max(1, x1 - x0 + 1), h: Math.max(1, y1 - y0 + 1) };
};

export const useImageSprites = (sources) => {
  const [sprites, setSprites] = useState({});
  useEffect(() => {
    Object.entries(sources).forEach(([key, src]) => {
      const img = new window.Image();
      img.onload = () => setSprites((prev) => ({ ...prev, [key]: { img, crop: opaqueBox(img) } }));
      img.src = src;
    });
  }, []);
  return sprites;
};
