export function getVisibleTiles(grid, position, radius = 2) {
  const tiles = [];
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const x = position.x + dx;
      const y = position.y + dy;
      if (grid[y]?.[x]) {
        tiles.push(grid[y][x]);
      }
    }
  }
  return tiles;
}

export function computeNextDirection(creature, allCreatures, plants, corpses, effects=[], gridSize) {
  const { x, y } = creature.position;
const rayon=4;
  // Générer les 25 cases visibles (rayon 2)
  const visibleTiles = [];
  for (let dy = -rayon; dy <= rayon; dy++) {
    for (let dx = -rayon; dx <= rayon; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        dx === 0 && dy === 0
      ) continue; // ignorer sa propre case
      if (
        nx >= 0 && nx < gridSize.width &&
        ny >= 0 && ny < gridSize.height
      ) {
        visibleTiles.push({ x: nx, y: ny, dx, dy });
      }
    }
  }

  // Trouver une plante visible
  let plantTile = visibleTiles.find(tile =>
    plants.some(p => p.x === tile.x && p.y === tile.y)
  );
  if(creature.isCharognard){
    const corpsTile = visibleTiles.find(tile =>
      corpses.some(p => p.x === tile.x && p.y === tile.y)
    );
    if(corpsTile!=null)
      plantTile=corpsTile;
  }

  // Trouver un partenaire compatible (même espèce / ADN ? ici on prend toute autre créature)
  const potentialPartners = visibleTiles.filter(tile =>
    {
      return allCreatures.some(c =>
      c.id !== creature.id &&
      c.position.x === tile.x &&
      c.position.y === tile.y
    )}
  );
  const partnerTile = potentialPartners.length > 0
    ? potentialPartners[Math.floor(Math.random() * potentialPartners.length)]
    : null;
  const sexNeed = potentialPartners.length==0?0:(Math.min(1,potentialPartners.length/5));// reduit fortement la libido si trop de cret autour ou augment si pas assez
  // Décider d'une priorité
  const { hunger, needForSex } = creature;

  if (hunger >= 0.7 && plantTile) { // faim urgente
    return { dx: plantTile.dx, dy: plantTile.dy };
  }

const holyTile = findClosestHolyZone(creature.position, effects);
if (holyTile) {
  return { dx: holyTile.dx, dy: holyTile.dy };
}
  if (needForSex > sexNeed && partnerTile) { // libido urgente
      return { dx: partnerTile.dx, dy: partnerTile.dy };
  }
  else if (partnerTile && partnerTile.x===x && partnerTile.y===y) { // fuis si ensemble
    return { dx: -partnerTile.dx, dy: -partnerTile.dy };
  }

  if (hunger > 0.4 && plantTile) {// a choisir de la bouffe
    return { dx: plantTile.dx, dy: plantTile.dy };
  }

  // au pire Choisir une direction aléatoire parmi les cases valides
 
  if (visibleTiles.length > 0) {
    const rand = visibleTiles[Math.floor(Math.random() * visibleTiles.length)];
    return { dx: rand.dx, dy: rand.dy };
  }

  return null;
}

function findClosestHolyZone(pos, effects) {
  const candidates = effects.filter(e => e.type === "holy");
  if (!candidates.length) return null;

  let closest = null;
  let minDist = Infinity;

  for (let zone of candidates) {
    const dx = zone.x - pos.x;
    const dy = zone.y - pos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= zone.radius && dist < minDist) {
      minDist = dist;
      closest = { dx: Math.sign(dx), dy: Math.sign(dy) };
    }
  }
  if(minDist<1){ //dedans
    return null;
  }
  return closest;
}


export const addPlantAround=(x,y,radius)=>{
  const newPlantes=[];
   for (let dx = -radius; dx <= radius; dx++) {
    for (let dy = -radius; dy <= radius; dy++) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius && Math.random() < 0.5) {
        const px = x + dx;
        const py = y + dy;
          newPlantes.push({ id: Date.now() + newPlantes.length, x: px, y: py });
      }
    }
  }
  return newPlantes;
}