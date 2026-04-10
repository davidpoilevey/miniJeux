import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Divider,
  LinearProgress,
  Slider,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import { RemoveCircle } from "@mui/icons-material";
import { useLab } from "../LabContext";
import ProductionWidget, { GaugeMeter } from "./ProductionWidget";
import { BIO_REACTOR_DATA } from "../bactData";
import { OnBoardingStep } from "../../OnBoardingContext";

/**
 * ReactorDetails — version corrigée / thème rouge
 *
 * Remarques importantes (respect de ton code) :
 * - Je n'ai **pas** renommé les variables que tu m'as fournies.
 * - Correction : availableBacteria n'exclut QUE les souches déjà présentes
 *   dans CE réacteur (logique que tu voulais).
 * - Le bouton Réparer respecte la condition `coutReparation > labState.resources.credits`.
 * - UI : capacity affichée par bulles (pleines/vide).
 */

const ReactorDetails = ({ reactorID }) => {
  const { updateReactor, labState, setLabState } = useLab();
  let reactor = labState.reactors.find((r) => r.id === reactorID);
  let inMarket=false;
  if(!reactor){
    inMarket=true;
    reactor=BIO_REACTOR_DATA.find((r) => r.id === reactorID);
  }
  const { efficiency, assignedBacteria = [] } = reactor || {};

  const [repairing, setRepairing] = useState(false);

  // coût de réparation (formule conservatrice — tu peux ajuster)
  const coutReparation = Math.max(
    50,
    Math.round(200 * (1 - (reactor?.efficiency ?? 1)))
  );

  // === IMPORTANT ===
  // Available bacteria : on exclut uniquement celles déjà présentes DANS CE réacteur.
  // Ceci permet d'assigner la même souche à d'autres réacteurs, sauf si elle est
  // déjà dans celui-ci — exactement la logique que tu demandais.
  const availableBacteria = useMemo(() => {
    const assignedIdsThisReactor = reactor?.assignedBacteria ?? [];
    return labState.bacteria.filter((b) => !assignedIdsThisReactor.includes(b.id));
  }, [labState.bacteria, reactor?.assignedBacteria]);

  // --- Handlers ---

  const handleAssignOne = (bId) => {
    if ((reactor.assignedBacteria?.length || 0) >= reactor.capacity) return;
    updateReactor(reactor.id, {
      assignedBacteria: [...(reactor.assignedBacteria || []), bId],
    });
  };

  const handleRemove = (bId) => {
    updateReactor(reactor.id, {
      assignedBacteria: (reactor.assignedBacteria || []).filter((id) => id !== bId),
    });
  };

  const handleSliderChange = (field) => (e, value) => {
    updateReactor(reactor.id, { [field]: value });
  };

  const handleRepair = () => {
    setRepairing(true);
    setTimeout(() => {
      setLabState((prev) => {
        const updatedReactors = prev.reactors.map((r) =>
          r.id === reactor.id ? { ...r, status: 1.0, efficiency: 1.0 } : r
        );
        return {
          ...prev,
          resources: {
            ...prev.resources,
            credits: Math.max(0, (prev.resources.credits || 0) - coutReparation),
          },
          reactors: updatedReactors,
        };
      });
      setRepairing(false);
    }, 3000); // feedback
  };

  if (!reactor)
    return (
      <Box>
        <Typography variant="subtitle1">Bio-réacteur introuvable</Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        border: "1px solid #ef9a9a",
        background:
          "linear-gradient(180deg, rgba(255,235,238,0.95) 0%, rgba(255,205,210,0.6) 100%)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ color: "#b71c1c", fontWeight: "bold" }}>
          Bio-réacteur #{reactor.name}
        </Typography>

        <Box
          sx={{
            height: 12,
            width: 12,
            borderRadius: "50%",
            border: "1px solid #b71c1c",
            backgroundColor:
              reactor.status === "running"
                ? "#4caf50"
                : reactor.status === "maintenance"
                ? "#ffb300"
                : "#f44336",
          }}
        />
      </Box>

      {reactor.stoppedReason && <Typography color="error">{reactor.stoppedReason}</Typography>}

      {!inMarket&&<FormControlLabel
        required
        control={
          <Switch
            checked={reactor.status === "running"}
            onChange={() =>
              updateReactor(reactor.id, { status: reactor.status === "running" ? "maintenance" : "running" })
            }
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: "#b71c1c" },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#f48fb1" },
            }}
          />
        }
        label="Mettre sous tension"
        labelPlacement="start"
      />}

      <Divider sx={{ my: 2 }} />
