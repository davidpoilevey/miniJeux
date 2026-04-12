import { useState, useCallback } from 'react';
import { Box } from '@mui/material';
import Stade from './Stade';
import Scoreboard from './Scoreboard';
import TacticsBar from './TacticsBar';

const INITIAL_UI = { score: [0, 0], time: 0, tactic: 'attack', phase: 'playing', oppStyleKey: null };

export default function FootballCoach({ equipe, equipeAdverse, styleAdverse, onMatchEnded }) {
  const [ui, setUi] = useState(INITIAL_UI);

  const handleUpdate = useCallback((next) => {
    setUi(prev => {
      const updated = typeof next === 'function' ? next(prev) : { ...prev, ...next };
      if (updated.phase === 'ended' && prev.phase !== 'ended') {
        const [s0, s1] = updated.score;
        const result = s0 > s1 ? 'win' : s0 < s1 ? 'loss' : 'draw';
        onMatchEnded?.({ score: updated.score, result });
      }
      return updated;
    });
  }, [onMatchEnded]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, p: 2, bgcolor: '#0d1117', minHeight: '100%' }}>
      <Scoreboard score={ui.score} time={ui.time} tactic={ui.tactic} oppStyleKey={ui.oppStyleKey} />
      <Stade onUpdate={handleUpdate} equipe={equipe} equipeAdverse={equipeAdverse} styleAdverse={styleAdverse} />
      <TacticsBar tactic={ui.tactic} />
    </Box>
  );
}
