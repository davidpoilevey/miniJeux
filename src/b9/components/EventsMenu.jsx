// Nouveau fichier: /src/components/EventsMenu.jsx

import React, { useState } from 'react';
import { 
  Button, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Typography
} from '@mui/material';

const EventsMenu = ({ onEvent }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEvent = (eventType) => {
    onEvent(eventType);
    handleClose();
  };

  const events = [
    {
      id: 'javel',
      emoji: '☠️',
      label: 'Javel (50% meurent)',
      description: 'Sélection aléatoire, favorise dormants/immunity',
      color: '#8800ff'
    },
    {
      id: 'drought',
      emoji: '🏜️',
      label: 'Sécheresse',
      description: 'Réserves -70%, favorise filtration/photosynthesis',
      color: '#ffaa00'
    },
    {
      id: 'heatwave',
      emoji: '☀️',
      label: 'Canicule',
      description: 'Jour permanent ×3, favorise photosynthesis',
      color: '#ffdd00'
    },
    // Ajouter dans le tableau events:

{
  id: 'radiation',
  emoji: '☢️',
  label: 'Radiation',
  description: '50% mutent massivement',
  color: '#00ff00'
},
{
  id: 'centralvoid',
  emoji: '🕳️',
  label: 'Gouffre Central',
  description: 'Zone morte au centre (réserves/lumière/chimie)',
  color: '#666666'
},
{
  id: 'edgebonus',
  emoji: '🌊',
  label: 'Bordures Fertiles',
  description: 'Périphérie ×3 ressources',
  color: '#00ddff'
},
{
  id: 'gradient',
  emoji: '⬅️',
  label: 'Gradient Horizontal',
  description: 'Ouest fertile, Est désertique',
  color: '#ffaa00'
},
{
  id: 'chemstorm',
  emoji: '🌪️',
  label: 'Tempête Chimique',
  description: '50 hotspots aléatoires toutes molécules',
  color: '#ff00ff'
},
{
  id: 'extinction',
  emoji: '💀',
  label: 'Extinction Massive',
  description: '80% meurent, réserves -90%',
  color: '#ff0000'
},
    {
      id: 'iceage',
      emoji: '❄️',
      label: 'Ère Glaciaire',
      description: 'Nuit permanente, coûts ×2, favorise dormance',
      color: '#88ccff'
    },
    {
      id: 'virus',
      emoji: '🦠',
      label: 'Attaque Virale',
      description: 'Cible composant majoritaire',
      color: '#ff4444'
    },
    {
      id: 'toxicbloom',
      emoji: '☠️',
      label: 'Bloom Toxique',
      description: 'Émission toxine C massive, favorise ToxinTolerance',
      color: '#ff00ff'
    },
    {
      id: 'predatorwave',
      emoji: '🦷',
      label: 'Vague Prédateurs',
      description: 'Spawn prédateurs aliens',
      color: '#ff0000'
    }
  ];

  return (
    <>
      <Button
        variant="contained"
        onClick={handleClick}
        sx={{
          bgcolor: '#8800ff',
          color: '#fff',
          fontFamily: '"Courier New", monospace',
          fontWeight: 700,
          fontSize: '0.9rem',
          letterSpacing: '0.05em',
          '&:hover': {
            bgcolor: '#aa22ff',
            boxShadow: '0 0 20px #8800ff'
          }
        }}
      >
        🌍 ÉVÉNEMENTS
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            border: '1px solid #404040',
            maxWidth: '350px'
          }
        }}
      >
        <Typography
          sx={{
            px: 2,
            py: 1,
            color: '#00ff88',
            fontFamily: '"Courier New", monospace',
            fontSize: '0.8rem',
            fontWeight: 700
          }}
        >
          PRESSIONS SÉLECTIVES
        </Typography>
        <Divider sx={{ borderColor: '#404040' }} />

        {events.map((event) => (
          <MenuItem
            key={event.id}
            onClick={() => handleEvent(event.id)}
            sx={{
              py: 1.5,
              '&:hover': {
                bgcolor: `${event.color}22`
              }
            }}
          >
            <ListItemIcon sx={{ fontSize: '1.5rem' }}>
              {event.emoji}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    color: event.color,
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.85rem',
                    fontWeight: 700
                  }}
                >
                  {event.label}
                </Typography>
              }
              secondary={
                <Typography
                  sx={{
                    color: '#888',
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.7rem',
                    mt: 0.5
                  }}
                >
                  {event.description}
                </Typography>
              }
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default EventsMenu;