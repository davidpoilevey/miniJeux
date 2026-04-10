import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import CambrienView from './components/CambrienView.jsx';

// Thème sombre personnalisé
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#e38111',
    },
    secondary: {
      main: '#dd2bf1',
    },
    background: {
      default: '#b8f4eb',
      paper: '#8aeedb',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontFamily: '"Courier New", monospace',
    },
  },
});

function Precambrien() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <CambrienView />
    </ThemeProvider>
  );
}

export default Precambrien;

