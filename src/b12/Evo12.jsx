import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import E12View from './components/E12View';

// Thème sombre personnalisé
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2ab80d',
    },
    secondary: {
      main: '#c50d4e',
    },
    background: {
      default: '#6a9cb4',
      paper: '#3f9686',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontFamily: '"Courier New", monospace',
    },
  },
});

function Evo12() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <E12View />
    </ThemeProvider>
  );
}

export default Evo12;

