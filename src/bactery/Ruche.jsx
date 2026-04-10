import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { useSB } from "./SmartBactContext";
import base0 from './images/base0.png';
import base1 from './images/base1.png';
import base2 from './images/base2.png';
import base3 from './images/base3.png';
import base4 from './images/base4.png';
import centreRecherche from './images/centreGenetique.png'
import centreSport from './images/centreSport.png'
import centreBeaute from './images/centreBeaute.png'
import centreAgro from './images/centreAgro.png'
import RucheDialog from "./RucheDialog";
import CentreDialog from "./CentreDialog";

const Ruche = (props) => {

    const [openDialog, setOpenDialog] = useState(false);
    const handleOpenDialog = () => {
        setOpenDialog(true);
    };
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };
    return <RucheUI {...props} handleOpenDialog={handleOpenDialog}>

        <RucheDialog
            openDialog={openDialog} handleCloseDialog={handleCloseDialog} />

    </RucheUI>
}
const RucheUI = ({ frameWidth, frameHeight, handleOpenDialog, children }) => {
    const spawnPointRadius = 40;
    const { niveau , centres} = useSB();
    const [currentCentre, setCurrentCentre] = useState();

    const [centreOpen, setCentreOpen] = useState(false);
    const handleOpenCentre = (ctre) => {
        setCentreOpen(true);
        setCurrentCentre(ctre);
    };
    const handleCloseCentre = () => {
        setCentreOpen(false);
        setCurrentCentre(null);
    };

    const imgRuche = useMemo(() => {
        if (niveau == null)
            return base0;
        switch (niveau) {
            case 1:
                return base1;
            case 2:
                return base2;
            case 3:
                return base3;
            case 4:
                return base4;
            default: return base0;
        }
    }, [niveau])
const topPos = frameHeight / 2-spawnPointRadius/2;
const leftPos = frameWidth / 2-spawnPointRadius/2;
    return <>
    <Box
        onMouseDown={handleOpenDialog}
        style={{
            position: 'absolute',
            top: `${topPos}px`,
            left: `${leftPos}px`,
            width: `${spawnPointRadius}px`,
            height: `${spawnPointRadius}px`,
        }}
    >
        <img alt="ruche" src={imgRuche} height={spawnPointRadius} width={spawnPointRadius} />
        {children}
    </Box>
    {currentCentre&&<CentreDialog open={centreOpen} centre={currentCentre} onClose={handleCloseCentre}/>}
    {centres.some(centre => centre.type ==='Recherche')&&<Box 
            onMouseDown={()=>{handleOpenCentre('Recherche');}}
            sx={{ position: 'absolute',
            top: `${topPos+spawnPointRadius}px`,
            left: `${leftPos}px`,
            width: `${spawnPointRadius}px`,
            height: `${spawnPointRadius}px`,}}>
                <img alt="recherche" src={centreRecherche} width={'100%'}/></Box>}
    {centres.some(centre => centre.type ==='Agro')&&<Box 
            onMouseDown={()=>{handleOpenCentre('Agro');}}
            sx={{ position: 'absolute',
            top: `${topPos}px`,
            left: `${leftPos-spawnPointRadius}px`,
            width: `${spawnPointRadius}px`,
            height: `${spawnPointRadius}px`,}}>
                <img alt="agro" src={centreAgro} width={'100%'}/></Box>}
    {centres.some(centre => centre.type ==='Sport')&&<Box 
            onMouseDown={()=>{handleOpenCentre('Sport');}}
            sx={{ position: 'absolute',
            top: `${topPos}px`,
            left: `${leftPos+spawnPointRadius}px`,
            width: `${spawnPointRadius}px`,
            height: `${spawnPointRadius}px`,}}>
                <img alt="sport" src={centreSport} width={'100%'}/></Box>}
    {centres.some(centre => centre.type ==='Beaute')&&<Box 
            onMouseDown={()=>{handleOpenCentre('Beaute');}}
            sx={{ position: 'absolute',
            top: `${topPos-spawnPointRadius}px`,
            left: `${leftPos}px`,
            width: `${spawnPointRadius}px`,
            height: `${spawnPointRadius}px`,}}>
                <img alt="Beaute" src={centreBeaute} width={'100%'}/></Box>}
    </>
}
export default Ruche;


