import { 
    Box, 
    Button, 
    Card, 
    CardContent, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle, 
    Typography,
    Chip,
    LinearProgress,
    Alert,
    Divider
} from "@mui/material";
import React from "react";
import { useFarming } from "./FarmingProvider";
import { FARM_BUILDINGS, getPlanteById, PRODUCTIONS } from "./farmData";

const BatimentDialog = ({ popupOpen, onClose, selectedBuilding }) => {
    const { setResources, resources, setBuildings, buildings, setLogMessage } = useFarming();

    if (selectedBuilding?.id == null || buildings[selectedBuilding.id]==null) return null;
    
    selectedBuilding = buildings[selectedBuilding.id];
    const buildingProductions = selectedBuilding.possibleProduction;

    // Obtenir les informations de production courante
    const getCurrentProductionInfo = () => {
        if (!selectedBuilding.currentProduction) return null;
        
        const production = PRODUCTIONS.find(p => p.id === selectedBuilding.currentProduction);
        if (!production) return null;

        const timeElapsed = Date.now() - selectedBuilding.productionStarted;
        const progress = Math.min(100, (timeElapsed / production.tempsProduction) * 100);
        const isComplete = progress >= 100;

        return {
            production,
            progress,
            isComplete,
            timeRemaining: Math.max(0, production.tempsProduction - timeElapsed)
        };
    };

    const currentProductionInfo = getCurrentProductionInfo();

    function handleStartProduction(productionId) {
        const production = PRODUCTIONS.find(p => p.id === productionId);
        if (!production) return;

        const ingredients = production.ingredients;
        setLogMessage("Production de "+production.name+" commencée")
        // Consomme les ingrédients
        setResources(prev => {
            const updated = { ...prev };
            for (const [ingredientId, qty] of Object.entries(ingredients)) {
                updated[ingredientId] -= qty;
            }
            return updated;
        });

        setBuildings(prev => {
            return {
                ...prev, 
                [selectedBuilding.id]: {
                    ...selectedBuilding,
                    currentProduction: productionId, 
                    productionStarted: Date.now()
                }
            }
        });
    }

    const availableProductions = PRODUCTIONS.filter(prod => 
        buildingProductions.includes(prod.id)
    );

    const formatTime = (ms) => {
        const seconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
    };

    return (
        <Dialog open={popupOpen} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h6">{selectedBuilding?.name}</Typography>
                    {currentProductionInfo ? (
                        <Chip 
                            label={currentProductionInfo.isComplete ? "Production terminée" : "En production"} 
                            color={currentProductionInfo.isComplete ? "success" : "warning"}
                            size="small"
                        />
                    ) : (
                        <Chip label="Inactif" color="default" size="small" />
                    )}
                </Box>
            </DialogTitle>

            <DialogContent>
                {/* État de production actuel */}
                {currentProductionInfo && (
                    <Box mb={3}>
                        <Alert 
                            severity={currentProductionInfo.isComplete ? "success" : "info"}
                            sx={{ mb: 2 }}
                        >
                            <Typography variant="subtitle2">
                                {currentProductionInfo.isComplete 
                                    ? `Production de ${currentProductionInfo.production.name} terminée !`
                                    : `Production en cours : ${currentProductionInfo.production.name}`
                                }
                            </Typography>
                            {!currentProductionInfo.isComplete && (
                                <Typography variant="body2" color="text.secondary">
                                    Temps restant : {formatTime(currentProductionInfo.timeRemaining)}
                                </Typography>
                            )}
                        </Alert>
                        
                        {!currentProductionInfo.isComplete && (
                            <LinearProgress 
                                variant="determinate" 
                                value={currentProductionInfo.progress}
                                sx={{ mb: 2 }}
                            />
                        )}
                    </Box>
                )}

                {/* Liste des productions disponibles */}
                <Typography variant="h6" gutterBottom>
                    Productions disponibles
                </Typography>

                {availableProductions.length === 0 ? (
                    <Alert severity="info">
                        Aucune production disponible pour ce bâtiment.
                    </Alert>
                ) : (
                    <Box display="flex" flexDirection="column" gap={2}>
                        {availableProductions.map(prod => {
                            const hasIngredients = hasEnoughIngredients(prod.ingredients, resources);
                            const isOccupied = selectedBuilding.currentProduction != null;
                            const isDisabled = isOccupied || !hasIngredients;

                            let statusMessage = "";
                            let severity = "info";
                            
                            if (isOccupied) {
                                statusMessage = "Bâtiment occupé";
                                severity = "warning";
                            } else if (!hasIngredients) {
                                statusMessage = "Ingrédients insuffisants";
                                severity = "error";
                            } else {
                                statusMessage = "Prêt à produire";
                                severity = "success";
                            }

                            return (
                                <Card key={prod.id} variant="outlined">
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                            <Box flex={1}>
                                                <Box display={'flex'} justifyContent={'space-between'}>
                                                    <Box>
                                                        
                                                    <Typography variant="h6" gutterBottom>
                                                    {prod.name}
                                                    </Typography>
                                                    
                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                        Durée : {formatTime(prod.tempsProduction)}
                                                    </Typography>
                                                    </Box>
                                                    <img src={prod.img} alt={prod.name} height={84}/>
                                                </Box>

                                                <Typography variant="body2" gutterBottom>
                                                    <strong>Ingrédients requis :</strong>
                                                </Typography>
                                                
                                                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                                                    {Object.entries(prod.ingredients).map(([id, qty]) => {
                                                        const available = resources[id] || 0;
                                                        const hasEnough = available >= qty;
                                                        const planteName = getPlanteById(id)?.name || id;
                                                        
                                                        return (
                                                            <Chip
                                                                key={id}
                                                                label={`${qty} × ${planteName} (${available})`}
                                                                size="small"
                                                                color={hasEnough ? "success" : "error"}
                                                                variant={hasEnough ? "outlined" : "filled"}
                                                            />
                                                        );
                                                    })}
                                                </Box>

                                                <Alert severity={severity} sx={{ mt: 1 }}>
                                                    {statusMessage}
                                                </Alert>
                                            </Box>

                                            <Button
                                                variant="contained"
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    if (!isDisabled) {
                                                        handleStartProduction(prod.id);
                                                    }
                                                }}
                                                sx={{ ml: 2 }}
                                            >
                                                Produire
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Fermer</Button>
            </DialogActions>
        </Dialog>
    );
};

export default BatimentDialog;

function hasEnoughIngredients(ingredients, ressources) {
    return Object.entries(ingredients).every(([id, qty]) => (ressources[id] || 0) >= qty);
}