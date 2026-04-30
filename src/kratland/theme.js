import { createTheme } from '@mui/material/styles'

const kratlandTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main:         '#984300',
      light:        '#bb5810',
      dark:         '#763300',
      contrastText: '#ffffff',
    },
    secondary: {
      main:         '#944a23',
      light:        '#fd9e70',
      dark:         '#76330d',
      contrastText: '#ffffff',
    },
    error: {
      main:         '#ba1a1a',
      light:        '#ffdad6',
      dark:         '#93000a',
      contrastText: '#ffffff',
    },
    warning: { main: '#825100' },
    background: {
      default: '#fdf9e9',   // zone principale
      paper:   '#f8f4e4',   // sidebar, cartes
    },
    text: {
      primary:   '#1c1c13',
      secondary: '#554336',
      disabled:  '#887364',
    },
    divider: '#dbc2b0',
  },

  typography: {
    fontFamily: '"Newsreader", serif',
    h1: { fontFamily: '"Noto Serif", serif', fontWeight: 900 },
    h2: { fontFamily: '"Noto Serif", serif', fontWeight: 700 },
    h3: { fontFamily: '"Noto Serif", serif', fontWeight: 700 },
    h4: { fontFamily: '"Noto Serif", serif', fontWeight: 700 },
    h5: { fontFamily: '"Noto Serif", serif', fontWeight: 700 },
    h6: { fontFamily: '"Noto Serif", serif', fontWeight: 700 },
    button:  { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 },
    caption: { fontFamily: '"Plus Jakarta Sans", sans-serif' },
    overline:{ fontFamily: '"Plus Jakarta Sans", sans-serif', letterSpacing: '0.1em' },
  },

  shape: { borderRadius: 4 },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#fdf9e9', minHeight: '100vh' },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(152,67,0,0.20)',
          '&:hover': { boxShadow: '0 4px 12px rgba(152,67,0,0.28)' },
        },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root:         { borderRadius: 4, height: 8 },
        colorPrimary: { backgroundColor: '#e6e3d3' },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          '&.Mui-selected': {
            backgroundColor: '#e6e3d3',
            color: '#984300',
            '&:hover': { backgroundColor: '#dbc2b0' },
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { fontFamily: '"Plus Jakarta Sans", sans-serif' },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
})

export default kratlandTheme
