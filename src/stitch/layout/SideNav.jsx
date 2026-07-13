import { useRef } from 'react';
import {
  Drawer, Box, Avatar, Typography,
  List, ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { HiScoreButton } from '../../ChuckNorrisFact';
import photoMoi from '../../DSCN0013.jpg';

const LABEL_STYLE = {
  fontFamily: '"Space Grotesk", sans-serif',
  fontSize: '0.65rem',
  textTransform: 'uppercase',
  letterSpacing: 2,
};

const NAV_SELECTED_SX = {
  borderRadius: '24px 0 0 24px',
  ml: 1,
  '&.Mui-selected': {
    bgcolor: 'background.paper',
    color: 'primary.main',
    boxShadow: '0 4px 12px rgba(50,44,57,0.06)',
    '&:hover': { bgcolor: 'background.paper' },
  },
};

const NAV_IDLE_SX = {
  borderRadius: 2,
  ml: 1,
  opacity: 0.6,
  transition: 'all 300ms cubic-bezier(0.4,0,0.2,1)',
  '&:hover': { opacity: 1, transform: 'translateX(4px)' },
};

const SideNav = ({ drawerWidth, currentView = 'library', onSelectLibrary, onSelectFavorites }) => {
  const hiScoreRef = useRef(null);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: { xs: 0, md: drawerWidth },
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          pt: '64px',   // AppBar height
          border: 'none',
          bgcolor: 'background.default',
        },
      }}
    >
      {/* Profile block */}
      <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Avatar
          src={photoMoi}
          alt="David"
          sx={{
            width: 56, height: 56,
            boxShadow: '0 4px 16px rgba(164,34,127,0.15)',
            outline: '2px solid rgba(253,111,204,0.2)',
          }}
        />
        <Box>
          <Typography
            sx={{ fontFamily: '"Newsreader", serif', fontSize: '1.2rem', color: 'text.primary', lineHeight: 1 }}
          >
            David
          </Typography>
          <Typography sx={{ ...LABEL_STYLE, letterSpacing: 0.5, color: 'text.secondary', mt: 0.25, lineHeight: 1.4 }}>
            Curator of the Ethereal Arcade.
          </Typography>
        </Box>
      </Box>

      {/* Nav */}
      <List sx={{ px: 1 }}>
        {/* Bibliothèque */}
        <ListItemButton
          selected={currentView === 'library'}
          onClick={onSelectLibrary}
          sx={currentView === 'library' ? NAV_SELECTED_SX : NAV_IDLE_SX}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            <LibraryBooksIcon />
          </ListItemIcon>
          <ListItemText
            primary="Bibliothèque"
            primaryTypographyProps={{ ...LABEL_STYLE, fontWeight: currentView === 'library' ? 700 : 400 }}
          />
        </ListItemButton>

        {/* Favoris */}
        <ListItemButton
          selected={currentView === 'favorites'}
          onClick={onSelectFavorites}
          sx={currentView === 'favorites' ? NAV_SELECTED_SX : NAV_IDLE_SX}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            <AutoAwesomeIcon />
          </ListItemIcon>
          <ListItemText
            primary="Favoris"
            primaryTypographyProps={{ ...LABEL_STYLE, fontWeight: currentView === 'favorites' ? 700 : 400 }}
          />
        </ListItemButton>

        {/* Top Scores — triggers HiScoreButton */}
        <ListItemButton
          onClick={() => hiScoreRef.current?.click()}
          sx={NAV_IDLE_SX}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <LeaderboardIcon />
          </ListItemIcon>
          <ListItemText
            primary="Top Scores"
            primaryTypographyProps={LABEL_STYLE}
          />
        </ListItemButton>
      </List>

      {/* HiScoreButton hidden — acts as anchor for the Popover */}
      <Box sx={{ display: 'none' }}>
        <HiScoreButton ref={hiScoreRef} />
      </Box>
    </Drawer>
  );
};

export default SideNav;
