import { soundManager } from '../rpg/sons/SoundManager';
import punch from './assets/punch-impact.mp3';
import metal from './assets/metalImpact.mp3';
import cartoon from './assets/cartoon-impact.mp3';
import tambour from './assets/tambour.mp3';
import gong from './assets/gong.mp3';

// Un son par événement du jeu.
// start = on saute le silence en tête du mp3 (sinon le son arrive après le choc)
const SOUNDS = {
  bumper: { src: punch, volume: 0.5, start: 0.04 },
  target: { src: metal, volume: 0.6, start: 0.06 },
  hole:   { src: cartoon, volume: 0.8, start: 0.08 },
  launch: { src: tambour, volume: 0.8, start: 0.09 },
  lost:   { src: gong, volume: 0.7, start: 0.07 },
};

// soundManager est partagé entre les jeux : on préfixe nos clés
const keyOf = (name) => `flipper.${name}`;
const MIN_GAP_MS = 60;   // une rafale de bumpers ne doit pas devenir un mur de son
const lastPlayed = {};

export const loadSounds = () => {
  soundManager.loadSounds(Object.fromEntries(Object.entries(SOUNDS).map(([name, s]) => [keyOf(name), s.src])));
};

export const playSound = (name) => {
  const s = SOUNDS[name];
  const now = performance.now();
  if (!s || now - (lastPlayed[name] ?? 0) < MIN_GAP_MS) return;
  lastPlayed[name] = now;
  const audio = soundManager.play(keyOf(name), { volume: s.volume });
  if (audio) audio.currentTime = s.start;
};
