import {
  Box,
  Typography,
  Divider,
  Button,
  Stack,
  LinearProgress,
  Chip,
  Tooltip,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useEffect, useState } from "react";
import { categoryColors } from "../views/MarketView";
import { mergeMachineDefinition } from "../views/LabView";
import { buildAPI, useLab } from "../LabContext";

export default function MachineDetails({ machine, labState, setLabState }) {
  const [repairing, setRepairing] = useState(false);
  const [localeMachine, setLocalMachine] = useState(machine);
  const api = buildAPI(labState);
  useEffect(()=>{
    setLocalMachine(machine)
  },[machine])

 const applyAction = (action) => {
  setLabState((oldState) => {
    // appeler l'effect qui retourne le nouveau lab
    const newState = action.effect ? action.effect({ ...oldState }, api) : oldState;
    const ress = {...newState.resources}
    ress.energy-=machine.powerUsage;
    return { ...newState, resources:ress };
  });
};

  const coutReparation = (machine.cost*0.2).toFixed(2);
  const handleRepair = () => {
    setRepairing(true);
    setTimeout(() => {
      setLabState((prev) => {
        const updatedMachines = prev.machines.map((m) =>
          m.id === machine.id ? { ...m, status: 1.0 } : m
        );
        return { ...prev,resources:{...prev.resources, credits:prev.resources.credits-coutReparation}, machines: updatedMachines };
      });
      setRepairing(false);
      setLocalMachine(prev=>mergeMachineDefinition({...prev,status:1.0}));
    }, 3000); // petite pause pour le feedback
  };

  const healthColor =
    localeMachine.status > 0.8
      ? "#3bdf22ff"
      : localeMachine.status > 0.5
      ? "#64b5f6"
      : localeMachine.status > 0.2
      ? "#eeb95ceb"
      : "#fa543fff";

  return (
    <Box
      sx={{
        border: "1px solid #64b5f6",
        borderRadius: 2,
        p: 2,
        bgcolor:categoryColors[machine.category]||"#e3f2fd",
        color: "#0d47a1",
      }}
    >
        <Box>
      <Typography variant="h6" sx={{ color: "#0d47a1" }}>
        {machine.name}
      </Typography>
      

       <Box sx={{height:10,width:10,borderRadius:5, border:'1px solid black;'
                        ,backgroundColor:healthColor}}></Box>
            
            {localeMachine.stoppedReason &&<Typography color="error">{localeMachine.stoppedReason}</Typography>}
             <FormControlLabel required control={<Switch checked={localeMachine.active} onChange={(evt,chkd)=>{
              setLocalMachine(prev=>mergeMachineDefinition({...prev,active:chkd, stoppedReason:chkd?null:'stoppedManually'}))
                setLabState(ls=>{
                    return {...ls, machines:ls.machines.map(mac=>{
                        return (mac.id===machine.id)?{...mac,active:chkd, stoppedReason:chkd?null:'stoppedManually'}:mac
                    })}
                })
            }}/>} label="Mettre sous tension"  labelPlacement="start"/>
</Box>
            
      <Typography variant="body2" color="text.secondary">
        {machine.description}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Chip
          label={`Catégorie: ${machine.category}`}
          size="small"
          sx={{ bgcolor: categoryColors[machine.category]||"#bbdefb", color: "#0d47a1" }}
        />
        {machine.costOnUse && (
          <Chip
            label="Action manuelle"
            size="small"
            sx={{ bgcolor: "#bbdefb", color: "#0d47a1" }}
          />
        )}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="body2">
        <strong>Prix d'achat :</strong> {machine.cost} crédits
      </Typography>
      <Typography variant="body2">
        <strong>Consommation d'énergie :</strong>{" "}
        {machine.powerUsage} ⚡{" "}
        {machine.costOnUse
          ? "(à chaque utilisation)"
          : "(par tick, automatique)"}
      </Typography>

      <Typography variant="body2" sx={{ mt: 1 }}>
        <strong>État de la machine :</strong>{" "}
        {(localeMachine.status * 100).toFixed(0)}%
      </Typography>
      <LinearProgress
        variant="determinate"
        value={localeMachine.status * 100}
        sx={{
          height: 6,
          borderRadius: 3,
          my: 1,
          bgcolor: 'rgba(0,0,0,0.4)',
          "& .MuiLinearProgress-bar": { bgcolor: healthColor },
        }}
      />

      <Typography variant="body2" sx={{ mt: 2 }}>
        <strong>Effet passif :</strong>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {machine.effect
          ? "Agit automatiquement à chaque tick (cycle de simulation)."
          : "Aucun effet automatique."}
      </Typography>

      <Typography variant="body2" sx={{ mt: 1 }}>
        <strong>Effet à l'achat :</strong>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {machine.effectAchat
          ? "Déclenché une fois lors de l'acquisition."
          : "Aucun effet particulier à l'achat."}
      </Typography>

      {machine.actions?.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ color: "#1565c0" }}>
            Actions disponibles :
          </Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {machine.actions.map((action) => (
              <Tooltip
                key={"action-" + action.id}
                title={action.description || "Aucune description"}
                placement="right"
              >
                <Button
                  variant="contained"
                  size="small" disabled={!machine.active}
                  onClick={() => applyAction(action)}
                  sx={{
                    bgcolor: "#42a5f5",
                    "&:hover": { bgcolor: "#1e88e5" },
                  }}
                >
                  {machine.active?action.name:'Hors tension'}
                  
                </Button>
              </Tooltip>
            ))}
          </Stack>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <Button
        variant="outlined"
        size="small"
        fullWidth
        onClick={handleRepair}
        disabled={repairing||coutReparation>labState.resources.credits}
        sx={{
          mt: 1,
          borderColor: "#42a5f5",
          color: "#0d47a1",
          "&:hover": {
            borderColor: "#1565c0",
            bgcolor: "#e3f2fd",
          },
        }}
      >
        {repairing ? "Réparation..." : `Réparer la machine (${coutReparation}$)`}
      </Button>
      <FixMissingMachineButton machine={machine}/>
    </Box>
  );
}

function FixMissingMachineButton({ machine }) {
  const { labState, setLabState } = useLab();

  // si la machine est déjà déverrouillée, inutile de l'afficher
  if (!machine || labState.unlockedMachines.includes(machine.id)) return null;

  const handleFix = () => {
    const id = machine.id;
    const already = labState.unlockedMachines.includes(id);

    if (already) return; // sécurité doublon

    // on ajoute la machine à la liste
    setLabState((prev) => ({
      ...prev,
      unlockedMachines: [...prev.unlockedMachines, id],
      logs: [
        ...(prev.logs || []),
        {
          id: crypto.randomUUID(),
          time: Date.now(),
          severity: "info",
          message: `Procédure administrative terminée : la machine "${machine.name}" est enfin autorisée. (L’administration a reconnu l’erreur)`,
        },
      ],
    }));
  };

  return (
    <Button
      variant="outlined"
      size="small"
      fullWidth
      onClick={handleFix}
      sx={{
        mt: 1.5,
        borderColor: "#f57c00",
        color: "#e65100",
        fontWeight: 600,
        "&:hover": {
          borderColor: "#ef6c00",
          bgcolor: "rgba(255, 183, 77, 0.15)",
        },
      }}
    >
      C’est quoi ce bordel, j’ai droit à cette machine normalement
    </Button>
  );
}