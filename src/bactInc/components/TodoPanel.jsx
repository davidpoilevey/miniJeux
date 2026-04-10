// TodoPanel.jsx
import React from "react";
import { Box, Paper, Typography, Stack, Button, Chip } from "@mui/material";
import { buildAPI, useLab } from "../LabContext";

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

export default function TodoPanel() {
  const { labState, addLog , removeHint, setLabState} = useLab();
  const advices = labState.guidance?.active || [];

  const api = buildAPI(labState);
const glassSX={background: 'rgba(255, 255, 225, 0.2)',
borderRadius: '16px',boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
backdropFilter: 'blur(5px)', border: '1px solid rgba(255, 255, 255, 0.3)'
}
  if (advices.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 2, minWidth: 280, ...glassSX }}>
        <Typography variant="h6">Conseils</Typography>
        <Typography variant="body2" color="text.secondary">Tout va bien pour l'instant.</Typography>
        {labState.reactors.length==0 && <Typography variant="h6" color="text.secondary">Commencez par acheter un bio-reacteur et une souche de bacterie</Typography>}
        {labState.reactors.filter(r=>r.assignedBacteria.length==0).length>0 && <Typography variant="h6" color="text.primary">
          Assignez  une souche de bacterie dans un bio-reacteur. Cliquez sur le bio-reacteur</Typography>}
           {labState.reactors.filter(r=>r.assignedBacteria.length>0)&&!labState.machines.find(m=>m.id==='centrifugeuse') && <Typography variant="h6" color="text.primary">
          Obtenez une centrifugeuse pour produire de l'ADN brut<br/> 
          (vital pour creer des points de recherche, mais il faut la "chercher" d'abord)</Typography>}
          <Box sx={{display:'flex', justifyContent:'space-between', gap:3}}>
            
      <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                     setLabState(ls=>({...ls, nextDest:'market'}))
                  }}
                >
                  Aller au marché
                </Button> 
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                     setLabState(ls=>({...ls, nextDest:'recherche'}))
                  }}
                >
                 On ferait pas un peu de recherche ?
                </Button>
          </Box>
      </Paper>
    );
  }

  const sorted = [...advices].sort((a,b) => {
    return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
  });

  return (
    <Paper elevation={3} sx={{ p: 2, minWidth: 320, maxHeight: 420, overflowY: "auto", ...glassSX }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Conseils et alertes</Typography>
      <Stack spacing={1}>
        {sorted.map((a) => (
          <Box key={a.ruleId} sx={{
            borderLeft: `4px solid ${a.severity === "critical" ? "#d32f2f" : a.severity === "high" ? "#f57c00" : a.severity === "medium" ? "#ffd54f" : "#90a4ae"}`,
            p: 1, background: "#fff"
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <div>
                <Typography variant="subtitle2">{a.name}</Typography>
                <Typography variant="body2" color="text.secondary">{a.message}</Typography>
                <Typography variant="caption" color="text.secondary">Vues: {a.firedCount}</Typography>
              </div>
              <div>
                <Chip label={a.severity.toUpperCase()} size="small" />
              </div>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {(a.hints || []).slice(0,3).map((h, i) => (
                h.conseil?<Typography  key={i}>{h.label}</Typography>:<Button
                  key={i}
                  size="small"
                  disabled={h.disabled}
                  variant="contained"
                  onClick={() => {
                    try {
                       h.action?.(api, labState); 
                       addLog?.(`${h.label} executé`); } catch(e) { addLog?.(`Erreur action: ${e.message}`); }
                  }}
                >
                  {h.label}
                </Button>
              ))}
              <Button size="small" variant="outlined" onClick={() => {
                addLog?.(`[REMIND] ${a.name} — ${a.message}`);
                removeHint(a);
                }}>Rappeler</Button>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
