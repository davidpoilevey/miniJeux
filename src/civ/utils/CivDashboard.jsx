import React, { useState } from 'react';
import {
  Box, Typography, Button, IconButton, Tooltip, Divider,
  Menu, MenuItem, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent,
} from '@mui/material';
import {
  Map, Biotech, LocationCity, Summarize, EmojiEvents,
  Save, Publish, VolumeUp, VolumeOff, BugReport, InfoOutlined,
  ArrowDropDown,
} from '@mui/icons-material';
import { useCivContext } from '../CivContext';
import { getYearForTurn } from './utils';

const EVENT_COLORS = {
  info: '#90caf9',
  warning: '#ffb74d',
  success: '#81c784',
  error: '#e57373',
};

/**
 * Tableau de bord latéral : le poste de commandement du joueur.
 * Navigation entre les écrans, journal des événements en continu (fini la
 * chasse aux snackbars) et LE bouton qui rythme le jeu : Fin du tour.
 */
const CivDashboard = ({ selected, setSelected }) => {
  const {
    turn, nextTurn, cities, playerNation, setRunning, isRunning,
    selectedCity, setSelectedCity, saveCiv, loadCiv, cheatGiveResources,
    eventLog, currentResearch,
  } = useCivContext();

  const [isMuted, setIsMuted] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [cityMenuAnchor, setCityMenuAnchor] = useState(null);

  const playerCities = cities.filter(c => c.owner?.id === playerNation?.id);
  const idleCities = playerCities.filter(c =>
    !c.currentProduction && (c.productionQueue?.length || 0) === 0);

  const endTurn = () => {
    if (isRunning) return;
    setRunning(true);
    setTimeout(nextTurn, 1);
  };

  const NAV_ITEMS = [
    { value: 'map', label: 'Carte', icon: <Map fontSize="small" /> },
    { value: 'recherche', label: 'Recherche', icon: <Biotech fontSize="small" /> },
    {
      value: 'city',
      label: selectedCity?.name || 'Cité',
      icon: <LocationCity fontSize="small" />,
      disabled: !selectedCity,
      withCityMenu: playerCities.length > 1,
    },
    { value: 'sump', label: 'Résumé', icon: <Summarize fontSize="small" /> },
    { value: 'palmares', label: 'Palmarès', icon: <EmojiEvents fontSize="small" /> },
  ];

  return (
    <Box sx={{
      width: 260, minWidth: 260, height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(180deg, #2a2318 0%, #171310 100%)',
      color: '#e8ddc8',
      borderRight: '2px solid #8a6d3b',
      boxShadow: '3px 0 12px rgba(0,0,0,0.5)',
    }}>
      {/* En-tête : la nation et l'époque */}
      <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Typography fontSize={34} lineHeight={1}>{playerNation?.flag}</Typography>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.1}>
            {playerNation?.name}
          </Typography>
          <Typography variant="caption" sx={{ color: '#b8a88a' }}>
            An {getYearForTurn(turn)} · Tour {turn}
          </Typography>
        </Box>
      </Box>

      {/* ⌛ LE bouton — le cœur qui bat */}
      <Box sx={{ px: 1.5, pb: 1 }}>
        <Button
          fullWidth
          disabled={isRunning}
          onClick={endTurn}
          sx={{
            height: 58, fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: 1,
            color: '#241f16',
            background: 'linear-gradient(180deg, #f0c05a, #c8922a)',
            border: '2px solid #8a6d3b', borderRadius: 2,
            boxShadow: '0 3px 10px rgba(0,0,0,0.6)',
            '&:hover': { background: 'linear-gradient(180deg, #f7cd74, #d6a034)' },
            '&.Mui-disabled': { background: '#4a4438', color: '#8d8574' },
          }}
        >
          ⌛ Fin du tour
        </Button>

        {/* Rappels avant de tourner la page de l'histoire */}
        {idleCities.length > 0 && (
          <Typography
            variant="caption"
            onClick={() => { setSelectedCity(idleCities[0]); setSelected('city'); }}
            sx={{ display: 'block', mt: 0.5, color: '#ffb74d', cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' } }}
          >
            💤 {idleCities.length} ville{idleCities.length > 1 ? 's' : ''} sans production
          </Typography>
        )}
        {!currentResearch && (
          <Typography
            variant="caption"
            onClick={() => setSelected('recherche')}
            sx={{ display: 'block', mt: 0.5, color: '#ffb74d', cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' } }}
          >
            🧪 Aucune recherche en cours
          </Typography>
        )}
      </Box>

      <Divider sx={{ borderColor: '#4a3f2a' }} />

      {/* Navigation entre les écrans */}
      <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {NAV_ITEMS.map(item => (
          <Button
            key={item.value}
            startIcon={item.icon}
            disabled={item.disabled}
            onClick={() => setSelected(item.value)}
            endIcon={item.withCityMenu ? (
              <ArrowDropDown onClick={(e) => { e.stopPropagation(); setCityMenuAnchor(e.currentTarget); }} />
            ) : null}
            sx={{
              justifyContent: 'flex-start',
              color: selected === item.value ? '#f0c05a' : '#cfc3a8',
              backgroundColor: selected === item.value ? 'rgba(240, 192, 90, 0.12)' : 'transparent',
              borderLeft: selected === item.value ? '3px solid #f0c05a' : '3px solid transparent',
              borderRadius: 1,
              textTransform: 'none',
              fontWeight: selected === item.value ? 'bold' : 'normal',
              '&:hover': { backgroundColor: 'rgba(240, 192, 90, 0.08)' },
              '&.Mui-disabled': { color: '#6b6252' },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      {/* Sélecteur de ville (quand on a un empire) */}
      <Menu
        anchorEl={cityMenuAnchor}
        open={Boolean(cityMenuAnchor)}
        onClose={() => setCityMenuAnchor(null)}
        PaperProps={{ sx: { backgroundColor: 'rgba(30,25,15,0.95)', border: '1px solid #8a6d3b' } }}
      >
        {playerCities.map(city => (
          <MenuItem
            key={city.id}
            selected={city.id === selectedCity?.id}
            onClick={() => { setSelectedCity(city); setSelected('city'); setCityMenuAnchor(null); }}
            sx={{ color: '#e8ddc8' }}
          >
            <ListItemIcon><LocationCity sx={{ color: '#cfc3a8' }} fontSize="small" /></ListItemIcon>
            <ListItemText primary={city.name} secondary={`${city.population * 1000} hab.`}
              secondaryTypographyProps={{ sx: { color: '#8d8574' } }} />
          </MenuItem>
        ))}
      </Menu>

      <Divider sx={{ borderColor: '#4a3f2a' }} />

      {/* 📜 Journal : l'histoire s'écrit ici, plus besoin de guetter les snackbars */}
      <Typography variant="overline" sx={{ px: 1.5, pt: 0.5, color: '#b8a88a' }}>
        📜 Journal
      </Typography>
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, pb: 1 }}>
        {eventLog.length === 0 && (
          <Typography variant="caption" sx={{ color: '#6b6252', fontStyle: 'italic' }}>
            L'histoire de votre civilisation s'écrira ici...
          </Typography>
        )}
        {[...eventLog].reverse().map(evt => (
          <Box
            key={evt.id}
            sx={{
              mb: 0.6, pl: 1, py: 0.3,
              borderLeft: `3px solid ${EVENT_COLORS[evt.type] || EVENT_COLORS.info}`,
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '0 4px 4px 0',
            }}
          >
            <Typography variant="caption" sx={{ display: 'block', color: '#e8ddc8', lineHeight: 1.3, whiteSpace: 'pre-line' }}>
              {evt.text}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8d8574', fontSize: '0.65rem' }}>
              An {getYearForTurn(evt.timestamp)}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ borderColor: '#4a3f2a' }} />

      {/* Intendance */}
      <Box sx={{ p: 0.5, display: 'flex', justifyContent: 'space-around' }}>
        <Tooltip title="Sauvegarder">
          <IconButton size="small" sx={{ color: '#cfc3a8' }} onClick={saveCiv}><Save fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Charger">
          <IconButton size="small" sx={{ color: '#cfc3a8' }} onClick={loadCiv}><Publish fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title={isMuted ? 'Activer le son' : 'Couper le son'}>
          <IconButton size="small" sx={{ color: '#cfc3a8' }} onClick={() => setIsMuted(m => !m)}>
            {isMuted ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="CHEAT CODE (ressources sur la ville sélectionnée)">
          <IconButton size="small" sx={{ color: '#e57373' }} onClick={cheatGiveResources}><BugReport fontSize="small" /></IconButton>
        </Tooltip>
        <Tooltip title="Infos et contrôles">
          <IconButton size="small" sx={{ color: '#90caf9' }} onClick={() => setInfoOpen(true)}><InfoOutlined fontSize="small" /></IconButton>
        </Tooltip>
      </Box>

      <DialogInfo infoOpen={infoOpen} onClose={() => setInfoOpen(false)} />
    </Box>
  );
};

export default CivDashboard;


const DialogInfo = ({ infoOpen, onClose }) => {
  return <Dialog open={infoOpen} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>ℹ️ Infos du jeu</DialogTitle>
    <DialogContent dividers>
      <Box mb={2}>
        <Typography variant="h6">🧭 Contrôles clavier</Typography>
        <ul>
          <li><strong>Space</strong> : Passer à l’unité suivante</li>
          <li><strong>Flèches directionnelles</strong> : Déplacer l’unité sélectionnée</li>
          <li><strong>Enter</strong> : Terminer le tour</li>
        </ul>
      </Box>

      <Box mb={2}>
        <Typography variant="h6">🖥️ Écrans du jeu</Typography>
        <ul>
          <li><strong>Carte</strong> : Vue globale avec vos unités et villes</li>
          <li><strong>Recherche</strong> : Choisissez vos technologies à débloquer</li>
          <li><strong>Cité</strong> : Gérez ce que produisent vos villes</li>
          <li><strong>Résumé</strong> : Statistiques et état de votre civilisation</li>
          <li><strong>Palmarès</strong> : Le classement des civilisations</li>
        </ul>
      </Box>

      <Box>
        <Typography variant="h6">📜 Règles du jeu</Typography>
        <Typography variant="body2" color="text.secondary">
          Les regles sont les memes que le jeu Civilization I, j'ai juste pas pu gerer le passage d'une unité par-dessus une ville, faudra contourner.
          Mefiez-vous des diplomates adverses qui peuvent vous retourner une ville, et des barbares qui rodent dans le brouillard.
          Le jeu est en mode Facile.
          Les unités peuvent se deplacer sur de longues distances si vous leur donnez un objectif.
          (Le fameux trou noir spatio-temporel qui absorbait les unités a été colmaté par une intervention divine.)
        </Typography>
      </Box>
    </DialogContent>
  </Dialog>
};
