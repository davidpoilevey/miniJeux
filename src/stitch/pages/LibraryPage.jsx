import { Box } from '@mui/material';
import HeroHeader from '../components/HeroHeader';
import GamesGrid from '../components/GamesGrid';
import '../stitch.css';

const LibraryPage = ({ gamesData, searchQuery, onSelectGame }) => (
  <Box
    className="stitch-grid-bg"
    sx={{ px: { xs: 2, md: 4 }, pt: 4, pb: 12, minHeight: '100%', position: 'relative' }}
  >
    {/* Sun motif — fixed background radial */}
    <Box sx={{
      position: 'fixed',
      top: 0, right: 0,
      width: { xs: 320, md: 640 },
      height: { xs: 320, md: 640 },
      background: 'radial-gradient(circle at top right, rgba(253,111,204,0.07) 0%, transparent 55%)',
      pointerEvents: 'none',
      zIndex: 0,
    }} />

    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <HeroHeader />
      <GamesGrid gamesData={gamesData} searchQuery={searchQuery} onSelectGame={onSelectGame} />
    </Box>
  </Box>
);

export default LibraryPage;
