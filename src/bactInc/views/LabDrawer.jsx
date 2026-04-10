import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Divider,
  Stack,
  IconButton,
  Card,
  CardContent,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useLab } from "../LabContext";
import ReactorDetails from "../components/ReactorDetails";
import ButtonDPY from "../../bitLife/ui/ButtonDPY";
import BacteriaDetails from "../components/SoucheDetail";
import MachineDetails from "../components/MachineDetail";
import { Bolt, EmojiEvents, Lock, Science, Timer } from "@mui/icons-material";
import LabHistoryPanel from "./HistoryView";

export default function LabDrawer({ selected, onClose }) {
  const { labState, setLabState } = useLab();

  if (!selected) return null;

  const type = detectType(selected); // fallback si pas de type explicite
  const content = (() => {
    switch (type) {
      case "reactor":
        return <ReactorDetails reactorID={selected.id} setLabState={setLabState} />;
      case "bacteria":
        return <BacteriaDetails bacteria={selected} setLabState={setLabState} />;
      case "machine":
        return <MachineDetails machine={selected} labState={labState} setLabState={setLabState} />;
      case "contract":
        return <ContractDetails contract={selected} />;
      case "research":
        return <ResearchDetails research={selected} />;
      case "history":
        return <LabHistoryPanel research={selected} />;
      default:
        return <UnknownDetails selected={selected} />;
    }
  })();

  return (
    <Drawer
      anchor="right"
      open={Boolean(selected)}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 380,
          p: 2,
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        },
      }}
    >
      <Box sx={{display:'flex', position:'absolute', right:20, top:10}}>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>{content}</Box>
    </Drawer>
  );
}

/* ---- sous-composants ---- */




/*level: 1,
  health: 100,           // vitalité (0 = morte)
  stability: 1.0,        // 1 = stable, <1 = risque de mutation
  mutationChance: 0.01,  // % par tick
  baseYield: 1.0,        // rendement en biomasse
  baseEnergyCost: 1.0,   // énergie nécessaire par cycle
  baseNutrientCost: 1.0, // nutriments nécessaires par cycle
  wasteRate: 0.5,        // proportion de déchet générée
  dna: {                 // gènes actifs (modifiables par recherche)
    efficiency: 1.0,
    resilience: 1.0,
    purity: 1.0,
  },

  product: {             // ce que cette souche produit
    name: "biomass",
    value: 2,            // crédits gagnés par unité
  },
  status: "idle", */


function ContractDetails({ contract }) {
  if (!contract) return null;

  const { name, description, reward = {} } = contract;

  return (
    <Card
      sx={{
        background: "linear-gradient(145deg, #fff3e0, #ffe0b2)",
        border: "1px solid #ffb300",
        boxShadow: "0 0 12px rgba(255, 171, 64, 0.4)",
        color: "#5d4037",
        borderRadius: 2,
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" mb={1}>
          <EmojiEvents sx={{ color: "#ff8f00", mr: 1 }} />
          <Typography variant="h6" sx={{ color: "#e65100", fontWeight: 600 }}>
            {name}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 1 }}>
          {description}
        </Typography>

        <Divider sx={{ my: 1, borderColor: "#ffb74d" }} />

        <Typography variant="subtitle2" sx={{ color: "#e65100", mb: 0.5 }}>
          Récompenses :
        </Typography>

        <Box sx={{ pl: 2 }}>
          {Object.entries(reward).length > 0 ? (
            Object.entries(reward).map(([key, value]) => (
              <Typography key={key} variant="body2">
                • {key} :{" "}
                <Box
                  component="span"
                  sx={{
                    fontWeight: 600,
                    color:
                      key.toLowerCase().includes("reputation") ||
                      key.toLowerCase().includes("research")
                        ? "#ff6f00"
                        : "#ef6c00",
                  }}
                >
                  {value}
                </Box>
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              Aucune récompense spécifiée.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

 function ResearchDetails({ research }) {
  if (!research) return null;

  const glassStyle = {
    background: "rgba(155, 89, 182, 0.15)",
    borderRadius: "12px",
    border: "1px solid rgba(155, 89, 182, 0.3)",
    p: 2,
  };

  const renderReward = () => {
    switch (research.type) {
      case "geneUnlock":
        return `Débloque le gène : ${research.target}`;
      case "unlockMachine":
        return `Permet la construction de la machine : ${research.target}`;
      case "statBoost":
        return `Améliore une statistique du laboratoire : ${research.target}`;
      case "globalUpgrade":
        return `Amélioration des reacteurs : ${research.target}`;
      default:
        return research.target ? `Effet : ${research.target}` : "Effet inconnu";
    }
  };

  return (
    <Box sx={{ ...glassStyle }}>
      <Typography
        variant="h6"
        sx={{
          color: "#6a1b9a",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
        gutterBottom
      >
        {research.icon || "🧬"} {research.name}
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        {research.description}
      </Typography>

      <Divider sx={{ mb: 1 }} />

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Chip
          icon={<Science />}
          label={`Catégorie : ${research.category}`}
          sx={{ bgcolor: "rgba(103, 58, 183, 0.1)", color: "#6a1b9a" }}
        />
        <Chip
          icon={<Bolt />}
          label={`Coût : ${research.cost} pts`}
          sx={{ bgcolor: "rgba(156, 39, 176, 0.1)", color: "#6a1b9a" }}
        />
        <Chip
          icon={<Timer />}
          label={`Durée : ${research.duration}s`}
          sx={{ bgcolor: "rgba(186, 104, 200, 0.1)", color: "#6a1b9a" }}
        />
      </Stack>

      {research.requires?.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="subtitle2"
            sx={{ color: "#8e24aa", display: "flex", alignItems: "center", gap: 1 }}
          >
            <Lock fontSize="small" /> Nécessite :
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
            {research.requires.map((req) => (
              <Chip
                key={req}
                label={req}
                size="small"
                sx={{
                  bgcolor: "rgba(233, 30, 99, 0.1)",
                  color: "#ad1457",
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      <Divider sx={{ mb: 1 }} />

      <Typography
        variant="subtitle2"
        sx={{ color: "#4a148c", fontWeight: 600, mb: 0.5 }}
      >
        Résultat attendu :
      </Typography>
      <Typography variant="body2" sx={{ color: "#6a1b9a" }}>
        {renderReward()}
      </Typography>
    </Box>
  );
}
function UnknownDetails({ selected }) {
  return (
    <Typography variant="body2" color="text.disabled">
      Type d’objet inconnu : {JSON.stringify(selected, null, 2)}
    </Typography>
  );
}

/* ---- outils utilitaires ---- */

function detectType(obj) {
  if (obj.assignedBacteria) return "reactor";
  if(obj.history) return "history";
  if (obj.dna) return "bacteria";
  if (obj.type) return "research";
  if (obj.category) return "machine";
  if (obj.reward) return "contract";
  return "unknown";
}

