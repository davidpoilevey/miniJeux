import React, { useEffect, useRef, useState } from "react";
import { usePiano } from "./PianoContext";

export const useAudio=({rythme})=>{

  const audioContextRef = useRef();
  
  const oscillatorsRef = useRef([]);
const makeOscillator=({frequence=444, type="square"}, duree=1000)=>{
    const oscillator = audioContextRef.current.createOscillator();

const gainNode = audioContextRef.current.createGain();
// Connecter les nodes
oscillator.connect(gainNode);
gainNode.connect(audioContextRef.current.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequence;
   // oscillator.connect(audioContextRef.current.destination);
    oscillator.start();

// Enveloppe simple pour le piano
gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
gainNode.gain.cancelScheduledValues(audioContextRef.current.currentTime);
gainNode.gain.linearRampToValueAtTime(1, audioContextRef.current.currentTime + 0.02); // Attaque rapide
gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + Math.min(1,duree/500)); // Décroissance lente
// const oscillator2 = audioContextRef.current.createOscillator();
// oscillator2.type = 'sine';
// oscillator2.frequency.value = frequence/2; // 2 fois la fréquence fondamentale
// oscillator2.connect(gainNode);
// oscillator2.start();
    return oscillator;
}
  const playNote = (noteConfig) => {
   const oscillator = makeOscillator(noteConfig);
   oscillatorsRef.current.push(oscillator);
    return () => {
      oscillator.stop();
      oscillatorsRef.current=oscillatorsRef.current.filter(o=>o!==oscillator );
    }
  };

  const stopAllNotes = () => {
    oscillatorsRef.current.forEach((oscillator) =>  {oscillator.stop()});
    oscillatorsRef.current.clear();
  };

  useEffect(() => {

    const context = new AudioContext();
    audioContextRef.current = context;
   // return () => os.disconnect(context.destination);
  }, []);

  const playNoteAuto = ({duree,  ...note}) => {//duree en ms
    return new Promise(resolve => {
        const oscillator = makeOscillator(note, duree);
       // Appelle votre fonction existante pour afficher la couleur
      setTimeout(() => {
        // Réinitialise la couleur        
          resolve();
          oscillator.stop();
          oscillator.disconnect();
      }, duree);
    });
  };
  
  return {playNoteAuto, playNote, stopAllNotes}
}

export const noteConfig=(note)=>{
  const freq=noteToFrequency(note);
  if(freq!=null)
    return {frequence:freq,type:"square"};
  else
  return null;
}
const noteToFrequency = (note) => {
  // Tableau des fréquences de base pour le la
  const baseFrequencies = {
    'C': 16.35,
    'C#': 17.32,
    'D': 18.35,
    'D#': 19.45,
    'E': 20.60,
    'F': 21.83,
    'F#': 23.12,
    'G': 24.50,
    'G#': 25.96,
    'A': 27.50,
    'A#': 29.14,
    'B': 30.87
  };

  // Fonction pour calculer la fréquence en fonction de l'octave
  const calculateFrequency = (baseFrequency, octave) => {
    return baseFrequency * Math.pow(2, octave); // 4 est l'octave de référence (A4 = 440Hz)
  };

  // Extraire la note, l'altération et l'octave de la chaîne de caractères
  const match = note.match(/([A-G]#?)([0-9]+)/);
  if (!match) {
    return null; // Note invalide
  }

  const noteName = match[1].toUpperCase();
  const octave = parseInt(match[2]);

  // Calculer la fréquence
  const baseFrequency = baseFrequencies[noteName];
  return calculateFrequency(baseFrequency, octave);
};