export function generateInitialWorld(config) {
  const grid = [];
  for (let y = 0; y < config.gridHeight; y++) {
    const row = [];
    for (let x = 0; x < config.gridWidth; x++) {
      row.push({ x, y, plant: false, creature: null });
    }
    grid.push(row);
  }

  placeEntities(grid, config.initialPlants, 'plant');
  placeEntities(grid, config.initialHerbivores, 'herbivore');
  placeEntities(grid, config.initialScavengers, 'scavenger');

  return grid;
}

function placeEntities(grid, count, type) {
  const width = grid[0].length;
  const height = grid.length;
  let placed = 0;

  while (placed < count) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const tile = grid[y][x];

    if (type === 'plant' && !tile.plant) {
      tile.plant = true;
      placed++;
    }

    if (['herbivore', 'scavenger'].includes(type) && !tile.creature) {
      tile.creature = type;
      placed++;
    }
  }
}
