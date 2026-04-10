// PredatorSystem — prédateurs uniquement
//
// Priorité des besoins : soif > chasse > accouplement (si mating ≥ 85) > exploration
//
// Différences clés vs herbivores :
//   - besoins montent plus lentement → vivent plus longtemps
//   - rayon de perception plus grand (6–16 cellules)
//   - se reproduisent seul (1 enfant), moins souvent
//   - traversée de rivière : ~50 % de la population (vs 18 % chez herbivores)
//   - mouvement : 2 cellules/tick (géré par MovementSystem)
//
// Traits génétiques utilisés :
//   appetit          (float) → hunger +0.2–+0.7/tick
//   soifBase         (float) → thirst +0.2–+0.8/tick
//   libido           (float) → mating +0.1–+0.4/tick
//   rayon            (float) → perception 6–16 cellules
//   traverseeRiviere (float > 0.50) → ~50 %

export default class PredatorSystem {
  update({ grid, em, seaLevel, spawnPredator, recordDeath, season }) {

    // ── Index herbivores (proies potentielles) ─────────────────────
    const herbivoreMap = new Map();
    for (const hid of em.query('Position', 'Needs')) {
      if (em.getComponent(hid, 'Predator')) continue; // exclude fellow predators
      const p = em.getComponent(hid, 'Position');
      const key = `${p.x},${p.y}`;
      if (!herbivoreMap.has(key)) herbivoreMap.set(key, []);
      herbivoreMap.get(key).push(hid);
    }

    // ── Index prédateurs (pour accouplement) ──────────────────────
    const predatorMap = new Map();
    for (const pid of em.query('Position', 'Predator')) {
      const p = em.getComponent(pid, 'Position');
      const key = `${p.x},${p.y}`;
      if (!predatorMap.has(key)) predatorMap.set(key, []);
      predatorMap.get(key).push(pid);
    }

    const predators = em.query('Position', 'Age', 'Needs', 'Genome', 'Predator');

    // ── Pénalité de disette : compétition inter-prédateurs ────────
    // Quand les prédateurs dépassent largement les zones de proies disponibles,
    // chaque individu affame plus vite (ressource insuffisante pour tous).
    const preyZones    = herbivoreMap.size;
    const predCount    = predators.length;
    // Neutre à ratio proies/préd ≥ 2:1 ; pénalité croissante jusqu'à +1.5/tick en dessous
    const scarcityBonus = preyZones > 0
      ? Math.min(1.5, Math.max(0, (predCount / preyZones - 2) * 0.35))
      : 1.5; // aucune proie → pénalité maximale

    for (const id of predators) {
      const age   = em.getComponent(id, 'Age');
      const pos   = em.getComponent(id, 'Position');
      const needs = em.getComponent(id, 'Needs');
      const { handler } = em.getComponent(id, 'Genome');

      // ── Vieillissement ──────────────────────────────────────────
      age.age += 1;
      if (age.age >= age.maxAge) { recordDeath('age'); em.destroyEntity(id); continue; }

      // ── Incréments des besoins (plus lents que herbivores) ──────
      needs.hunger = Math.min(100, needs.hunger + (0.3 + handler.readFloat('appetit')  * 0.3) * (season?.hungerMult ?? 1) + scarcityBonus);
      needs.thirst = Math.min(100, needs.thirst + (0.2 + handler.readFloat('soifBase') * 0.6) * (season?.thirstMult ?? 1));
      needs.mating = Math.min(100, needs.mating + 0.3 + handler.readFloat('libido')   * 0.8);

      // ── Mort ────────────────────────────────────────────────────
      if (needs.hunger >= 100) { recordDeath('hunger'); em.destroyEntity(id); continue; }
      if (needs.thirst >= 100) { recordDeath('thirst'); em.destroyEntity(id); continue; }

      // ── Action à l'arrivée sur la cible ─────────────────────────
      if (pos.x === needs.targetX && pos.y === needs.targetY) {
        this._executeAction(id, pos, needs, em, grid, seaLevel,
                            herbivoreMap, predatorMap, spawnPredator, recordDeath);
      }

      // ── Réévaluation de la cible ────────────────────────────────
      const atTarget  = pos.x === needs.targetX && pos.y === needs.targetY;
      const critical  = needs.thirst > 85 || needs.hunger > 85;
      // Priorités prédateur : seekWater(3) > hunt(2) > seekMate(1) > explore(0)
      const shouldReeval = atTarget || critical
        || needs.action === 'hunt'  // re-track prey position every tick
        || (needs.action === 'explore'  && (needs.thirst > 65 || needs.hunger > 30 || needs.mating >= 85))
        || (needs.action === 'seekMate' && (needs.thirst > 65 || needs.hunger > 30));
        // seekWater : jamais interrompu
      if (shouldReeval) {
        const rayon    = Math.round(6 + handler.readFloat('rayon') * 10);
        const canRiver = handler.readFloat('traverseeRiviere') > 0.80;
        const canMtn   = handler.readFloat('traverseeMontagne') > 0.92;
        this._pickTarget(id, pos, needs, grid, seaLevel,
                         herbivoreMap, predatorMap, rayon, canRiver, canMtn);
      }
    }
  }

