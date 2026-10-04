// La vitrine des viseurs
import React from 'react';
import { Box, Typography } from '@mui/material';
import { HUD } from './constants';
import { CROSSHAIRS } from './crosshairs';

// le Classique n'est pas une image : on le redessine en petit pour la vitrine
export const ClassicIcon = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" stroke="rgb(120,255,140)" strokeWidth="3">
    <path d="M22 4v10M22 30v10M4 22h10M30 22h10" />
    <rect x="21" y="21" width="2" height="2" fill="rgb(120,255,140)" stroke="none" />
  </svg>
);

// la vitrine : clic sur un viseur pas encore à toi = achat (si tu as de quoi), sur un viseur à toi = équiper
export const CrosshairShop = ({ save, onPick }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, width: '100%', maxWidth: 520 }}>
    {CROSSHAIRS.map((x) => {
      const owned = save.owned.includes(x.id);
      const equipped = save.crosshair === x.id;
      const affordable = owned || save.money >= x.price;
      const label = equipped ? 'Équipé' : owned ? 'Équiper' : `${x.price} $`;
      const color = equipped ? '#ffd860' : owned ? '#c8b88a' : affordable ? '#7fd87f' : '#d33';
      return (
        <Box key={x.id} onClick={() => affordable && onPick(x)}
          sx={{ bgcolor: '#14110d', border: `2px solid ${equipped ? '#ffd860' : '#3a342c'}`, borderRadius: 1, p: 0.5,
            display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: affordable ? 1 : 0.45,
            cursor: affordable ? 'pointer' : 'not-allowed', '&:hover': affordable ? { borderColor: '#ffd860' } : {} }}>
          {x.src ? <img src={x.src} alt={x.name} width={44} height={44} /> : <ClassicIcon />}
          <Typography sx={{ ...HUD, fontSize: 13 }}>{x.name}</Typography>
          <Typography sx={{ ...HUD, fontSize: 13, fontWeight: 'bold', color }}>{label}</Typography>
        </Box>
      );
    })}
  </Box>
);
