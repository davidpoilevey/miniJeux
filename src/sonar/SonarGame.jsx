import React, { useState, useRef, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
import './SonarGame.css';
import Bateau from './Bateau';
import { Box, Button } from '@mui/material';
import { Circle } from './Circle';
import { InfoBox } from './InfoBox';
import ConfigMenu from './ConfigMenu';
import SonarProvider, { SonarContext } from './SonarProvider';


const SonarBoard = () => {
  const [circles, setCircles] = useState([]);
  const [resetBtn, showResetButton] = useState(false);
  const { sonarRadius, boatSpeed, setBoatSpeed, playerCoins, setPlayerCoins } =
  useContext(SonarContext);
  const [showShop, setShowShop] = useState(false);
  const [msg, setMsg] = useState('');
  const [tries, setTries] = useState(3);
  const [sonarTries, setSonarTries] = useState(15);
  const [yeah, setYeah] = useState('');// flag de victoire
  const tresor = useRef();
  const animationRef = useRef(null);
  const merRef = useRef();
  const setRef = (elt) => {
    if (merRef.current == null)
      merRef.current = elt;

  }
  const startGame = () => {
    showResetButton(false);
    setYeah('');
    setCircles([]);
    setMsg('');
    setTries(3);
    setSonarTries(10);
    placeTresor();
  }
  // Fin de partie
  useEffect(() => {
    if (tries < 1 || sonarTries < 1) {
      showResetButton(true);
      setMsg('Vous avez perdu, une autre partie ? Le tresor va se deplacer...');
      setYeah('PERDU :-(');
    }
  }, [tries, sonarTries])
  const placeTresor = () => {

    // Fonction pour générer des coordonnées x et y aléatoires dans les limites de la mer
    const generateRandomCoordinates = () => {
      const mer = merRef.current;
      if (mer) {
        const merWidth = mer.offsetWidth;
        const merHeight = mer.offsetHeight;
        const x = Math.floor(Math.random() * (merWidth - 50));
        const y = Math.floor(Math.random() * (merHeight - 50));
        return { x, y };
      }
      return { x: 0, y: 0 };
    };

    // Générer les coordonnées du trésor aléatoirement
    tresor.current = generateRandomCoordinates();
  }
  useEffect(() => {
    startGame();
  }, [merRef.current]);

  const trySonar = (loc) => {
    const newCircle = { ...loc, size: 0 };
    setCircles([...circles, newCircle]);
    setMsg('');
    setSonarTries(s => s - 1)
    if (!animationRef.current) {
      animateCircles();
    }
  }

  const peche = (loc) => {
    const distance = Math.sqrt(
      Math.pow(loc.x - tresor.current.x, 2) + Math.pow(loc.y - tresor.current.y, 2)
    );
    if (distance < 20) {
      //victoire();
      setMsg('Bravo, vous avez gagné');
      showResetButton(true);
      setYeah('Vous avez gagnééééééé');
    }
    else if (distance < 40){
      setMsg('allez pas loin, un coup gratuit');
      setSonarTries(s=>s+1);

    }
    else {
      setMsg('Trop loin, un essai de perdu');
      setTries(t => (t - 1));

    }
  }
  const handleClick = (event) => {
    const { clientX, clientY } = event;
    const bndRec = event.target.getBoundingClientRect();

    const x = clientX - bndRec.left;
    const y = clientY - bndRec.top;

    const newCircle = { x, y, size: 0 };
    setCircles([...circles, newCircle]);

    if (!animationRef.current) {
      animateCircles();
    }

  };
  useEffect(() => {
    // Annulez l'animation en cours si sonarRadius change
    cancelAnimationFrame(animationRef.current);
    // Redémarrez l'animation avec la nouvelle valeur de sonarRadius
    animateCircles();
  }, [sonarRadius, setCircles]);
  const animateCircles = () => {
    const animationSpeed = 4;
    const targetSize = sonarRadius;
    setCircles((prevCircles) => {
      const removeGros = prevCircles.filter(c => c.size < targetSize);
      return removeGros.map((prevCircle) => ({
        ...prevCircle,
        size: Math.min(prevCircle.size + animationSpeed, targetSize),
      }))
    }

    );

    animationRef.current = requestAnimationFrame(animateCircles);
  };
  const handleButtonKeyDown = (event) => {
    // Vérifiez si la touche tapée est la barre d'espace (code ASCII 32)
    if (event.keyCode === 32) {
      // Empêche le déclenchement du onClick
      event.preventDefault();
    }
  };
  return (<Box ref={setRef} className="sonar-game" onClick={handleClick}>
    <ConfigMenu open={showShop}
      onClose={() => { setShowShop(!showShop); }} />

    <Button onKeyDown={handleButtonKeyDown} className="shop-button" onClick={() => { setShowShop(!showShop); }}>
      Boutique
    </Button>
    <InfoBox tries={tries} sonarTries={sonarTries} yeah={yeah} resetBtn={resetBtn} startGame={startGame} msg={msg} />
    <Tresor pos={tresor.current} />
    <Bateau bounding={merRef.current} trySonar={trySonar} peche={peche} />
    {circles.map((circle, index) => (
      <Circle key={index} circle={circle} tresor={tresor.current} />
    ))}
  </Box>
  );
};


const SonarGame = () => {
  return <SonarProvider>
    <SonarBoard />
  </SonarProvider>

}

export default SonarGame;

const Tresor = ({ pos }) => {
  if (pos == null)
    return null;
  return <Box sx={{ position: 'absolute', top: pos.y, left: pos.x }}>
    {/* <Castle/> */}
  </Box>
}

