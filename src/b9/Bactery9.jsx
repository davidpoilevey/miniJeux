import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import SimulationView from './components/SimulationView.jsx';

// Thème sombre personnalisé
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#11e3b6',
    },
    secondary: {
      main: '#4488ff',
    },
    background: {
      default: '#eed2d2',
      paper: '#e7e4e4',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontFamily: '"Courier New", monospace',
    },
  },
});

function Bactery9() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <SimulationView />
    </ThemeProvider>
  );
}

export default Bactery9;