<Box sx={{display:'flex', alignItems:'center'}}>
  
      {!inMarket&&<Button
        variant="outlined"
        size="small"
        fullWidth
        onClick={handleRepair}
        disabled={repairing || coutReparation > (labState.resources?.credits || 0)}
        sx={{
          mt: 2,
          borderColor: "#ef5350",
          color: "#b71c1c",
          "&:hover": { borderColor: "#b71c1c", bgcolor: "#ffebee" },
        }}
      >
        {repairing ? "Réparation en cours..." : `Réparer le réacteur (${coutReparation} ₡)`}
      </Button>}
      <Box sx={{height:50}}>
        
      <GaugeMeter
                    label={'Efficacité :'} size={120}
                    min={0} max={150}
                      value={reactor.efficiency*100}
                    />
      </Box>
     

      <Typography variant="body2" sx={{ mt: 1 }}>Charge :</Typography>
      <Box sx={{ display: "flex", gap: 1, my: 1 }}>
        {Array.from({ length: reactor.capacity }).map((_, i) => (
          <Box
            key={i}
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              border: "1px solid #c62828",
              bgcolor: i < (reactor.assignedBacteria?.length || 0) ? "#c62828" : "rgba(198,40,40,0.12)",
            }}
          />
        ))}
      </Box>
</Box>

      <Divider sx={{ my: 2 }} />
 <OnBoardingStep stepId="assigneSouche" 
                message="Ajoutez une souche au bio-reacteur pour commencer la production, verifiez la temperature et le niveau d'oxygene optimal pour votre bacterie. Parfois les bio-reacteurs tombent en panne, il faudra le rallumer manuellement ici " >


      <Typography variant="subtitle2" sx={{ color: "#b71c1c" }}>Souches assignées :</Typography>

                </OnBoardingStep>
      {assignedBacteria.length === 0 ? (
        <Typography variant="body2" color="text.disabled">Aucune souche active.</Typography>
      ) : (
        <Stack spacing={1}>
          {assignedBacteria.map((id) => {
            const b = labState.bacteria.find((x) => x.id === id);
            return (
              <Box
                key={id}
                sx={{
                  bgcolor: "rgba(255,205,210,0.4)",
                  p: 1,
                  borderRadius: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="body2">{b ? b.name : `Souche inconnue (${id})`}</Typography>
                <IconButton size="small" onClick={() => handleRemove(id)} sx={{ color: "#b71c1c" }}>
                  <RemoveCircle />
                </IconButton>
              </Box>
            );
          })}
        </Stack>
      )}

      {availableBacteria.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary">Ajouter une souche :</Typography>

          {/* boutons d'ajout rapides (plus user-friendly) */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 1 }}>
            {availableBacteria.map((b) => (
              <Button
                key={b.id}
                variant="outlined"
                size="small"
                onClick={() => handleAssignOne(b.id)}
                disabled={(reactor.assignedBacteria?.length || 0) >= reactor.capacity}
                sx={{
                  borderColor: "#ef5350",
                  color: "#b71c1c",
                  "&:hover": { bgcolor: "#ffcdd2", borderColor: "#c62828" },
                }}
              >
                {b.name}
              </Button>
            ))}
          </Stack>

        </>
      )}

      <Divider sx={{ my: 2 }} />
      <ProductionWidget labState={labState} reactor={reactor} />
      <Divider sx={{ my: 2 }} />

      {/* Contrôles environnementaux */}
      <Typography variant="body2">Température : {reactor.temperature} °C</Typography>
      <Slider
        min={20}
        max={80}
        step={1}
        value={reactor.temperature}
        onChange={handleSliderChange("temperature")}
        sx={{ mb: 2, color: "#c62828" }}
      />

      <Typography variant="body2">Oxygène : {(reactor.oxygenLevel * 100).toFixed(0)}%</Typography>
      <Slider min={0} max={1} step={0.01} value={reactor.oxygenLevel} onChange={handleSliderChange("oxygenLevel")} sx={{ mb: 2, color: "#c62828" }} />

      <Typography variant="body2">Débit de nutriment : {reactor.nutrientFlow.toFixed(2)}</Typography>
      <Slider min={0.1} max={2} step={0.1} value={reactor.nutrientFlow} onChange={handleSliderChange("nutrientFlow")} sx={{ mb: 2, color: "#c62828" }} />

      <TextField disabled label="Consommation d'énergie" value={reactor.energyUsage} variant="standard" fullWidth sx={{ mb: 1 }} />
      <TextField disabled label="Risque de contamination" value={reactor.contaminationRisk?.toFixed(2)} variant="standard" fullWidth sx={{ mb: 1 }} />
      <TextField disabled label="Status" value={reactor.status} variant="standard" fullWidth />

    </Box>
  );
};

export default ReactorDetails;
