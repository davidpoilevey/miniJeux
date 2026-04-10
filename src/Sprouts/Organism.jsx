import { Box, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { BlurCircular, CleaningServices, EnergySavingsLeaf, Flatware, Hub, NotInterested } from '@mui/icons-material';

/**
 * 
 * organism { id , 
 *   cellules:[
 *      {type  // sprout, feuille (produit nrj), racine(consomme orgMatter)
 *         , mycelium (consomme pourri), bois (conduit nrj)
 *      , position:{top, left}}
 *  ], nrj, adn
 * }
 */


const Organism = ({size, ...organisme}) => {
    

    return <>
        {organisme.cellules.map((cell, orgIdx) => {
            return <SproutCellule key={orgIdx} type={cell.type} 
            nrj={cell.type == 'sprout' ? organisme.nrj : ''} 
            size={size}
            position={cell.position} branches={cell.branches}/>
        })}
    </>
}
export default Organism;

export const SproutCellule = ({ type, position, nrj,branches ,size}) => {
    const [spClipPath, spColor] = useMemo(() => {
        let cp=null, color;
        switch (type) {
            case 'sprout':
                
                color = '#dedd03'
                break;
            case 'graine':
                
                color = '#aead23'
                break;
            case 'feuille':
                cp='polygon(0% 0%, 50% 30%, 100% 0%, 60% 50%, 100% 100%,  50% 60%, 0% 100%, 30% 50%)';
                color = '#2edd23'
                break;
            case 'racine':
                cp='polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
                color = '#fe4d23'
                break;
            case 'mycelium':
                cp='polygon(0% 30%, 30% 0%,50% 50%, 60% 0%, 100% 30% ,50% 50%, 100% 70%, 70% 100%, 50% 50%,30% 100%, 0% 70%)';
                color = '#2e4df3'
                break;
            case 'bois':
                color = '#333333'
                break;

            default:
                color = '#eee';
                break;
        }
        return [cp, color]
    }, [type]);
    if (type === 'bois')
        return <Bois position={position} branches={branches} size={size}/>
    else
        return <Box style={{
            position: 'absolute', top: position.top, left: position.left
            , width: size, height: size, backgroundColor: spColor, borderRadius: type==='mycelium'?0:'50%'
            , clipPath:spClipPath
        }}>
            {/* <SproutIcon sx={{ color: spColor }} /> */}
            {type === 'sprout' && <Typography variant='caption'>{Math.round(nrj)}</Typography>}
        </Box>
}
const Bois = ({ position , branches=[], size}) => {
    // trouve ou sont les voisins et dessinent en consequence
   
    return <Box style={{
        position: 'absolute', top: position.top, left: position.left
        , width: size, height: size
    }}>
        {branches.includes('haut') && <Box style={{ position: 'absolute', top: 0, left: size / 2, width: 2, height: size / 2, backgroundColor: '#333' }} />}
        {branches.includes('bas') && <Box style={{ position: 'absolute', top: size / 2, left: size / 2, width: 2, height: size / 2, backgroundColor: '#333' }} />}
        {branches.includes('gauche') && <Box style={{ position: 'absolute', top: size / 2, left: 0, height: 2, width: size / 2, backgroundColor: '#333' }} />}
        {branches.includes('droite') && <Box style={{ position: 'absolute', top: size / 2, left: size / 2, height: 2, width: size / 2, backgroundColor: '#333' }} />}
    </Box>
}