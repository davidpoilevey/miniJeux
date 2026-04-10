import * as React from 'react';
import { Box, Typography, Collapse, IconButton, Popover } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const JeuPanel = ({ jeu }) => {
 const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box  sx={{
          backgroundColor: '#f8e970', // Couleur d'arrière-plan personnalisée
          padding: 1,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Typography variant="h5" sx={{
            fontFamily: 'Montserrat', // Police personnalisée
            fontWeight: 'bold', marginLeft:4,
             textShadow: '17px 12px 3px rgba(100,0,0,0.3)',
            color: '#833',
          }}>{jeu?.name}</Typography>
        <IconButton onClick={handleClick}>
          <ExpandMoreIcon />
        </IconButton>
      </Box>
    
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2, maxWidth: 400 , m:2, backgroundColor:'#f9f8dbff'}}>
        <Typography variant="h6">{jeu?.regles}</Typography>

        </Box>
      </Popover>
      {jeu?.component}
    </Box>
  );
};