  // ── Action sur la cellule cible ─────────────────────────────────

  _executeAction(id, pos, needs, em, grid, seaLevel,
                 herbivoreMap, predatorMap, spawnPredator, recordDeath) {

    if (needs.action === 'hunt') {
      // Zone de mêlée 3×3 : compense le décalage d'1 tick entre ciblage et mouvement
      let preyId, preyKey;
      outer: for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const key   = `${pos.x + dx},${pos.y + dy}`;
          const found = (herbivoreMap.get(key) ?? []).find(pid => em.getComponent(pid, 'Position'));
          if (found !== undefined) { preyId = found; preyKey = key; break outer; }
        }
      }
      if (preyId !== undefined) {
        em.destroyEntity(preyId);
        recordDeath('predation');
        herbivoreMap.delete(preyKey);
        needs.hunger = 0;
      }
      return;
    }

    if (needs.action === 'seekWater') {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const c = grid.getCell(pos.x + dx, pos.y + dy);
          if (!c) continue;
          const t = c.altitude < seaLevel ? 'eau' : (c.isRiver ? 'riviere' : c.terrainType);
          if (t === 'riviere' || t === 'marecage') {
            needs.thirst = Math.max(0, needs.thirst - 65);
            return;
          }
        }
      }
      return;
    }

    if (needs.action === 'seekMate') {
      // Voisinage 3x3 pour éviter l'oscillation mutuelle
      let partnerId;
      for (let dy = -1; dy <= 1 && partnerId === undefined; dy++) {
        for (let dx = -1; dx <= 1 && partnerId === undefined; dx++) {
          const others = predatorMap.get(`${pos.x + dx},${pos.y + dy}`) ?? [];
          partnerId = others.find(oid =>
            oid !== id && (em.getComponent(oid, 'Needs')?.mating ?? 0) >= 55
          );
        }
      }
      if (partnerId !== undefined) {
        const selfGenome    = em.getComponent(id,         'Genome');
        const partnerGenome = em.getComponent(partnerId,  'Genome');
        const partnerNeeds  = em.getComponent(partnerId,  'Needs');
        spawnPredator(pos.x, pos.y, [selfGenome.adn, partnerGenome.adn]);
        needs.mating        = 0;
        partnerNeeds.mating = 0;
        partnerNeeds.action = 'explore';
      }
    }
  }

  // ── Choix de la prochaine cible ─────────────────────────────────

  _pickTarget(id, pos, needs, grid, seaLevel,
              herbivoreMap, predatorMap, rayon, canRiver, canMtn = false) {

    // Soif
    if (needs.thirst > 60) {
      const t = this._findWater(pos, grid, seaLevel, rayon, canRiver);
      if (t) { needs.action = 'seekWater'; needs.targetX = t.x; needs.targetY = t.y; return; }
    }

    // Chasse
    if (needs.hunger > 30) {
      const t = this._findPrey(pos, herbivoreMap, rayon);
      if (t) { needs.action = 'hunt'; needs.targetX = t.x; needs.targetY = t.y; return; }
    }

    // Accouplement — supprimé si affamé (pas de proies = stress = inhibition reproductive)
    if (needs.mating >= 85 && needs.hunger < 60) {
      const t = this._findMate(id, pos, predatorMap, rayon);
      if (t) { needs.action = 'seekMate'; needs.targetX = t.x; needs.targetY = t.y; return; }
    }

    // Parfois, attendre sur place vaut mieux que courir dans le vide :
    // 25 % de chance de faire une pause quand aucun besoin urgent ne presse.
    // Avantage évolutif : le repos réduit le métabolisme → moins de faim/soif ce tick.
    if (Math.random() < 0.25) {
      needs.action  = 'explore';
      needs.targetX = pos.x;
      needs.targetY = pos.y;
      needs.hunger  = Math.max(0, needs.hunger - 0.4);
      needs.thirst  = Math.max(0, needs.thirst - 0.25);
      return;
    }

    // Exploration — évite de cibler mer/glace/montagne/rivière inaccessible
    const baseAngle = Math.random() * Math.PI * 2;
    const dist      = 4 + Math.floor(Math.random() * rayon);
    let targetX = pos.x, targetY = pos.y;
    for (let attempt = 0; attempt < 6; attempt++) {
      const a = baseAngle + attempt * (Math.PI / 3);
      const cx = Math.max(0, Math.min(grid.cols - 1, Math.round(pos.x + Math.cos(a) * dist)));
      const cy = Math.max(0, Math.min(grid.rows - 1, Math.round(pos.y + Math.sin(a) * dist)));
      const tc = grid.getCell(cx, cy);
      if (!tc || tc.altitude < seaLevel) continue;
      const tt = tc.isRiver ? 'riviere' : tc.terrainType;
      if (tt === 'eau' || tt === 'glace') continue;
      if (tt === 'riviere'  && !canRiver) continue;
      if (tt === 'montagne' && !canMtn)   continue;
      targetX = cx; targetY = cy; break;
    }
    needs.action  = 'explore';
    needs.targetX = targetX;
    needs.targetY = targetY;
  }

  _findPrey(pos, herbivoreMap, rayon) {
    let best = null, bestDist = Infinity;
    for (const [key] of herbivoreMap) {
      const [x, y] = key.split(',').map(Number);
      const dist = Math.abs(x - pos.x) + Math.abs(y - pos.y);
      if (dist <= rayon && dist < bestDist) { bestDist = dist; best = { x, y }; }
    }
    return best;
  }

  _findWater(pos, grid, seaLevel, rayon, canRiver) {
    for (let r = 1; r <= rayon; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const nx = pos.x + dx, ny = pos.y + dy;
          const cell = grid.getCell(nx, ny);
          if (!cell) continue;
          const t = cell.altitude < seaLevel ? 'eau' : (cell.isRiver ? 'riviere' : cell.terrainType);
          if (t !== 'riviere' && t !== 'marecage') continue;
          if (t === 'marecage') return { x: nx, y: ny };
          if (canRiver) return { x: nx, y: ny };
          for (const [bx, by] of [[nx-1,ny],[nx+1,ny],[nx,ny-1],[nx,ny+1]]) {
            const bc = grid.getCell(bx, by);
            if (!bc || bc.altitude < seaLevel) continue;
            const bt = bc.isRiver ? 'riviere' : bc.terrainType;
            if (bt !== 'riviere' && bt !== 'eau' && bt !== 'glace') return { x: bx, y: by };
          }
        }
      }
    }
    return null;
  }

  _findMate(selfId, pos, predatorMap, rayon) {
    for (let r = 1; r <= rayon; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const key = `${pos.x + dx},${pos.y + dy}`;
          const ids = predatorMap.get(key);
          if (!ids) continue;
          if (ids.some(oid => oid !== selfId)) return { x: pos.x + dx, y: pos.y + dy };
        }
      }
    }
    return null;
  }
}
