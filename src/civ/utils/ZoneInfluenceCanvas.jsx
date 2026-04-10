import { Stage, Layer, Text, Group, Label, Tag } from 'react-konva';
import { useMemo, useState } from 'react';
import { HexTile } from './HexTile';
import { getSurroundingTiles } from '../utils/hexUtils';
import { hexToPixel } from '../utils/hexUtils';
import { Box } from '@mui/material';

const TILE_SIZE = 35;
const WIDTH = 300;
const HEIGHT = 250;

export const ZoneInfluenceCanvas = ({
  city,
  tiles,
  images,
  onToggleAssign,
}) => {
  const [hoveredTile, setHoveredTile] = useState(null);

  const areaTiles = useMemo(() => {
    return getSurroundingTiles(city.position, tiles);
  }, [city, tiles]);

  const offset = useMemo(() => {
    const pixels = areaTiles.map(t => hexToPixel(t, TILE_SIZE));
    const minX = Math.min(...pixels.map(p => p.x));
    const maxX = Math.max(...pixels.map(p => p.x));
    const minY = Math.min(...pixels.map(p => p.y));
    const maxY = Math.max(...pixels.map(p => p.y));
    return {
      dx: WIDTH / 2 - (minX + maxX) / 2,
      dy: HEIGHT / 2 - (minY + maxY) / 2,
    };
  }, [areaTiles]);

  const isTileAssigned = (tile) =>
    city.assignedTiles?.some(t => t.q === tile.q && t.r === tile.r);

  const isCenterTile = (tile) =>
    tile.q === city.position.q && tile.r === city.position.r;

  const maxCitizens = city.population;
  const assignedCount = city.assignedTiles?.length || 0;
  const freeCitizens = maxCitizens - assignedCount;

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <Stage width={WIDTH} height={HEIGHT}>
        <Layer>
          {areaTiles.map(tile => {
            const isAssigned = isTileAssigned(tile);
            const isCenter = isCenterTile(tile);
            const { x, y } = hexToPixel(tile, TILE_SIZE);
            const posX = x + offset.dx;
            const posY = y + offset.dy;

            return (
              <Group
                key={`${tile.q},${tile.r}`}
                onClick={() => {
                  if (!isCenter) onToggleAssign(tile);
                }}
                onMouseEnter={() => setHoveredTile({ tile, x: posX, y: posY })}
                onMouseLeave={() => setHoveredTile(null)}
              >
                <HexTile
                  tile={tile}
                  images={images}
                  isAssigned={isAssigned}
                  showCitoyen={isAssigned}
                  positionOverride={{ x: posX, y: posY }}
                  size={TILE_SIZE}
                />
                {isCenter && (
                  <Text
                    x={posX - 10}
                    y={posY - 8}
                    text="🏛️"
                    fontSize={18}
                    stroke="white"
                  />
                )}
              </Group>
            );
          })}

          {hoveredTile && (
            <Label x={hoveredTile.x + 10} y={hoveredTile.y - 30}>
              <Tag fill="white" stroke="black" />
             <Text
  text={
    `${hoveredTile.tile.type}${hoveredTile.tile.feature ? ` (${hoveredTile.tile.feature})` : ''}\n` +
    Object.entries(hoveredTile.tile.yield || {})
      .map(([res, val]) => `${res} +${val}`)
      .join(', ')
  }
  fontSize={12}
  padding={4}
  fill="black"
/>

            </Label>
          )}
        </Layer>
      </Stage>

      <Box sx={{ width: 100 , p:1, backgroundImage: 'linear-gradient(to right, rgba(180, 154, 79, 0.7), rgba(225, 225, 225, 0))', height:'min-content'}}>
        <div style={{ fontWeight: 'bold', marginBottom: 6 }}>
          👥 Citoyens
        </div>
        {Array.from({ length: freeCitizens }).map((_, i) => (
          <div key={i} style={{fontSize:36}}>👷</div>
        ))}
      </Box>
    </div>
  );
};
