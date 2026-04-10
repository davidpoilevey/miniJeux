import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Stack,
  Divider,
  Paper,
  CircularProgress,
  Tooltip,
  LinearProgress,
  Badge,
  Button,
  Collapse,
  Popover,
  IconButton
} from "@mui/material";
import Mee from "./Mee";
import { foncerHSL } from "./meeUtils";
import { ArrowDownwardOutlined, ArrowUpwardOutlined, Psychology } from "@mui/icons-material";
import MeeDialog from "./MeeDialog";

// Utilitaire pour afficher le nom d'un Mee à partir de son id
const meeName = (id, mees, attr = 'name', defaut) => {
  if (defaut == null)
    defaut = `Mee ${id}`;
  const found = mees.find(m => m.id === id);
  return found ? found[attr] : defaut;
};

const HistoryPanel = ({ mees }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMeeId, setSelectedMeeId] = useState(null);
  const [open, setOpen] = useState(false);
  const [clickedMee, setClickedMee] = useState();

  if (!mees || mees.length === 0) return <Typography>Aucun Mee à afficher.</Typography>;

  const handleHistoricClick = (event, meeId) => {
    setAnchorEl(event.currentTarget);
    setSelectedMeeId(meeId);
  };

  const handleHistoricClose = () => {
    setAnchorEl(null);
    setSelectedMeeId(null);
  };

  return (
    <Box
      mt={4}
      sx={{
        overflow: "auto",
        width: "100%",
        height: "100%",
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        alignItems: "flex-start",
        justifyContent: "flex-start"
      }}
    >
    {clickedMee!=null && <MeeDialog open={open} setOpen={setOpen} mee={clickedMee}/>}
      {mees.map((mee) => (
        <Paper
          key={'p' + mee.id}
          sx={{
            maxWidth: 260,
            p: 2,
            bgcolor: "#fafafa",
            flex: "1 1 180px",
            boxShadow: 2,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          {/* Mee header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: '5px', justifyContent:'space-between', width:'100%' }}>
            <Typography variant="caption">{mee.age}/{mee.ageMax}</Typography>
            <Mee mee={mee} isStatic  onClick={()=>{
              setClickedMee(mee);
              setOpen(true);
              }}/>
            <Typography variant="subtitle1">{mee.name}</Typography>
            <ReputationIndicator reputation={mee.reputation} />
            <IconButton
              size="small"
              onClick={(e) => handleHistoricClick(e, mee.id)}
              color="primary"
            >
              <Psychology /> {/* ou <HistoryIcon /> ou <MemoryIcon /> */}
            </IconButton>
          </Box>
          <RessourceBar value={mee.ressources} />
          {/* Alliances */}
          <Alliances mee={mee} mees={mees} />
          <Popover
              open={selectedMeeId === mee.id}
              anchorEl={anchorEl}
              onClose={handleHistoricClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              PaperProps={{
                sx: { p: 2, maxWidth: 300, maxHeight: 350, overflowY: 'auto' }
              }}
            >
              <Typography variant="subtitle2" mb={1}>Historique de {mee.name}</Typography>
              <MemoryList memoire={mee.memoire} getName={meeid => meeName(meeid, mees)} />
            </Popover>
        </Paper>
      ))}
    </Box>
  );
};

export default HistoryPanel;

const Alliances = ({ mee, mees }) => {


  const clanName = mee.maisonId?.name || mee.maisonId || "Aucun clan";
  const clanCount = mee.maisonId
    ? mees.filter(m =>
      m.maisonId &&
      (typeof m.maisonId === "object"
        ? m.maisonId.name === clanName
        : m.maisonId === clanName)
    ).length
    : 0;

  return <Box mb={1} width="100%" display={'flex'} alignItems="center" justifyContent="space-between">
    <Typography variant="body2" fontWeight="bold" mb={0.5} mr={1}>
      Clan
    </Typography>
    {mee.maisonId ? (
      <Badge
        badgeContent={clanCount}
        color="primary"
        sx={{ mr: 1 }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Chip
          label={clanName}
          size="small"
          sx={{
            bgcolor: mee.maisonId.color || "#eee",
            color: "#333",
            fontWeight: 600,
            border: '1px solid #333',
            boxShadow: 1,
          }}
        />
      </Badge>
    ) : (
      <Typography variant="body2" color="text.secondary">
        Aucun
      </Typography>
    )}
  </Box>

}

export const MemoryList = ({ memoire, getName }) => {

  return <> {memoire && memoire.length > 0 ? (
    memoire.reverse().map((m, idx) => (
      <Box
        key={'log' + idx}
        sx={{
          display: "flex",
          alignItems: "center",
          fontSize: "0.92em",
          mb: 0.5,
          pl: 0.5,
          bgcolor:
            m.type === "vol"
              ? "#ffe0e0"
              : m.type === "coop"
                ? "#e0ffe0"
                : "#e0e7ff"
        }}
      >
        <Typography variant="caption" sx={{ mr: 0.5 }}>
          {m.type === "coop" ? "🤝" : m.type === "vol" ? "🦹" : "🍆"}
        </Typography>
        <Typography variant="body2" sx={{ mr: 0.5 }}>
          {m.type}
        </Typography>
        <Typography variant="body2" sx={{ mr: 0.5 }}>
          avec {getName(m.avec)}
        </Typography>
        <Tooltip title={m.resultat}>
          <Typography variant="body2" color="text.secondary">
            : {(m.resultat === 'profiteur' || m.resultat === 'ok' || m.resultat === 'reussi') ? <ArrowUpwardOutlined color="success" /> : <ArrowDownwardOutlined color="warning" />}
          </Typography>
        </Tooltip>
      </Box>
    ))
  ) : (
    <Typography variant="body2" color="text.secondary">
      Aucun événement
    </Typography>
  )}
  </>;
}


export const RessourceBar = ({ value }) => {
  // Limite l'affichage à 15 pour la barre (plein au-delà)
  const capped = Math.min(value, 15);
  const percent = (capped / 15) * 100;

  return (
    <Box sx={{ width: "100%", mb: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 0.5, gap: '4px' }}>
        <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" sx={{ flex: 1 }}>
          Ressources
        </Typography>
        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            height: 18, flex: 3,
            borderRadius: 2,
            backgroundColor: "#e0e0e0",
            "& .MuiLinearProgress-bar": {
              background: "linear-gradient(90deg, #6dd5ed 0%, #2193b0 100%)",
              borderRadius: 2,
            }
          }}
        />
      </Box>
    </Box>
  );
};

// reputation attendu entre 0 et 1
export const ReputationIndicator = ({ reputation = 0, size = 28 , inverseColor}) => {
  // Couleur verte si bonne réputation, rouge si mauvaise, orange intermédiaire
  const color = inverseColor?(reputation < 0.5
      ? 'success'
      : reputation < 0.75
        ? 'warning'
        : 'error'):(reputation > 0.5
      ? 'success'
      : reputation > 0.25
        ? 'warning'
        : 'error');
    

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', ml: 0.5 }}>

      {/* Cercle de fond gris pour le reste */}
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={size}
        sx={{
          position: 'absolute',
          left: 0,
          color: '#eee',
        }}
      />
      <CircularProgress
        variant="determinate"
        value={Math.round(reputation * 100)}
        size={size}
        thickness={size}
        color={color}
      />
    </Box>
  );
};