import { useEffect, useState } from 'react';
import { parseGIF, decompressFrames } from 'gifuct-js';

// Décode un GIF animé en une liste d'images (canvas) dessinables dans un canvas,
// recadrées sur la zone réellement occupée par le personnage (union de toutes les frames).
const loadGifSprite = async (src) => {
  const buffer = await fetch(src).then((r) => r.arrayBuffer());
  const gif = parseGIF(buffer);
  const frames = decompressFrames(gif, true);
  const { width, height } = gif.lsd;

  const screen = document.createElement('canvas');
  screen.width = width;
  screen.height = height;
  const ctx = screen.getContext('2d');
  const patch = document.createElement('canvas');
  const patchCtx = patch.getContext('2d');

  const images = [];
  for (const frame of frames) {
    const { left, top, width: pw, height: ph } = frame.dims;
    const saved = frame.disposalType === 3 ? ctx.getImageData(0, 0, width, height) : null;
    patch.width = pw;
    patch.height = ph;
    patchCtx.putImageData(new ImageData(frame.patch, pw, ph), 0, 0);
    ctx.drawImage(patch, left, top);

    const snap = document.createElement('canvas');
    snap.width = width;
    snap.height = height;
    snap.getContext('2d').drawImage(screen, 0, 0);
    images.push(snap);

    if (frame.disposalType === 2) ctx.clearRect(left, top, pw, ph);
    if (saved) ctx.putImageData(saved, 0, 0);
  }

  // boîte englobante des pixels non transparents, toutes frames confondues
  let x0 = width, y0 = height, x1 = 0, y1 = 0;
  for (const img of images) {
    const data = img.getContext('2d').getImageData(0, 0, width, height).data;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 20) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
  }

  const delays = frames.map((f) => f.delay);
  return {
    images,
    delays,
    total: delays.reduce((a, b) => a + b, 0),
    crop: { x: x0, y: y0, w: Math.max(1, x1 - x0 + 1), h: Math.max(1, y1 - y0 + 1) },
  };
};

// image courante de l'animation à l'instant t (ms)
export const gifFrame = (sprite, t) => {
  let r = t % sprite.total;
  for (let i = 0; i < sprite.delays.length; i++) {
    r -= sprite.delays[i];
    if (r < 0) return sprite.images[i];
  }
  return sprite.images[0];
};

export const useGifSprites = (sources) => {
  const [sprites, setSprites] = useState({});
  useEffect(() => {
    let alive = true;
    Object.entries(sources).forEach(([key, src]) =>
      loadGifSprite(src).then((s) => alive && setSprites((prev) => ({ ...prev, [key]: s })))
    );
    return () => { alive = false; };
  }, []);
  return sprites;
};
