import { Avatar, Box,  LinearProgress, Stack, Typography } from "@mui/material"
import chatSprite from "../images/chatRoux.jpg"; // ton image 
import matinImg from "../images/matin.png"; 
import apremeImg from "../images/aprem.png"; 
import soirImg from "../images/soir.png"; 
import nuitImg from "../images/nuit.png"; 
import { useCat } from "../backend/CatContext";
import { OnBoardingStep } from "../../OnBoardingContext";

// Taille d’une case dans le sprite
const FRAME_SIZE = 570 / 3;

const EXPRESSIONS = {
  soif: { col: 0, row: 0 },
  satisfait: { col: 1, row: 0 },
  endormi: { col: 2, row: 0 },
  effraye: { col: 0, row: 1 },
  inquiet: { col: 1, row: 1 },
  triste: { col: 2, row: 1 },
  vainqueur: { col: 0, row: 2 },
  exalte: { col: 1, row: 2 },
  heureux: { col: 2, row: 2 },
};

    // --- Calcul de l’humeur en fonction des besoins ---
  export  const computeMood = ({ hunger, energy, affection, sante,territorialite }) => {
        if (sante < 30) return "effraye";
        if (hunger < 30) return "soif";
        if (energy < 30) return "endormi";
        if (affection < 35) return "triste";
        if (hunger > 70 && energy > 70 && affection > 70 && sante > 70)
            return "heureux";
        if (affection > 90) return "exalte";
        if (territorialite > 90) return "vainqueur";
        if (hunger < 40 && energy < 40 && territorialite<40) return "inquiet";
        return "satisfait";
    };
const CatExpression=({cat})=>{

  const expr = EXPRESSIONS[cat.mood];
  if(expr==null)
    return <Typography>Je connais pas {cat.mood}</Typography>
  const bgX = -expr.col * FRAME_SIZE;
  const bgY = -expr.row * FRAME_SIZE;
    return <Box>
      <CycleWidget/>
      <OnBoardingStep stepId="intro" message="Voici ton chat !" >
        <Box
        sx={{
          width: FRAME_SIZE,
          height: FRAME_SIZE,
          mx: "auto",
          my: 2,
          borderRadius: 2,
          backgroundImage: `url(${chatSprite})`,
          backgroundPosition: `${bgX}px ${bgY}px`,
          imageRendering: "pixelated",
          border: "4px solid #888",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        }}
      > 

      </Box>
      </OnBoardingStep>
              <Typography sx={{ mt: 2 }}>
                Humeur actuelle : <strong>{cat.mood}</strong>
              </Typography>
      <Stack spacing={1} sx={{flex:4, mb: 2, mx: 4 }}>
        <Stat name="Santé" value={cat.sante} color="success" />
        <Stat name="Faim" value={cat.hunger} color="secondary" />
        <Stat name="Énergie" value={cat.energy} color="primary" />
        <Stat name="Affection" value={cat.affection} color="error" />
        <Stat name="Territorialité" value={cat.territorialite} color="warning" />
       
      </Stack>
      </Box>
}
export default CatExpression;


function Stat({ name, value, color }) {
  return (
    <Box>
      <Typography variant="caption">{name}</Typography>
      <LinearProgress variant="determinate" value={value} color={color} />
    </Box>
  );
}

const CycleWidget=()=>{
//{ matin: "apreme", "apreme": "soir", soir: "nuit", nuit: "matin" };
const {timeOfDay} = useCat();
let imgCycle = null;
switch(timeOfDay){
  case 'matin': imgCycle=matinImg;break;
  case 'apreme': imgCycle=apremeImg;break;
  case 'soir': imgCycle=soirImg;break;
  case 'nuit': imgCycle=nuitImg;break;
  default:
}
return <Avatar src={imgCycle}>{timeOfDay}</Avatar>
}