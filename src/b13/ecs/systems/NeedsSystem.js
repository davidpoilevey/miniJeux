// NeedsSystem — herbivores uniquement
//
// Priorité des besoins : soif > faim > accouplement (si mating ≥ 70) > exploration
//
// Traits génétiques utilisés :
//   appetit           (float) → hunger +0.5–+2.0/tick
//   soifBase          (float) → thirst +0.3–+1.5/tick
//   rayon             (float) → rayon de perception 3–10 cellules
//   libido            (float) → vitesse de montée du besoin d'accouplement +0.4–+1.4/tick
//   traverseeRiviere  (float > 0.82) → ~18 % de la population

export default class NeedsSystem {
  update({ grid, em, seaLevel, spawnHerbivore, recordDeath, season }) {
    // ── Index par position (construits une fois par tick) ─────────
    const plantMap     = new Map(); // "x,y" → plantId
    const herbivoreMap = new Map(); // "x,y" → [herbivoreId, ...]

    for (const pid of em.query('Position', 'Plant')) {
      const p = em.getComponent(pid, 'Position');
      plantMap.set(`${p.x},${p.y}`, pid);
    }
    for (const hid of em.query('Position', 'Species', 'Needs')) {
      const s = em.getComponent(hid, 'Species');
      if (s.type !== 'herbivore') continue;
      const p = em.getComponent(hid, 'Position');
      const key = `${p.x},${p.y}`;
      if (!herbivoreMap.has(key)) herbivoreMap.set(key, []);
      herbivoreMap.get(key).push(hid);
    }

    const herbivores = em.query('Position', 'Species', 'Age', 'Needs', 'Genome');

    for (const id of herbivores) {
      const species = em.getComponent(id, 'Species');
      if (species.type !== 'herbivore') continue;

      const age   = em.getComponent(id, 'Age');
      const pos   = em.getComponent(id, 'Position');
      const needs = em.getComponent(id, 'Needs');
      const { handler } = em.getComponent(id, 'Genome');

      // ── Vieillissement ───────────────────────────────────────
      age.age += 1;
      if (age.age >= age.maxAge) { recordDeath('age'); em.destroyEntity(id); continue; }

      // ── Incréments des besoins ───────────────────────────────
      needs.hunger          = Math.min(100, needs.hunger + (0.85 + handler.readFloat('appetit') * 1.5) * (season?.hungerMult ?? 1));
      needs.thirst          = Math.min(100, needs.thirst + (0.3  + handler.readFloat('soifBase') * 1.2) * (season?.thirstMult ?? 1));
      const matingMult      = Math.min(1.5, Math.max(0.15, season?.fertilityMult ?? 1));
      needs.mating          = Math.min(100, needs.mating  + (0.1 + handler.readFloat('libido') * 1.0) * matingMult);
      needs.explorationUrge = Math.min(100, needs.explorationUrge + 0.4);

      // ── Mort par inanition / déshydratation ──────────────────
      if (needs.hunger >= 100) { recordDeath('hunger'); em.destroyEntity(id); continue; }
      if (needs.thirst >= 100) { recordDeath('thirst'); em.destroyEntity(id); continue; }

      // ── Action à l'arrivée sur la cible ──────────────────────
      if (pos.x === needs.targetX && pos.y === needs.targetY) {
        this._executeAction(id, pos, needs, em, grid, seaLevel, plantMap, herbivoreMap, spawnHerbivore);
      }

      // ── Réévaluation de la cible ─────────────────────────────
      const atTarget = pos.x === needs.targetX && pos.y === needs.targetY;
      const critical  = needs.thirst > 85 || needs.hunger > 85;
      // N'interrompt l'action courante que si un besoin de priorité SUPÉRIEURE devient urgent.
      // Sinon, la cible change à chaque tick pendant un détour → oscillation sur 2 cases.
      // Priorités : seekWater(3) > seekFood(2) > seekMate(1) > explore(0)
      // MovementSystem → targetX/Y = pos si bloqué → atTarget=true → réévaluation normale.
      const shouldReeval = atTarget || critical
        || (needs.action === 'explore'  && (needs.thirst > 65 || needs.hunger > 55 || needs.mating >= 70))
        || (needs.action === 'seekMate' && (needs.thirst > 65 || needs.hunger > 55))
        || (needs.action === 'seekFood' &&  needs.thirst > 65);
        // seekWater : jamais interrompu (priorité max)
      if (shouldReeval) {
        const rayon    = Math.round(3 + handler.readFloat('rayon') * 7);
        const canRiver = handler.readFloat('traverseeRiviere') > 0.92;
        const canMtn   = handler.readFloat('traverseeMontagne') > 0.92;
        this._pickTarget(id, pos, needs, em, grid, seaLevel, plantMap, herbivoreMap, rayon, canRiver, canMtn);
      }
    }
  }

