import React from 'react';
import { Group, Line, RegularPolygon, Text, Rect } from 'react-konva';

const EmpileTile = ({ hex, size, onClick }) => {
  const pile = hex.pile || [];
  const type = hex.type || 'normal';
  const counter = hex.counter || 0;
  const TILE_HEIGHT = 6; // Hauteur de chaque dalle individuelle
  const ISO_ANGLE = Math.PI / 6; // 30 degrés pour l'effet iso
  
  // Fonction pour assombrir une couleur (pour les faces latérales)
  const darkenColor = (color, factor = 0.4) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.floor(r * (1 - factor));
    const newG = Math.floor(g * (1 - factor));
    const newB = Math.floor(b * (1 - factor));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };
  
  // Fonction pour éclaircir une couleur (pour l'effet frozen)
  const lightenColor = (color, factor = 0.3) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };
  
  // Calcul des points de l'hexagone
  const getHexPoints = (radius, yOffset = 0) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      points.push(
        radius * Math.cos(angle),
        radius * Math.sin(angle) + yOffset
      );
    }
    return points;
  };
  
  // Convertir la pile en dalles individuelles
  const allTiles = [];
  let topNb=0;
  pile.forEach(item => {
    topNb=item.nb;
    for (let i = 0; i < item.nb; i++) {
      allTiles.push(item.color);
    }
  });
  
  const totalHeight = allTiles.length * TILE_HEIGHT;
  
  return (
    <Group x={hex.x} y={hex.y} onClick={(type === 'counter'&& counter > 0) ? undefined : onClick}>
      {/* Filtre pour frozen : effet de gel */}
      {type === 'frozen' && (
        <Group>
          {/* Overlay bleu glacé semi-transparent */}
          <Line
            points={getHexPoints(size, -totalHeight)}
            fill="rgba(173, 216, 230, 0.7)"
            closed
          />
          {/* Cristaux de glace (lignes décoratives) */}
          <Line
            points={[0, -totalHeight - size * 0.8, 0, -totalHeight + size * 0.8]}
            stroke="#ADD8E6"
            strokeWidth={2}
            opacity={0.7}
          />
          <Line
            points={[-size * 0.6, -totalHeight - size * 0.4, size * 0.6, -totalHeight + size * 0.4]}
            stroke="#ADD8E6"
            strokeWidth={2}
            opacity={0.7}
          />
          <Line
            points={[-size * 0.6, -totalHeight + size * 0.4, size * 0.6, -totalHeight - size * 0.4]}
            stroke="#ADD8E6"
            strokeWidth={2}
            opacity={0.7}
          />
        </Group>
      )}
      
      {/* Hexagone de base (sol) si pas de dalles */}
      {allTiles.length === 0 && (
        <>
          <RegularPolygon
            sides={6}
            radius={size}
            fill={(type === 'counter'&& counter > 0) ? "#ffcccc" : "#e0e0e0"}
            stroke={type === 'counter' ? "#cc0000" : "#999"}
            strokeWidth={2}
            opacity={type === 'frozen' ? 0.8 : 1}
          />
          
          {/* Barres rouges pour les counters */}
          {type === 'counter' && counter > 0 && (
            <Group>
              {Array.from({ length: counter }).map((_, idx) => {
                const barWidth = size * 1.6;
                const barHeight = 6;
                const spacing = size * 0.4;
                const yPos = -size + spacing * (idx + 3);
                
                return (
                  <Rect
                    key={idx}
                    x={10*idx-barWidth / 2}
                    y={yPos}
                    width={barWidth}
                    height={barHeight}
                    fill="#cc0000"
                    cornerRadius={2}
                    stroke="#880000"
                    strokeWidth={1}
                    rotation={-30*idx}
                  />
                );
              })}
              
              {/* Nombre du counter */}
              <Text
                text={counter.toString()}
                fontSize={size * 0.8}
                fill="#cc0000"
                fontStyle="bold"
                align="center"
                verticalAlign="middle"
                offsetX={size * 0.3}
                offsetY={size * 0.3}
                stroke="#fff"
                strokeWidth={2}
              />
            </Group>
          )}
        </>
      )}
      
      {/* Dessiner chaque dalle de bas en haut */}
      {allTiles.map((color, index) => {
        const yOffset = -index * TILE_HEIGHT;
        const isTop = index === allTiles.length - 1;
        
        // Appliquer un effet plus clair pour frozen
        const displayColor = type === 'frozen' ? lightenColor(color, 0.7) : color;
        
        return (
          <Group key={index} opacity={type === 'frozen' ? 0.85 : 1}>
            {/* Face supérieure de la dalle */}
            <Line
              points={getHexPoints(size, yOffset)}
              fill={displayColor}
              stroke={isTop ? "#333" : "#555"}
              strokeWidth={isTop ? 2 : 1}
              closed
            />
            
            {/* Faces latérales visibles (2 faces pour l'effet 3D) */}
            {/* Face droite */}
            <Line
              points={[
                // Coin bas droit
                size * Math.cos(Math.PI / 6), size * Math.sin(Math.PI / 6) + yOffset,
                // Coin bas droit du dessous
                size * Math.cos(Math.PI / 6), size * Math.sin(Math.PI / 6) + yOffset + TILE_HEIGHT,
                // Coin milieu bas du dessous
                0, size + yOffset + TILE_HEIGHT,
                // Coin milieu bas du dessus
                0, size + yOffset
              ]}
              fill={darkenColor(displayColor, 0.3)}
              stroke="#444"
              strokeWidth={0.5}
              closed
            />
            
            {/* Face droite-arrière */}
            <Line
              points={[
                // Coin haut droit
                size * Math.cos(-Math.PI / 6), size * Math.sin(-Math.PI / 6) + yOffset,
                // Coin bas droit
                size * Math.cos(Math.PI / 6), size * Math.sin(Math.PI / 6) + yOffset,
                // Coin bas droit du dessous
                size * Math.cos(Math.PI / 6), size * Math.sin(Math.PI / 6) + yOffset + TILE_HEIGHT,
                // Coin haut droit du dessous
                size * Math.cos(-Math.PI / 6), size * Math.sin(-Math.PI / 6) + yOffset + TILE_HEIGHT
              ]}
              fill={darkenColor(displayColor, 0.5)}
              stroke="#444"
              strokeWidth={0.5}
              closed
            />
          </Group>
        );
      })}
      
      {/* Optionnel : afficher le nombre total de dalles */}
      {allTiles.length > 3 && (
        <Group y={-totalHeight}>
          <RegularPolygon
            sides={6}
            radius={size * 0.45}
            fill="white"
            stroke="#333"
            strokeWidth={1}
          />
           <Text
                text={topNb.toString()}
                fontSize={size * 0.6}
                fill="#000000"
                fontStyle="bold"
                align="center"
                verticalAlign="middle"
                offsetX={size * 0.15}
                offsetY={size * 0.24}
                stroke="#fff"
                strokeWidth={2}
              />
        </Group>
      )}
    </Group>
  );
};

export default EmpileTile;