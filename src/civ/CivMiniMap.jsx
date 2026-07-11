import React, { useRef, useEffect, useState, useContext } from 'react';
import { useCivContext } from './CivContext';

// Contexte simulé pour l'exemple - remplace par ton vrai contexte
const CivContext = React.createContext();

// Couleurs par type de terrain
const TERRAIN_COLORS = {
  water: '#1e40af',
  plain: '#22c55e',
  desert: '#eab308',
  forest: '#166534',
  mountain: '#525252',
  default: '#64748b'
};

// Fonction pour convertir coordonnées hex vers pixel
const hexToPixel = (q, r, size) => {
  const x = size * (3/2 * q);
  const y = size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return { x, y };
};

// Fonction pour dessiner un hexagone
const drawHexagon = (ctx, x, y, size) => {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const hx = x + size * Math.cos(angle);
    const hy = y + size * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(hx, hy);
    } else {
      ctx.lineTo(hx, hy);
    }
  }
  ctx.closePath();
};

// Fonction pour vérifier si un point est dans un hexagone
const pointInHexagon = (px, py, hx, hy, size) => {
  const dx = Math.abs(px - hx);
  const dy = Math.abs(py - hy);
  
  if (dx > size * 0.866 || dy > size * 1.5) return false;
  
  return (size * 1.5 - dy) >= Math.sqrt(3) * (size * 0.866 - dx);
};

export const MiniMap = ({ 
  onNavigate = () => {},
  currentViewport = { x: 0, y: 0, width: 100, height: 100 },
  mainHexSize=40
}) => {
    const {playerNation, tiles, techsUnlocked} = useCivContext();
  const hasGeographie = techsUnlocked.includes('geographie');
  const canvasRef = useRef(null);
  const [canvasSize] = useState({ width: 200, height: 150 });
  const hexSize = 3; // Taille des hexagones dans la minimap

  const drawMiniMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    if (tiles.length === 0) return;

    // Calculer les limites de la map
    const minQ = Math.min(...tiles.map(t => t.q));
    const maxQ = Math.max(...tiles.map(t => t.q));
    const minR = Math.min(...tiles.map(t => t.r));
    const maxR = Math.max(...tiles.map(t => t.r));

    const mapWidthHex = maxQ - minQ;
    const mapHeightHex = maxR - minR;

    // Échelle pour faire tenir la map dans le canvas
    const scaleX = (canvasSize.width - 20) / (mapWidthHex * hexSize * 1.5);
    const scaleY = (canvasSize.height - 20) / (mapHeightHex * hexSize * Math.sqrt(3));
    const scale = Math.min(scaleX, scaleY, 1);

    const offsetX = canvasSize.width / 2;
    const offsetY = canvasSize.height / 2;

    // Dessiner les tiles
    tiles.forEach(tile => {
      const { x, y } = hexToPixel(tile.q - minQ - mapWidthHex/2, tile.r - minR - mapHeightHex/2, hexSize * scale);
      const pixelX = x + offsetX;
      const pixelY = y + offsetY;

      // Dessiner l'hexagone de base
      drawHexagon(ctx, pixelX, pixelY, hexSize * scale);
      
      const explored = tile.explored || hasGeographie;
      if (!explored) {
        // Zone non explorée = noir
        ctx.fillStyle = '#000000';
      } else {
        // Couleur selon le type de terrain
        ctx.fillStyle = TERRAIN_COLORS[tile.type] || TERRAIN_COLORS.default;
      }

      ctx.fill();
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Dessiner les villes
      if (tile.hasCity && explored) {
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, hexSize * scale * 0.6, 0, 2 * Math.PI);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Dessiner les unités
      if (tile.unit && tile.explored) {
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, hexSize * scale * 0.4, 0, 2 * Math.PI);
        
        if (tile.unit.owner.id === playerNation.id) {
          ctx.fillStyle = '#10b981'; // Vert pour les unités amies
        } else {
          ctx.fillStyle = '#ef4444'; // Rouge pour les ennemies
        }
        
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Dessiner le rectangle de viewport actuel - VERSION SIMPLIFIÉE
    // Convertir les coordonnées de scroll en position sur la minimap
    const scrollRatioX = mapWidthHex > 0 ? (canvasSize.width - 20) / (mapWidthHex * mainHexSize * 1.5) : 0;
    const scrollRatioY = mapHeightHex > 0 ? (canvasSize.height - 20) / (mapHeightHex * mainHexSize * Math.sqrt(3)) : 0;
    
    const viewportX = offsetX + (currentViewport.x * scrollRatioX) - (canvasSize.width - 20) / 2;
    const viewportY = offsetY + (currentViewport.y * scrollRatioY) - (canvasSize.height - 20) / 2;
    const viewportWidth = currentViewport.width * scrollRatioX;
    const viewportHeight = currentViewport.height * scrollRatioY;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas || tiles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Calculer les coordonnées hex correspondantes
    const minQ = Math.min(...tiles.map(t => t.q));
    const maxQ = Math.max(...tiles.map(t => t.q));
    const minR = Math.min(...tiles.map(t => t.r));
    const maxR = Math.max(...tiles.map(t => t.r));

    const mapWidthHex = maxQ - minQ;
    const mapHeightHex = maxR - minR;
    const scaleX = (canvasSize.width - 20) / (mapWidthHex * hexSize * 1.5);
    const scaleY = (canvasSize.height - 20) / (mapHeightHex * hexSize * Math.sqrt(3));
    const scale = Math.min(scaleX, scaleY, 1);

    const offsetX = canvasSize.width / 2;
    const offsetY = canvasSize.height / 2;

    // Trouver la tile la plus proche du clic
    let closestTile = null;
    let minDistance = Infinity;

    tiles.forEach(tile => {
      const { x, y } = hexToPixel(tile.q - minQ - mapWidthHex/2, tile.r - minR - mapHeightHex/2, hexSize * scale);
      const pixelX = x + offsetX;
      const pixelY = y + offsetY;

      if (pointInHexagon(clickX, clickY, pixelX, pixelY, hexSize * scale)) {
        const distance = Math.sqrt((clickX - pixelX) ** 2 + (clickY - pixelY) ** 2);
        if (distance < minDistance) {
          minDistance = distance;
          closestTile = tile;
        }
      }
    });

    if (closestTile) {
      // Appeler la fonction de navigation avec les coordonnées de la tile
      onNavigate(closestTile.q, closestTile.r);
    }
  };

  useEffect(() => {
    drawMiniMap();
  }, [tiles, playerNation, currentViewport, techsUnlocked]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      border: '2px solid #374151',
      borderRadius: '8px',
      padding: '10px',
      zIndex: 1000
    }}>
      <div style={{
        color: 'white',
        fontSize: '12px',
        marginBottom: '5px',
        textAlign: 'center'
      }}>
        MiniMap
      </div>
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleCanvasClick}
        style={{
          cursor: 'pointer',
          border: '1px solid #6b7280',
          borderRadius: '4px'
        }}
      />
      <div style={{
        color: '#9ca3af',
        fontSize: '10px',
        marginTop: '5px',
        textAlign: 'center'
      }}>
        <div>🟢 Amis | 🔴 Ennemis</div>
        <div>🟡 Villes | ⬛ Inexploré</div>
      </div>
    </div>
  );
};



