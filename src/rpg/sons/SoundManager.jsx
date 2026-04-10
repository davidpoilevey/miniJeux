// utils/SoundManager.js
// assets/soundMap.js
import sonGlou from './bois.mp3';
import sonEpee from './epee.mp3';
import sonPorte from './porte.mp3';
import sonCoffre from './chest.mp3';
import sonMarche from './marche.mp3';
import sonGold from './gold.mp3';
import sonSlash from './slash.mp3';
import sonfinNiveau from './finNiveau.mp3';
import sonFire from './fire.mp3';

export const soundMap = {
  glou: sonGlou,
  sword: sonEpee,
  porte: sonPorte,
  coffre: sonCoffre,
  slash:sonSlash,
  fire:sonFire,
  finNiveau:sonfinNiveau,
  marche:sonMarche,
  gold: sonGold,
};
class SoundManager {
  constructor() {
    this.sounds = {};
    // On garde une trace des sons en cours de lecture pour pouvoir les stopper
    this.activeInstances = new Map();
  }

  loadSounds(soundMap) {
    for (const [key, path] of Object.entries(soundMap)) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this.sounds[key] = audio;
    }
  }

  play(key, options = {}) {
    const baseSound = this.sounds[key];
    if (!baseSound) return;

    const audio = baseSound.cloneNode();
    if (options.volume !== undefined) audio.volume = options.volume;
    if (options.loop) audio.loop = true;

    // On stocke l'instance. Si on joue plusieurs fois le même "key", 
    // on stocke un tableau d'instances.
    if (!this.activeInstances.has(key)) {
      this.activeInstances.set(key, new Set());
    }
    this.activeInstances.get(key).add(audio);

    // Nettoyage automatique quand le son est fini
    audio.onended = () => {
      this.activeInstances.get(key)?.delete(audio);
    };

    audio.play().catch(err => {
      console.warn(`Erreur lecture son ${key}:`, err);
    });

    return audio; // On retourne l'instance au cas où
  }

  // Vérifie si au moins une instance de ce son est en cours de lecture
  isPlaying(key) {
    const instances = this.activeInstances.get(key);
    if (!instances || instances.size === 0) return false;
    
    // On vérifie si au moins un n'est pas en pause et n'est pas fini
    return Array.from(instances).some(audio => !audio.paused && !audio.ended);
  }

  // Arrête toutes les instances d'un son précis
  stop(key) {
    const instances = this.activeInstances.get(key);
    if (instances) {
      instances.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      this.activeInstances.delete(key);
    }
  }

  // Optionnel : Arrêter absolument tout (pratique pour le reset du jeu)
  stopAll() {
    this.activeInstances.forEach((instances) => {
      instances.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    });
    this.activeInstances.clear();
  }
}


export const soundManager = new SoundManager();
