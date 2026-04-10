import { createTheme } from "@mui/material";

export const cultTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9c27b0', // Violet profond
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    secondary: {
      main: '#ffd700', // Or
      light: '#ffed4e',
      dark: '#c7a600',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a2e',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ff6f00',
    },
  },
  typography: {
    fontFamily: '"Cinzel", "Playfair Display", serif',
    h3: {
      fontWeight: 700,
      letterSpacing: '0.1em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '0.05em',
    },
    body1: {
      fontFamily: '"Lato", sans-serif',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(156, 39, 176, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          letterSpacing: '0.1em',
          fontWeight: 600,
        },
      },
    },
  },
});