// Composant de démonstration
// const CivGameDemo = () => {
//   const [selectedNation, setSelectedNation] = useState('player1');
//   const [currentViewport, setCurrentViewport] = useState({ x: 0, y: 0, width: 100, height: 100 });

//   const handleNavigate = (q, r) => {
//     console.log(`Navigation vers la tile q:${q}, r:${r}`);
//     // Ici tu intègrerais avec ton système de scroll de la map principale
//     // Par exemple: scrollToHex(q, r);
//     setCurrentViewport(prev => ({ ...prev, x: q * 10, y: r * 10 }));
//   };

//   return (
//     <div style={{ 
//       position: 'relative', 
//       width: '100%', 
//       height: '400px', 
//       background: 'linear-gradient(45deg, #1e40af, #22c55e)',
//       overflow: 'hidden'
//     }}>

//       {/* Ta MiniMap */}
//       <MiniMap
//         tiles={[]} // Passe tes vraies tiles ici
//         selectedNation={selectedNation}
//         onNavigate={handleNavigate}
//         currentViewport={currentViewport}
//       />
//     </div>
//   );
// };



// // MiniMap.js
// import React, { useMemo } from 'react';
// import { Stage, Layer, Rect, Circle } from 'react-konva';
// import { hexToPixel } from './utils/hexUtils';
// import { useCivContext } from './CivContext';

// // Définissez des couleurs simples pour la représentation
// const TERRAIN_COLORS = {
//     water: '#4169E1', // RoyalBlue
//     plain: '#228B22', // ForestGreen
//     mountain: '#A0522D', // Sienna
//     forest: '#006400', // DarkGreen
//     desert: '#F4A460', // SandyBrown
//     // ...ajoutez vos autres types
// };

