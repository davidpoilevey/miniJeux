import { createTheme } from '@mui/material/styles';

const stitchTheme = createTheme({
  palette: {
    primary:    { main: '#a4227f', contrastText: '#ffeef4' },
    secondary:  { main: '#00647d', contrastText: '#e3f6ff' },
    success:    { main: '#006940', contrastText: '#caffdb' },
    info:       { main: '#00647d', contrastText: '#e3f6ff' },
    warning:    { main: '#d6aa16', contrastText: '#322c39' },
    error:      { main: '#b41340', contrastText: '#ffefef' },
    background: { default: '#fcf4ff', paper: '#ffffff' },
    text:       { primary: '#322c39', secondary: '#5f5967' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    h1: { fontFamily: '"Newsreader", serif' },
    h2: { fontFamily: '"Newsreader", serif' },
    h3: { fontFamily: '"Newsreader", serif' },
    h4: { fontFamily: '"Newsreader", serif' },
    h5: { fontFamily: '"Newsreader", serif' },
    h6: { fontFamily: '"Newsreader", serif' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#fcf4ff',
          color: '#322c39',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(252, 244, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 20px 40px -10px rgba(164,34,127,0.08)',
          color: '#322c39',
          borderBottom: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#fcf4ff',
          border: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 20px 40px -10px rgba(50,44,57,0.08)',
          border: 'none',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'uppercase',
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(178,170,186,0.15)' },
      },
    },
  },
});

export default stitchTheme;
