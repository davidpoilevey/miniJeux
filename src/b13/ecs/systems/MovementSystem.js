// MovementSystem — déplace les entités mobiles vers leur cible (Needs.targetX/Y)
//
// Traits génétiques utilisés :
//   vitesseDeplacement (float) → cells/tick = 1 + floor(vitesse × 2)  → 1, 2 ou 3
//   traverseeRiviere   (bool)  → peut entrer dans une cellule 'riviere'
//   traverseeMontagne  (bool)  → peut entrer dans une cellule 'montagne'
//   resistanceAuFroid  (float) → peut entrer en 'neige'/'glace' si > 0.5
//
// Algorithme : greedy multi-step avec 8-directions et liste de candidats ordonnée.
// Si la voie vers la cible est entièrement bloquée → abandon de la cible
// (NeedsSystem en choisira une nouvelle au prochain tick).

export default class MovementSystem {
  update({ grid, em, seaLevel }) {
    const movers = em.query('Position', 'Needs', 'Genome');


    for (const id of movers) {
      const pos   = em.getComponent(id, 'Position');
      const needs = em.getComponent(id, 'Needs');
      const { handler } = em.getComponent(id, 'Genome');

      if (pos.x === needs.targetX && pos.y === needs.targetY) continue;

      // ── Traits de déplacement ──────────────────────────────
      const isPredator = !!em.getComponent(id, 'Predator');
      const moveSpeed  = isPredator ? 2 : 0.5; // prédateurs : 2 cases/tick
      // Seuil aligné sur PredatorSystem (0.50) et NeedsSystem (0.82)
      const canRiver   = isPredator
        ? handler.readFloat('traverseeRiviere') > 0.80  // ~50 % des prédateurs
        : handler.readFloat('traverseeRiviere') > 0.982; // ~18 % des herbivores
      const canMtn     = handler.readFloat('traverseeMontagne') > 0.92; // ~18 %
      const coldRes    = handler.readFloat('resistanceAuFroid');

      // ── Avance pas par pas vers la cible ──────────────────
      let { x, y } = pos;

      for (let step = 0; step < moveSpeed; step++) {
        if (x === needs.targetX && y === needs.targetY) break;

        const next = this._stepToward(x, y, needs.targetX, needs.targetY,
                                      grid, seaLevel, canRiver, canMtn, coldRes);
        if (!next) {
          // Bloqué — abandonne la cible ; NeedsSystem en piochera une autre
          needs.targetX = x;
          needs.targetY = y;
          break;
        }
        x = next.x;
        y = next.y;
      }

      pos.x = x;
      pos.y = y;
    }
  }

  // ── Un pas vers la cible ────────────────────────────────────────

  _stepToward(x, y, tx, ty, grid, seaLevel, canRiver, canMtn, coldRes) {
    const dx = Math.sign(tx - x);
    const dy = Math.sign(ty - y);

    // Ordre de préférence : diagonal > cardinal X > cardinal Y > déviations latérales
    const candidates = [];
    if (dx !== 0 && dy !== 0)  candidates.push({ x: x + dx, y: y + dy });
    if (dx !== 0)              candidates.push({ x: x + dx, y });
    if (dy !== 0)              candidates.push({ x,          y: y + dy });
    // Déviations pour contourner les obstacles
    if (dx !== 0) { candidates.push({ x: x + dx, y: y + 1 }); candidates.push({ x: x + dx, y: y - 1 }); }
    if (dy !== 0) { candidates.push({ x: x + 1,  y: y + dy }); candidates.push({ x: x - 1, y: y + dy }); }

    for (const c of candidates) {
      if (this._canEnter(grid.getCell(c.x, c.y), seaLevel, canRiver, canMtn, coldRes)) return c;
    }
    return null; // aucun passage possible
  }

  // ── Traversabilité d'une cellule ────────────────────────────────

  _canEnter(cell, seaLevel, canRiver, canMtn, coldRes) {
    if (!cell) return false;
    if (cell.altitude < seaLevel) return false;           // inondé

    const t = cell.isRiver ? 'riviere' : cell.terrainType;
    if (t === 'eau') return false;                        // mer ouverte
    if (t === 'riviere'  && !canRiver) return false;      // rivière sans trait
    if (t === 'montagne' && !canMtn)   return false;      // montagne sans trait
    if ((t === 'neige' || t === 'glace') && coldRes < 0.5) return false; // trop froid

    return true;
  }
}
