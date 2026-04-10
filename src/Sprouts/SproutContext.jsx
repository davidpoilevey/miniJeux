import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import QuickDialog from "../bitLife/utils/QuickDialog";

import { lifeCycle } from "./sproutUtil";

const SproutContext = createContext();

export const useSprout = () => useContext(SproutContext);


export const SproutProvider = ({ frameWidth, frameHeight, children }) => {
    const [msgText, setMessage] = useState();
    const [cycle, setCycle] = useState(0);
    const [gridSize, setGridSize] = useState(10);
    const [coutDeLaVie, setcoutDeLaVie]=useState(1);
    const [gridMap, setGridMap] = useState({});//
    const [organismes, setOrganismes] = useState([]);
    const reset = ()=>{
        setCycle(0);
        setGridMap({});
        setOrganismes([]);
    }

    useEffect(() => {
        let tid=null;
        const animate = () => {
          
            if(organismes.length>0)
            lifeCycle({ gridMap, organismes, setGridMap, setOrganismes
                , frameHeight, frameWidth, cycle, gridSize ,coutDeLaVie});
          
             
        };
        //tid = setTimeout(animate, 200);
        animate();
        return () => {
            if(tid!=null)
                clearTimeout(tid);
        };
    }, [cycle]);
  
    useEffect(() => {
        setCycle(cycle+1);
    },[organismes]);
    
    
    const ctxt = {
        organismes, setOrganismes,  setMessage
        , gridMap, setGridMap, reset,gridSize, setGridSize,setcoutDeLaVie, coutDeLaVie
    }
    return <SproutContext.Provider value={ctxt}>
        {children}
        <QuickDialog text={msgText} titre="Message a caractère informatif" />

    </SproutContext.Provider>;
}
