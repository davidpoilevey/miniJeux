import { Box, Button, Typography } from '@mui/material';
import { useGod } from '../GodContext';
import GodCreatureLayer from '../utils/GodCreatureManager';
import GodPlantLayer, { GodCorpseLayer, PopulationChart } from '../utils/GodPlanteLayer';
import GodSpeedDial from './GodSpeedDial';

export default function GodGrid() {
    const { state, handleGodClick } = useGod();
    const { tileSize, gridSize, creatures,effects } = state;

    return (
        <Box
            sx={{
                position: "relative",
                width: gridSize.width * tileSize,
                height: gridSize.height * tileSize,
                backgroundColor: "#f0f0f0",   }}
            onClick={(e) => handleGodClick(e)}
        >
            {/* Ici tu peux boucler sur des GodTiles si tu veux */}
            <GodCorpseLayer corpses={state.corpses} tileSize={tileSize} />
            <GodPlantLayer plants={state.plants} tileSize={state.tileSize} />
            <GodCreatureLayer creatures={creatures} tileSize={tileSize} effects={effects} />
        </Box>
    );
}

const GOD_MODE_COLORS = {
  NONE: "transparent",
  KILL_CREATURE_AT: "rgba(237, 118, 54, 0.4)",
  HOLY_ZONE: "rgba(238, 167, 213, 0.2)",
  FERTILE_ZONE: "rgba(10,255,10,0.4)",
  ASTEROID: "rgba(255, 4, 4, 0.9)",
};

export function MainView() {
    const { dispatch, state } = useGod();

    return (
        <Box sx={{ height:'100%' , overflow: 'auto', alignItems: 'center'
,  border: "4px solid",
"&::before": state.godMode && {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    boxShadow: `
      inset 0 0 40px 10px ${state.godMode?'rgba(255,10,10,0.4)':'transparent'},
      inset 0 0 80px 60px ${GOD_MODE_COLORS[state.godMode||'NONE']}
    `,
    zIndex: 10,
    transition: "box-shadow 0.4s ease-in-out",
  },

   borderColor: GOD_MODE_COLORS[state.godMode||'NONE'] || "transparent",
    transition: "border-color 0.3s ease",
         
         }}>
            <GodGrid />
           <GodSpeedDial/>
            <Box sx={{position:'fixed', bottom:60, right:40}}>

                <PopulationChart state={state} width={400} height={150}/>
            </Box>
        </Box>
    );
}