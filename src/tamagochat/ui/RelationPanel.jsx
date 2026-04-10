// ui/RelationPanel.js
import React from "react";
import { Box, Typography, Card, CardContent, LinearProgress, Avatar, Tooltip } from "@mui/material";
import { useCat } from "../backend/CatContext";
import { CAT_AROUND } from "../backend/Social";

const defconColors = {
  1: "#ff1744", // guerre ouverte
  2: "#ff7043", // hostile
  3: "#ffb300", // méfiant
  4: "#81c784", // cordial
  5: "#4caf50", // paix
};

export function RelationPanel() {
  const { cat } = useCat();

  return (
    <Box sx={{ p: 2 ,flex:1,overflow:'auto',}}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Relations félines 🐾
      </Typography>

      {cat.relations.map((rel,idx) => {
        const other = CAT_AROUND.find((c) => c.id === rel.id);
        if (!other) return null;

        const color = defconColors[rel.defcon] || "#9e9e9e";

        return (
          <Card
            key={rel.id+'-'+idx}
            sx={{
              mb: 1,
              borderLeft: `6px solid ${color}`,
              backgroundColor: `${color}20`,
            }}
          >
            <CardContent sx={{ p: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar sx={{ bgcolor: color }}>{other.name[0]}</Avatar>
                  <Typography variant="subtitle1">{other.name}</Typography>
                </Box>

                <Tooltip title={`DEFCON ${rel.defcon} (${defconLabel(rel.defcon)})`}>
                  <Typography variant="body2" sx={{ color }}>
                    DEFCON {rel.defcon}
                  </Typography>
                </Tooltip>
              </Box>

              <Box sx={{ display: "flex", mt: 1 ,gap: 1,  flexWrap:'wrap'}}>
                {Object.entries(other.personality).map(([trait, val]) => (
                  <Box key={trait} sx={{ display: "flex", alignItems: "center", gap: 1, width:'40%', flexWrap:'wrap' }}>
                    <Typography variant="caption" sx={{ width: 70 }}>
                      {trait}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={val * 100}
                      sx={{
                        height: 6,
                        flex: 1,
                        borderRadius: 1,
                        backgroundColor: "#ddd",
                        "& .MuiLinearProgress-bar": { backgroundColor: color },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

function defconLabel(n) {
  switch (n) {
    case 1:
      return "Guerre ouverte 😾";
    case 2:
      return "Tensions fortes";
    case 3:
      return "Méfiance";
    case 4:
      return "Cordialité";
    case 5:
      return "Paix féline 🐾";
    default:
      return "Inconnu";
  }
}
