import React from 'react';
import Button from '@mui/material/Button';
import { Badge, Box, Typography } from '@mui/material';
import { useTheme } from '@emotion/react';

const ButtonDPY = ({ onClick, children, type="activite", disabledBecause,variant="contained", ...props }) => {
  const theme = useTheme();
  return (
    <Button
      variant={variant}
      disabled={disabledBecause!=null}
      style={{
        borderRadius: 20, // Contrôle l'arrondi du bouton
        padding: '10px 20px', // Contrôle le rembourrage du bouton
        fontWeight: 'bold', // Ajoute de l'importance au texte
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Ajoute une ombre subtile
        
        backgroundColor:type==='activite'?theme.palette.primary.main:(type==='bonneAnnee'?theme.palette.success.light:theme.palette.secondary.main)
      }}
      onClick={onClick}
      {...props}
    >
      
      {disabledBecause==null? children
      :<Box sx={{display:'flex',flexDirection:'column'}}>
        {children}
        <Typography variant="caption" color="error">{disabledBecause}</Typography>
        </Box>}
    </Button>
  );
};

export default ButtonDPY;
