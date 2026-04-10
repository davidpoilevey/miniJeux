import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { pb, PSEUDO_KEY } from './pocketbaseScores';
import './App.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';


import { Box, Fade,  } from '@mui/material';

import { AppBackButton, AppHeader, GamesGrid, Regles } from './JeuxCards';
import { GAMES_DATA } from './gameData';
import { injectGamesJsonLd, updatePageTitle } from './seoUtils';

// Thème défini une seule fois, hors du composant
const theme = createTheme({
  palette: {
    primary: {
      main: '#2690ceff',
    },
    secondary: {
      main: '#e78c1eff',
    },
  },
});

function findGameById(id) {
  for (const cat of GAMES_DATA) {
    const found = cat.jeux?.find(g => g.id === id || g.name === id);
    if (found) return found;
  }
  return null;
}

const App = () => {
  const [selectedApp, setSelectedApp] = useState(() => {
    const id = new URLSearchParams(window.location.search).get('game');
    return id ? findGameById(id) : null;
  });
  const gameStartTimeRef = useRef(null);

  // JSON-LD catalogue — une seule fois
  useEffect(() => {
    if (!document.getElementById('games-jsonld')) injectGamesJsonLd();
  }, []);

  // Titre de page dynamique
  useEffect(() => { updatePageTitle(selectedApp); }, [selectedApp]);

  const handleSelectApp = (app) => {
    setTimeout(() => {
      setSelectedApp(app);
      gameStartTimeRef.current = Date.now();
    }, 500);
  };

  // Quand un jeu s'ouvre, on pousse ?game=<id> dans l'URL.
  // Le bouton back Android / swipe iOS déclenchera popstate → retour accueil.
  useEffect(() => {
    if (selectedApp) {
      const url = `?game=${encodeURIComponent(selectedApp.id || selectedApp.name)}`;
      window.history.pushState({ minijeuxGame: true }, '', url);
      const onPop = () => {
        sendCloseEvent(selectedApp);
        setSelectedApp(null);
      };
      window.addEventListener('popstate', onPop);
      return () => window.removeEventListener('popstate', onPop);
    }
  }, [selectedApp]);

  const sendCloseEvent = (app) => {
    if (!app || !gameStartTimeRef.current || !window.gtag) return;
    const duree = Math.round((Date.now() - gameStartTimeRef.current) / 1000);
    window.gtag('event', 'jeu_ferme', {
      event_category: 'jeu',
      event_label: app.name,
      value: duree,
      duree_secondes: duree,
    });
    gameStartTimeRef.current = null;
  };

  // returnBack nettoie l'entrée history qu'on a poussée,
  // ce qui déclenche popstate → setSelectedApp(null) via le listener ci-dessus.
  const returnBack = () => {
    sendCloseEvent(selectedApp);
    if (window.history.state?.minijeuxGame) {
      window.history.back();
    } else {
      setSelectedApp(null);
    }
  };
  return (
    <ThemeProvider theme={theme}>
      <div className="app-container">

        {/* Button to toggle the center panel */}

    <AppBackButton selectedApp={selectedApp} returnBack={returnBack} /> 


        {/* Center panel */}
        <div className="center-panel">
          <Regles regle={selectedApp?.regle} />

          <AppPanel selectedApp={selectedApp} handleSelectApp={(app) => {
            if (window.gtag) {
              window.gtag('event', 'jeu_selectionne', {
                'event_category': 'nouveauJeu',
                'event_label': app.name,
                'value': 1
              });
            }
            handleSelectApp(app)
          }} />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;


const AppPanel = ({ selectedApp, handleSelectApp }) => {
  const [showMain, setShowMain] = useState(!selectedApp);
  const [showGame, setShowGame] = useState(!!selectedApp);

  // Quand selectedApp change, on déclenche une transition fluide
  useEffect(() => {
     setShowMain(!selectedApp);
  setShowGame(!!selectedApp);
   
  }, [selectedApp]);
  const SelectedComponent = selectedApp?.component;


  return (
    <Box sx={{ position: "relative", height: "100vh", overflow: "hidden", '@supports (height: 100dvh)': { height: '100dvh' } }}>
      {/* --- Page principale --- */}
      <Fade in={showMain} timeout={500} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              position: "relative",
              p: { xs: 2, md: 3 },
              background:
                "linear-gradient(115deg, rgb(7, 107, 152) 0%, rgb(5, 109, 58) 100%)",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                animation: "float 8s ease-in-out infinite",
              },
            }}
          >
            <AppHeader 
              gamesData={GAMES_DATA} selectedApp={selectedApp} />
          </Box>

          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <GamesGrid
              gamesData={GAMES_DATA}
              onSelectGame={(app) => handleSelectApp(app)}
            />
          </Box>
        </Box>
      </Fade>

      {/* --- Jeu sélectionné --- */}
      <Fade in={showGame} timeout={500} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
         {SelectedComponent ? (
    <Suspense fallback={<div>Chargement du jeu...</div>}>
      <SelectedComponent />
    </Suspense>
  ) : (
    <div className="app-panel">
      <h1>{selectedApp?.name}</h1>
      <p>{selectedApp?.description}</p>
    </div>
  )}
        </Box>
      </Fade>
    </Box>
  );
};

// Projets Unity — impossible à exporter en web pour l'instant, à ressortir un jour peut-être
// const CopainTripWrapper = () => {
//   useEffect(() => { window.open('./copainTrip/'); }, []);
//   return null;
// }
// const BebrisWrapper = () => {
//   useEffect(() => { window.open('./BebrisWebGL/'); }, []);
//   return null;
// }


// Fonction pour sauvegarder l'état dans le localStorage
const saveStateToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("dpyScores", serializedState);
  } catch (error) {
    console.error("Error saving state to localStorage:", error);
  }
};

// Fonction pour charger l'état à partir du localStorage
const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem("dpyScores");
    if (serializedState === null) {
      return undefined; // Retourne undefined si aucune sauvegarde n'est trouvée
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error("Error loading state from localStorage:", error);
    return undefined;
  }
};
export const useGlobalScores = () => {
  const [localScores] = useState(() => loadStateFromLocalStorage() || {});
  const [pbScores, setPbScores] = useState({});

  // Fetch les scores PocketBase de l'utilisateur courant au montage
  useEffect(() => {
    const pseudo = localStorage.getItem(PSEUDO_KEY);
    if (!pseudo) return;
    pb.collection('scores').getList(1, 500, {
      sort: '-score',
      filter: `user = "${pseudo}"`,
      requestKey: 'useGlobalScores',
    }).then(result => {
      const best = {};
      for (const item of result.items) {
        if (!best[item.gameName] || item.score > best[item.gameName].score)
          best[item.gameName] = { score: item.score, player: item.user };
      }
      setPbScores(best);
    }).catch(() => {});
  }, []);

  // PocketBase prime sur localStorage si le score est plus élevé
  const allScores = useMemo(() => {
    const merged = { ...localScores };
    for (const [gameID, data] of Object.entries(pbScores)) {
      if (!merged[gameID] || data.score > merged[gameID].score)
        merged[gameID] = data;
    }
    return merged;
  }, [localScores, pbScores]);

  const setScore = (gameID, score, player) => {
    const current = loadStateFromLocalStorage() || {};
    if (current[gameID]?.score > score) return;
    saveStateToLocalStorage({ ...current, [gameID]: { score, player } });
  };

  const getScoreByGame = (gameID) => allScores?.[gameID] || { score: 0 };

  return { setScore, getScoreByGame, allScores };
}