import { Box, Button} from "@mui/material"
import { useCat } from "../backend/CatContext";
import { ChatLog } from "./ChatLog";


export const StatPanel=({cat})=>{
    const {setRythme, rythme} = useCat();
    return   <Box>
        <Box sx={{display:'flex'}}>

       
      <Box sx={{flex:1}}>
        <Button variant={rythme===100?'filled':'outlined'} onClick={()=>setRythme(100)}>
            Rythme Acceleré (100ms)
        </Button>
        <Button variant={rythme===1000?'filled':'outlined'}onClick={()=>setRythme(1000)}>
            Rythme Rapide (1s)
        </Button>
        <Button variant={rythme===5000?'filled':'outlined'} onClick={()=>setRythme(5000)}>
            Rythme Normal (5s)
        </Button>
      </Box>
        </Box>
       <ChatLog/>
       </Box>
}

