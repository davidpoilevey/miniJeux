// ─────────────────────────────────────────────────────────────
// SPRITE ENGINE — chargement des images + drawSprite
// ─────────────────────────────────────────────────────────────

import { SHEETS, SPRITE_MAP } from './spriteConfig';

const imageCache = new Map(); // sheetKey → HTMLImageElement

// Charge toutes les images. Appelle onProgress(loaded, total) à chaque image,
// puis onDone() quand tout est prêt.
export function loadAllSprites(onDone, onProgress) {
  const keys = Object.keys(SHEETS);
  let loaded = 0;

  for (const key of keys) {
    if (imageCache.has(key)) {
      loaded++;
      if (loaded === keys.length) onDone?.();
      continue;
    }
    const img = new Image();
    // eslint-disable-next-line no-loop-func
    img.onload = () => {
      loaded++;
      onProgress?.(loaded, keys.length);
      if (loaded === keys.length) onDone?.();
    };
    // eslint-disable-next-line no-loop-func
    img.onerror = () => { loaded++; if (loaded === keys.length) onDone?.(); };
    img.src = SHEETS[key].src;
    imageCache.set(key, img);
  }
}

// Retourne l'image chargée pour une sheet (null si pas encore prête)
export function getSheetImage(sheetKey) {
  return imageCache.get(sheetKey) ?? null;
}

// Calcule le rect source { sx, sy, sw, sh } d'un sprite dans son tileset.
// spriteRef : { sheet, col, row }  pour grid
//             { sheet, sprite }    pour atlas
// Retourne null si introuvable.
export function getSpriteRect(spriteRef) {
  const sheet = SHEETS[spriteRef.sheet];
  const img   = imageCache.get(spriteRef.sheet);
  if (!sheet || !img?.complete || img.naturalWidth === 0) return null;

  if (sheet.mode === 'grid') {
    const tileW = img.naturalWidth  / sheet.cols;
    const tileH = img.naturalHeight / sheet.rows;
    return {
      sx: spriteRef.col * tileW,
      sy: spriteRef.row * tileH,
      sw: tileW,
      sh: tileH,
    };
  }

  if (sheet.mode === 'atlas') {
    // Vérifie d'abord les overrides localStorage (calibration en cours)
    const overrides = getCalibrationOverrides(spriteRef.sheet);
    const rect = overrides?.[spriteRef.sprite] ?? sheet.sprites?.[spriteRef.sprite];
    if (!rect) return null;
    return { sx: rect.x, sy: rect.y, sw: rect.w, sh: rect.h };
  }

  return null;
}

// Dessine un sprite sur un canvas 2D context, mis à l'échelle dans (dx, dy, dw, dh).
// typeKey : clé de SPRITE_MAP (ex: 'arbre', 'fer', 'maison')
// Retourne true si le sprite a été dessiné, false si introuvable.
export function drawSprite(ctx, typeKey, dx, dy, dw, dh) {
  const ref  = SPRITE_MAP[typeKey];
  if (!ref) return false;
  const img  = imageCache.get(ref.sheet);
  if (!img?.complete || img.naturalWidth === 0) return false;
  const rect = getSpriteRect(ref);
  if (!rect) return false;

  ctx.drawImage(img, rect.sx, rect.sy, rect.sw, rect.sh, dx, dy, dw, dh);
  return true;
}

// ── Overrides de calibration (stockés en localStorage) ──────
const LS_KEY = 'wb_sprite_calibration';

export function getCalibrationData() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '{}'); }
  catch { return {}; }
}

export function getCalibrationOverrides(sheetKey) {
  return getCalibrationData()[sheetKey] ?? null;
}

export function saveCalibrationData(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}