  // ── Action sur la cellule cible ────────────────────────────────

  _executeAction(id, pos, needs, em, grid, seaLevel, plantMap, herbivoreMap, spawnHerbivore) {
    if (needs.action === 'seekFood') {
      const plantId = plantMap.get(`${pos.x},${pos.y}`);
      if (plantId !== undefined) {
        const plant  = em.getComponent(plantId, 'Plant');
        needs.hunger = Math.max(0, needs.hunger - plant.biomass * 8);
        em.destroyEntity(plantId);
        plantMap.delete(`${pos.x},${pos.y}`);
      }
      return;
    }

    if (needs.action === 'seekWater') {
      // Boire depuis la cellule courante OU depuis une rive adjacente
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
      // Cherche un partenaire dans la case courante ET les 8 voisins
      // (évite l'oscillation mutuelle : les deux animaux se croisent à chaque tick)
      let partnerId;
      for (let dy = -1; dy <= 1 && partnerId === undefined; dy++) {
        for (let dx = -1; dx <= 1 && partnerId === undefined; dx++) {
          const others = herbivoreMap.get(`${pos.x + dx},${pos.y + dy}`) ?? [];
          partnerId = others.find(oid =>
            oid !== id && (em.getComponent(oid, 'Needs')?.mating ?? 0) >= 40
          );
        }
      }
      if (partnerId !== undefined) {
        const selfGenome    = em.getComponent(id,         'Genome');
        const partnerGenome = em.getComponent(partnerId,  'Genome');
        const partnerNeeds  = em.getComponent(partnerId,  'Needs');

        spawnHerbivore(pos.x, pos.y, [selfGenome.adn, partnerGenome.adn]);
        spawnHerbivore(pos.x, pos.y, [partnerGenome.adn, selfGenome.adn]);

        needs.mating        = 0;
        needs.thirst = Math.min(90, needs.thirst + 30);
        needs.hunger = Math.min(90, needs.hunger + 50); // ca donne faim et soif de mettre au monde
        partnerNeeds.mating = 0;
        partnerNeeds.action = 'explore'; // partenaire retourne à l'exploration
      }
    }
  }

  // ── Choix de la prochaine cible ────────────────────────────────

