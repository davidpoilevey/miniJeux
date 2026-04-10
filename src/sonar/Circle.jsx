import React, { useState, useRef, useEffect } from 'react';
import sonarSound from './sonar.wav';

export const Circle = ({ circle, tresor }) => {
  const [isAtTresor, setIsAtTresor] = useState(false);
  const audioRef = useRef();
  useEffect(() => {
    if (audioRef.current == null) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioRef.current = new Audio(sonarSound);
      audioRef.current.volume = 0.5;

      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(audioContext.destination);
    }
  }, []);


  useEffect(() => {
    let timeoutId;

    if (isAtTresor) {
      audioRef.current.play();

      // Durée en millisecondes pendant laquelle le son doit être joué (2 secondes)
      const soundDuration = 2000;

      // Arrête la lecture du son après 2 secondes
      setTimeout(() => {
        audioRef.current.pause();
      }, soundDuration);
    }

  }, [isAtTresor]);

  useEffect(() => {
    if (tresor == null)
      return;
    // Calculer la distance entre le cercle et le trésor
    const distance = Math.sqrt(
      Math.pow(circle.x - tresor.x, 2) + Math.pow(circle.y - tresor.y, 2)
    );

    // Si la distance est inférieure au rayon du cercle, le cercle atteint le trésor
    if (distance < circle.size / 2 + 10 && distance > (circle.size / 2 - 10)) {
      setIsAtTresor(true);
    } else {
      setIsAtTresor(false);
    }
  }, [circle, tresor]);

  return (
    <div
      className="circle"
      style={{
        borderColor: isAtTresor ? 'yellow' : 'blue',
        left: circle.x - circle.size / 2,
        top: circle.y - circle.size / 2,
        width: circle.size,
        height: circle.size,
      }} />
  );
};
