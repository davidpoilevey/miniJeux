import { useEffect, useState, useRef,useMemo } from "react";
import { Snackbar, Alert, Slide, Tooltip } from "@mui/material";
import { useLab } from "../LabContext";


import { Box, Typography, useTheme } from "@mui/material";

function SlideUpTransition(props) {
  return <Slide {...props} direction="up" />;
}

/**
 * Panneau d’alerte permanent du laboratoire.
 * Affiche les 3 derniers logs visibles (non "muets")
 * avec des codes couleur inspirés des tableaux de contrôle industriels.
 */
export default function AlertConsole({ onClick }) {
  const { labState } = useLab();
  const logs = labState?.logs || [];
  const theme = useTheme();

  // On garde les 3 derniers logs significatifs
  const visibleLogs = useMemo(() => {
    return logs.filter(l => l.severity !== "muet").slice(-3).reverse();
  }, [logs]);

  // Gravité maximale
  const severityRank = { error: 3, warn: 2, info: 1, muet: 0 };
  const maxSeverity = visibleLogs.reduce(
    (acc, l) => Math.max(acc, severityRank[l.severity] || 0),
    0
  );

  // Palette couleur selon gravité
  const bgColor =
    maxSeverity === 3
      ? "rgba(255, 30, 0, 0.2)"
      : maxSeverity === 2
      ? "rgba(255, 193, 7, 0.15)"
      : "rgba(56, 142, 60, 0.15)";

  const borderColor =
    maxSeverity === 3
      ? "#ff1744"
      : maxSeverity === 2
      ? "#ffa000"
      : "#66bb6a";

  const glow =
    maxSeverity === 3
      ? "0 0 15px rgba(255,0,0,0.6)"
      : maxSeverity === 2
      ? "0 0 12px rgba(255,193,7,0.4)"
      : "0 0 10px rgba(76,175,80,0.3)";

  return (
    <Box
      sx={{
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 2,
        boxShadow: glow,
        p: 1.2,
        mx: 1,
        mb: 1.2,
        minHeight: 110,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-around",
        cursor: "pointer",
        transition: "all 0.25s ease",
        "&:hover": {
          transform: "scale(1.01)",
          boxShadow: `0 0 15px ${borderColor}`,
        },
      }}
      onClick={onClick}
    >
      {visibleLogs.length === 0 ? (
        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            color: theme.palette.text.disabled,
            fontStyle: "italic",
          }}
        >
          Aucun événement récent — les capteurs ronronnent paisiblement.
        </Typography>
      ) : (
        visibleLogs.map((log) => (
          <Tooltip title={log.message}>
            <Typography
            key={log.id}
            variant="body2"
            sx={{
              lineHeight: 1.25,
              fontFamily: "Roboto Mono, monospace",
              color:
                log.severity === "error"
                  ? "#ff5252"
                  : log.severity === "warn"
                  ? "#ffb300"
                  : "#81c784",
              textShadow:
                log.severity === "error"
                  ? "0 0 6px rgba(255,0,0,0.7)"
                  : log.severity === "warn"
                  ? "0 0 5px rgba(255,193,7,0.5)"
                  : "0 0 4px rgba(76,175,80,0.4)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            [{new Date(log.time).toLocaleTimeString("fr-FR", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}] {log.message}
          </Typography>
          </Tooltip>
        ))
      )}
    </Box>
  );
}


export  function LabLogPopper() {
  const { labState , setLabState} = useLab();
  const [currentLog, setCurrentLog] = useState(null);
  const [open, setOpen] = useState(false);
  const bufferRef = useRef(false); // bloqueur de 2 secondes

  useEffect(() => {
    if (labState.logs.length === 0) return;
    const latest = labState.logs[labState.logs.length - 1];
    if(latest.severity!=='urgent')
      return;

    //if (bufferRef.current) return; // si le buffer est actif, on ignore

    // affiche le nouveau log
    setCurrentLog(latest);
    setOpen(true);

    // active le buffer anti-spam pendant 2s
    bufferRef.current = true;
    setLabState(ls=>{
      return {...ls, logs:[...ls.logs,{...latest, id:latest.id+'coold', severity:'error'}]}
    })
    const timer = setTimeout(() => {
      bufferRef.current = false;
    }, 2000);

    return () => clearTimeout(timer);
  }, [labState]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      autoHideDuration={4000}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      TransitionComponent={SlideUpTransition}
    >
      <Alert
        onClose={handleClose}
        severity={'warning'}
        variant="filled"
        sx={{ boxShadow: 3 }}
      >
        {currentLog ? currentLog.message : ""}
      </Alert>
    </Snackbar>
  );
}
