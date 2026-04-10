import React, { useEffect, useState } from "react";
import { Box, AppBar, Toolbar, Typography, Grid, Paper, CssBaseline, Button, ThemeProvider, createTheme } from "@mui/material";
import { MaqCityProvider, useMaqCity } from "./GangContext";
import { GlobalEventDialog, MoreMenu, TurnReportDialog } from "./GangDialogs";
import { StableView } from "./StableView";
import { CityView } from "./cityMap";
import { RecruitView } from "./RecruitView";
import MarketView from "./MarketView";
import { AttachMoney, Report, ResetTv } from "@mui/icons-material";
import { resolveGlobalEvent } from "./GangUtils";
import { OnBoardingProvider, OnBoardingStep } from "../OnBoardingContext";


const MaqCity = () => {
  return <>
    <CssBaseline />
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <MaqCityProvider>
        <GangBoard />
      </MaqCityProvider>
    </Box>
  </>
}

export default MaqCity;
const darkRedTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#b71c1c',   // rouge profond
    },
    secondary: {
      main: '#8e2424',   // rouge brun
    },
    background: {
      default: '#121212',
      paper: '#2a0f0f',  // bordeaux sombre
    },
  },
});
const GangBoard = () => {
  const { state, endTurn, reset, fairePret, showAlert, setState } = useMaqCity();
  const [uiMode, setUiMode] = useState('city');
  const [openReport, setOpenReport] = useState(false);
 const [eventDialogOpen, setEventDialogOpen] = useState(false);

  // Ouvrir le dialogue automatiquement quand un pending event arrive
  useEffect(() => {
    if (state.pendingGlobalEvent && !eventDialogOpen) {
      setEventDialogOpen(true);
    }
  }, [state.pendingGlobalEvent, eventDialogOpen]);

  const handleResolveEvent = (resolution) => {
    const newState = resolveGlobalEvent(state, resolution, showAlert);
    setState(newState);
    setEventDialogOpen(false);
  };

  const lastReport =
    state.turnLogs[state.turnLogs.length - 1];
  return (
     <ThemeProvider theme={darkRedTheme}>
      <OnBoardingProvider 
        app="maqCity" 
        stepsConfig={[
          { id: 'welcome' },
          { id: 'welcome2' },
          { id: 'paolo' },
          { id: 'retourVille' },
          { id: 'affecterFille' },
          { id: 'ramasserArgent' },
          { id: 'voirReport' },
          { id: 'ecurie' },
          { id: 'ecuriePro' },
          { id: 'ecuriePerso' },
          { id: 'marche' },
        ]}
      >
     <AppBar position="static" sx={{ bgcolor: 'background.paper' }}>
  <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>

    {/* Titre */}
    <Typography
      variant="h6"
      sx={{ fontWeight: 'bold', letterSpacing: 1 }}
    >
      MaqCity
    </Typography>

    {/* Onglets */}
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {[
        { id: 'city', label: 'Ville' },
        { id: 'stable', label: 'Écurie' },
        { id: 'recruit', label: 'Recruter' },
        { id: 'market', label: 'Marché' },
      ].map(tab => (
        <Button
          key={tab.id}
          onClick={() => setUiMode(tab.id)}
          sx={{
            px: 2,
            borderRadius: 2,
            color: uiMode === tab.id ? 'secondary.contrastText' : 'text.secondary',
            bgcolor: uiMode === tab.id ? 'secondary.main' : 'transparent',
            '&:hover': {
              bgcolor: uiMode === tab.id
                ? 'secondary.dark'
                : 'rgba(255,255,255,0.08)',
            },
          }}
        >
          {tab.label}
        </Button>
      ))}
    </Box>

    {/* Argent */}
    <Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}>
      💰 {Math.round(state.money)} $
    </Typography>

    <Typography variant="body2" sx={{color:'#a6bcef', whiteSpace: 'nowrap' }}>
       Tour {state.turn} 
    </Typography>

    {/* Actions */}
    <Box sx={{ display: 'flex', gap: 1 }}>

     
       <OnBoardingStep
              stepId="voirReport"
              condition={state.turn>1}
              message="Cliquez sur ce bouton pour comprendre tout ce qu'il s'est passé, ce rapport est essentiel"
            ></OnBoardingStep>
              <Button
                variant="contained"
                color="info"
                onClick={() => setOpenReport(true)}
              >
               <Report/>
              </Button>
      {/* Action reine */}
      <Button
        variant="contained"
        color="primary"
        onClick={endTurn}
        sx={{
          fontWeight: 'bold',
          boxShadow: 3,
        }}
      >
        Ramasser l’argent
      </Button>
        <OnBoardingStep
              stepId="ramasserArgent"
              message="Cliquez sur ce bouton pour ramasser l'argent accumulé, ca passera le tour pour la recolte des passes et les loyers"
            ></OnBoardingStep>
      <MoreMenu fairePret={fairePret} reset={reset}/>
    </Box>

  </Toolbar>
</AppBar>


      <MainView uiMode={uiMode} />

      <TurnReportDialog
        open={openReport}
        onClose={() => setOpenReport(false)}
        report={lastReport}
      />
       <GlobalEventDialog
        open={eventDialogOpen}
        event={state.pendingGlobalEvent}
        state={state}
        onResolve={handleResolveEvent}
      />
      <Footer />
      </OnBoardingProvider>
    </ThemeProvider>
  );
};

const MainView = ({ uiMode }) => {
  const {showAlert} = useMaqCity();

  switch (uiMode) {
    case 'stable':
      return <StableView />;
    case 'recruit':
      return <RecruitView />;
    case 'market':
      return <MarketView showAlert={showAlert}/>;
    case 'city':
    default:
      return <CityView />;
  }
};

const Footer = () => {
  return <Box component="footer" sx={{ p: 2, textAlign: "center", bgcolor: "background.paper" }}>
    <Typography variant="body2" color="text.secondary">
      DPY © 2026
    </Typography>
  </Box>
}