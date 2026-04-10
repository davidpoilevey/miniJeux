import { createTheme } from '@mui/material/styles';

const wargameTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#c9a84c',
      light: '#e0c46e',
      dark: '#9a7d30',
      contrastText: '#1a1205',
    },
    secondary: {
      main: '#9b2335',
      light: '#c23b50',
      dark: '#6b1725',
      contrastText: '#fff',
    },
    background: {
      default: '#111218',
      paper: '#1c1e2e',
    },
    text: {
      primary: '#e8dcc8',
      secondary: '#9e8c78',
      disabled: '#4a4535',
    },
    divider: 'rgba(201,168,76,0.18)',
    error:   { main: '#e05252', contrastText: '#fff' },
    warning: { main: '#d4843a', contrastText: '#fff' },
    info:    { main: '#3a86b0', contrastText: '#fff' },
    success: { main: '#4aac6a', contrastText: '#fff' },
    action: {
      hover:    'rgba(201,168,76,0.07)',
      selected: 'rgba(201,168,76,0.13)',
    },
  },

  shape: { borderRadius: 6 },

  typography: {
    h4: { fontWeight: 800, letterSpacing: '0.08em' },
    h5: { fontWeight: 700, letterSpacing: '0.06em' },
    h6: { fontWeight: 600, letterSpacing: '0.04em' },
    button: { fontWeight: 700, letterSpacing: '0.06em' },
    caption: { letterSpacing: '0.04em' },
    overline: { letterSpacing: '0.18em' },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { backgroundColor: '#111218' } },
    },

    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        outlined: { borderColor: 'rgba(201,168,76,0.22)' },
        elevation1: { boxShadow: '0 2px 12px rgba(0,0,0,0.6)' },
        elevation2: { boxShadow: '0 4px 20px rgba(0,0,0,0.7)' },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },

    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          background: 'linear-gradient(180deg, #1e1a0c 0%, #13131c 100%)',
          borderBottom: '1px solid rgba(201,168,76,0.28)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.9)',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: 'linear-gradient(160deg, #d4b05a 0%, #9a7a28 100%)',
          color: '#1a1205',
          boxShadow: '0 2px 8px rgba(201,168,76,0.35)',
          '&:hover': {
            background: 'linear-gradient(160deg, #e0c070 0%, #b08030 100%)',
            boxShadow: '0 4px 14px rgba(201,168,76,0.45)',
          },
          '&.Mui-disabled': {
            background: '#2a2618',
            color: '#4a4535',
            boxShadow: 'none',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(160deg, #b02840 0%, #7a1825 100%)',
          '&:hover': {
            background: 'linear-gradient(160deg, #c03050 0%, #8a2030 100%)',
          },
        },
        containedWarning: {
          background: 'linear-gradient(160deg, #e8913e 0%, #b86820 100%)',
          color: '#fff',
          '&:hover': {
            background: 'linear-gradient(160deg, #f0a050 0%, #c87830 100%)',
          },
        },
        containedSuccess: {
          background: 'linear-gradient(160deg, #4aac6a 0%, #2e7848 100%)',
          '&:hover': {
            background: 'linear-gradient(160deg, #5ac07a 0%, #3e8858 100%)',
          },
          '&.Mui-disabled': {
            background: '#1e3028',
            color: '#3a5040',
            boxShadow: 'none',
          },
        },
        outlinedInherit: {
          borderColor: 'rgba(201,168,76,0.45)',
          color: '#e0c46e',
          '&:hover': {
            borderColor: '#c9a84c',
            backgroundColor: 'rgba(201,168,76,0.08)',
          },
        },
        containedInherit: {
          background: 'rgba(201,168,76,0.15)',
          color: '#e0c46e',
          border: '1px solid rgba(201,168,76,0.3)',
          '&:hover': {
            background: 'rgba(201,168,76,0.22)',
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
        outlinedDefault: { borderColor: 'rgba(201,168,76,0.3)' },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          color: '#9e8c78',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          '&.Mui-selected': { color: '#c9a84c' },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#c9a84c', height: 3 },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: 'rgba(201,168,76,0.15)' },
      },
    },

    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          transition: 'background 0.15s',
        },
      },
    },
  },
});

export default wargameTheme;
