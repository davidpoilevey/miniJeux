// Whole connected bodies fall one grid cell at a time. Grafts carry support.
export function gravite(world) {
  const links = new Map([...world.plants.keys()].map(id => [id, []]));
  for (const graft of world.grafts.values()) {
    if (!links.has(graft.a) || !links.has(graft.b)) continue;
    links.get(graft.a).push(graft.b); links.get(graft.b).push(graft.a);
  }
  const seen = new Set(), groups = [];
  for (const plant of world.plants.values()) {
    if (seen.has(plant.id)) continue;
    const group = [], queue = [plant.id]; seen.add(plant.id);
    while (queue.length) {
      const id = queue.pop(); group.push(world.plants.get(id));
      for (const neighbor of links.get(id)) if (!seen.has(neighbor)) { seen.add(neighbor); queue.push(neighbor); }
    }
    groups.push(group);
  }
  const bottom = group => Math.max(...group.flatMap(p => p.cells.map(c => c.y)));
  // Move supporting bodies first, allowing a stack to fall together without overlaps.
  groups.sort((a, b) => bottom(b) - bottom(a));
  for (const group of groups) {
    const ids = new Set(group.map(p => p.id));
    const blocked = group.some(p => p.cells.some(c => c.y === world.H - 1
      || (world.occupied[world.index(c.x, c.y + 1)] && !ids.has(world.occupied[world.index(c.x, c.y + 1)]))));
    if (!blocked) {
      for (const p of group) for (const c of p.cells) world.occupied[world.index(c.x, c.y)] = 0;
      for (const p of group) {
        if (p.supported && p.cells.length > 1) { world.falls++; world.log(`La plante ${p.id} perd son appui et descend.`); }
        for (const c of p.cells) { c.y++; world.occupied[world.index(c.x, c.y)] = p.id; }
      }
      for (const g of world.grafts.values()) if (ids.has(g.a) && ids.has(g.b)) { g.from.y++; g.to.y++; }
    }
    for (const p of group) {
      p.falling = !blocked; p.supported = blocked;
      p.grounded = p.cells.some(c => c.y === world.H - 1);
    }
  }
  // Dormant cells settle too; they cannot turn into a new floating canopy.
  for (const spore of [...world.spores.values()].sort((a, b) => b.y - a.y)) {
    if (spore.y === world.H - 1) continue;
    const below = world.index(spore.x, spore.y + 1);
    if (world.occupied[below] || world.sporeAt[below]) continue;
    world.sporeAt[world.index(spore.x, spore.y)] = 0;
    spore.y++; spore.favorable = 0; world.sporeAt[below] = spore.id;
  }
}
