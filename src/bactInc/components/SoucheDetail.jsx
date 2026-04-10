import {
    Box,
    Typography,
    LinearProgress,
    Divider,
    Stack,
    Button,
    Collapse,
    Card,
    CardContent,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    TextField,
    Tooltip,
} from "@mui/material";
import { useState } from "react";
import {  useLab } from "../LabContext";
import ButtonDPY from "../../bitLife/ui/ButtonDPY";
import { GENE_DATA } from "../bactData";
import { AcUnit, LocalLaundryServiceSharp } from "@mui/icons-material";
import { triggerSpontaneousMutation } from "../LabCtxtUtils";
import { OnBoardingStep } from "../../OnBoardingContext";

export default function BacteriaDetails({ bacteria, setLabState }) {
    const { labState, research, attachGene } = useLab();
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedGene, setSelectedGene] = useState("");
    const [cloneName, setCloneName] = useState(bacteria.name + "_clone_" + crypto.randomUUID().slice(0, 4));

    if (!bacteria) {
        return (
            <Typography variant="body2" color="text.disabled">
                Aucune souche sélectionnée.
            </Typography>
        );
    }
    const handleClone = () => {
        const source = bacteria;
        const newBacteria = structuredClone(source); // évite les références partagées
        newBacteria.id = cloneName.trim() || source.name + "_clone_" + crypto.randomUUID().slice(0, 4);
        newBacteria.name = newBacteria.id;
        newBacteria.health = 100;
        newBacteria.status = "idle";
        newBacteria.mutationChance *= 1.2; // les clones sont légèrement plus instables

        // Application d’une mutation spontanée pour différencier
        const mutatedClone = triggerSpontaneousMutation(newBacteria, labState);

        setLabState((prev) => ({
            ...prev,
            bacteria: [...prev.bacteria, mutatedClone],
        }));

        labState.logs.push({
            id: crypto.randomUUID(),
            message: `🧫 Une nouvelle souche clonée de ${source.name} a été créée : ${mutatedClone.name}`,
            severity: "info",
            time: Date.now(),
        });

        setCloneName(source.name + "_clone_" + crypto.randomUUID().slice(0, 4)); // reset du champ
    };

    const javel = () => {
          setLabState((prev) => ({
            ...prev,
            bacteria: prev.bacteria.filter(b=>b.id!=bacteria.id),
            logs: [...prev.logs, { id: 'dead'+bacteria.id, message: bacteria.name+" est décédé et repose au fond de l'evier", time: Date.now() }]
        }));
    }
    const handleAttach = () => {
        if (!selectedGene) return;
        attachGene(bacteria.id, selectedGene);
        setSelectedGene("");
        setOpenEdit(false);
    };

    return (
        <Card
            sx={{
                border: "1px solid #81c784",
                background: "linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)",
                boxShadow: 2,
            }}
        >
            <CardContent>
                <Typography
                    variant="h6"
                    sx={{ color: "#2e7d32", fontWeight: "bold", mb: 1 }}
                >
                    🧫 {bacteria.name}  <Typography variant="body2">Niv : {bacteria.level}</Typography>
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {bacteria.description}
                </Typography>
                {bacteria.status !== 'stable' && <Typography variant="body2">Statut : {bacteria.status}</Typography>}

                <Divider sx={{ my: 1 }} />

                <Stack spacing={1}>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>

                        <Typography variant="body2">
                            Santé : {bacteria.health.toFixed(1)} %
                        </Typography>
                         <LinearProgress
                            variant="determinate"
                            value={bacteria.health}
                            sx={{
                                flex: 1,
                                borderRadius: 3, height: 12,
                                bgcolor: "#dcedc8",
                                "& .MuiLinearProgress-bar": { bgcolor: "#689f38" },
                            }}
                        />
                        <Tooltip title="Purifier la souche permet de ramener sa santé au maximum, mais reduit son efficacité">
                        <Button size="small" variant="outlined" disabled={labState.resources.credits<=100}
                        onClick={evt => {
                            setLabState(ls => {
                                if (ls.resources.credits < 100) {

                                    return { ...ls, logs: [...ls.logs, { id: evt.id, message: "Pas assez de credits", time: Date.now() }] };
                                }
                                const newBact = ls.bacteria.map(oldB => {
                                    if (oldB.id != bacteria.id)
                                        return oldB;
                                    else
                                        return { ...oldB, health: 100, dna:{...oldB.dna, efficiency:oldB.dna.efficiency*oldB.dna.resilience} };
                                });
                                return {
                                    ...ls, resources: { ...ls.resources, credits: ls.resources.credits - 100 }
                                    , bacteria: newBact
                                }
                            })
                        }}><LocalLaundryServiceSharp/> (100 ₡)</Button>
                        </Tooltip>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="body2" sx={{ minWidth: 130 }}>
                            Stabilité 
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={bacteria.stability * 100}
                            sx={{
                                flex: 1, height: 12,
                                borderRadius: 3,
                                bgcolor: "#c8e6c9",
                                "& .MuiLinearProgress-bar": { bgcolor: "#388e3c" },
                            }}
                        />
                        <Tooltip title="Cryogeniser ramene la stabilité au niveau de resilience, mais diminue le rendement et la santé">
                        <Button size="small" variant="outlined" disabled={labState.resources.credits<=50}
                        onClick={evt => {
                            setLabState(ls => {
                                if (ls.resources.credits < 50) {

                                    return { ...ls, logs: [...ls.logs, { id: evt.id, message: "Pas assez de credits", time: Date.now() }] };
                                }
                                const newBact = ls.bacteria.map(oldB => {
                                    if (oldB.id != bacteria.id)
                                        return oldB;
                                    else
                                        return { ...oldB, baseYield:oldB.baseYield*0.8, stability: oldB.dna.resilience
                                    , health:oldB.health*0.9 };
                                });
                                return {
                                    ...ls, resources: { ...ls.resources, credits: ls.resources.credits - 50 }
                                    , bacteria: newBact
                                }
                            })
                        }}><AcUnit/> (50 ₡)</Button>
                        </Tooltip>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ minWidth: 130 }}>
                            Rendement {(bacteria.baseYield * 100).toFixed(2)}%
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={bacteria.baseYield * 100}
                            sx={{
                                flex: 1,
                                borderRadius: 3, height: 12,
                                bgcolor: "#dcedc8",
                                "& .MuiLinearProgress-bar": { bgcolor: "#689f38" },
                            }}
                        />
                    </Box>


                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', gap: 2, border: '2px ridge green', p: 2 }}>
                        <Box sx={{flex:2}}>

                            <Typography variant="body2">
                                Énergie / cycle : {(bacteria.baseEnergyCost).toFixed(2)}
                            </Typography>
                            <Typography variant="body2">
                                Nutriments / cycle : {(bacteria.baseNutrientCost).toFixed(2)}
                            </Typography>
  <Typography variant="body2">
                                Temperature optimale : {(bacteria.optimalTemp).toFixed(2)}ºC
                            </Typography>
                            <Typography variant="body2">
                                Oxygene optimal: {(bacteria.optimalOxygen).toFixed(2)}%
                            </Typography>
                            <Typography variant="body2">
                                Déchets générés : {(bacteria.wasteRate).toFixed(2)} /sec
                            </Typography>
                        </Box>
                        
                            <Box sx={{flex:1}}>
                                
                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                Production
                            </Typography>
                            {bacteria.product?.length ? (
                                <Stack spacing={0.5} sx={{ pl: 1 }}>
                                    {bacteria.product.map((p, i) => (
                                        <Typography key={i} variant="body2">
                                            • {p.name} {p.value ? `(+${p.value} ₡)` : ""}
                                        </Typography>
                                    ))}
                                </Stack>
                            ) : (
                                <Typography variant="body2" color="text.disabled" sx={{ pl: 1 }}>
                                    Aucune production connue
                                </Typography>
                            )}
                            </Box>

                    </Box>




                    <Divider sx={{ my: 1 }} />

                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        ADN (gènes actifs)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, border: '2px ridge lime', p: 2 }}>
                        <Box>

                            <Typography variant="body2">
                                Taux Mutation : {(bacteria.mutationChance * 100).toFixed(2)} %
                            </Typography>
                            <Typography variant="body2">
                                Efficacité : {(bacteria.dna.efficiency * 100).toFixed(2)}%
                            </Typography>
                            <Typography variant="body2">
                                Résilience :  {(bacteria.dna.resilience * 100).toFixed(2)}%
                            </Typography>
                            <Typography variant="body2">
                                Pureté : {(bacteria.dna.purity * 100).toFixed(2)}%
                            </Typography>
                        </Box>
                        <Box>

                            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                                Gènes actifs
                            </Typography>
                            {bacteria.genes?.length ? (
                              <GeneIconsDisplay genes={bacteria.genes} showLabel/>
                            ) : (
                                <Typography variant="body2" color="text.disabled" sx={{ pl: 1 }}>
                                    Aucun gène modifié
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 1 }} />



                </Stack>

                {/* --- Section Modification --- */}
                <Box sx={{ mt: 2 }}>
                    
           <OnBoardingStep stepId="soucheExpl" 
                          message="Cliquez sur ce bouton pour cloner votre souche et pour lui ajouter les genes que votre departement Recherche aura trouvé" >

                    <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        sx={{
                            backgroundColor: "#388e3c",
                            "&:hover": { backgroundColor: "#2e7d32" },
                        }}
                        onClick={() => setOpenEdit(!openEdit)}
                    >
                        {openEdit ? "Fermer l’édition" : "Modifier la souche"}
                    </Button>
                          </OnBoardingStep>

                    <Collapse in={openEdit}>
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                border: "1px dashed #81c784",
                                borderRadius: 2,
                                bgcolor: "#f1f8e9",
                            }}
                        >

                            <Typography variant="subtitle2" gutterBottom>
                                Ajouter un gène
                            </Typography>
                            {research.unlockedGenes?.length ? (
                                <FormControl fullWidth size="small">
                                    <InputLabel>Gène disponible</InputLabel>
                                    <Select
                                        value={selectedGene}
                                        label="Gène disponible"
                                        onChange={(e) => setSelectedGene(e.target.value)}
                                    >
                                        {research.unlockedGenes.map((gene, i) => (
                                            <MenuItem key={i} value={gene}>
                                                {gene}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <Button
                                        sx={{
                                            mt: 1.5,
                                            backgroundColor: "#66bb6a",
                                            "&:hover": { backgroundColor: "#43a047" },
                                        }}
                                        variant="contained"
                                        size="small"
                                        onClick={handleAttach}
                                    >
                                        Attacher le gène
                                    </Button>
                                </FormControl>
                            ) : (
                                <Typography variant="body2" color="text.disabled">
                                    Aucun gène débloqué dans la recherche.
                                </Typography>
                            )}
                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" gutterBottom>
                                Cloner la souche
                            </Typography>

                            <TextField
                                fullWidth
                                size="small"
                                label="Nom du clone"
                                value={cloneName}
                                onChange={(e) => setCloneName(e.target.value)}
                                sx={{ mt: 1 }}
                            />

                            <Button
                                variant="contained"
                                size="small"
                                fullWidth
                                sx={{
                                    mt: 1,
                                    backgroundColor: "#43a047",
                                    "&:hover": { backgroundColor: "#2e7d32" },
                                }}
                                onClick={handleClone}
                            >
                                Créer un clone
                            </Button>

                        </Box>
                    </Collapse>
                    <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        sx={{
                            mt:2,
                            backgroundColor: "#a74626ff",
                            "&:hover": { backgroundColor: "#701f13ff" },
                        }}
                        onClick={javel}
                    >
                       Javelliser (eliminer)
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}


/**
 * Affiche les icônes des gènes d'une bactérie avec infobulle descriptive.
 * @param {Object} props
 * @param {string[]} props.genes - Liste d'ID de gènes présents dans la bactérie
 * @param {number} [props.size=28] - Taille des icônes
 * @param {boolean} [props.showLabel=false] - Affiche ou non le titre "Gènes"
 */
export  function GeneIconsDisplay({ genes = [], size = 28,full=false, showLabel = false }) {
  if (!genes.length) {
    return (
      <Typography variant="body2" color="text.disabled">
        Aucun gène
      </Typography>
    );
  }

  // Trouve les définitions complètes depuis GENE_DATA
  const fullGenes = genes
    .map((id) => GENE_DATA.find((g) => g.id === id))
    .filter(Boolean);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      {(showLabel||full) && (
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Gènes :
        </Typography>
      )}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {fullGenes.map((gene) => (
          <Tooltip
            key={gene.id}
            title={
              <Box>
                <Typography variant="subtitle2">{gene.name}</Typography>
                <Typography variant="body2">{gene.description}</Typography>
              </Box>
            }
            arrow
            placement="top"
          >
            <Box
              sx={{
                width: size,
                height: size,
                fontSize: size * 0.8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                bgcolor: "rgba(0,0,0,0.04)",
                cursor: "default",
                transition: "transform 0.15s ease",
                "&:hover": {
                  transform: "scale(1.1)",
                  bgcolor: "rgba(255,215,64,0.1)",
                },
              }}
            >
              {gene.icon || "🧬"}
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
}
