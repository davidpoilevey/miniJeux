import React, { useState, useEffect } from 'react';
import { Fab } from '@mui/material';
import { Settings } from '@mui/icons-material';

const AutoHide = ({children, duration=2000}) => {
  const [isFabVisible, setIsFabVisible] = useState(true);

  useEffect(() => {
    let timeoutId;

    const handleMouseMove = () => {
      // Réinitialise le délai d'inactivité à chaque mouvement de souris
      clearTimeout(timeoutId);

      // Rend le bouton visible
      setIsFabVisible(true);

      // Démarre un nouveau délai pour cacher le bouton après 2 secondes
      timeoutId = setTimeout(() => {
        setIsFabVisible(false);
      }, duration);
    };

    // Écoute l'événement de mouvement de la souris
    window.addEventListener('mousemove', handleMouseMove);

    // Nettoie l'écouteur d'événements lors du démontage du composant
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, opacity: isFabVisible?1:0, transition: 'opacity 1s' }}>
      {children}
      
    </div>
  );
};

export default AutoHide;