  _pickTarget(id, pos, needs, em, grid, seaLevel, plantMap, herbivoreMap, rayon, canRiver = true, canMtn = false) {
    // Soif
    if (needs.thirst > 55) {
      const t = this._findWater(pos, grid, seaLevel, rayon, canRiver);
      if (t) { needs.action = 'seekWater'; needs.targetX = t.x; needs.targetY = t.y; return; }
    }

    // Faim — rayon élargi proportionnellement à la détresse (dispersion forcée)
    if (needs.hunger > 40) {
      const foodRadius = needs.hunger > 80 ? rayon * 4
                       : needs.hunger > 60 ? rayon * 2
                       : rayon;
      const t = this._findFood(pos, plantMap, foodRadius);
      if (t) { needs.action = 'seekFood'; needs.targetX = t.x; needs.targetY = t.y; return; }
    }

    // Accouplement — supprimé si affamé (stress nutritionnel inhibe la reproduction)
    if (needs.mating >= 70 && needs.hunger < 65) {
      const t = this._findMate(id, pos, herbivoreMap, rayon);
      if (t) { needs.action = 'seekMate'; needs.targetX = t.x; needs.targetY = t.y; return; }
    }

    // Exploration : flocking uniquement si rassasié — affamé → dispersion aléatoire
    let baseAngle = Math.random() * Math.PI * 2;
    if (needs.hunger < 55 && needs.thirst < 55) {
      let nearestDist = Infinity;
      for (const [key, ids] of herbivoreMap) {
        const [nx, ny] = key.split(',').map(Number);
        const d = Math.abs(nx - pos.x) + Math.abs(ny - pos.y);
        if (d > 0 && d < nearestDist && d <= rayon) {
          const nid = ids.find(i => i !== id);
          if (nid !== undefined) {
            const nNeeds = em.getComponent(nid, 'Needs');
            if (nNeeds) {
              const ndx = nNeeds.targetX - nx;
              const ndy = nNeeds.targetY - ny;
              if (ndx !== 0 || ndy !== 0) {
                baseAngle = Math.atan2(ndy, ndx) + (Math.random() - 0.5) * 0.8;
                nearestDist = d;
              }
            }
          }
        }
      }
    }
    // Parfois, attendre sur place vaut mieux que courir dans le vide :
    // 25 % de chance de faire une pause quand aucun besoin urgent ne presse.
    // Avantage évolutif : le repos réduit le métabolisme → moins de faim/soif ce tick.
    if (Math.random() < 0.25) {
      needs.action  = 'explore';
      needs.targetX = pos.x;
      needs.targetY = pos.y;
      needs.hunger  = Math.max(0, needs.hunger - 0.5);
      needs.thirst  = Math.max(0, needs.thirst - 0.3);
      return;
    }

    // Validation de la cible : évite mer/glace/rivière/montagne inaccessibles
    // Tente 6 angles (tous les 60°) avant de conserver la position courante
    const dist = 2 + Math.floor(Math.random() * rayon);
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
    needs.explorationUrge = Math.max(0, needs.explorationUrge - 30);
  }

  _findFood(pos, plantMap, rayon) {
    let best = null, bestDist = Infinity;
    for (const [key] of plantMap) {
      const [x, y] = key.split(',').map(Number);
      const dist = Math.abs(x - pos.x) + Math.abs(y - pos.y);
      if (dist <= rayon && dist < bestDist) { bestDist = dist; best = { x, y }; }
    }
    return best;
  }

  _findWater(pos, grid, seaLevel, rayon, canRiver = true) {
    for (let r = 1; r <= rayon; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const nx = pos.x + dx, ny = pos.y + dy;
          const cell = grid.getCell(nx, ny);
          if (!cell) continue;
          const t = cell.altitude < seaLevel ? 'eau' : (cell.isRiver ? 'riviere' : cell.terrainType);
          if (t !== 'riviere' && t !== 'marecage') continue;

          // Marécage : toujours traversable → cible directe
          if (t === 'marecage') return { x: nx, y: ny };
          // Rivière traversable → cible directe
          if (canRiver) return { x: nx, y: ny };
          // Rivière non traversable → cherche une rive adjacente
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

  // Cherche un partenaire réceptif (mating ≥ 60) dans le rayon
  _findMate(selfId, pos, herbivoreMap, rayon) {
    for (let r = 1; r <= rayon; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
          const key  = `${pos.x + dx},${pos.y + dy}`;
          const ids  = herbivoreMap.get(key);
          if (!ids) continue;
          if (ids.some(oid => oid !== selfId)) return { x: pos.x + dx, y: pos.y + dy };
        }
      }
    }
    return null;
  }
}
