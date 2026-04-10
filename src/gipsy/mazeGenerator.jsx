import { useState, useCallback } from 'react';

const TILE_TYPES = {
  EMPTY: 0,
  WALL: 1,
  EXIT: 2,
  WATER: 3,
  GRASS: 4,
  BRIDGE: 5,
  PURSE: 6,      // Bourse - plus de points
  MISSILE: 7,    // Missile - détruit le prochain mur
  CANOE: 8,      // Canoë - traverse l'eau
  ARROW_UP: 9,   // Flèche haut - change direction map
  ARROW_DOWN: 10,
  ARROW_LEFT: 11,
  ARROW_RIGHT: 12,
  DYNAMITE: 13   // Dynamite - explosion 3x3
};

const useMazeGenerator = (mapCols, mapRows) => {
  const [map, setMap] = useState([]);

  // Créer une rivière continue
  const generateRiver = (mapGrid, riverIndex, totalRivers) => {
    const riverTypes = ['horizontal', 'vertical', 'zigzag', 'diagonal', 'zigzag', 'zigzag'];
    const type = riverTypes[Math.floor(Math.random() * riverTypes.length)];
    
    const riverWidth = 2; // Largeur de la rivière
    const bridges = [];

      // Ajouter 2-3 ponts (pas japonais)
      const numBridges = 5 + Math.floor(Math.random() * 6);
    if (type === 'horizontal') {
      const y = Math.floor(mapRows / (totalRivers + 1)) * (riverIndex + 1);
      
      for (let x = 0; x < mapCols; x++) {
        for (let w = 0; w < riverWidth; w++) {
          if (y + w < mapRows) {
            mapGrid[y + w][x] = TILE_TYPES.WATER;
          }
        }
      }

      for (let i = 0; i < numBridges; i++) {
        const bridgeX = Math.floor((mapCols / (numBridges + 1)) * (i + 1));
        for (let w = 0; w < riverWidth; w++) {
          if (y + w < mapRows) {
            mapGrid[y + w][bridgeX] = TILE_TYPES.BRIDGE;
            // Parfois faire un pont de 2 cases de large
            if (Math.random() > 0.5 && bridgeX + 1 < mapCols) {
              mapGrid[y + w][bridgeX + 1] = TILE_TYPES.BRIDGE;
            }
          }
        }
      }
    } 
    else if (type === 'vertical') {
      const x = Math.floor(mapCols / (totalRivers + 1)) * (riverIndex + 1);
      
      for (let y = 0; y < mapRows; y++) {
        for (let w = 0; w < riverWidth; w++) {
          if (x + w < mapCols) {
            mapGrid[y][x + w] = TILE_TYPES.WATER;
          }
        }
      }

      // Ajouter 2-3 ponts
     
      for (let i = 0; i < numBridges; i++) {
        const bridgeY = Math.floor((mapRows / (numBridges + 1)) * (i + 1));
        for (let w = 0; w < riverWidth; w++) {
          if (x + w < mapCols) {
            mapGrid[bridgeY][x + w] = TILE_TYPES.BRIDGE;
            if (Math.random() > 0.5 && bridgeY + 1 < mapRows) {
              mapGrid[bridgeY + 1][x + w] = TILE_TYPES.BRIDGE;
            }
          }
        }
      }
    }
   else if (type === 'zigzag') {
  let currentY = Math.floor(mapRows / (totalRivers + 1)) * (riverIndex + 1);
  const initialY = currentY; // Stocker la position initiale
  let goingDown = Math.random() > 0.5;
  const initialGoingDown = goingDown; // Stocker la direction initiale
  const segmentLength = 8;
  let segmentCount = 0;
  
  for (let x = 0; x < mapCols; x++) {
    for (let w = 0; w < riverWidth; w++) {
      if (currentY + w >= 0 && currentY + w < mapRows) {
        mapGrid[currentY + w][x] = TILE_TYPES.WATER;
      }
    }

    segmentCount++;
    if (segmentCount >= segmentLength) {
      goingDown = !goingDown;
      segmentCount = 0;
    }

    if (goingDown && currentY < mapRows - riverWidth - 2) {
      currentY++;
    } else if (!goingDown && currentY > 2) {
      currentY--;
    }
  }

  // Ponts pour zigzag
  for (let i = 0; i < numBridges; i++) {
    const bridgeX = Math.floor((mapCols / (numBridges + 1)) * (i + 1));
    
    // Recalculer le Y en suivant le même algorithme
    let bridgeY = initialY;
    let goingDownBridge = initialGoingDown;
    let segmentCountBridge = 0;
    
    for (let x = 0; x < bridgeX; x++) {
      segmentCountBridge++;
      if (segmentCountBridge >= segmentLength) {
        goingDownBridge = !goingDownBridge;
        segmentCountBridge = 0;
      }
      if (goingDownBridge && bridgeY < mapRows - riverWidth - 2) {
        bridgeY++;
      } else if (!goingDownBridge && bridgeY > 2) {
        bridgeY--;
      }
    }
    
    // Placer le pont
    for (let w = 0; w < riverWidth; w++) {
      if (bridgeY + w < mapRows) {
        mapGrid[bridgeY + w][bridgeX] = TILE_TYPES.BRIDGE;
      }
    }
  }
}
    else if (type === 'diagonal') {
      const startY = riverIndex % 2 === 0 ? 0 : mapRows - 1;
      const direction = riverIndex % 2 === 0 ? 1 : -1;
      
      for (let x = 0; x < mapCols; x++) {
        const y = startY + Math.floor((x / mapCols) * mapRows * direction);
        for (let w = 0; w < riverWidth; w++) {
          const currentY = y + w;
          if (currentY >= 0 && currentY < mapRows) {
            mapGrid[currentY][x] = TILE_TYPES.WATER;
          }
        }
      }

      for (let i = 0; i < numBridges; i++) {
        const bridgeX = Math.floor((mapCols / (numBridges + 1)) * (i + 1));
        const y = startY + Math.floor((bridgeX / mapCols) * mapRows * direction);
        for (let w = 0; w < riverWidth; w++) {
          const currentY = y + w;
          if (currentY >= 0 && currentY < mapRows) {
            mapGrid[currentY][bridgeX] = TILE_TYPES.BRIDGE;
          }
        }
      }
    }
  };

  // Créer des blocs de murs groupés
  const generateWallBlocks = (mapGrid, density) => {
    const numBlocks = Math.floor((mapCols * mapRows) * density / 10);
    
    for (let i = 0; i < numBlocks; i++) {
      const x = Math.floor(Math.random() * (mapCols - 4));
      const y = Math.floor(Math.random() * (mapRows - 4));
      
      // Créer un bloc de 2-3 cases
      const blockLength = 2 + Math.floor(Math.random() * 3);
      const isHorizontal = Math.random() > 0.5;
      
      for (let j = 0; j < blockLength; j++) {
        const blockX = isHorizontal ? x + j : x;
        const blockY = isHorizontal ? y : y + j;
        
        if (blockX < mapCols && blockY < mapRows) {
          // Ne pas écraser les rivières, ponts ou la sortie
          if (mapGrid[blockY][blockX] === TILE_TYPES.EMPTY) {
            mapGrid[blockY][blockX] = TILE_TYPES.WALL;
          }
        }
      }
    }
  };

  // Créer des touffes d'herbe
  const generateGrass = (mapGrid) => {
    const totalCells = mapCols * mapRows;
    const numGrass = Math.floor(totalCells / 10);
    
    let placed = 0;
    let attempts = 0;
    const maxAttempts = numGrass * 3;

    while (placed < numGrass && attempts < maxAttempts) {
      const x = Math.floor(Math.random() * mapCols);
      const y = Math.floor(Math.random() * mapRows);
      
      if (mapGrid[y][x] === TILE_TYPES.EMPTY) {
        mapGrid[y][x] = TILE_TYPES.GRASS;
        placed++;
      }
      attempts++;
    }
  };

  // Créer des bonus
  const generateBonuses = (mapGrid, level) => {
    const bonusTypes = [
      { type: TILE_TYPES.PURSE, probability: 0.3 },
      { type: TILE_TYPES.MISSILE, probability: 0.2 },
      { type: TILE_TYPES.CANOE, probability: 0.15 },
      { type: TILE_TYPES.ARROW_UP, probability: 0.18 },
      { type: TILE_TYPES.ARROW_DOWN, probability: 0.18 },
      { type: TILE_TYPES.ARROW_LEFT, probability: 0.18 },
      { type: TILE_TYPES.ARROW_RIGHT, probability: 0.18 },
      { type: TILE_TYPES.DYNAMITE, probability: 0.2 }
    ];

    // Nombre de bonus augmente avec le niveau
    const numBonuses = 8 + Math.floor(level * 2);

    let placed = 0;
    let attempts = 0;
    const maxAttempts = numBonuses * 5;

    while (placed < numBonuses && attempts < maxAttempts) {
      const x = Math.floor(Math.random() * mapCols);
      const y = Math.floor(Math.random() * mapRows);
      
      if (mapGrid[y][x] === TILE_TYPES.EMPTY) {
        // Choisir un bonus aléatoire selon les probabilités
        const rand = Math.random();
        let cumulative = 0;
        
        for (const bonus of bonusTypes) {
          cumulative += bonus.probability;
          if (rand < cumulative) {
            mapGrid[y][x] = bonus.type;
            placed++;
            break;
          }
        }
      }
      attempts++;
    }
  };

  // Générer le labyrinthe complet
  const generateMaze = useCallback((level) => {
    // Initialiser la grille vide
    const newMap = Array(mapRows).fill(null).map(() => 
      Array(mapCols).fill(TILE_TYPES.EMPTY)
    );

    // Position de départ (zone dégagée en haut à gauche)
    const startX = Math.floor(mapCols / 6);
    const startY = Math.floor(mapRows / 6);
    
    // Créer une zone de sécurité autour du spawn (5x5)
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x = startX + dx;
        const y = startY + dy;
        if (x >= 0 && x < mapCols && y >= 0 && y < mapRows) {
          newMap[y][x] = TILE_TYPES.EMPTY;
        }
      }
    }

    // Position de sortie (zone dégagée en bas à droite)
    const exitX = mapCols - Math.floor(mapCols / 6);
    const exitY = mapRows - Math.floor(mapRows / 6);
    
    // Zone de sécurité autour de la sortie (5x5)
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const x = exitX + dx;
        const y = exitY + dy;
        if (x >= 0 && x < mapCols && y >= 0 && y < mapRows) {
          newMap[y][x] = TILE_TYPES.EMPTY;
        }
      }
    }
    
    newMap[exitY][exitX] = TILE_TYPES.EXIT;
    newMap[exitY+1][exitX] = TILE_TYPES.EXIT;
    newMap[exitY][exitX+1] = TILE_TYPES.EXIT;
    newMap[exitY+1][exitX+1] = TILE_TYPES.EXIT;

    // Générer les rivières (1 par niveau)
    const numRivers = level;
    for (let i = 0; i < numRivers; i++) {
      generateRiver(newMap, i, numRivers);
    }

    // Générer des blocs de murs
    const wallDensity = Math.min(0.15 + (level * 0.05), 0.40);
    generateWallBlocks(newMap, wallDensity);

    // Générer les touffes d'herbe
    generateGrass(newMap);

    // Générer les bonus
    generateBonuses(newMap, level);

    // S'assurer que spawn et exit sont bien vides
    newMap[startY][startX] = TILE_TYPES.EMPTY;
    newMap[exitY][exitX] = TILE_TYPES.EXIT;

    // Générer les ennemis (positions et directions)
    const enemies = [];
    const numEnemies = Math.floor(level * 2.8); // Augmente avec le niveau
    
    for (let i = 0; i < numEnemies; i++) {
      let enemyPlaced = false;
      let attempts = 0;
      
      while (!enemyPlaced && attempts < 50) {
        const x = Math.floor(Math.random() * (mapCols - 4)) + 2;
        const y = Math.floor(Math.random() * (mapRows - 4)) + 2;
        
        // Vérifier qu'il y a un espace vide et des murs pour rebondir
        if (newMap[y][x] === TILE_TYPES.EMPTY) {
          const isHorizontal = Math.random() > 0.5;
          enemies.push({
            id: i,
            x,
            y,
            direction: isHorizontal ? 1 : -1, // 1 = horizontal (droite), 0 = vertical (bas)
            axis: isHorizontal ? 'x' : 'y',
            speed: 1
          });
          enemyPlaced = true;
        }
        attempts++;
      }
    }

    return { map: newMap, startX, startY, enemies };
  }, [mapCols, mapRows]);

  return {
    map,
    generateMaze,
    TILE_TYPES
  };
};

export const findSpawnInViewport = (
  map,
  viewport,
  VIEWPORT_COLS,
  VIEWPORT_ROWS,
  allowedTiles
) => {

  const centerX = viewport.x + Math.floor(VIEWPORT_COLS / 2);
  const centerY = viewport.y + Math.floor(VIEWPORT_ROWS / 2);

  const visited = new Set();
  const queue = [{ x: centerX, y: centerY }];

  const key = (x, y) => `${x},${y}`;

  const isInsideViewport = (x, y) =>
    x >= viewport.x &&
    y >= viewport.y &&
    x < viewport.x + VIEWPORT_COLS &&
    y < viewport.y + VIEWPORT_ROWS;

  while (queue.length > 0) {
    const { x, y } = queue.shift();

    if (!isInsideViewport(x, y)) continue;
    if (map[y]==null || map[y][x]==null) continue;

    if (visited.has(key(x, y))) continue;
    visited.add(key(x, y));

    if (allowedTiles.includes(map[y][x])) {
      return { x, y };
    }

    queue.push(
      { x: x + 1, y },
      { x: x - 1, y },
      { x, y: y + 1 },
      { x, y: y - 1 }
    );
  }

  return null;
};



export default useMazeGenerator;