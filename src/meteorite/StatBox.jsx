import { InstructionBox } from "./MeteorComponent"

import { Box, Typography, Button, LinearProgress } from '@mui/material';

export const StatBox = ({ resetGame, getStage, score, mass, currentStage }) => {
    const stage = getStage();
    const progress = ((mass - stage.minMass) / (stage.maxMass - stage.minMass)) * 100;
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <Box sx={{ mb: 2, display: 'flex', gap: 4, alignItems: 'center' }}>
            <Button 
                variant="outlined"
                onClick={resetGame}
                sx={{ 
                    borderColor: '#9e9e9e',
                    color: '#9e9e9e',
                    '&:hover': { 
                        borderColor: '#00bcd4',
                        color: '#00bcd4' 
                    }
                }}
            >
                Reset
            </Button>

            {/* Stage actuel */}
            <Box sx={{ 
                textAlign: 'center',
                px: 3,
                py: 1,
                background: 'linear-gradient(135deg, rgba(186, 104, 200, 0.2), rgba(156, 39, 176, 0.2))',
                borderRadius: 2,
                border: '1px solid rgba(186, 104, 200, 0.3)'
            }}>
                <Typography variant="caption" sx={{ color: '#ba68c8', display: 'block' }}>
                    Stade
                </Typography>
                <Typography variant="h5" sx={{ color: '#ba68c8', fontWeight: 'bold' }}>
                    {stage.name}
                </Typography>
            </Box>

            {/* Score */}
            <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: '#9e9e9e' }}>
                    Score
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#00bcd4' }}>
                    {score.toLocaleString()}
                </Typography>
            </Box>

            {/* Masse avec barre de progression */}
            <Box sx={{ textAlign: 'center', minWidth: 200 }}>
                <Typography variant="caption" sx={{ color: '#9e9e9e' }}>
                    Masse
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                    {humanMass(Math.floor(mass))}
                </Typography>
                
                {/* Barre de progression */}
                <Box sx={{ mt: 0.5, position: 'relative' }}>
                    <LinearProgress 
                        variant="determinate" 
                        value={clampedProgress}
                        sx={{
                            height: 8,
                            borderRadius: 1,
                            backgroundColor: 'rgba(156, 39, 176, 0.2)',
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 1,
                                background: 'linear-gradient(90deg, #9c27b0, #ba68c8, #ce93d8)',
                                transition: 'transform 0.4s ease'
                            }
                        }}
                    />
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        mt: 0.5 
                    }}>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.65rem' }}>
                            {humanMass(stage.minMass)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#ba68c8', fontSize: '0.65rem', fontWeight: 'bold' }}>
                            {clampedProgress.toFixed(0)}%
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.65rem' }}>
                            {stage.maxMass === Infinity ? '∞' : humanMass(stage.maxMass)}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Instructions */}
            <InstructionBox />
        </Box>
    );
};

function humanMass(kg) {
  const units = [
    { limit: 1, label: "kg" },
    { limit: 1e3, label: "t" },        // tonne
    { limit: 1e6, label: "kt" },       // kilotonne
    { limit: 1e9, label: "Mt" },      // mégatonne
    { limit: 1e12, label: "Gt" },      // gigatonne
    { limit: 1e15, label: "Tt" },      // tératonne
    { limit: 1e18, label: "Pt" },      // pétatonne
    { limit: 1e21, label: "Et" },      // exatonne
    { limit: Infinity, label: "?" }
  ];

  for (let i = 0; i < units.length; i++) {
    if (kg < units[i].limit) {
      const prev = i === 0 ? units[0] : units[i - 1];
      const value = kg / (i === 0 ? 1 : prev.limit);
      return `${value.toFixed(2)} ${prev.label}`;
    }
  }
}
