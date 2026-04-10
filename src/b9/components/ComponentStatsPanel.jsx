/**
 * ComponentStatsPanel - Affiche les statistiques de distribution des composants
 */

import React from 'react';
import {
  Paper,
  Typography,
  Stack,
  Chip,
  Box,
  Divider
} from '@mui/material';
import { OPTIONAL_COMPONENTS } from '../engine/components/Components.js';

const ComponentStatsPanel = ({ engine }) => {
  // Calculer la distribution des composants
  const componentCounts = {};
  
  // Initialiser tous les composants à 0
  for (const componentName in OPTIONAL_COMPONENTS) {
    componentCounts[componentName] = 0;
  }
  
  // Compter les occurrences
  const entities = engine.getEntitiesForRendering();
  for (const entity of entities) {
    for (const componentName of entity.activeComponents || []) {
      if (componentCounts[componentName] !== undefined) {
        componentCounts[componentName]++;
      }
    }
  }
  
  // Trier par fréquence
  const sortedComponents = Object.entries(componentCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  
  // Calculer le nombre moyen de composants par bactérie
  let totalComponents = 0;
  for (const entity of entities) {
    totalComponents += (entity.activeComponents || []).length;
  }
  const avgComponents = entities.length > 0 
    ? (totalComponents / entities.length).toFixed(2) 
    : 0;
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        border: '1px solid #404040',
        maxHeight: '600px',
        overflowY: 'auto'
      }}
    >
      <Stack spacing={2}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#00ff88',
            fontFamily: '"Courier New", monospace',
            fontSize: '1rem',
            letterSpacing: '0.05em'
          }}
        >
          COMPOSANTS ACTIFS
        </Typography>
        
        <Box>
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#aaa',
              fontFamily: '"Courier New", monospace'
            }}
          >
            Moyenne: {avgComponents} composants/bactérie
          </Typography>
        </Box>
        
        <Divider sx={{ borderColor: '#404040' }} />
        
        {sortedComponents.length === 0 ? (
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#888',
              fontStyle: 'italic',
              fontFamily: '"Courier New", monospace'
            }}
          >
            Aucun composant actif
          </Typography>
        ) : (
          <Stack spacing={1}>
            {sortedComponents.map(([componentName, count]) => {
              const Component = OPTIONAL_COMPONENTS[componentName];
              const color = Component.COLOR;
              if(color==null)
                return null;
              const percentage = ((count / entities.length) * 100).toFixed(1);
              
              return (
                <Box 
                  key={componentName}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <Chip
                    label={color.label || componentName}
                    size="small"
                    sx={{
                      bgcolor: `hsl(${color.h}, ${color.s}%, 40%)`,
                      color: '#fff',
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.7rem',
                      minWidth: '120px'
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#aaa',
                        fontFamily: '"Courier New", monospace',
                        minWidth: '40px',
                        textAlign: 'right'
                      }}
                    >
                      {count}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#666',
                        fontFamily: '"Courier New", monospace',
                        minWidth: '50px',
                        textAlign: 'right'
                      }}
                    >
                      ({percentage}%)
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default ComponentStatsPanel;