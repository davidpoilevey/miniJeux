import { Suspense, useEffect, useRef, useState } from 'react';
import { ThemeProvider, CssBaseline, Box, Fade, CircularProgress } from '@mui/material';
import stitchTheme from './theme';
import TopNavBar from './stitch/layout/TopNavBar';
import SideNav from './stitch/layout/SideNav';
import LibraryPage from './stitch/pages/LibraryPage';
import { AppBackButton } from './JeuxCards';
import { GAMES_DATA } from './gameData';
import { useRandomGame } from './hookGame';
import { injectGamesJsonLd, updatePageTitle } from './seoUtils';

const DRAWER_WIDTH = 206;
const APPBAR_HEIGHT = 64;

function findGameById(id) {
  for (const cat of GAMES_DATA) {
    const found = cat.jeux?.find(g => g.id === id);
    if (found) return found;
  }
  return null;
}

const AppStitch = () => {
  const [selectedApp, setSelectedApp] = useState(() => {
    const id = new URLSearchParams(window.location.search).get('game');
    return id ? findGameById(id) : null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const { getRandomGame } = useRandomGame(GAMES_DATA);
  const gameStartTimeRef = useRef(null);

  useEffect(() => { injectGamesJsonLd(); }, []);
  useEffect(() => { updatePageTitle(selectedApp); }, [selectedApp]);

  const handleSelectApp = (app) => {
    setTimeout(() => {
      setSelectedApp(app);
      gameStartTimeRef.current = Date.now();
    }, 300);
  };

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

  const handleRandom = () => {
    const jeu = getRandomGame();
    if (!jeu) return;
    if (window.gtag) window.gtag('event', 'randomGame', { event_label: jeu.name });
    handleSelectApp(jeu);
  };

  useEffect(() => {
    if (selectedApp) {
      const url = selectedApp.id ? `?game=${selectedApp.id}` : '';
      window.history.pushState({ minijeuxGame: true }, '', url);
      const onPop = () => {
        sendCloseEvent(selectedApp);
        setSelectedApp(null);
      };
      window.addEventListener('popstate', onPop);
      return () => window.removeEventListener('popstate', onPop);
    }
  }, [selectedApp]);

  const returnBack = () => {
    sendCloseEvent(selectedApp);
    if (window.history.state?.minijeuxGame) {
      window.history.back();
    } else {
      setSelectedApp(null);
    }
  };

  const SelectedComponent = selectedApp?.component;

  return (
    <ThemeProvider theme={stitchTheme}>
      <CssBaseline />

      {/* Back button overlay (shown while a game is open) */}
      <AppBackButton selectedApp={selectedApp} returnBack={returnBack} />

      {/* ── Library view ── */}
      <Fade in={!selectedApp} timeout={400} mountOnEnter unmountOnExit>
        <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
          <TopNavBar
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            onRandom={handleRandom}
          />
          <SideNav drawerWidth={DRAWER_WIDTH} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              ml: 0 ,
              mt: `${APPBAR_HEIGHT}px`,
              minHeight: `calc(100dvh - ${APPBAR_HEIGHT}px)`,
            }}
          >
            <LibraryPage
              gamesData={GAMES_DATA}
              searchQuery={searchQuery}
              onSelectGame={(app) => {
                if (window.gtag)
                  window.gtag('event', 'jeu_selectionne', {
                    event_category: 'nouveauJeu',
                    event_label: app.name,
                    value: 1,
                  });
                handleSelectApp(app);
              }}
            />
          </Box>
        </Box>
      </Fade>

      {/* ── Game view ── */}
      <Fade in={!!selectedApp} timeout={400} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1200,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            bgcolor: 'background.default',
          }}
        >
          {SelectedComponent ? (
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress color="primary" />
              </Box>
            }>
              <SelectedComponent />
            </Suspense>
          ) : selectedApp ? (
            <Box sx={{ p: 4 }}>
              <h1>{selectedApp.name}</h1>
              <p>{selectedApp.description}</p>
            </Box>
          ) : null}
        </Box>
      </Fade>
    </ThemeProvider>
  );
};

export default AppStitch;
