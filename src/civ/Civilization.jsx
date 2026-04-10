import React, { useState } from 'react';
import Box from '@mui/material/Box';
import CivMap, { STAGE_HEIGHT, STAGE_WIDTH } from './CivMap';
import CivSump from './CivSumUp';
import CivRecherche from './CivRecherche';
import { CivContextProvider, useCivContext } from './CivContext';
import CivCity from './CivCity';
import { NationDialog } from './utils/Dialogs';
import CivAppBar from './utils/CivAppBar';
import { MiniMap } from './CivMiniMap';
import { HEX_SIZE, hexToPixel } from './utils/hexUtils';
import { LoadGameMenu, MainMenu } from './utils/MainMenu';
import { Alert, CircularProgress, Typography } from '@mui/material';



const Civilization = () => {
  const [selected, setSelected] = useState('map');
  const [selectedNation, setSelectedNation] = useState(null);
  return <CivContextProvider setSelected={setSelected} selectedNation={selectedNation}>
    <CivilizationMain selected={selected} setSelected={setSelected}
      setSelectedNation={setSelectedNation} />
  </CivContextProvider>
}

const CivilizationMain = ({ selected, setSelectedNation, setSelected }) => {
  const [gameState, setGameState] = useState('mainMenu');
  const [open, setOpen] = useState(true);

  const handleNationSelect = (nation) => {
    setSelectedNation(nation); // on en parlera juste après
    setOpen(false);
    setGameState('playing');
  };



  // Rendu conditionnel selon l'état du jeu
  switch (gameState) {
    case 'mainMenu':
      return (
        <MainMenu
          onNewGame={() => { setGameState('nationSelect'); }}
          onGameLoaded={(withNation) => {
            setSelectedNation(withNation)
            setGameState('playing');
          }}
        />
      );

    case 'nationSelect':
      return (
        <NationDialog
          open={true}
          handleNationSelect={handleNationSelect}
          onClose={() => { setGameState('mainMenu'); }} // Optionnel : retour au menu principal
        />
      );

    case 'playing':
      return (
        <PlayingCiv setSelected={setSelected} selected={selected} />
      );

    default:
      return <Alert severity='error'>Tain c'est quoi ce bordel ? gameState={gameState}</Alert>;
  }
};

const PlayingCiv = ({ setSelected, selected, }) => {
  const [currentViewport, setCurrentViewport] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const mapContainerRef = React.useRef(null);
  const { isRunning } = useCivContext();
  const [savedScrollPosition, setSavedScrollPosition] = useState({ x: 0, y: 0 });
  // Un état pour stocker la position et la taille de la vue

  // Mettre à jour le viewport quand l'utilisateur scrolle
  // On utilise useCallback pour la performance
  const handleScroll = React.useCallback(() => {
    const container = mapContainerRef.current;
    if (container && selected === 'map') {
      setCurrentViewport({
        x: container.scrollLeft,
        y: container.scrollTop,
        width: container.clientWidth,
        height: container.clientHeight,
      });
      setSavedScrollPosition({
        x: container.scrollLeft,
        y: container.scrollTop
      });
    }
  }, [selected]);
  React.useEffect(() => {
    const container = mapContainerRef.current;
    if (container && selected === 'map') {
      // Petit délai pour que le DOM soit prêt
      setTimeout(() => {
        container.scrollTo(savedScrollPosition.x, savedScrollPosition.y);
        //    behavior: 'auto' // Pas d'animation au restore
        //});
      }, 0);
    }
  }, [selected]);

  // La fonction de navigation appelée par la minimap
  const handleNavigate = (q, r) => {
    console.log(`Navigation vers la tile q:${q}, r:${r}`);

    const container = mapContainerRef.current;
    if (container) {
      // Conversion simple hex vers pixel (ajuste hexSize selon ton setup)
      const { x: targetX, y: targetY } = hexToPixel({ q, r });

      // Centrer la vue sur ce point
      container.scrollTo({
        left: targetX - container.clientWidth / 2,
        top: targetY - container.clientHeight / 2,
        behavior: 'smooth'
      });
    }
  };

  const renderView = () => {
    switch (selected) {
      case 'city': return <CivCity />;
      case 'map': return <CivMap setSelected={setSelected} handleNavigate={handleNavigate}/>;
      case 'recherche': return <CivRecherche />;
      case 'sump': return <CivSump setSelected={setSelected} handleNavigate={handleNavigate}/>;
      default:
    }
  }
  return <Box sx={{ flexGrow: 1, height: '100%',overscrollBehaviorX: 'none' }}>
    <CivAppBar setSelected={setSelected} selected={selected} />
    <Box ref={mapContainerRef} onScroll={handleScroll}
      sx={{ width: '100%', height: '100%', overflow: 'auto', position: 'relative' }}>
      {renderView()}
      {selected === 'map' && (
        <MiniMap mainHexSize={HEX_SIZE}
          onNavigate={handleNavigate}
          currentViewport={currentViewport}
        />
      )}
      {isRunning && (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backdropFilter: 'blur(2px)',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: 'white',
      }}
    >
      <CircularProgress color="inherit" size={64} thickness={5} />
      <Typography variant="h6" mt={2} sx={{ animation: 'pulse 1.5s infinite' }}>
        Tour en cours...
      </Typography>
    </Box>

    {/* Animation keyframes (à mettre dans ton thème global ou avec GlobalStyles si tu veux) */}
    <style>
      {`
        @keyframes pulse {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.3; transform: scale(1); }
        }
      `}
    </style>
  </Box>
)}

    </Box>
  </Box>
}

export default Civilization;

