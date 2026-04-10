import React, { useState, useEffect, useRef, useMemo } from "react";
import { Box, Typography, Popover } from "@mui/material";
import { bactWidth, bactHeight } from "./Aquarium";
import {getAggressiviteColor} from './Bactery';
import { Flatware } from "@mui/icons-material";

const BacterieDiv = React.forwardRef(
    ({ bacterie, typeColor,  isAlive, icon, onOpenInfo, handleMouseLeave, ...rest }, ref) => {
       
        const position = bacterie.position;
        if (position == null) {
            return null;
        }

        const handleMouseEnter = (event) => {
           
            onOpenInfo(bacterie, event)
        };

        const containerStyle = {
            position: 'absolute',
            top: `${position.y-bacterie.champVision/2}px`,
            left: `${position.x-bacterie.champVision/2}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
        };

        const circleStyle = {
            width: `${bacterie.champVision}px`,
            height: `${bacterie.champVision}px`,
            borderRadius: '50%',
            border: '1px dashed #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative', // pour positionner les cicatrices
            color: typeColor,
            filter: `drop-shadow(0px 0px 8px ${bacterie.color})${bacterie.specialEffect ? ' blur(1px)' : ''}`,
        };
    
        const scarsContainerStyle = {
            position: 'absolute',
            top: 0,
            right: 0,
            transform: 'translate(-10px, -3px)',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        };

        const scarStyle = {

            color: 'red', // Couleur de la cicatrice
            marginTop: '-4px',
        };

        const textStyle = {
            maxWidth: bactWidth * 2,
            fontSize: '12px',
        };


        const renderScars = () => {
            const columns = [];
            let currentColumn = [];
            bacterie.scars.forEach((scar, index) => {
                if (index % 4 === 0 && index !== 0) {
                    columns.push(currentColumn);
                    currentColumn = [];
                }
                if (scar === 'sink') {
                    currentColumn.push(
                        <span key={index} style={{ fontSize: '10px', color: 'red', ...scarStyle }}>
                            ✓
                        </span>
                    );
                } else  if (scar === 'meurtre') {
                    currentColumn.push(
                        <span key={index} style={{ fontSize: '10px', color: 'red', ...scarStyle }}>
                            |
                        </span>
                    );
                } 
                else {
                    currentColumn.push(
                        <span key={index} style={{ fontSize: '14px', color: 'blue', ...scarStyle }}>
                            x
                        </span>
                    );
                }
            });
            if (currentColumn.length > 0) {
                columns.push(currentColumn);
            }

            return (
                <div style={scarsContainerStyle}>
                    {columns.map((column, columnIndex) => (
                        <div key={columnIndex}>
                            {column.map((scar, scarIndex) => (
                                <div key={scarIndex} style={{ display: 'flex', alignItems: 'center' }}>
                                    {scar}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            );
        };
        
        return (
            <Box ref={ref} style={containerStyle}>
                {isAlive ? null : <Flatware/>}

                {bacterie.scars.length > 0 && renderScars()}
                <div
                    style={circleStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {icon}
                </div>
                <Typography style={textStyle}>{bacterie.ptiNom}</Typography>
            </Box>
        );

    }
);
export const InfoDiv = ({bact})=>{

    const popoverContentStyle = {
        padding: '8px',
    };
    const popoverTitleStyle = {
        fontWeight: 'bold',
        marginBottom: '8px',
    };

    const popoverPropertyStyle = {
        marginBottom: '4px',
    };
 return   <div style={popoverContentStyle}>
    <Typography variant="subtitle1" style={popoverTitleStyle}>
        Propriétés de la bactérie
    </Typography>
    <Typography variant="body2" style={popoverPropertyStyle}>
        Nom: {bact.ptiNom}
    </Typography>
    <Typography variant="body2" style={popoverPropertyStyle}>
        Type: {bact.type}
    </Typography>
    <Typography variant="body2" color={getAggressiviteColor(bact.aggressivite)} style={popoverPropertyStyle}>
        Aggressivite: {bact.aggressivite}
    </Typography>
    <Typography variant="body2" style={popoverPropertyStyle}>
        Glisse: {bact.glisse}
    </Typography>
    <Typography variant="body2" style={popoverPropertyStyle}>
        Énergie: {bact.energy}
    </Typography>
    <Typography variant="body2" style={popoverPropertyStyle}>
        Vitesse maximale: {Math.round(bact.vitesseMax)}
    </Typography>
    <Typography variant="body2" style={popoverPropertyStyle}>
        Champ de vision: {Math.round(bact.champVision)}
    </Typography>
    <Typography variant="body2" style={popoverPropertyStyle}>
        Cicatrices: {bact.scars.length}
    </Typography>
    <Typography variant="body2" style={popoverPropertyStyle}>
        Seuil d'énergie pour la reproduction: {Math.round(bact.reproductionEnergyThreshold)}
    </Typography>
</div>
}
export const InfoPopover = ({ bact, handleMouseLeave, open,...props }) => {

    const [anchorEl, setAnchorEl] = useState(null);
    useEffect(()=>{
        if(bact.anchorEl!=null)
        setAnchorEl(bact.anchorEl);
    },[bact.anchorEl])

    const onclose=(event)=>{
        handleMouseLeave(event);
        setAnchorEl(null);
    }
    return <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={onclose}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
        }}
    >
      <InfoDiv bact={bact}/>
    </Popover>


}
export default BacterieDiv;  