// const UNIT_COLORS = {
//     PLAYER: '#00FFFF', // Cyan
//     AI: '#FF0000', // Red
//     // ...ajoutez vos autres joueurs/factions
// };

// const MINIMAP_WIDTH = 240; // Largeur en pixels de votre minimap

//             const TILE_SIZE = 1; // On peut utiliser 1 pour le calcul du ratio
// export const MiniMap = ({ tiles, units, viewportRect, onNavigate }) => {
//     const {playerNation} = useCivContext();
//     // 1. Calculer les dimensions du monde et le ratio d'échelle
//     const { worldWidth, worldHeight, scale ,minX, minY} = useMemo(() => {
//         if (!tiles.length) return { worldWidth: 0, worldHeight: 0, scale: 1 };

//         // Simulez les coordonnées en pixels pour trouver les min/max
//         // NOTE: Adaptez getPixelCoords à votre propre logique
//         const getPixelCoords = (tile) => {
//             const x = TILE_SIZE * (3 / 2 * tile.q);
//             const y = TILE_SIZE * (Math.sqrt(3) / 2 * tile.q + Math.sqrt(3) * tile.r);
//             return { x, y };
//         };

//         let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
//         tiles.forEach(tile => {
//             const { x, y } = getPixelCoords(tile);
//             if (x < minX) minX = x;
//             if (x > maxX) maxX = x;
//             if (y < minY) minY = y;
//             if (y > maxY) maxY = y;
//         });

//         const worldWidth = maxX - minX + (TILE_SIZE * 2);
//         const scale = MINIMAP_WIDTH / worldWidth;
//         const worldHeight = (maxY - minY + (TILE_SIZE * 2)) * scale;

//         return { worldWidth: MINIMAP_WIDTH, worldHeight, scale, minX, minY };
//     }, [tiles]);

//     // 2. Logique pour le clic
//     const handleNavigate = (e) => {
//         const stage = e.target.getStage();
//         const pos = stage.getPointerPosition();

//         // Convertir les coordonnées du clic sur la minimap en coordonnées du monde réel
//         const targetX = pos.x / scale;
//         const targetY = pos.y / scale;

//         onNavigate({ x: targetX, y: targetY });
//     };


//     return (
//         <Stage width={worldWidth} height={worldHeight} onClick={handleNavigate}>
//             <Layer>
//                 {/* 3. Dessin des terrains simplifiés */}
//                 {tiles.map(tile => {
//                     // Utilisez votre VRAIE fonction getPixelCoords ici
//                     const { x, y } = hexToPixel(tile); // getRealPixelCoords est votre fonction existante
//                     return (
//                         <Rect
//                             key={`${tile.q},${tile.r}`}
//                             x={(x - minX) * scale} // On normalise et on met à l'échelle
//                             y={(y - minY) * scale}
//                             width={TILE_SIZE * 2 * scale} // TILE_SIZE de votre jeu principal
//                             height={TILE_SIZE * 2 * scale}
//                             fill={TERRAIN_COLORS[tile.type] || 'grey'}
//                             listening={false}
//                         />
//                     );
//                 })}

//                 {/* 4. Dessin des unités */}
//                 {units.map(unit => {
//                     const tile = tiles.find(t => t.q === unit.q && t.r === unit.r);
//                     if (!tile) return null;
//                     const { x, y } = hexToPixel(tile);
//                     return (
//                         <Circle
//                             key={unit.id}
//                             x={(x - minX) * scale}
//                             y={(y - minY) * scale}
//                             radius={4} // Rayon fixe pour une bonne visibilité
//                             fill={unit.owner.id==playerNation.id?UNIT_COLORS.PLAYER:UNIT_COLORS.AI || 'white'}
//                             stroke="black"
//                             strokeWidth={1}
//                             listening={false}
//                         />
//                     );
//                 })}

//                 {/* 5. Dessin du rectangle de la vue actuelle */}
//                 {viewportRect && (
//                     <Rect
//                         x={viewportRect.x * scale}
//                         y={viewportRect.y * scale}
//                         width={viewportRect.width * scale}
//                         height={viewportRect.height * scale}
//                         stroke="white"
//                         strokeWidth={2}
//                         listening={false}
//                     />
//                 )}
//             </Layer>
//         </Stage>
//     );
// };