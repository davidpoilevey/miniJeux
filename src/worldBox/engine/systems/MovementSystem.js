// Déplace les entités avec State.current === 'moving' d'un pas vers leur cible.
// Terrains bloquants : eau (sauf si bateau dans inventaire), glace, montagne.
// La vitesse (pas/tick) est 1 par défaut ; force > 60 → parfois 2 pas/tick.

const ALWAYS_BLOCKED = new Set(['eau', 'montagne']);

function isBlocked(cell, canSwim) {
  if (!cell) return true;
  if (ALWAYS_BLOCKED.has(cell.terrainType)) return true;
  if (cell.terrainType === 'eau' || cell.isRiver) return !canSwim;
  return false;
}

export default class MovementSystem {
  update({ em, grid }) {
    for (const id of em.query('Position', 'State')) {
      const state = em.getComponent(id, 'State');
      if (state.current !== 'moving' || !state.target) continue;

      const pos   = em.getComponent(id, 'Position');
      const stats = em.getComponent(id, 'Stats');
      const { x: tx, y: ty } = state.target;

      if (pos.x === tx && pos.y === ty) {
        em.addComponent(id, 'State', { ...state, current: 'idle', target: null });
        continue;
      }

      // Bateau : permet de traverser l'eau
      const inv      = em.getComponent(id, 'Inventory');
      const canSwim  = inv?.items?.includes('bateau') ?? false;

      // Nombre de pas ce tick (force élevée → parfois 2)
      const steps = (stats && stats.force > 60 && Math.random() < 0.4) ? 2 : 1;

      let cx = pos.x, cy = pos.y;
      for (let s = 0; s < steps; s++) {
        if (cx === tx && cy === ty) break;

        const dx = Math.sign(tx - cx);
        const dy = Math.sign(ty - cy);

        const candidates = [];
        if (dx !== 0) candidates.push({ x: cx + dx, y: cy });
        if (dy !== 0) candidates.push({ x: cx,      y: cy + dy });
        if (dx !== 0 && dy !== 0) candidates.push({ x: cx + dx, y: cy + dy });

        const next = candidates.find(c => !isBlocked(grid.getCell(c.x, c.y), canSwim));

        if (next) { cx = next.x; cy = next.y; }
        else {
          // Bloqué, on abandonne la cible
          em.addComponent(id, 'State', { ...state, current: 'idle', target: null });
          cx = pos.x; cy = pos.y;
          break;
        }
      }

      if (cx !== pos.x || cy !== pos.y) {
        em.addComponent(id, 'Position', { x: cx, y: cy });
      }
    }
  }
}
