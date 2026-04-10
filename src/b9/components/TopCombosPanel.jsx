// TopCombosPanel.jsx - VERSION AVEC FRÉQUENCE DES COMPOSANTS

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { generateFamilyName, getSpeciesColor } from '../utils/SpeciesNamer.js';
import { OPTIONAL_COMPONENTS, SPECIALIZATION_COMPONENTS } from '../engine/components/Components.js';

const getComponentLabel = (componentName) => {
  
  const Component = OPTIONAL_COMPONENTS[componentName] || SPECIALIZATION_COMPONENTS[componentName];
  
  if (Component && Component.COLOR && Component.COLOR.label) {
    return Component.COLOR.label;
  }
  
  return componentName; // Fallback si pas de label
};
const getComponentColor = (componentName) => {
  
  const Component = OPTIONAL_COMPONENTS[componentName] || SPECIALIZATION_COMPONENTS[componentName];
  
  if (Component && Component.COLOR) {
    const { h, s } = Component.COLOR;
    return `hsl(${h}, ${s}%, 50%)`; // Luminosité fixe à 50% pour la pastille
  }
  
  return '#888'; // Gris par défaut
};
const TopCombosPanel = ({ engine }) => {
  const entities = engine.getEntitiesForRendering();
  
  // Map par famille
  const familyMap = new Map();
  
  for (const entity of entities) {
    const genome = entity.genome;
    const speciesId = genome?.handler.readFloat('speciesIdentity') || 0;
    const familyName = generateFamilyName(speciesId);
    
    if (!familyMap.has(familyName)) {
      familyMap.set(familyName, {
        familyName,
        speciesId,
        count: 0,
        totalEnergy: 0,
        componentFrequency: new Map() // Fréquence de chaque composant
      });
    }
    
    const family = familyMap.get(familyName);
    family.count++;
    family.totalEnergy += entity.metabolism?.energyStored || 0;
    
    // Compter fréquence des composants
    for (const comp of entity.activeComponents) {
      
         if (!family.componentFrequency.has(comp)) {
      family.componentFrequency.set(comp, 0);
    }
    family.componentFrequency.set(comp, family.componentFrequency.get(comp) + 1);

    }
  }
  
  // Trier par popularité
  const topFamilies = Array.from(familyMap.values())
    .map(family => ({
      ...family,
      avgEnergy: family.count > 0 ? family.totalEnergy / family.count : 0,
      // Convertir fréquences en pourcentages et trier
      componentStats: Array.from(family.componentFrequency.entries())
        .map(([comp, count]) => ({
          component: comp,
          count,
          percentage: (count / family.count) * 100
        }))
        .sort((a, b) => b.percentage - a.percentage) // Trier par fréquence
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8); // Top 8 familles
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        border: '1px solid #404040',
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
          DYNASTIES
        </Typography>
        
        {topFamilies.map(({ familyName, speciesId, count, avgEnergy, componentStats }, index) => {
          const percentage = ((count / entities.length) * 100).toFixed(1);
          const familyColor = getSpeciesColor(speciesId);
          
          return (
            <Box 
              key={familyName}
              sx={{
                p: 1.5,
                bgcolor: '#222',
                borderRadius: 1,
                border: index === 0 ? `2px solid ${familyColor}` : '1px solid #333',
                boxShadow: index === 0 ? `0 0 10px ${familyColor}40` : 'none'
              }}
            >
              {/* Header famille */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: familyColor,
                      fontFamily: '"Courier New", monospace',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}
                  >
                    #{index + 1}
                  </Typography>
                  
                  <Chip
                    label={`👑 ${familyName}`}
                    size="small"
                    sx={{
                      bgcolor: familyColor,
                      color: '#000',
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em'
                    }}
                  />
                </Stack>
                
                <Stack direction="row" spacing={1}>
                  <Chip 
                    label={`${count}`}
                    size="small"
                    sx={{
                      bgcolor: '#00ff88',
                      color: '#000',
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}
                  />
                  <Chip 
                    label={`${percentage}%`}
                    size="small"
                    sx={{
                      bgcolor: '#4488ff',
                      color: '#fff',
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.7rem'
                    }}
                  />
                  <Chip 
                    label={`E:${avgEnergy.toFixed(0)}`}
                    size="small"
                    sx={{
                      bgcolor: '#ffaa00',
                      color: '#000',
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.7rem'
                    }}
                  />
                </Stack>
              </Stack>
              
              {/* Fréquence des composants */}
              <Stack spacing={0.3} ml={2}>
                {componentStats.map(({ component, percentage: compPercentage }, cpidx) => {
                  // Symboles selon fréquence
                  const componentColor = getComponentColor(component);
                  const label = getComponentLabel(component);
                  let symbol = '+';
                  if (compPercentage >= 90) symbol = '+++';
                  else if (compPercentage >= 60) symbol = '++';
                  
                  // Couleur selon fréquence
                  let color = '#888';
                  if (compPercentage >= 90) color = '#00ff88';
                  else if (compPercentage >= 60) color = '#ffaa00';
                  if(cpidx>3)
                    return null;
                  return (
                    <Stack 
                      key={component} 
                      direction="row" 
                      spacing={1} 
                      alignItems="center"
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: color,
                          fontFamily: '"Courier New", monospace',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          minWidth: '30px'
                        }}
                      >
                        {symbol}
                      </Typography>
                       <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: componentColor,
          border: '1px solid #666',
          flexShrink: 0
        }}
      />
                      <Chip
                        label={label}
                        size="small"
                        sx={{
                          bgcolor: '#2a2a2a',
                          color: '#f8f9d9',
                          fontFamily: '"Courier New", monospace',
                          fontSize: '0.65rem',
                          height: '18px',
                          '& .MuiChip-label': {
                            px: 0.5
                          }
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#666',
                          fontFamily: '"Courier New", monospace',
                          fontSize: '0.6rem'
                        }}
                      >
                        {compPercentage.toFixed(0)}%
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default TopCombosPanel;