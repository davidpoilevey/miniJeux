// components/PlayerHUD.jsx
import { Box, Typography, Stack, LinearProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { CATQuests } from '../data/quests';

const PlayerHUD = ({ startTime, pdv,vomito, maxPdv = 50, croqs, level }) => {

 const chrono = useChrono(startTime);
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(2px)',
        padding: '8px 12px',
        borderRadius: '8px',
        color: 'white',
        minWidth: 180,
        zIndex: 100
      }}
    >
      <Box
      sx={{
        position: "absolute",
        top: 8,
        right: 8,
        background: "#000",
        color: "#0f0",
        padding: "4px 8px",
        fontFamily: "Press Start 2P",
        fontSize: "12px",
        borderRadius: "4px",
        zIndex: 100
      }}
    >
      ⏱️ {chrono}
    </Box>
      <Stack spacing={3} direction="row"  alignItems="baseline">
        <Typography variant="body2">💰 {croqs}  croqs</Typography>
       <Stack spacing={1}>

        <Stack direction="row" spacing={1} alignItems="center" minWidth={100}>
          <Typography variant="body2">❤️</Typography>
          <LinearProgress
            variant="determinate"
            value={(pdv / maxPdv) * 100}
            sx={{ flexGrow: 1, height: 8, borderRadius: 5, backgroundColor: '#333', '& .MuiLinearProgress-bar': { backgroundColor: 'blue' } }}
          />
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" minWidth={100}>
          <Typography variant="body2">Vomi</Typography>
          <LinearProgress
            variant="determinate"
            value={vomito||0}
            sx={{ flexGrow: 1, height: 8, borderRadius: 5, backgroundColor: '#333', '& .MuiLinearProgress-bar': { backgroundColor: 'red' } }}
          />
        </Stack>
       </Stack>
        <Typography variant="body2">🧍‍♂️ Niveau {level}</Typography>

      </Stack>
    </Box>
  );
};

export default PlayerHUD;

export const useChrono = (startTime) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return formatTime(elapsed);
};

export const QuestBox = ({ quests, inPanel }) => {
  const activeEntry = Object.entries(quests.activeQuests).find(
    ([id, q]) => q.isCurrent
  );

  if (!activeEntry) return null;

  const [questId, state] = activeEntry;
  const quest = CATQuests[questId];
  const stepsCompleted = new Set(state.stepsCompleted || []);

  const step = quest?.steps.find((_, i) => !stepsCompleted.has(i));

  return (
    <Box
      sx={{
        position: inPanel ? "relative" : "absolute",
        top: inPanel ? "0" : "100px",
        right: inPanel ? "0" : "16px",
        width: "260px",
        backgroundColor: "#fffaf0",
        border: "2px solid #d4af37",
        borderRadius: "8px",
        padding: "12px",
        fontFamily: "Press Start 2P",
        fontSize: "10px",
        boxShadow: "0 0 8px #0003",
        zIndex: 90
      }}
    >
      <Typography variant="subtitle2" sx={{ color: "#6b3e00", mb: 1 }}>
        🧭 {quest.name}
      </Typography>
      <Typography variant="body2" sx={{ color: "#333" }}>
        ➤ {step?.description || "🎉 Quête terminée !"}
      </Typography>
    </Box>
  );
};
