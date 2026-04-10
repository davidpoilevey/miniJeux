// components/TiledMapRenderer.jsx
import { Group, Image as KonvaImage, Rect, Text } from 'react-konva';

import {getFrameById } from '../assets/imageSources';
import { useCATImage } from '../hooks/useCATImage';
import { TILE_SIZE } from '../data/maps';
import { useState } from 'react';


const TiledMapRenderer = ({
  tileMap,
  tileStates = {},
  effects = {},
  foreground = {},
  layer = 'base', // 'base' ou 'foreground'
  playerPosition = { col: 0, row: 0 }, // <<<< ici
  visionRadius = 10  
  , nightVision=false

}) => {
  const images =useCATImage();
const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  // const rows = tileMap.length;
  // const cols = tileMap[0]?.length || 0;

  if (layer === 'base') {
    const rows = tileMap.length;
    const cols = tileMap[0]?.length || 0;

    const tileElements = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const tileId = tileMap[row][col];
        const frame = getFrameById(tileId);
        const key = `${row},${col}`;
        const img = frame ? images[frame.imageKey] : images[tileId];
        if (!img) continue;

        tileElements.push(
         <Group key={`tile-${key}`}>
  <KonvaImage
    image={img}
    x={col * TILE_SIZE}
    y={row * TILE_SIZE}
    width={(frame?.tileWidth || 1) * (frame?.ratio || 1) * TILE_SIZE}
    height={(frame?.tileHeight || 1) * (frame?.ratio || 1) * TILE_SIZE}
    crop={frame?.crop}
    onMouseEnter={(e) => {
      if (frame?.label) {
        const stage = e.target.getStage();
        const pointer = stage.getPointerPosition();
        setTooltip({
          visible: true,
          text: frame.label,
          x: pointer.x + 20,
          y: pointer.y - 30,
        });
      }
    }}
    onMouseMove={(e) => {
      if (!frame?.label) return;
      const stage = e.target.getStage();
      const pointer = stage.getPointerPosition();
      setTooltip((prev) => ({
        ...prev,
        x: pointer.x + 20,
        y: pointer.y - 30,
      }));
    }}
    onMouseLeave={() => {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }}
  />
</Group>

        );
      }
    }

    // 🔦 Effet de pénombre
    const darknessOverlays = [];
    if(nightVision){
      
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const dx = col - playerPosition.col;
        const dy = row - playerPosition.row;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > visionRadius) {
          darknessOverlays.push(
            <Rect
              key={`shadow-${row},${col}`}
              x={col * TILE_SIZE}
              y={row * TILE_SIZE}
              width={TILE_SIZE}
              height={TILE_SIZE}
              fill="black"
              opacity={0.98}
            />
          );
        } else {
          // Zone visible mais dégradée
          const opacity = Math.min(0.85, dist / visionRadius);
          if (opacity > 0.05) {
            darknessOverlays.push(
              <Rect
                key={`fog-${row},${col}`}
                x={col * TILE_SIZE}
                y={row * TILE_SIZE}
                width={TILE_SIZE}
                height={TILE_SIZE}
                fill="black"
                opacity={opacity}
              />
            );
          }
        }
      }
    }
    }

    return (
      <>
        {tileElements}
        
        {darknessOverlays}
      </>
    );
  }

  if (layer === 'foreground') {
    const coords = Object.keys(foreground);
    return coords.map((coord) => {
      const [row, col] = coord.split(',').map(Number);
      const data = foreground[coord];
      let tileId = data.tileType;
      const realKey = `${row},${col}`;
      const tileState = tileStates[realKey] ?? null;
      // special case recipients lavabo
     const pleinMode=(tileState=='plein') ;//tileId=tileId+'Plein';
        const key = `fg-${realKey}`;
      const frame = getFrameById(tileId);
      const framePlein = pleinMode?getFrameById(tileId+'Plein'):null;
      if (frame) {
        const image = images[frame.imageKey];
        const imagePlein = framePlein?images[framePlein.imageKey]:null;
        if (!image) return null;
        const ratio = data.ratio||frame.ratio||1;

        return <>
        
          <Group key={key}>
            <KonvaImage
              image={image}
              x={col * TILE_SIZE}
              y={row * TILE_SIZE}
              width={(frame.tileWidth||1)*(ratio) *TILE_SIZE}
              height={(frame.tileHeight||1)*(ratio) *TILE_SIZE}
              crop={frame.crop}
              onMouseEnter={(e) => {
                if (frame?.label) {
                  const stage = e.target.getStage();
                  const pointer = stage.getPointerPosition();
                  setTooltip({
                    visible: true,
                    text: frame.label,
                    x: pointer.x + 20,
                    y: pointer.y -30,
                  });
                }
              }}
              onMouseMove={(e) => {
                if (!frame?.label) return;
                const stage = e.target.getStage();
                const pointer = stage.getPointerPosition();
                setTooltip((prev) => ({
                  ...prev,
                  x: pointer.x + 20,
                  y: pointer.y -30,
                }));
              }}
              onMouseLeave={() => {
                setTooltip((prev) => ({ ...prev, visible: false }));
              }}
            />
            {pleinMode&&<KonvaImage
              image={imagePlein}
              x={col * TILE_SIZE}
              y={row * TILE_SIZE}
              width={(framePlein.tileWidth||1)*(ratio) *TILE_SIZE}
              height={(framePlein.tileHeight||1)*(ratio) *TILE_SIZE}
              crop={framePlein.crop}
            />}
            

          </Group>
          
        {tooltip.visible && (
  <Group x={tooltip.x} y={tooltip.y}>
      <Rect
        fill="rgba(0, 0, 0, 0.7)"
        width={tooltip.text.length * 8 + 10}
        height={24}
        cornerRadius={4}
      />
      <Text
        text={tooltip.text}
        fontSize={14}
        fill="#fff"
        padding={2}
        x={5}
        y={4}
      />
    </Group>
)}
</>
      }
      const img = images[tileId];
      if (!img) return null;

      const state = tileStates[coord] ?? null;
      const opacity = ((!isNaN(state)) && state != null)
        ? Math.min(1, 0.2+(state / 10))
        : 1;

      return (
        <Group key={key}>
          <KonvaImage
            image={img}
            x={col * TILE_SIZE}
            y={row * TILE_SIZE}
            width={TILE_SIZE*(data.ratio||1)}
            height={TILE_SIZE*(data.ratio||1)}
            opacity={state==0?0:opacity}
          />
        </Group>
      );
    });
  }

  return null;
};
export default TiledMapRenderer;
