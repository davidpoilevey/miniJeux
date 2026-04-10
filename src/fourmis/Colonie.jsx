// Colonie.jsx
import React from 'react';
import { TILE_SIZE } from './Tiles';
import { Box, Paper, Typography } from '@mui/material';
import img from './images/fourmiliere.png';
import Tooltip from '@mui/material/Tooltip';

const Colonie = ({ reserve, color, name }) => {
  return (
    <Tooltip title={name}>
      <Paper
        style={{
          width: TILE_SIZE + 'px',
          height: TILE_SIZE + 'px',
          position: 'relative',
        }}
      >
        <img src={img} alt="fourmilliere" height={TILE_SIZE} />
        <Box
          sx={{
            position: 'absolute',
            top: '25%',
            left: '25%',
            textAlign: 'center',
            backgroundColor: color,
            borderRadius: '10px',
            width: TILE_SIZE / 2,
          }}
        >
          <Typography variant="caption">{reserve}</Typography>
        </Box>
      </Paper>
    </Tooltip>
  );
};


export default Colonie;
