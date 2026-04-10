import { AppBar, Toolbar, Typography, InputBase, Button, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CasinoIcon from '@mui/icons-material/Casino';

const LABEL_FONT = { fontFamily: '"Space Grotesk", sans-serif' };

const TopNavBar = ({ searchQuery, onSearch, onRandom }) => (
  <AppBar position="fixed" elevation={0} sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
    <Toolbar sx={{ display: 'flex', gap: 2, px: { xs: 2, md: 4 }, minHeight: 64 }}>

      {/* Brand */}
      <Typography
        variant="h5"
        sx={{
          fontFamily: '"Newsreader", serif',
          fontStyle: 'italic',
          color: 'primary.main',
          letterSpacing: 2,
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        Mini-jeux de David
      </Typography>

      {/* Search — hidden on mobile */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        gap: 1,
        bgcolor: '#efe4f8',
        borderRadius: 6,
        px: 2,
        py: 0.75,
        flex: 1,
        maxWidth: 420,
      }}>
        <SearchIcon sx={{ color: 'text.secondary', fontSize: 18, flexShrink: 0 }} />
        <InputBase
          placeholder="Chercher un jeu ou un tag..."
          value={searchQuery}
          onChange={e => onSearch(e.target.value)}
          sx={{ flex: 1, fontSize: 14, color: 'text.primary', '& input::placeholder': { color: '#b2aaba' } }}
        />
      </Box>

      <Box sx={{ flex: 1 }} />

      {/* Random Game */}
      <Button
        variant="contained"
        onClick={onRandom}
        startIcon={<CasinoIcon />}
        sx={{
          ...LABEL_FONT,
          fontSize: '0.65rem',
          letterSpacing: 2,
          px: 2.5,
          py: 1,
          bgcolor: 'primary.main',
          flexShrink: 0,
          '&:hover': {
            bgcolor: '#8a1a6a',
            boxShadow: '0 0 20px rgba(164,34,127,0.3)',
          },
        }}
      >
        Random
      </Button>
    </Toolbar>
  </AppBar>
);

export default TopNavBar;
