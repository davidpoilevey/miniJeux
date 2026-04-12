import { createContext, useContext, useEffect, useRef, useState } from "react";
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

    const [isRunning, setIsRunning] = useState(true);
    const isRunningRef = useRef(true);
    const toggleRunning = () => {
        const nowRunning = !isRunningRef.current;
        isRunningRef.current = nowRunning;
        setIsRunning(nowRunning);
        if (nowRunning) setCycle(c => c + 1); // relance la boucle
    };

    useEffect(() => {
        if (!isRunningRef.current) return;
        if (organismes.length > 0 && frameWidth > 0 && frameHeight > 0)
            lifeCycle({ gridMap, organismes, setGridMap, setOrganismes
                , frameHeight, frameWidth, cycle, gridSize, coutDeLaVie });
    }, [cycle]);

    useEffect(() => {
        // toujours incrémenter : la boucle s'arrête naturellement si lifeCycle
        // ne modifie pas organismes (ex: pause — le cycle monte mais rien ne change)
        setCycle(c => c + 1);
    }, [organismes]);

    const ctxt = {
        organismes, setOrganismes, setMessage
        , gridMap, setGridMap, reset, gridSize, setGridSize, setcoutDeLaVie, coutDeLaVie
        , cycle, isRunning, toggleRunning
    }
    return <SproutContext.Provider value={ctxt}>
        {children}
        <QuickDialog text={msgText} titre="Message a caractère informatif" />

    </SproutContext.Provider>;
}
