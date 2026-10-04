// Clavier + souris capturée (Pointer Lock) : la souris tourne la tête, le clic tire, Échap met en pause
import { useEffect } from 'react';
import { F, MAX_PITCH, MOUSE_SPEED } from './constants';
import { WEAPONS } from './weapons';

export const useControls = (canvasRef, gameRef, setLocked) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    const isLocked = () => document.pointerLockElement === canvas;
    const g = () => gameRef.current;
    // molette : arme suivante (ou précédente) parmi celles qu'on a ramassées
    const cycleWeapon = (dir) => {
      let i = g().weapon;
      do i = (i + dir + WEAPONS.length) % WEAPONS.length; while (!g().owned[i]);
      g().weapon = i;
    };
    const onLockChange = () => {
      setLocked(isLocked());
      g().keys = {};
      g().firing = false;
    };
    const onMove = (e) => {
      if (!isLocked()) return;
      const p = g().player;
      p.a += e.movementX * MOUSE_SPEED;
      // en haut / en bas : même sensibilité qu'à l'horizontale (F pixels d'horizon ≈ 1 radian)
      p.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, p.pitch - e.movementY * MOUSE_SPEED * F));
    };
    const onDown = (e) => { if (isLocked() && e.button === 0) g().firing = true; };
    const onUp = (e) => { if (e.button === 0) g().firing = false; };
    const onWheel = (e) => {
      if (!isLocked()) return;
      e.preventDefault();
      if (e.deltaY) cycleWeapon(Math.sign(e.deltaY));
    };
    const onKeyDown = (e) => {
      if (!isLocked()) return;
      const n = /^Digit(\d)$/.exec(e.code);
      if (n && g().owned[n[1] - 1]) g().weapon = n[1] - 1;
      g().keys[e.code] = true;
      e.preventDefault();
    };
    const onKeyUp = (e) => { g().keys[e.code] = false; };
    document.addEventListener('pointerlockchange', onLockChange);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      if (isLocked()) document.exitPointerLock();
      document.removeEventListener('pointerlockchange', onLockChange);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [canvasRef, gameRef, setLocked]); // des refs et un setter : stables, l'effet ne tourne qu'une fois
};
