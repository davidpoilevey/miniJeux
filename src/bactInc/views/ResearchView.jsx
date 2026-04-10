import {
  Box, Card, CardContent, Typography, Button, Stack, LinearProgress, Tooltip, Avatar, Grid
} from "@mui/material";
import { useLab } from "../LabContext";
import { RESEARCH_DATA, GENE_DATA } from "../bactData";
import rechImg from "../images/recherche.png";

export default function ResearchView() {
  const { research, startResearch } = useLab();

  const ongoingData = research.ongoing
    ? RESEARCH_DATA.find((r) => r.id === research.ongoing.id)
    : null;

  const glassSX = {
    m: 1,
    p: 2,
    background: "rgba(101, 5, 91, 0.37)",
    color: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(5px)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background:'#222',
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
      }}
    >
      {/* --- Bandeau supérieur : points + état actuel --- */}
      <Box
        sx={{
          ...glassSX,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar src={rechImg} />
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Centre de Recherche
          </Typography>
        </Stack>
        <Box textAlign="right">
          <Typography variant="h6" sx={{ color: "#ffe600" }}>
            Points de recherche : {research.points.toFixed(2)}
          </Typography>
          <Typography variant="caption">
            Convertissez de l’ADN brut en points (via centrifugeuse)
          </Typography>
        </Box>
      </Box>

      {/* --- Contenu principal en deux colonnes --- */}
      <Grid container spacing={2} sx={{ flex: 1, overflow: "hidden" }}>
        {/* --- Colonne gauche : recherches disponibles --- */}
        <Grid item xs={8} sx={{ overflowY: "auto", maxHeight: "80vh", pr: 1 }}>
          {ongoingData && (
            <Card sx={{ ...glassSX, border: "2px solid #8e24aa" }}>
              <CardContent>
                <Typography variant="h6">
                  {ongoingData.icon} {ongoingData.name}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    (research.ongoing.progress / research.ongoing.duration) * 100
                  }
                  sx={{
                    mt: 1,
                    height: 6,
                    borderRadius: 2,
                    backgroundColor: "#fff2",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: "#ff80ff",
                    },
                  }}
                />
                <Typography variant="caption">
                  {research.ongoing.progress}/{research.ongoing.duration} sec
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* --- Liste compacte des recherches --- */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {RESEARCH_DATA.map((r) => {
              const completed = research.completed.includes(r.id);
              const locked = r.requires.some(
                (req) => !research.completed.includes(req)
              );
              const disabled = completed || locked;
              const requiredNames = r.requires
                .map((req) => {
                  const found = RESEARCH_DATA.find((x) => x.id === req);
                  return found ? found.name : req;
                })
                .join(", ");

              const statusColor = completed
                ? "#66bb6a"
                : locked
                ? "#757575"
                : "#ab47bc";

              return (
                <Card
                  key={r.id}
                  sx={{
                    ...glassSX,
                    p: 1.5,
                    border: `2px solid ${statusColor}`,
                    background:
                      completed
                        ? "linear-gradient(135deg,#4caf5050,#2e7d3250)"
                        : locked
                        ? "linear-gradient(135deg,#55555540,#33333360)"
                        : "linear-gradient(135deg,#7b1fa250,#4a148c50)",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: disabled ? "none" : "scale(1.02)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Box sx={{ flex: 2 }}>
                      <Typography variant="subtitle1" sx={{ color: "#fff" }}>
                        {r.icon} {r.name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {r.description}
                      </Typography>
                      <Typography variant="caption" sx={{ display: "block" }}>
                        🧩 Coût : {r.cost} pts — ⏱ Durée : {r.duration}s
                      </Typography>
                      {r.requires.length > 0 && (
                        <Typography
                          variant="caption"
                          sx={{ display: "block", color: "#ffcc80" }}
                        >
                          Nécessite : {requiredNames}
                        </Typography>
                      )}
                      {r.type === "geneUnlock" && (
                        <Typography
                          variant="caption"
                          sx={{ color: "#00e676" }}
                        >
                          Peut débloquer : {r.target}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ flexShrink: 0 }}>
                      <Button
                        variant="contained"
                        size="small"
                        disabled={disabled || r.cost > research.points}
                        sx={{
                          color:'aliceblue!important',
                          backgroundColor: disabled
                            ? "#7777"
                            : r.cost > research.points
                            ? "#999"
                            : "#ba68c8",
                          "&:hover": {
                            backgroundColor: "#ab47bc",
                          },
                        }}
                        onClick={() => startResearch(r)}
                      >
                        {completed
                          ? "✔️ Terminé"
                          : locked
                          ? "🔒 Verrouillé"
                          : r.cost > research.points
                          ? "⏳ Manque de points"
                          : "Lancer"}
                      </Button>
                    </Box>
                  </Stack>
                </Card>
              );
            })}
          </Box>
        </Grid>

        {/* --- Colonne droite : gènes débloqués --- */}
        <Grid item xs={4}>
          <Box
            sx={{
              ...glassSX,
              border: "2px solid #2fdb0dff",
              height: "100%",
              overflowY: "auto",
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              🧬 Gènes débloqués
            </Typography>
            {research.unlockedGenes.length === 0 ? (
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Aucun gène débloqué pour l’instant.
              </Typography>
            ) : (
              research.unlockedGenes.map((geneId) => {
                const gene = GENE_DATA.find((g) => g.id === geneId);
                return gene ? (
                  <Card
                    key={geneId}
                    sx={{
                      my: 1,
                      p: 1,
                      backgroundColor: "rgba(255,255,255,0.15)",
                      border: "1px solid #66bb6a",
                    }}
                  >
                    <Typography variant="subtitle2" color="lime">
                      {gene.name}
                    </Typography>
                    <Typography variant="caption" color="#ddd">
                      {gene.description}
                    </Typography>
                  </Card>
                ) : null;
              })
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
