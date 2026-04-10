// Toolbar.js
import React, { useState } from 'react';
import { Box, Button, CardHeader, Toolbar } from '@material-ui/core';

import { BubbleChart } from '@mui/icons-material';
import { useBull } from './BulContext';
import { useAquariumStyles } from './Bubulle';
import { Card, CardActions, CardContent, Grid, Rating } from '@mui/material';
import Bulle from './Bulle';
import imgAimant from './images/magnet.png';

import { ElementSelector } from './ElementChooser';
import RandomConfig from './RandomConfig';
import { ForceButton } from './ForceButton';
import { NombresPopover } from './NombresPopover';
import exempleJson from './exemple.json';
import BulleButton from './BulleButton';

const RegToolbar = () => {
  const { reset, save, load,setConfig } = useBull();
  const classes = useAquariumStyles();

  const handleReset = () => {
    reset();
    setAnchorEl(null); // Fermer le popover après avoir exécuté la fonction reset()
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleButtonClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };


  return <>
    <Box className={classes.toolbar}>
      <BubbleChart />
      <BulleButton onClick={reset}>Reset</BulleButton>
      <BulleButton onClick={handleButtonClick}>Nombres</BulleButton>
      <ForceButton groupe="feu" />
      <ForceButton groupe="air" />
      <ForceButton groupe="eau" />
      <ForceButton groupe="terre" />
      <RandomConfig />
      <BulleButton onClick={save}>Sauve cette config</BulleButton>
      <BulleButton onClick={load}>Charge une config</BulleButton>
      <BulleButton onClick={()=>{setConfig(exempleJson)}}>Config marrante</BulleButton>
    </Box>
    <NombresPopover open={open} anchorEl={anchorEl} handleReset={handleReset}
      handleClosePopover={handleClosePopover} />
  </>;
};

export default RegToolbar;


