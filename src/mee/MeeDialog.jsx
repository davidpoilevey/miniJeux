import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, Typography, Stack, Chip, Badge, Divider, Button, Collapse
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import * as materialIcons from '@mui/icons-material';
import { MemoryList, ReputationIndicator, RessourceBar } from "./HistoryMee";
import { getMeeNickname } from "./meeUtils";
import { ClanFlag } from "./Mee";

// Utilitaire pour compter les membres du clan
const getClanCount = (mees, maisonId) =>
  maisonId
    ? mees.filter(m =>
        m.maisonId &&
        (typeof m.maisonId === "object"
          ? m.maisonId.name === maisonId.name
          : m.maisonId === maisonId)
      ).length
    : 0;

const MeeDialog = ({ open, setOpen, mee, mees=[] }) => {
  const [confOpen, setConfOpen] = useState(false);
  const IconComponent = materialIcons[mee.icon] || materialIcons.Person;
  const clanName = mee.maisonId?.name || mee.maisonId || "Aucun clan";
  const clanColor = mee.maisonId?.color || "#eee";
  const clanCount = getClanCount(mees, mee.maisonId);

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <IconComponent sx={{ color: mee.color, fontSize: 36 }} />
          <Typography variant="h6" flex={1}>{mee.name}</Typography>
          <Typography variant="subtitle1" flex={1}>{getMeeNickname(mee)}</Typography>
          
          <Badge
            badgeContent={clanCount}
            color="primary" showZero
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box>
                
             <ClanFlag clan={mee.maisonId} size={100} height={12} />
            <Chip
              label={clanName}
              size="small"
              sx={{
                bgcolor: clanColor,
                color: "#333",
                fontWeight: 600,
                border: '1px solid #333',
                ml: 1
              }}
            />
            </Box>
          </Badge>
          <IconButton onClick={() => setOpen(false)} sx={{ ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {/* Statut général */}
        <Stack spacing={1.5} divider={<Divider flexItem />}>
          {/* Statut de base */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
              Statut
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <Typography variant="body2">Âge : <b>{mee.age}/{mee.ageMax}</b></Typography>
              <Typography variant="body2">Défense : <b>{mee.defenses}</b></Typography>
            </Stack>
            <RessourceBar value={mee.ressources} />
          </Box>

          {/* Paramètres sociaux */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
              Paramètres sociaux
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <ReputationIndicator reputation={mee.reputation} size={28} />
              <Typography variant="body2">Réputation : <b>{(mee.reputation ?? 0).toFixed(2)}</b></Typography>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
              <Typography variant="body2">Sociabilité : <ReputationIndicator reputation={mee.sociabilite?.toFixed(2)} size={22} /></Typography>
              <Typography variant="body2">Coopération : <ReputationIndicator reputation={mee.propCooperation?.toFixed(2)} size={22} /></Typography>
              <Typography variant="body2">Trahison : <ReputationIndicator inverseColor reputation={mee.propTrahison?.toFixed(2)} size={22} /></Typography>
            </Stack>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setConfOpen(o => !o)}
              sx={{ mt: 1, mb: 1 }}
            >
              Voir confiance envers les autres
            </Button>
            <Collapse in={confOpen}>
              <Box sx={{ flexWrap: 'wrap', display: 'flex', gap: 1, mb: 1 }}>
                {Object.keys(mee.confiance).length > 0
                  ? Object.entries(mee.confiance).map(([id, val]) => (
                      <ReputationIndicator key={id} size={18} reputation={val} />
                    ))
                  : <Typography variant="caption" color="text.secondary">aucune</Typography>}
              </Box>
            </Collapse>
          </Box>

          {/* Historique */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
              Historique des interactions
            </Typography>
            <MemoryList memoire={mee.memoire} getName={id => (mees.find(m => m.id === id)?.name || `Mee ${id}`)} />
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default MeeDialog;
