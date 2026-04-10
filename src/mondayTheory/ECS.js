// ecs.js
export function createWorld() {
  return {
    entities: {},
    systems: [],
    navigation : {
  cellSize: 40, //1000x2000 divisé en cellules de 40x40
  width: 25,
  staticGrid:[],dynamicGrid:[],
  height: 50,
},
    time : {
  totalHours: 0,      // temps absolu en heures
  hour: 0,
  minute: 0,
  day: 1,
  weekday: 1,         // 1 = Monday
  timeScale: 0.5,
},
    nextId: 1,
  };
}
export function findEntityByType(world, type) {
  for (const [id, e] of Object.entries(world.entities)) {
    if (e.type === type) return id;
  }
  return null;
}
export function addWallRect(world, startX, startY, width, height) {
  const { staticGrid } = world.navigation;

  for (let y = startY; y < startY + height; y++) {
    for (let x = startX; x < startX + width; x++) {
      staticGrid[y][x] = 1;
    }
  }
}  
export function createNavigationGrid(width, height) {
  const grid = [];
   const dgrid = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      row.push(0); // 0 = libre
    }
    grid.push(row);
    dgrid.push(row.map(() => 0));
  }
  return { width, height, staticGrid:grid, dynamicGrid:dgrid, cellSize: 40};
} 

export function worldToCell(world, x, y) {
  const { cellSize } = world.navigation;

  return {
    col: Math.abs(Math.floor(x / cellSize)),
    row: Math.abs(Math.floor(y / cellSize)),
  };
}

export function cellToWorld(world, col, row) {
  const { cellSize } = world.navigation;

  return {
    x: col * cellSize,
    y: row * cellSize,
  };
}
export function rebuildDynamicGrid(world) {
  const { dynamicGrid, width, height } = world.navigation;

  // reset
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      dynamicGrid[r][c] = 0;
    }
  }

  Object.values(world.entities).forEach(entity => {
    if (!entity.position) return;
    if(!entity.needs) return; // Seules les entités avec des besoins sont des obstacles dynamiques (les agents)

    const cell = worldToCell(world, entity.position.x, entity.position.y);
    dynamicGrid[cell.row][cell.col] = 1;
  });
}

export function isCellBlocked(world, cell) {
  const { staticGrid, dynamicGrid, width, height } = world.navigation;

  const { col, row } = cell;

  // hors grille = bloqué
  if (col < 0 || row < 0 || col >= width || row >= height) {
    return true;
  }

  if (staticGrid[row][col] === 1) return true;
  if (dynamicGrid[row][col] === 1) return true;

  return false;
}


export function addEntity(world, components) {
  const id = world.nextId++;
  world.entities[id] = components;
  return id;
}

export function addSystem(world, system) {
  world.systems.push(system);
}

export function update(world, delta) {
  for (const system of world.systems) {
    system(world, delta);
  }
}
