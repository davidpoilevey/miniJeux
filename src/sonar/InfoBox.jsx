import React, { useState } from 'react';
import { Alert, Box, Button, IconButton, Popover, Typography } from '@mui/material';
import { Info } from '@mui/icons-material';

export const InfoBox = ({ msg, startGame, tries, sonarTries, yeah, resetBtn }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [infoText, setInfoText] = useState();

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  return <Box className={`infoBox`}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <IconButton
        size="large"
        onClick={evt => { setInfoText('Appuyer sur Entree pour lancer le filet'); handlePopoverOpen(evt); }}
      >
        <Info />
      </IconButton>
      <Typography variant='h5'>Nombre de filets restants : </Typography>
      <Typography variant='h4' color="primary"> {tries}</Typography>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Typography sx={{ padding: 2 }}>{infoText}</Typography>
      </Popover>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>

      <IconButton
        size="large"
        onClick={evt => { setInfoText('Appuyer sur Espace pour donner un coup de sonar'); handlePopoverOpen(evt); }}
      >
        <Info />
      </IconButton>
      <Typography variant='h5'>Nombre de coups de sonar restants : </Typography>
      <Typography variant='h4' color="primary"> {sonarTries}</Typography>
    </Box>

    {yeah !== '' && <Box className="info-box info-boxAnimated"><Typography variant='h2'>{yeah}</Typography></Box>}



    {resetBtn && <Button onClick={startGame}>RESTART GAME</Button>}
    {msg !== '' && <Alert severity="info">{msg}</Alert>}
  </Box>;
};
