import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Stage, Layer, Image as KImage, Circle, Line, Text, Rect } from 'react-konva';
import { Box, Button, Typography, Select, MenuItem, Chip } from '@mui/material';
import { useBirthday, LEVELS, BirthdayProvider } from './BirthdayContext';
import birthdayCake from './assets/birthdayCake.png';
import bAll from './assets/bougieAllumee.png';
import bEt from './assets/bougieEteinte.png';
import song from './assets/birthdaySong.mp3';
import ohhh from './assets/ohhh.mp3';
import yeahSound from './assets/yeah.mp3';
import { soundManager } from '../../rpg/sons/SoundManager';


export default function Birthday() {
  return (
    <BirthdayProvider>
      <BirthdayGame />
    </BirthdayProvider>
  );
}


export const CAKE_W = 380;
const CAKE_H = 220;
const CANDLE_W = 24;
export const CANDLE_H = 50;
const TARGET_R = 28;

const useImage = (src) => {
  const [img, setImg] = useState(null);
  useEffect(() => {
    const i = new window.Image();
    i.src = src;
    i.onload = () => setImg(i);
  }, [src]);
  return img;
};

 function BirthdayGame() {
  const { phase, level, levels, candles, startGame, blowCandle, endGame, setPhase } = useBirthday();
  const [selectedLevel, setSelectedLevel] = useState(LEVELS[4]); // 54 ans par défaut 😄
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [cakePos, setCakePos] = useState({ x: 400, y: 300 });
  const [blownCount, setBlownCount] = useState(0);
  const [breath, setBreath] = useState(100);
  const breathRef = useRef(100);

  const containerRef = useRef(null);
  const cakePosRef = useRef({ x: 400, y: 300 });
  const velRef = useRef({ vx: 2.5, vy: 1.8 });
  const candlesRef = useRef(candles);
  const animRef = useRef(null);
  const audioRef = useRef(null);

  const gateauImg    = useImage(birthdayCake);
  const allumeeImg   = useImage(bAll);
  const eteinteImg   = useImage(bEt);

  // Resize observer
  useEffect(() => {
    const check = () => {
      if (!containerRef.current) return;
      const { offsetWidth: width, offsetHeight: height } = containerRef.current;
      setStageSize({ width, height });
      cakePosRef.current = { x: width / 2, y: height / 2 };
      setCakePos({ x: width / 2, y: height / 2 });
    };
    check();
    soundManager.loadSounds({anniv:song, ohhh:ohhh, yeah:yeahSound});
    const ro = new ResizeObserver(check);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Enregistrement du son (une seule fois)
  useEffect(() => {
    soundManager.loadSounds({ anniv: song });
  }, []);

  // Sync candles ref
  useEffect(() => {
    candlesRef.current = candles;
    setBlownCount(candles.filter(c => !c.lit).length);
  }, [candles]);

  // Game loop
  useEffect(() => {
    if (phase !== 'playing') {
      cancelAnimationFrame(animRef.current);
      return;
    }
    const { width, height } = stageSize;
    // Vitesse augmente avec le nombre de bougies

    const baseSpeed = 1.2 + level.candles * 0.025;

    // Bornes : le gâteau doit pouvoir se décaler de ±CAKE_W/2 autour du centre
    // pour que chaque bougie puisse passer sur le viseur.
    // Sur grand écran on donne plus d'amplitude (×0.3 de la largeur).
    const roamX = Math.max(CAKE_W / 2 + 10, width * 0.3);
    const roamY = Math.max(CAKE_H + CANDLE_H + 10, height * 0.25);
    const minX = width / 2 - roamX;
    const maxX = width / 2 + roamX;
    const minY = Math.max(CANDLE_H + 20, height / 2 - roamY);
    const maxY = Math.min(height - 20, height / 2 + roamY / 2);

    // Attracteur fantôme : se promène sur tout le stage (closure vars, pas de ref React)
    const aSpeed = baseSpeed * 0.8;
    let ax = width / 2, ay = height / 2;
    let avx = aSpeed, avy = aSpeed * 0.65;

    // Le gâteau part au repos, l'attracteur va le tirer progressivement
    velRef.current = { vx: 0, vy: 0 };
    breathRef.current = 100;
    setBreath(100);

    const animate = () => {
      // 1. Déplace l'attracteur (rebond sur les bords)
      ax += avx;
      ay += avy;
      if (ax < minX || ax > maxX) {
        avx = -avx;
        avy += (Math.random() - 0.5) * aSpeed * 0.4; // légère variation verticale au rebond
        ax = Math.max(minX, Math.min(maxX, ax));
      }
      if (ay < minY || ay > maxY) {
        avy = -avy;
        avx += (Math.random() - 0.5) * aSpeed * 0.4;
        ay = Math.max(minY, Math.min(maxY, ay));
      }

      // 2. Ressort vers l'attracteur + amortissement → mouvement fluide et ample
      const { x, y } = cakePosRef.current;
      let { vx, vy } = velRef.current;
      vx += (ax - x) * 0.008;
      vy += (ay - y) * 0.008;
      vx *= 0.90;
      vy *= 0.90;

      // 3. Infime bruit pour le côté organique
      vx += (Math.random() - 0.5) * 0.8;
      vy += (Math.random() - 0.5) * 0.8;

      velRef.current = { vx, vy };
      const nx = x + vx;
      const ny = y + vy;
      cakePosRef.current = { x: nx, y: ny };
      setCakePos({ x: nx, y: ny });

      // Refill souffle : vide → plein en 2 secondes (120 frames @ 60fps)
      breathRef.current = Math.min(100, breathRef.current + 30 / 120);
      setBreath(breathRef.current);

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [phase, stageSize, level]);

  // Audio
  useEffect(() => {
    if (phase === 'playing') {
      const audio = soundManager.play('anniv');
      audioRef.current = audio;
      audio.onended = () => {
        if (candlesRef.current.some(c => c.lit)) endGame();
      };
    }
    return () => {
      soundManager.stop('anniv');
      audioRef.current = null;
    };
  }, [phase]);

  // Cible fixe = centre du stage
  const target = { x: stageSize.width / 2, y: stageSize.height / 2 };

  const handleClick = useCallback(() => {
    if (phase !== 'playing') return;
    if (breathRef.current < 20) return; // pas assez d'air pour souffler

    const cost = 20 + Math.random() * 30; // coûte 20–50% de souffle
    breathRef.current = Math.max(0, breathRef.current - cost);
    setBreath(breathRef.current);

    const { x: tx, y: ty } = target;
    const { x: cx, y: cy } = cakePosRef.current;

    candlesRef.current.forEach(candle => {
      if (!candle.lit) return;
      const wx = cx + candle.offsetX;
      const wy = cy + candle.offsetY;
      const dist = Math.sqrt((wx - tx) ** 2 + (wy - ty) ** 2);
      if (dist < TARGET_R + CANDLE_W) {
        blowCandle(candle.id);
      }
    });
  }, [phase, blowCandle]);

  const remaining = candles.filter(c => c.lit).length;

  return (
    <Box
      ref={containerRef}
      sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at center, #2d1b4e 0%, #0d0820 100%)' }}
    >
      {/* ---- IDLE ---- */}
      {phase === 'idle' && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 10, gap: 3 }}>
          <Typography variant="h3" sx={{ color: '#ffd700', fontFamily: 'cursive', textShadow: '0 0 20px #ffd700' }}>
            🎂 Joyeux Anniversaire !
          </Typography>
          <Typography sx={{ color: '#fff', fontSize: '1.1rem' }}>
            Quel âge fêtons-nous ?
          </Typography>
          <Select
            value={selectedLevel.level}
            onChange={e => setSelectedLevel(levels.find(l => l.level === e.target.value))}
            sx={{ bgcolor: 'white', borderRadius: 1, minWidth: 180 }}
          >
            {levels.map(l => <MenuItem key={l.level} value={l.level}>{l.label}</MenuItem>)}
          </Select>
          <Button variant="contained" size="large" onClick={() => startGame(selectedLevel)}
            sx={{ bgcolor: '#ff6b6b', fontSize: '1.2rem', px: 5, borderRadius: 3,
              boxShadow: '0 0 20px #ff6b6b', '&:hover': { bgcolor: '#ff4444' } }}>
            Souffler les bougies 💨
          </Button>
        </Box>
      )}

      {/* ---- WIN ---- */}
      {phase === 'win' && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 10, gap: 3,
          bgcolor: 'rgba(0,0,0,0.75)' }}>
          <Typography variant="h2" sx={{ color: '#ffd700', fontFamily: 'cursive' }}>🎉 Bravo !</Typography>
          <Typography variant="h5" sx={{ color: '#fff' }}>
            Toutes les bougies soufflées ! Fais un vœu !
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={() => startGame(selectedLevel)} sx={{ bgcolor: '#ff6b6b' }}>
              Rejouer
            </Button>
            <Button variant="outlined" onClick={() => setPhase('idle')} sx={{ color: '#fff', borderColor: '#fff' }}>
              Changer de niveau
            </Button>
          </Box>
        </Box>
      )}

      {/* ---- LOSE ---- */}
      {phase === 'lose' && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', zIndex: 10, gap: 3,
          bgcolor: 'rgba(0,0,0,0.75)' }}>
          <Typography variant="h2" sx={{ color: '#ff6b6b', fontFamily: 'cursive' }}>😅 Raté !</Typography>
          <Typography variant="h5" sx={{ color: '#fff' }}>
            La chanson est finie... {remaining} bougie{remaining > 1 ? 's résistent' : ' résiste'} encore !
          </Typography>
          <Typography sx={{ color: '#aaa' }}>
            {remaining > 20 ? "T'as les poumons d'un nourrisson 🍼" :
             remaining > 10 ? "Fais du sport mon ami 🚬" :
             remaining > 3  ? "Si proche... et si loin 😭" :
                              "La prochaine fois souffles plus fort ! 💨"}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" onClick={() => startGame(selectedLevel)} sx={{ bgcolor: '#ff6b6b' }}>
              Réessayer
            </Button>
            <Button variant="outlined" onClick={() => setPhase('idle')} sx={{ color: '#fff', borderColor: '#fff' }}>
              Changer de niveau
            </Button>
          </Box>
        </Box>
      )}

      {/* ---- KONVA STAGE ---- */}
      <Stage width={stageSize.width} height={stageSize.height} onClick={handleClick} onTap={handleClick}>
        <Layer>

          {/* Gâteau */}
          {gateauImg && (
            <KImage image={gateauImg}
              x={cakePos.x - CAKE_W / 2} y={cakePos.y - CAKE_H / 2}
              width={CAKE_W} height={CAKE_H}
            />
          )}

          {/* Bougies */}
          {candles.map(candle => (
            <KImage
              key={candle.id}
              image={candle.lit ? allumeeImg : eteinteImg}
              x={cakePos.x + candle.offsetX - CANDLE_W / 2}
              y={cakePos.y + candle.offsetY - CANDLE_H}
              width={CANDLE_W}
              height={CANDLE_H}
            />
          ))}

          {/* Cible fixe - viseur */}
          <Circle x={target.x} y={target.y} radius={TARGET_R}
            stroke="#fff" strokeWidth={2} dash={[6, 4]} opacity={0.8} />
          <Circle x={target.x} y={target.y} radius={5} fill="#fff" />
          {/* Croix du viseur */}
          <Line points={[target.x - TARGET_R - 12, target.y, target.x - TARGET_R + 8, target.y]}
            stroke="#fff" strokeWidth={2} />
          <Line points={[target.x + TARGET_R - 8, target.y, target.x + TARGET_R + 12, target.y]}
            stroke="#fff" strokeWidth={2} />
          <Line points={[target.x, target.y - TARGET_R - 12, target.x, target.y - TARGET_R + 8]}
            stroke="#fff" strokeWidth={2} />
          <Line points={[target.x, target.y + TARGET_R - 8, target.x, target.y + TARGET_R + 12]}
            stroke="#fff" strokeWidth={2} />
          {/* Emoji bouche sous le viseur */}
          <Text text="💨" x={target.x - 12} y={target.y + TARGET_R + 5} fontSize={20} />

          {/* Score HUD */}
          {phase === 'playing' && (
            <>
              <Text text={`💨 ${blownCount} soufflées`} x={20} y={20} fontSize={20} fill="white" />
              <Text text={`🕯️ ${remaining} restantes`} x={20} y={48} fontSize={20} fill="#ffd700" />

              {/* Jauge de souffle */}
              <Text text="Souffle" x={stageSize.width / 2 - 100} y={stageSize.height - 62}
                fontSize={13} fill="rgba(255,255,255,0.6)" />
              <Rect x={stageSize.width / 2 - 100} y={stageSize.height - 46}
                width={200} height={18} fill="#222" cornerRadius={9} opacity={0.8} />
              <Rect x={stageSize.width / 2 - 100} y={stageSize.height - 46}
                width={breath * 2} height={18} cornerRadius={9}
                fill={breath > 60 ? '#2ecc71' : breath > 25 ? '#f39c12' : '#e74c3c'} />
            </>
          )}

        </Layer>
      </Stage>
    </Box>
  );
}