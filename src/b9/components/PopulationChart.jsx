// Dans PopulationChart.jsx

import React, { useState, useEffect } from 'react';
import { Paper, Typography, Stack } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PopulationChart = ({ historyData }) => {
  // Force re-render périodique
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000); // Re-render toutes les secondes

    return () => clearInterval(interval);
  }, []);

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2,
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        border: '1px solid #404040'
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
          ÉVOLUTION POPULATIONS
        </Typography>
        
        <ResponsiveContainer width="100%" height={400}>
          <LineChart 
            data={historyData}
            key={historyData.length} // Force re-render quand data change
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="tick" 
              stroke="#888"
              style={{ fontSize: '0.7rem', fontFamily: '"Courier New", monospace' }}
            />
            <YAxis 
              stroke="#888"
              style={{ fontSize: '0.7rem', fontFamily: '"Courier New", monospace' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a1a1a', 
                border: '1px solid #404040',
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem'
              }}
            />
            <Legend 
              wrapperStyle={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#00ff88" 
              strokeWidth={2}
              name="Population totale"
              dot={false}
              isAnimationActive={false} // IMPORTANT
            />
            <Line 
              type="monotone" 
              dataKey="predators" 
              stroke="#ff4444" 
              strokeWidth={2}
              name="Predator"
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="photosynthesis" 
              stroke="#88ff44" 
              strokeWidth={2}
              name="Photosynthesis"
              dot={false}
              isAnimationActive={false}
            />
            <Line 
              type="monotone" 
              dataKey="filtration" 
              stroke="#4488ff" 
              strokeWidth={2}
              name="Filtration"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Stack>
    </Paper>
  );
};

export default PopulationChart;