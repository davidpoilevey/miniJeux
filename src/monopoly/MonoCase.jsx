import { Box, Button, Typography } from "@mui/material"
import React, { useEffect } from "react";
import imgDepart from './images/depart.png';
import imgPrison from './images/prison.png';
import imgPG from './images/parcgratuit.png';
import imgAllez from './images/allezEnPrison.png';
import imgChance from './images/chance.png';
import imgCommu from './images/commu.jpg';
import imgGare from './images/gare.png';
import imgHein from './images/heineken.jpg';
import imgImpot from './images/impots.png';
import imgKnack from './images/knack.jpg';
import imgTaxe from './images/taxeLuxe.png';
import { useMono } from "./MonoContext";
import { Dice } from "../miniJeux/Alpiniste";
import { Centre } from "./MonoBoard";
export const MonoCase = React.forwardRef(({players, monocase, baseCell }, ref) => {
    const {joueurs} = useMono(); // Pour récupérer le propriétaire

    const boxStyle = {
        flex: `0 0 ${baseCell}px`,
        height: baseCell,
        minWidth: baseCell + 40,
        borderRight: "1px solid #222",
        borderTop: monocase.type == 'spacer' ? null : "1px solid #222",
        borderBottom: monocase.type == 'spacer' ? null : "1px solid #222",
        backgroundColor: monocase.type == 'spacer' ? 'transparent' : "#f5f5f0",
        display: "flex",
        flexDirection: 'column',
        alignItems: "center",
        justifyContent: "center", 
        overflow: "hidden",
        textOverflow: "ellipsis",
        position:'relative'
    }
    
    if (monocase.flex) {
        boxStyle.flex = monocase.flex;
    }

    // Récupérer le propriétaire si la case en a un
    const proprietaire = monocase.owner !== null && monocase.owner !== undefined 
        ? joueurs[monocase.owner] 
        : null;

    return <Box sx={boxStyle} >
        {/* Pions des joueurs */}
        {players.map((j, idx) => {
            let pos = {};
            const adjustPos = players.length > 2 ? 0 : 10;
            if(j.position.indexOf('top') >= 0) pos.top = 5+adjustPos;
            if(j.position.indexOf('left') >= 0) pos.left = 15+adjustPos;
            if(j.position.indexOf('right') >= 0) pos.right = 15+adjustPos;
            if(j.position.indexOf('bottom') >= 0) pos.bottom = 5+adjustPos;
            
            return <Box 
                key={j.id}
                sx={{
                    borderRadius: '50%', 
                    height: players.length > 2? 28:40, 
                    width: players.length > 2? 28:40,
                    position: 'absolute',
                    ...pos, 
                    backgroundImage: `url(${j.image})`,
                    backgroundSize: 'contain',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    zIndex: 10
                }}
            />
        })}

        {monocase.type == 'spacer' ? null : (
            <CaseDisplay 
                monocase={monocase} 
                baseCell={baseCell} 
                proprietaire={proprietaire}
            />
        )}
    </Box>
})

const CaseDisplay = ({monocase, baseCell, proprietaire}) => {
    return (monocase.type === 'special' || monocase.type === 'compagnie') 
        ? <SpecialCase monocase={monocase} baseCell={baseCell}/> 
        : <PropertyCase monocase={monocase} baseCell={baseCell} proprietaire={proprietaire}/>
}

const PropertyCase = ({monocase, baseCell, proprietaire}) => {
    const isGare = monocase.type === 'gare';
    const nbMaisons = monocase.maisons || 0;
    
    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            {/* Bandeau de couleur */}
            <Box sx={{
                width: '100%',
                height: isGare ? '25%' : '30%',
                backgroundColor: monocase.colorGroup || '#ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '2px solid #333',
                position: 'relative'
            }}>
                {isGare && (
                    <img 
                        src={imgGare} 
                        alt={monocase.name} 
                        style={{
                            height: '90%',
                            filter: 'brightness(0) invert(1)'
                        }} 
                    />
                )}
                
                {/* Indicateur de propriétaire */}
                {proprietaire && (
                    <Box sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: proprietaire.color,
                        border: '2px solid white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        zIndex: 5
                    }}/>
                )}
            </Box>

            {/* Nom */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                textAlign: 'center',
                backgroundColor: proprietaire ? `${proprietaire.color}15` : 'transparent'
            }}>
                <Typography 
                    variant="caption" 
                    sx={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        lineHeight: 1.1,
                        color: '#333'
                    }}
                >
                    {monocase.name}
                </Typography>

                {/* Afficher les maisons */}
                {nbMaisons > 0 && (
                    <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>
                            {nbMaisons < 5 ? '🏠'.repeat(nbMaisons) : '🏨'}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Prix */}
            <Box sx={{
                width: '100%',
                padding: '2px 4px',
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderTop: '1px solid #ddd',
                textAlign: 'center'
            }}>
                <Typography 
                    variant="caption" 
                    sx={{
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        color: '#555'
                    }}
                >
                    {monocase.price}€
                </Typography>
            </Box>
        </Box>
    )
}

const SpecialCase = ({monocase, baseCell}) => {
    let src = null;
    const {parcPactole} = useMono();
    if(monocase.id === 'depart') src = imgDepart;
    else if(monocase.id === 'prison') src = imgPrison;
    else if(monocase.id === 'parcGratuit') src = imgPG;
    else if(monocase.id === 'allezEnPrison') src = imgAllez;
    else if(monocase.id.startsWith('chance')) src = imgChance;
    else if(monocase.id.startsWith('commu')) src = imgCommu;
    else if(monocase.id === 'compEau') src = imgHein;
    else if(monocase.id === 'impots') src = imgImpot;
    else if(monocase.id === 'compElec') src = imgKnack;
    else if(monocase.id === 'taxe') src = imgTaxe;

    return monocase.id === 'dices' ? <Centre/> : (
        <Box sx={{
            width: '100%', 
            height: '100%', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: 1,
            gap: 0.5
        }}>
            <Typography 
                variant="caption" 
                sx={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#333'
                }}
            >
                {monocase.name}
            </Typography>
            {parcPactole !== undefined && monocase.id === 'parcGratuit' && ( <Box sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        zIndex: 5
                    }}>
                        <Typography 
                            variant="caption" 
                            sx={{
                                fontSize: '0.6rem',
                                fontWeight: 600,
                                color: '#333'
                            }}
                        >
                            {parcPactole}€
                        </Typography>
                    </Box>
                )}
            {src && (
                <img 
                    src={src} 
                    alt={monocase.name} 
                    style={{
                        width: '70%', 
                        maxHeight: (baseCell * 0.6) + 'px',
                        objectFit: 'contain'
                    }} 
                />
            )}
            {monocase.price && (
                <Typography 
                    variant="caption" 
                    sx={{
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        color: '#555'
                    }}
                >
                    {monocase.price}€
                </Typography>
            )}
        </Box>
    )
}