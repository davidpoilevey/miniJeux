// components/LabHistoryPanel.jsx
import React, { useEffect, useRef } from "react";
import { Box, Typography, Divider, Paper, Tooltip, IconButton } from "@mui/material";
import { useLab } from "../LabContext";
import { DeleteSweep } from "@mui/icons-material";

export default function LabHistoryPanel({props}) {
  const { labState,setLabState } = useLab();
  const containerRef = useRef(null);
  const logs = (labState.logs || []).slice().sort((a, b) => b.time - a.time); // newest first

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [logs.length]);

  const handleClear = () => {
    setLabState((prev) => ({
      ...prev,
      logs: [],
    }));
  };
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", { hour12: false });
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 2,
        bgcolor: "#fff8e1", // jaune pastel
        border: "1px solid #ffe082",
        borderRadius: 2,
        color: "#5d4037", // brun doux pour contraste
        flex:1,
        overflowY: "auto",
      }}
      ref={containerRef}
    >
      <Box sx={{display:'flex'}}>

      <Typography
        variant="h6"
        sx={{
          color: "#f57f17",
          mb: 1,
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Historique du laboratoire
      </Typography>
       <Tooltip title="Effacer l'historique des logs">
      <IconButton
        onClick={handleClear}
        size="small"
        sx={{
          color: "#d32f2f",
          "&:hover": { color: "#b71c1c", bgcolor: "rgba(244, 67, 54, 0.08)" },
        }}
      >
        <DeleteSweep fontSize="small" />
      </IconButton>
    </Tooltip>
      </Box>

      <Divider sx={{ mb: 1, bgcolor: "#fbc02d" }} />

      {logs.length === 0 && (
        <Typography variant="body2" sx={{ textAlign: "center", opacity: 0.6 }}>
          Aucun événement pour l’instant...
        </Typography>
      )}

      {logs.map((entry) => (
        <Box
          key={entry.id}
          sx={{
            mb: 1,
            p: 1,
            borderRadius: 1,
            bgcolor: "rgba(255, 224, 130, 0.25)",
            "&:hover": { bgcolor: "rgba(255, 224, 130, 0.45)" },
            transition: "background 0.2s",
          }}
        >
          <Typography variant="caption" sx={{ fontSize: "0.75rem", opacity: 0.7 }}>
            {formatTime(entry.time)}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: "monospace",
              whiteSpace: "pre-line",
              lineHeight: 1.2,
            }}
          >
            {entry.message}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}
