// DoomLike : un FPS en raycasting, façon 1993. Ce fichier assemble le tout :
// la boucle de jeu, les images, les sons, et le menu quand la souris n'est pas capturée.
// Le reste est rangé à côté : map, monsters, weapons, combat, game (la logique) ;
// render, weaponView, hud (le dessin) ; crosshairs, save, CrosshairShop, MenuOverlay (la boutique et le menu).
import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { soundManager, soundMap } from '../rpg/sons/SoundManager';
import texturePierre from '../dungeon/texturepierre.png';
import { useGifSprites } from '../dungeon/gifSprite';
import { H, W } from './constants';
import { CURSOR_IMAGES } from './crosshairs';
import { newGame, update } from './game';
import { MenuOverlay } from './MenuOverlay';
import { GIFS } from './monsters';
import { render } from './render';
import { loadSave, storeSave } from './save';
import { useControls } from './useControls';
import { useImage, useImageSprites } from './useImages';
import { WEAPON_IMAGES } from './weapons';

const DoomLike = () => {
  const canvasRef = useRef(null);
  const saveRef = useRef(null);
  if (!saveRef.current) saveRef.current = loadSave();
  const gameRef = useRef(null);
  if (!gameRef.current) gameRef.current = newGame(saveRef.current);
  const [, setShopTick] = useState(0); // la sauvegarde vit dans une ref : on force juste le rafraîchissement
  const [locked, setLocked] = useState(false);
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState('play');
  const tex = useImage(texturePierre);
  const sprites = useGifSprites(GIFS);
  const weaponSprites = useImageSprites(WEAPON_IMAGES);
  const cursors = useImageSprites(CURSOR_IMAGES);
  const assets = useRef({});
  assets.current = { tex, sprites, weaponSprites, cursors };

  useEffect(() => {
    soundManager.loadSounds({
      punch: soundMap.punch, explosion: soundMap.explosion, explosion2: soundMap.explosion2, coupVide: soundMap.coupVide,
      fire: soundMap.fire, slash: soundMap.slash, levelUp: soundMap.levelUp, metalImpact: soundMap.metalImpact,
    });
  }, []);

  // la boucle : requestAnimationFrame (calé sur l'écran) plutôt que setInterval, un FPS a besoin de ses 60 images/s
  useEffect(() => {
    const canvas = canvasRef.current;
    const c = canvas.getContext('2d');
    let raf;
    let last = performance.now();
    const loop = (t) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const g = gameRef.current;
      if (document.pointerLockElement === canvas && g.status === 'play') {
        update(g, dt, t);
        if (g.status !== 'play') {
          setStatus(g.status);
          document.exitPointerLock();
        }
      }
      render(c, g, assets.current, t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useControls(canvasRef, gameRef, setLocked);

  const start = () => {
    if (status !== 'play') {
      gameRef.current = newGame(saveRef.current);
      setStatus('play');
    }
    setStarted(true);
    // juste après un Échap, le navigateur refuse la capture une petite seconde : on réessaiera au prochain clic
    canvasRef.current.requestPointerLock()?.catch?.(() => {});
  };

  // clic dans la boutique : on achète si ce n'est pas encore à nous (et qu'on a de quoi), puis on équipe
  const pickCrosshair = (x) => {
    const save = saveRef.current;
    if (!save.owned.includes(x.id)) {
      if (save.money < x.price) return;
      save.money -= x.price;
      save.owned.push(x.id);
      soundManager.play('levelUp');
    }
    save.crosshair = x.id;
    storeSave(save);
    setShopTick((n) => n + 1);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, bgcolor: '#000', minHeight: '100%' }}>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 1120, border: '4px solid #555' }}>
        <canvas ref={canvasRef} width={W} height={H} style={{ width: '100%', display: 'block', imageRendering: 'pixelated' }} />
        {!locked && (
          <MenuOverlay status={status} started={started} earned={gameRef.current.earned} save={saveRef.current}
            onPick={pickCrosshair} onStart={start} />
        )}
      </Box>
    </Box>
  );
};

export default DoomLike;
