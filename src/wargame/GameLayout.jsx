import { Box, CssBaseline, Grid, Paper } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import HexBoard from './plateau/HexBoard';
import { WGSelectionPanel } from './panels/WGSelectionPanel';
import { WGMissionPanel } from './panels/WGMissionPanel';
import { WGCasernePanel } from './panels/WGCasernePanel';
import WGAppBar from './WGAppBar';
import { useWG } from './WarGameContext';
import wargameTheme from './wargameTheme';

const GameLayout = () => {
  const { phase } = useWG();

  const isFullscreenPanel = phase === 'MISSION_CHOICE' || phase === 'CASERNE';

  return (
    <ThemeProvider theme={wargameTheme}>
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      <WGAppBar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          padding: isFullscreenPanel ? 0 : 2,
          overflow: 'hidden',
          height: 'calc(100vh - 64px)',
        }}
      >
        {phase === 'MISSION_CHOICE' && <WGMissionPanel />}

        {phase === 'CASERNE' && <WGCasernePanel />}

        {!isFullscreenPanel && (
          <Grid container spacing={2} sx={{ height: '100%' }}>
            <Grid item xs={12} md={9} sx={{ height: { xs: '50vh', md: '100%' } }}>
              <Paper sx={{ height: '100%', overflow: 'hidden' }}>
                <HexBoard />
              </Paper>
            </Grid>
            <Grid item xs={12} md={3} sx={{ height: { xs: 'auto', md: '100%' } }}>
              <WGSelectionPanel />
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
    </ThemeProvider>
  );
};

export default GameLayout;
