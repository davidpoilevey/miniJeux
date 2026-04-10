import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Tooltip, Typography } from "@mui/material";
import React, { useState } from "react";
import Field, { FieldFantome } from "./Field";
import { useFarming } from "./FarmingProvider";
import imgFond from './images/fondFarm.png';
import { FARM_BUILDINGS, getCurrentMission, MISSION_TYPES, MISSIONS_BY_LEVEL, PRODUCTIONS } from "./farmData";
import BatimentDialog from "./BatimentDialog";
import { GenieCharacter } from "./Missions";


const ZonePrincipale = () => {
    const { fields, buildings, money, setLogMessage, level, setMoney, setBuildings, setMissionProgress, xMode } = useFarming();

    const [popupOpen, setPopupOpen] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState(null);

    const handleClickBatiment = (batiment) => {
        const owned = buildings[batiment.id]?.level > 0;
        if (!owned) {
            if (money >= batiment.cost) {
                setMoney(money - batiment.cost);
                setLogMessage("Felicitation pour cet achat");
                setBuildings((prev) => ({
                    ...prev,
                    [batiment.id]: { ...batiment, level: 1, currentProduction: null },
                }));
    const mission = getCurrentMission(level);
    if(mission.type===MISSION_TYPES.BUILD_BUILDING && mission.targetBuilding===batiment.id)
      setMissionProgress(prev=>({...prev, progress:prev.progress+1, completed:true}));
            } else {
                setLogMessage("Pas assez d'argent pour débloquer ce bâtiment");
            }
        } else {
            setSelectedBuilding(buildings[batiment.id]);
            setPopupOpen(true);
        }
    };
    const renderBatiment = (batiment) => {
        const owned = buildings[batiment.id];
        return (
            <Tooltip key={batiment.id} title={
                (owned ? 'Entrer dans ' : 'Acheter ') +
                batiment.name + (owned ? '' : ' pour ' + batiment.cost + ' boules ?')}>
                <Box position="relative" width="100%" height="100%" 
                        onClick={() => handleClickBatiment(batiment)}
                        sx={{
                            opacity: owned ? 1 : 0.4,
                            border: owned ? '2px solid green' : '2px dashed gray',
                            borderRadius: 2, cursor: 'pointer', overflow: 'hidden',
                            width: 72, height: 72, m: 1
                        }}>
                        <img src={batiment.img} alt={batiment.id} width="100%" height="100%" />

                    {/* Barre de progression si production en cours */}
                    {owned && owned.currentProduction && owned.productionStarted && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '6px',
                                width: '100%',
                                bgcolor: 'rgba(0,0,0,0.3)',
                            }}
                        >
                            <Box
                                sx={{
                                    height: '100%',
                                    width: `${Math.min(
                                        100,
                                        ((Date.now() - owned.productionStarted) /
                                            (PRODUCTIONS.find(p => p.id === owned.currentProduction)?.tempsProduction || 1)) *
                                        100
                                    )}%`,
                                    bgcolor: 'limegreen',
                                    transition: 'width 1s linear',
                                }}
                            />
                        </Box>
                    )}
                    </Box>

            </Tooltip>
        );
    };

    return (
        <Box sx={{ flex: 1, margin: 2, backgroundSize: 'cover', backgroundImage: `url(${imgFond})` }}>
            <Paper elevation={4} sx={{ height: '100%', p: 0, backgroundColor: 'rgba(200,200,200,0.6)' }}>

                <Box display="flex" justifyContent="space-between">

                    {FARM_BUILDINGS.filter(b => b.position === 'top').map(renderBatiment)}

                </Box>

                <Box sx={{ display: "flex", height: '100%' }}>
                    <Box display="flex" flexDirection="column" alignItems="center" mr={2} justifyContent={'space-around'}>
                        {FARM_BUILDINGS.filter(b => b.position === 'left').map(renderBatiment)}
                    </Box>

                    <Box flex={1} display="flex" gap={2} flexWrap="wrap" justifyContent="center">
                        {fields.map((field) => (
                            <Field key={field.id} field={field} />
                        ))}
                        <FieldFantome />
                    </Box>

                    <Box display="flex" flexDirection="column" alignItems="center" ml={2} justifyContent={'space-around'}>
                        {FARM_BUILDINGS.filter(b => ((xMode || !b.xMode) && b.position === 'right')).map(renderBatiment)}
                    </Box>
                </Box>
                <Box sx={{position:'absolute', left:'50%', bottom:'40px'}}>
                    <GenieCharacter/>
                </Box>
            </Paper>
            <BatimentDialog popupOpen={popupOpen} selectedBuilding={selectedBuilding} onClose={() => { setPopupOpen(false) }} />
        </Box>
    );
};

export default ZonePrincipale;
