import { Box } from "@mui/material"
import Damier from "./Damier"
import { GameOver } from "../ChuckNorrisFact"
import { useState } from "react";


export const Dame = ()=>{
 const [isGameOver, setGameOver] = useState(false);
     const [score, setScore] = useState(0);
     const [resetID, setResetID] = useState(0);
     const reset= () => {
       setResetID(prev => prev + 1);
       setScore(0);
       setGameOver(false);
     };
    return <Box sx={{height:'100%', margin:1, overflow:'auto'}}>    
    <GameOver open={isGameOver} gameName="Dames" score={score} handleClose={() => { setGameOver(false) }}
     handleRestart={reset} />
        
        <Damier reset={resetID} setScore={setScore} gameOver={setGameOver}/>
        </Box>
}
export default Dame;