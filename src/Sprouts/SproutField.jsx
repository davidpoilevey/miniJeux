import { Box } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {  useSprout } from './SproutContext';
import Organism from './Organism';
import { LIMIT_POURRI } from './sproutUtil';

const SproutField = ({ }) => {
    const [showTerrain, setShowTerrain] = useState(false);
   
    const handleKeyPress = useCallback((event) => {
        if(event.key==='t')
            setShowTerrain(!showTerrain);
    },[showTerrain])
    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);

        };
    }, [handleKeyPress]);
    const { organismes,  gridMap, gridSize } = useSprout();
    return <Box style={{ flex: 1, height: '100%', position: 'relative' }}>
        {organismes.map((org, orgIdx) => {
            return <Organism key={org.id} {...org} size={gridSize}/>
        })}
        {showTerrain && <>
        <Terrains type="pourri" size={gridSize} tiles={gridMap.pourri} />
        <Terrains type="orgMatter"size={gridSize} tiles={gridMap.orgMatter} />
        </>}
    </Box>
}
export default SproutField;

const Terrains = ({ type, tiles = [], size }) => {
    const mainColor = type === 'orgMatter' ? '200,0,0' : '0,0,240';
    return <>
        {tiles.map((tile, tidx) => {
            const intensity = type=='pourri'?Math.min(0.6,(tile.qty/200))
                                        :Math.min(0.6, tile.qty / (LIMIT_POURRI*2));
            const terrainColor = `rgba(${mainColor}, ${intensity})`;
            return <Box key={tidx}
            style={{ position: 'absolute', width: size, height: size
                   , top:tile.top, left:tile.left
                , backgroundColor: terrainColor }}>

            </Box>
        })}
    </>
}