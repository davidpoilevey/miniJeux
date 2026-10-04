// Le menu par-dessus le jeu (départ, pause, mort, victoire) : le butin, la boutique de viseurs, et on y retourne
import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { HUD } from './constants';
import { CrosshairShop } from './CrosshairShop';

export const MenuOverlay = ({ status, started, earned, save, onPick, onStart }) => {
  const title = { dead: 'Tu es mort', won: 'Salle nettoyée !' }[status] ?? (started ? 'Pause' : 'DoomLike');
  const titleColor = { dead: '#d33', won: '#7fd8ff' }[status] ?? HUD.color;
  return (
    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.75)', overflowY: 'auto', p: 2,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
      <Typography sx={{ ...HUD, fontSize: 40, lineHeight: 1, color: titleColor }}>{title}</Typography>
      {status !== 'play' && earned > 0 && (
        <Typography sx={{ ...HUD, fontSize: 18, color: '#7fd87f' }}>Butin de la partie : +{earned} $</Typography>
      )}
      <Typography sx={{ ...HUD, fontSize: 16 }}>
        Boutique de viseurs · tu as <b style={{ color: '#7fd87f' }}>{save.money} $</b>
      </Typography>
      <CrosshairShop save={save} onPick={onPick} />
      <Button variant="contained" onClick={onStart}
        sx={{ ...HUD, fontSize: 20, fontWeight: 'bold', color: '#000', bgcolor: '#c8b88a', '&:hover': { bgcolor: '#ffd860' } }}>
        {status !== 'play' ? 'Recommencer' : started ? 'Reprendre' : 'Jouer'}
      </Button>
      <Typography sx={{ ...HUD, fontSize: 13, opacity: 0.7, textAlign: 'center' }}>
        Chaque monstre tué rapporte des $ (+50 % au headshot)<br />
        Souris : viser (la tête, c'est ×4) · Clic : tirer · Z Q S D : bouger · 1 à 4 ou molette : arme · Échap : pause
      </Typography>
    </Box>
  );
};
