import {
  Drawer,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  Collapse,
  IconButton,
  Badge,
  LinearProgress,
  Slider
} from '@mui/material';
import { QuestBox, useChrono } from './PlayerHud';
import { CATQuests } from '../data/quests';
import React, { useEffect, useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ButtonDPY from '../../bitLife/ui/ButtonDPY';

const InventoryDrawer = ({
  open,
  onClose,
  inventory,
  playerState, updatePlayerState,
  quests,
  startTime,
  onSave,
  onLoad
}) => {
  const { pdv, croqs, level, vomito } = playerState;
  const chrono = useChrono(startTime);
  const [showCompletedQuests, setShowCompletedQuests] = useState(false);
  const completedQuests = Object.entries(quests.activeQuests).filter(([_, q]) => q.completed);
  const completedCount = completedQuests.length;
  const [convertingCroqs, setConvertingCroqs] = useState(false);


  const [showInventory, setShowInventory] = useState(false);
  const renderQuest = ([questId, state]) => {
    const quest = CATQuests[questId];
    if (!quest) return null;

    const stepsCompleted = new Set(state.stepsCompleted || []);
    const steps = quest.steps;

    const firstIncompleteIndex = steps.findIndex((_, i) => !stepsCompleted.has(i));
    const showDone = (i) => stepsCompleted.has(i);
    const showCurrent = (i) => i === firstIncompleteIndex && !state.completed;

    return (
      <Box key={questId} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="gold">
          {quest.name || questId}
        </Typography>
        <Typography variant="caption" color="#aaa">
          {quest.description}
        </Typography>
        <List dense sx={{ pl: 1 }}>
          {steps.map((step, i) => {
            if (showDone(i)) {
              return (
                <ListItem key={i}>
                  <ListItemText
                    primary={`✅ ${step.description}`}
                    sx={{ color: '#999' }}
                  />
                </ListItem>
              );
            } else if (showCurrent(i)) {
              return (
                <ListItem key={i}>
                  <ListItemText
                    primary={`➡️ ${step.description}`}
                    sx={{ color: 'gold' }}
                  />
                </ListItem>
              );
            } else {
              return null; // ou afficher comme inactif ?
            }
          })}

          {state.completed && (
            <ListItem>
              <ListItemText
                primary={`🎉 Quête terminée !`}
                sx={{ color: '#6f6' }}
              />
            </ListItem>
          )}
        </List>
      </Box>
    );
  };


  return (
    <Drawer anchor="right" variant="persistent" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 340,
          bgcolor: '#1a1a1a',
          height: '100%',
          color: 'gold',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: `'Press Start 2P', monospace`
        }}
      >
        {/* HEADER: Chrono + stats */}
        <Box sx={{ p: 2, borderBottom: '1px solid #333' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>

            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
              🧍 STATS (niv {level})
            </Typography>
            <Box
              sx={{
                alignSelf: 'flex-end',
                background: '#000',
                color: '#0f0',
                padding: '4px 8px',
                fontSize: '12px',
                borderRadius: '4px',
                mb: 2
              }}
            >
              ⏱️ {chrono}
            </Box>
          </Box>

          <Typography
            variant="body2"
            onClick={() => setConvertingCroqs(!convertingCroqs)}
            sx={{ cursor: 'pointer', textDecoration: 'underline', '&:hover': { color: '#fff' } }}
          >
            💰 Croqs : {croqs}
          </Typography>
          {convertingCroqs && <CroqsConversion setConvertingCroqs={setConvertingCroqs}
            croqs={croqs} updatePlayerState={updatePlayerState} playerState={playerState} />}

          <Box sx={{ my: 1 }}>
            <Typography variant="body2" color="#0f0">❤️ Santé : {pdv}%</Typography>
            <LinearProgress variant="determinate" value={pdv} color="primary" />
          </Box>
          <Box sx={{ my: 1 }}>
            <Typography variant="body2" color="#0f0">Vomi : {vomito}%</Typography>
            <LinearProgress variant="determinate" value={vomito} color="error" />
          </Box>
          <Typography variant="caption" sx={{ color: '#fa3' }}>
            - "i" pour fermer ce panneau -
          </Typography>

        </Box>

        {/* ZONE CENTRALE SCROLLABLE */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
          {/* QuestBox */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
              📜 OBJECTIFS
            </Typography>
            <QuestBox quests={quests} inPanel />
          </Box>

          {/* Quêtes détaillées */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
              🔎 Quêtes en cours
            </Typography>

            <List dense>
              {quests && Object.keys(quests.activeQuests).length > 0 ? (
                <>
                  {/* 🔹 Quêtes non terminées */}
                  {Object.entries(quests.activeQuests)
                    .filter(([_, state]) => !state.completed)      
                     .sort(([_, a], [__, b]) => (b.isCurrent === true ? 1 : 0) - (a.isCurrent === true ? 1 : 0))             
                    .map(renderQuest)}

                  {/* 🔸 Quêtes terminées */}
                  {Object.entries(quests.activeQuests).some(([_, q]) => q.completed) && (
                    <>
                      <Stack
                        direction="row"
                        alignItems="center"
                        onClick={() => setShowCompletedQuests(!showCompletedQuests)}
                        sx={{ cursor: 'pointer', mb: 1 }}
                      >
                        <Typography variant="subtitle2" color="#aaa" sx={{ flexGrow: 1 }}>
                          Quêtes terminées
                        </Typography>
                        <Badge badgeContent={completedCount} color="secondary" max={99}>
                          <IconButton size="small" sx={{ color: 'gold' }}>
                            {showCompletedQuests ? <ExpandLess /> : <ExpandMore />}
                          </IconButton>
                        </Badge>

                      </Stack>

                      <Collapse in={showCompletedQuests}>
                        {Object.entries(quests.activeQuests)
                          .filter(([_, state]) => state.completed)
                          .map(renderQuest)}
                      </Collapse>
                    </>
                  )}
                </>
              ) : (
                <ListItem>
                  <ListItemText primary="Aucune quête active." sx={{ color: '#888' }} />
                </ListItem>
              )}
            </List>
          </Box>

        </Box>

        {/* FOOTER : boutons + inventaire repliable */}
        <Box sx={{ p: 2, borderTop: '1px solid #333' }}>
          <Stack direction="row" spacing={1} justifyContent="center" mb={1}>
            <Button variant="contained" size="small" color="success" onClick={() => {
              onSave();
            }}>
              💾 Sauver
            </Button>
            <Button variant="outlined" size="small" color="info" onClick={onLoad}>
              🔄 Charger
            </Button>
          </Stack>

          {/* INVENTAIRE COMPACT */}
          <Box>
            <Stack direction="row" alignItems="center" onClick={() => setShowInventory(!showInventory)} sx={{ cursor: 'pointer' }}>
              <Typography variant="h6" sx={{ color: '#fff', flexGrow: 1 }}>
                🎒 Inventaire
              </Typography>
              <IconButton size="small" sx={{ color: 'gold' }}>
                {showInventory ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Stack>
            <Collapse in={showInventory}>
              <List dense>
                {inventory.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="(Vide)" sx={{ color: 'gold' }} />
                  </ListItem>
                ) : (
                  inventory.map((item, i) => (
                    <ListItem key={i}>
                      <ListItemText primary={`• ${item}`} sx={{ color: 'gold' }} />
                    </ListItem>
                  ))
                )}
              </List>
            </Collapse>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );

};

export default React.memo(InventoryDrawer);


const CroqsConversion = ({ setConvertingCroqs, croqs, updatePlayerState, playerState }) => {

  const [croqsToUse, setCroqsToUse] = useState(0);
  const croqsMax = Math.min(
    croqs,
    Math.floor((playerState.maxPdv - playerState.pdv) / 2)
  );

  return croqsMax > 0 ? (
    <Box
      sx={{
        backgroundColor: '#222',
        p: 2,
        borderRadius: 2,
        border: '1px solid gold',
        mt: 2
      }}
    >
      <Typography variant="body2" sx={{ mb: 1 }}>
        🍽️ Utiliser des croquettes pour se soigner :
      </Typography>

      <Slider
        value={croqsToUse}
        min={1}
        max={croqsMax}
        step={1}
        valueLabelDisplay="auto"
        onChange={(_, value) => setCroqsToUse(value)}
        sx={{
          color: 'gold'
        }}
      />

      <Typography variant="body2" sx={{ mt: 1 }}>
        → Soigne <strong>{croqsToUse * 2}</strong> pdv
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={() => {
            updatePlayerState({
              croqs: playerState.croqs - croqsToUse,
              pdv: Math.min(
                playerState.pdv + croqsToUse * 2,
                playerState.maxPdv
              )
            });
            setConvertingCroqs(false);
          }}
        >
          Manger
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={() => setConvertingCroqs(false)}
        >
          Annuler
        </Button>
      </Stack>
    </Box>
  ) : (
    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
      Aucune croqs. Trouve une gamelle.
    </Typography>
  )
}