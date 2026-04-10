import React from 'react';
import { useReglages } from './ReglageContext';
import { Box, Button, Popover } from '@material-ui/core';
import { Typography } from '@mui/material';
import { ELTS } from './Bulle';

export const NombresPopover = ({ open, anchorEl, handleClosePopover, handleReset }) => {


  const { NB_EAU, NB_YEUX, NB_FEU, setNB_FEU, setNB_YEUX, setNB_EAU, NB_AIR, setNB_AIR, NB_TERRE, setNB_TERRE, FORCEFACTOR, setFORCEFACTOR } = useReglages();



  const handleValueChange = (event) => {
    const { name, value } = event.target;
    // Vérifier que la valeur entrée est un nombre entre 0 et 100
    if (!isNaN(value) && value >= 0 && value <= 100) {
      // Utiliser les setters correspondants en fonction du champ modifié
      switch (name) {
        case 'NB_FEU':
          setNB_FEU(Number(value));
          break;
        case 'NB_EAU':
          setNB_EAU(Number(value));
          break;
        case 'NB_AIR':
          setNB_AIR(Number(value));
          break;
        case 'NB_TERRE':
          setNB_TERRE(Number(value));
          break;
        case 'NB_YEUX':
          setNB_YEUX(Number(value));
          break;
        default:
          break;
      }
    }
  };


  const fields = [
    { name: 'NB_FEU', label: 'Feu', groupe: 'feu' },
    { name: 'NB_EAU', label: 'Eau', groupe: 'eau' },
    { name: 'NB_AIR', label: 'Air', groupe: 'air' },
    { name: 'NB_TERRE', label: 'Terre', groupe: 'terre' },
    { name: 'NB_YEUX', label: 'Nb connections', groupe: 'air' },
  ];

  return <Popover
    open={open}
    anchorEl={anchorEl}
    onClose={handleClosePopover}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
  >
    <Box p={2}>
      <Typography variant="h6">Nombre au depart</Typography>
      <Box style={{ display: 'flex', flexDirection: 'column' }}>
        {fields.map((field) => (

          <label key={field.name} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ backgroundColor: ELTS[field.groupe].color, width: 30, height: 30 }} />
            {field.label}:
            <input
              type="number"
              name={field.name}
              value={eval(field.name)} // Utiliser eval pour obtenir la valeur de la variable en utilisant le nom du champ
              onChange={handleValueChange}
              min={0}
              max={200} />
          </label>

        ))}

        <Button onClick={handleReset}>Valider</Button>
      </Box>
    </Box>
  </Popover>;
};
