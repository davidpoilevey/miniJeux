import React, { useContext, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Typography, Box } from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import './configMenu.css';
import { SonarContext } from './SonarProvider';


const ConfigMenu = ({ open, onClose }) => {
    const { sonarRadius, setSonarRadius, boatSpeed, setBoatSpeed, playerCoins, setPlayerCoins } =
    useContext(SonarContext);

  const handleRadiusUpgrade = () => {
    if (playerCoins >= 100) {
      setSonarRadius(sonarRadius + 50);
      setPlayerCoins(playerCoins - 100);
    }
  };

  const handleSpeedUpgrade = () => {
    if (playerCoins >= 200) {
      setBoatSpeed(boatSpeed + 1);
      setPlayerCoins(playerCoins - 200);
    }
  };

  
  return (
    <Dialog open={open} onClose={onClose} >
      <DialogTitle className='config-dialog'>
        <Box sx={{display:'flex', justifyContent:'space-evenly'}}>Boutique
      <Typography>Money:{playerCoins}</Typography>
        </Box></DialogTitle>
      <DialogContent className='config-dialog'>
        <ConfigItem handleClick={handleRadiusUpgrade} description="Amélioration de rayon de sonar (+50) - Coût : 200 pièces"
       disabled={playerCoins < 200} >
 Rayon actuel : {sonarRadius}
        </ConfigItem>
        <ConfigItem handleClick={handleSpeedUpgrade} description="Amélioration de vitesse de bateau (+1) - Coût : 100 pièces"
       disabled={playerCoins < 100} >
Vitesse actuelle : {boatSpeed}
        </ConfigItem>
       
       
      </DialogContent>
      <DialogActions className='config-dialog'>
        
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfigMenu;

const ConfigItem = ({handleClick, disabled, description, children})=>{
    return <div className="config-item">
    <p>
      {description}
      <br />
     {children}
    </p>
    <IconButton onClick={handleClick} disabled={disabled}>
      <AddCircleOutline />
    </IconButton>
  </div>
}