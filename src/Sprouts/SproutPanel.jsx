import { Box } from "@mui/material";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SproutProvider } from "./SproutContext";
import SproutField from "./SproutField";
import { SproutConfigPanel } from "./ConfigPanel";

const CONFIGPANEL_WIDTH=200;
export const SproutPanel = () => {
    const [frameWidth, setFrameWidth] = useState(0);
    const [frameHeight, setFrameHeight] = useState(0);
    const aquaRef = useRef();
    useLayoutEffect(() => {
        if (aquaRef.current) {
            setTimeout(()=>{

                const { width, height } = aquaRef.current.getBoundingClientRect();
                setFrameWidth(width-CONFIGPANEL_WIDTH);
                setFrameHeight(height);
            },500);
        }
      }, [aquaRef]);
    useEffect(() => {
        const handleResize = () => {
            const { width, height } = aquaRef.current.getBoundingClientRect();
          setFrameWidth(width-CONFIGPANEL_WIDTH);
          setFrameHeight(height);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    const initialConfig = {
        frameHeight, frameWidth
    }
    return <Box  ref={aquaRef}  sx={{height:'100%', display:'flex'}}>
        <SproutProvider  {...initialConfig}>
            <SproutField     {...initialConfig} />
            <SproutConfigPanel width={CONFIGPANEL_WIDTH}/>
        </SproutProvider>
    </Box>
}
export default SproutPanel