import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box, ToggleButton, ToggleButtonGroup,
  Menu, MenuItem, ListItemIcon, ListItemText, Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material';
import {
  Save, Publish as ImportExport, // 'Publish' est une alternative plus claire pour "charger"
  VolumeUp, VolumeOff, MoreVert, FastForward, BugReport, // Pour le cheat code
  Map,
  Biotech,
  LocationCity,
  Summarize,
  ArrowDropDown,
  InfoOutlined
} from '@mui/icons-material';
import { useCivContext } from '../CivContext';
import { getYearForTurn } from './utils';


// Le composant musical n'est plus dans la barre,
// mais il peut être placé à la racine de votre app et contrôlé par l'état global.
// import UnPeuDeMusique from './UnPeuDeMusique';

const CivAppBar = ({ selected, setSelected }) => {
  const { turn, nextTurn, cities, playerNation, setRunning, isRunning, selectedCity, setSelectedCity, saveCiv, loadCiv, cheatGiveResources } = useCivContext();
  const playerCities = cities.filter(city => city.owner?.id === playerNation?.id);

  const handleCityMenuOpen = (event) => {
    event.stopPropagation(); // Empêche le changement d'onglet
    setCityMenuAnchor(event.currentTarget);
  };

  const handleCityMenuClose = () => {
    setCityMenuAnchor(null);
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    handleCityMenuClose();
  };
  const [cityMenuAnchor, setCityMenuAnchor] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const [isMuted, setIsMuted] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);


  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // La signature de l'événement onChange est identique, aucune modification nécessaire !
  const handleSelectTab = (event, newSelection) => {
    setSelected(newSelection);
  };

  // Les autres fonctions (handleSave, etc.) restent inchangées...
  const handleSave = () => { saveCiv(); handleMenuClose(); };
  const handleLoad = () => { loadCiv(); handleMenuClose(); };
  const handleCheat = () => { cheatGiveResources(); handleMenuClose(); };
  const handleToggleVolume = () => { setIsMuted(!isMuted); handleMenuClose(); };

  return (
    <AppBar position="static">
      <Toolbar>
         <IconButton
              size="small"
              color="inherit"
              onClick={() => setInfoOpen(true)}
              sx={{ mt: '2px' }}
              aria-label="Infos"
            >
              <InfoOutlined color="info" />
            </IconButton>
        <Typography variant="h6" noWrap component="div">
          Civilization
        </Typography>
        {/* PARTIE CENTRALE: Remplacée par le composant Tabs */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Tabs centered
            value={selected}
            onChange={handleSelectTab}
            textColor="inherit"
            indicatorColor="secondary"
            aria-label="Navigation principale"
          >
            <Tab value="map" label="Carte" icon={<Map />} />
            <Tab value="recherche" label="Recherche" icon={<Biotech />} />

            {/* Tab City avec menu */}
            <Tab
              value="city"
              disabled={!selectedCity}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      onClick={handleCityMenuOpen}>
                  {selectedCity?.name || 'Cité'}
                  {playerCities.length > 1 && selected === "city" && (
                    <ArrowDropDown
                      sx={{
                        fontSize: 16,
                        cursor: 'pointer',
                        '&:hover': { color: 'secondary.main' }
                      }}
                    />
                  )}
                </Box>
              }
              icon={<LocationCity />}
            />

            <Tab value="sump" label="Résumé" icon={<Summarize />} />
          </Tabs>

          {/* Menu des villes */}
          <Menu
            anchorEl={cityMenuAnchor}
            open={Boolean(cityMenuAnchor)}
            onClose={handleCityMenuClose}
            PaperProps={{
              sx: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
              }
            }}
          >
            {playerCities.map((city) => (
              <MenuItem
                key={city.id}
                onClick={() => handleCitySelect(city)}
                selected={city.id === selectedCity?.id}
                sx={{
                  color: 'white',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }
                }}
              >
                <ListItemIcon>
                  <LocationCity sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary={city.name} />
              </MenuItem>
            ))}
          </Menu>
        </Box>

        {/* PARTIE DROITE: Reste identique */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" noWrap>
            An {getYearForTurn(turn)}
          </Typography>
          <Button
            variant="contained"
            color="warning"
            size="large"
            disabled={isRunning}
            startIcon={<FastForward />}
            onClick={() => {
              setRunning(true);
              setTimeout(nextTurn,1);
            }}
          >
            Fin du tour ({turn})
          </Button>
          <IconButton edge="end" color="inherit" onClick={handleMenuOpen}>
            <MoreVert />
          </IconButton>
        </Box>

        {/* Le Menu reste identique */}
        <Menu id="appbar-menu" anchorEl={anchorEl} open={isMenuOpen} onClose={handleMenuClose} /* ...autres props */ >
          {/* ...MenuItems... */}
          <MenuItem onClick={handleToggleVolume}>
            <ListItemIcon>
              {isMuted ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
            </ListItemIcon>
            <ListItemText>{isMuted ? "Activer le son" : "Couper le son"}</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleSave}>
            <ListItemIcon><Save fontSize="small" /></ListItemIcon>
            <ListItemText>Sauvegarder</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleLoad}>
            <ListItemIcon><ImportExport fontSize="small" /></ListItemIcon>
            <ListItemText>Charger</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleCheat}>
            <ListItemIcon><BugReport fontSize="small" color="error" /></ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>CHEAT CODE</ListItemText>
          </MenuItem>
        </Menu>
<DialogInfo infoOpen={infoOpen} onClose={() => setInfoOpen(false)}/>
      </Toolbar>
    </AppBar>
  );
};

export default CivAppBar;




const DialogInfo=({infoOpen, onClose})=>{

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
              <li><strong>Ville</strong> : Gérez ce que produisent vos villes</li>
              <li><strong>Résumé</strong> : Statistiques et état de votre civilisation</li>
            </ul>
          </Box>

          <Box>
            <Typography variant="h6">📜 Règles du jeu</Typography>
            <Typography variant="body2" color="text.secondary">
              Les regles sont les memes que le jeu Civilization I, j'ai juste pas pu gerer le passage d'une unité par-dessus une ville, faudra contourner.
              Et il manque certainement un paquet d'unité, mais mefiez-vous des diplomates adverses qui peuvent vous retourner une ville.
              Le jeu est en mode Facile.
              Les unités peuvent se deplacer sur de longues distances si vous leur donnez un objectif.
              parfois un trou noir les absorbe, ou ils tombent dans une faille spatio-temporelle (il y a un bug rare)
              , dans ce cas, l'unité est perdue et retrouve son chemin le tour suivant pres d'une ville a elle 
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
}