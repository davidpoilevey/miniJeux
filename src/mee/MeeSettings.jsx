import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, Stack, Divider, IconButton, Grid, Paper,
  Slider,
  Popover
} from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import GroupIcon from '@mui/icons-material/Groups';
import BoltIcon from '@mui/icons-material/Bolt';
import CloseIcon from '@mui/icons-material/Close';
import PinchIcon from '@mui/icons-material/Pinch';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { Looks, VolunteerActivism, Whatshot } from "@mui/icons-material";

const godModeActions = [
  {
    key: "thanos",
    label: "Claquage de doigt de Thanos",
    icon: <PinchIcon color="error" fontSize="large" />,
    color: "error.main",
    description: "Élimine instantanément la moitié des Mee, au hasard."
  },
  {
    key: "disette",
    label: "Réchauffement climatique",
    icon: <WbSunnyIcon color="warning" fontSize="large" />,
    color: "warning.main",
    description: "Réduit fortement les ressources de tous les Mee."
  },
  {
    key: "blizzard",
    label: "Tempête de neige",
    icon: <AcUnitIcon color="info" fontSize="large" />,
    color: "info.main",
    description: "Conditions de vie drastiques pendant un tour."
  },
  {
    key: "bisounours",
    label: "Mode Bisounours",
    icon: <Looks color="success" fontSize="large" />,
    color: "success.main",
    description: "Tout le monde devient un peu plus cooperatif"
  },
  {
    key: "social",
    label: "Aimez-vous les uns les autres",
    icon: <VolunteerActivism color="info" fontSize="large" />,
    color: "info.main",
    description: "Les gens se parlent plus, l'important ce sont les rencontres"
  },
  {
    key: "enfer",
    label: "Anarchie !!",
    icon: <Whatshot color="error" fontSize="large" />,
    color: "error.main",
    description: "Plus personne ne se fait confiance, la trahison est de mise, chacun pour sa gueule"
  },
  {
    key: "favoriserClan",
    label: "Chouchoutage",
    icon: <GroupAddIcon color="success" fontSize="large" />,
    color: "success.main",
    description: "Donne un avantage important à un clan choisi."
  },
  {
    key: "tuerMee",
    label: "Sniper",
    icon: <PersonOffIcon color="error" fontSize="large" />,
    color: "error.main",
    description: "Élimine un Mee précis de la simulation."
  }
];



const MeeSetting = ({ open, onClose, values , onChange, onAction }) => {
  const [form, setForm] = useState(values);

  const handleInput = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (onChange) onChange({ ...form, [key]: val });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SettingsIcon color="primary" />
          <Typography flex={1} variant="h6">Réglages de la simulation</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>

          {/* Thème Social */}
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <GroupIcon color="secondary" />
              <Typography variant="subtitle1">Paramètres sociaux</Typography>
            </Box>
            <Grid container spacing={2}>
             
              <Grid item xs={3}>
                <TextField
                  label="Esperance de vie"
                  type="number"
                  helperText={`de ${form.ESPERANCE_VIE} a ${form.ESPERANCE_VIE+10}`}
                  value={form.ESPERANCE_VIE}
                  onChange={e => handleInput('ESPERANCE_VIE', Number(e.target.value))}
                  fullWidth
                  size="small"
                />
                
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Seuil reproduction"
                  type="number"
                  value={form.seuilRepro}
                  onChange={e => handleInput('seuilRepro', Number(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Proba base reproduction"
                  type="number"
                  value={form.probaBaseRepro}
                  onChange={e => handleInput('probaBaseRepro', Number(e.target.value))}
                  fullWidth
                  size="small"
                  inputProps={{ step: 0.01, min: 0, max: 1 }}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Seuil alliance"
                  type="number"
                  value={form.SEUIL_ALLIANCE}
                  onChange={e => handleInput('SEUIL_ALLIANCE', Number(e.target.value))}
                  fullWidth
                  size="small"
                  inputProps={{ step: 0.01 }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Petite confiance"
                  type="number"
                  value={form.PETITE_CONFIANCE}
                  onChange={e => handleInput('PETITE_CONFIANCE', Number(e.target.value))}
                  fullWidth
                  size="small"
                  inputProps={{ step: 0.01 }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Moyenne confiance"
                  type="number"
                  value={form.MOYENNE_CONFIANCE}
                  onChange={e => handleInput('MOYENNE_CONFIANCE', Number(e.target.value))}
                  fullWidth
                  size="small"
                  inputProps={{ step: 0.01 }}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Grande confiance"
                  type="number"
                  value={form.GRANDE_CONFIANCE}
                  onChange={e => handleInput('GRANDE_CONFIANCE', Number(e.target.value))}
                  fullWidth
                  size="small"
                  inputProps={{ step: 0.01 }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Thème Plateau */}
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <BoltIcon color="warning" />
              <Typography variant="subtitle1">Plateau de jeu</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Largeur du verger"
                  type="number"
                  value={form.VERGER_WIDTH}
                  onChange={e => handleInput('VERGER_WIDTH', Number(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Hauteur du verger"
                  type="number"
                  value={form.VERGER_HEIGHT}
                  onChange={e => handleInput('VERGER_HEIGHT', Number(e.target.value))}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </Paper>
            <GodModePanel onAction={onAction} />


        
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MeeSetting;


const GodModePanel = ({ onAction }) => {
  const [confirmAnchor, setConfirmAnchor] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  const handleClick = (event, action) => {
    setConfirmAnchor(event.currentTarget);
    setPendingAction(action);
  };

  const handleConfirm = () => {
    if (pendingAction) {
      onAction(pendingAction);
    }
    setConfirmAnchor(null);
    setPendingAction(null);
  };

  const handleCancel = () => {
    setConfirmAnchor(null);
    setPendingAction(null);
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <BoltIcon color="success" />
        <Typography variant="subtitle1">God Mode & Événements</Typography>
      </Box>
      <Grid container spacing={2}>
        {godModeActions.map((action, idx) => (
          <Grid item xs={12} sm={6} key={action.key}>
            <Box
              onClick={e => handleClick(e, action)}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                bgcolor: "#f7f7fa",
                borderRadius: 2,
                p: 0,
                boxShadow: 1,
                height: "100%",
                cursor: "pointer",
                border: `2px solid transparent`,
                transition: "border-color 0.2s, box-shadow 0.2s",
                "&:hover": {
                  borderColor: action.color,
                  boxShadow: 3,
                  background: "#f0faff"
                }
              }}
            >
              <Box sx={{ mt: 0.5 }}>{action.icon}</Box>
              <Box flex={1}>
                <Typography variant="subtitle2" fontWeight={600}>{action.label}</Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  {action.description}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Popover de confirmation */}
      <Popover
        open={!!confirmAnchor}
        anchorEl={confirmAnchor}
        onClose={handleCancel}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        PaperProps={{ sx: { p: 2, minWidth: 220 } }}
      >
        <Typography variant="subtitle1" mb={1}>
          Confirmer l’action&nbsp;?
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {pendingAction?.description}
        </Typography>
        <Box display="flex" gap={1} justifyContent="flex-end">
          <Button onClick={handleCancel} color="inherit" variant="text" size="small">
            Annuler
          </Button>
          <Button onClick={handleConfirm} color="primary" variant="contained" size="small" autoFocus>
            Confirmer
          </Button>
        </Box>
      </Popover>
    </Paper>
  );
};

