import React from "react";
import { Box } from "@mui/system";
import { Church, Grass, LocalFlorist, PestControl } from "@mui/icons-material";
import { frameWidth,frameHeight } from "./Aquarium";

const grassValues={'grass':10, 'flower':15,'shit':5};
export const getRandomGrass = id=>{
  const keys = Object.keys(grassValues);
  const randomType = keys[Math.floor(Math.random() * keys.length)];
  return {
    id: id,
    type: randomType,
    gainEnergy: grassValues[randomType],
    position: {
      x: Math.floor(Math.random() * frameWidth),
      y: Math.floor(Math.random() * frameHeight),
    },
  }
}
const GrassPatch = ({ position, type='grass' }) => {
  const grassSize = 20;

  return (
    <Box
      sx={{
        position: "absolute",
        left: `${position.x-grassSize/2}px`,
        top: `${position.y-grassSize/2}px`,
        width: `${grassSize}px`,
        height: `${grassSize}px`,
      }}
    >
     {type==='grass' && <Grass sx={{ width: "100%", height: "100%" }} />}
     {type==='flower' && <LocalFlorist sx={{ width: "100%", height: "100%" }} />}
     {type==='shit' && <Grass color="red" sx={{ width: "100%", height: "100%" }} />}
     {type==='cadavre' && <Church sx={{ width: "100%", height: "100%" }} />}
    </Box>
  );
};

export default GrassPatch;
