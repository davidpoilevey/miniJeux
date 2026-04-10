import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
} from '@mui/material';
import {
  Person as PersonIcon,
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { initialGameState } from './data/gameState';
import { cultTheme } from './context/cultTheme';
import { loadGame, saveGame } from '../civ/utils/saveGame';
import { CultDashboard } from './components/CultDashboard';
import RecruitmentView from './components/RecruitCult';
import RevelationView from './components/RevelationView';
import CeremonyView from './components/CeremonyView';
import ManagementView from './components/ManagementView';
import ActionModal from './modals/ActionModal';
import AscensionView from './components/AscensionView';
import { OnBoardingProvider } from '../OnBoardingContext';

// Thème personnalisé dark mystique


const CultManagementGame = () => {
  const [gameState, setGameState] = useState(initialGameState);
  const [view, setView] = useState('dashboard'); // dashboard, recruit, revelation, ceremony, crisis

  const reset=()=>{
    setGameState(initialGameState);
    setView('dashboard');
  }

  //Chargement du jeu au démarrage
  useEffect(() => {
    const savedGame = loadGame('cultManagement');
    if (savedGame) {
      setGameState(savedGame);
    }
  }, [loadGame]);

  // Sauvegarde automatique
  useEffect(() => {
    saveGame(gameState,'cultManagement');
  }, [gameState, saveGame]);

    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedFollowerDetail, setSelectedFollowerDetail] = useState(null);
    const [actionModalOpen, setActionModalOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState(null); // { type, targetFollower }
  const openDetailModal = (follower) => {
      setSelectedFollowerDetail(follower);
      setDetailModalOpen(true);
    };
    
    // Ouvre la modal d'action
    const openActionModal = (actionType, targetFollower = null) => {
      setCurrentAction({ type: actionType, targetFollower });
      setActionModalOpen(true);
    };
 

  // Dashboard principal
  

  // Rendu principal avec switch de vues
  return (
    <ThemeProvider theme={cultTheme}>
      <OnBoardingProvider 
  app="cultManager" 
  stepsConfig={[
    { id: 'welcome' },
    { id: 'dashboard' },
    { id: 'stats' },
    { id: 'followers' },
    { id: 'actions' },
    { id: 'recruit' },
    { id: 'revelation' },
    { id: 'ceremony-prep' },
    { id: 'ceremony-done' },
  ]}
>
      <Box
        sx={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #46187f 100%)',
          position: 'relative',
          overflow:'auto', height:'100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(156, 39, 176, 0.1) 0%, transparent 50%),
                             radial-gradient(circle at 80% 80%, rgba(255, 215, 0, 0.05) 0%, transparent 50%)`,
            pointerEvents: 'none',
          },
        }}
      >
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:wght@400;700&family=Lato:wght@300;400;700&display=swap"
          rel="stylesheet"
        />

        {view === 'dashboard'&&<CultDashboard gameState={gameState} 
        openActionModal={openActionModal} openDetailModal={openDetailModal} 
        setView={setView}/>}
       
        {view === 'recruit' && (
          <RecruitmentView
            gameState={gameState}
            setGameState={setGameState}
            onBack={() => setView('dashboard')}
          />
        )}
        
        {view === 'revelation' && (
          <RevelationView
            gameState={gameState}
            setGameState={setGameState}
            onBack={() => setView('dashboard')}
          />
        )}
        {view === 'ascension' && (
  <AscensionView
    gameState={gameState}
    reset={reset}
    onBack={() => setView('dashboard')}
  />
)}
        {view === 'ceremony' && (
          <CeremonyView
            gameState={gameState}
            setGameState={setGameState}
            onBack={() => setView('dashboard')}
          />
        )}
        {view === 'management' && (
  <ManagementView
    gameState={gameState}
    setGameState={setGameState}
    onBack={() => setView('dashboard')}
    openActionModal={openActionModal}
  />
)}
        
{/* Modal de détails d'adepte */}
<ActionModal
  open={detailModalOpen}
  onClose={() => setDetailModalOpen(false)}
  type="detail"
  follower={selectedFollowerDetail}
  gameState={gameState}
/>

{/* Modal d'actions */}
<ActionModal
  open={actionModalOpen}
  onClose={() => setActionModalOpen(false)}
  type={currentAction?.type}
  follower={currentAction?.targetFollower}
  gameState={gameState}
  setGameState={setGameState}
/>
        {view !== 'dashboard' && view !== 'recruit' && view !== 'revelation' && view !== 'ascension' && view !== 'ceremony' && (
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
              onClick={() => setView('dashboard')}
              sx={{ mb: 3 }}
              startIcon={<PersonIcon />}
            >
              Retour au Cercle
            </Button>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                {view === 'ascension' && '⚡ La Grande Ascension'}
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Mini-jeu à implémenter
              </Typography>
            </Paper>
          </Container>
        )}
      </Box>
      </OnBoardingProvider>
    </ThemeProvider>
  );
};


export default CultManagementGame;