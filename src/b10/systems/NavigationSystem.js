/**
 * NavigationSystem
 * Calcule la direction souhaitée pour chaque organisme mobile.
 * Produit : navigation.targetDirection { dx, dy } + navigation.motivation [0-1]
 *
 * Priorités (score) :
 *   1. Fuite prédateur  (0.95 max) — nécessite Eye | Antenna | Thermoreceptor
 *   2. Énergie/nourriture (0.7 max)
 *   3. Reproduction      (0.5 max) — nécessite GeneticRecombination ou énergie pleine
 *   4. Exploration       (0.15)
 */
export class NavigationSystem {
  constructor(entityManager, ocean) {
    this.em = entityManager;
    this.ocean = ocean;

    // Directions cardinales + diagonales (8-dir)
    this._DIRS = [
      { dx:  0, dy: -1 }, { dx:  1, dy: -1 },
      { dx:  1, dy:  0 }, { dx:  1, dy:  1 },
      { dx:  0, dy:  1 }, { dx: -1, dy:  1 },
      { dx: -1, dy:  0 }, { dx: -1, dy: -1 },
    ];
  }

  update(_dt) {
    const entities = this.em.getEntitiesWithComponents([
      'Position', 'BodyPlan', 'Metabolism', 'Navigation'
    ]);

    for (const eid of entities) {
      const pos  = this.em.getComponent(eid, 'Position');
      const meta = this.em.getComponent(eid, 'Metabolism');
      const nav  = this.em.getComponent(eid, 'Navigation');

      // Calcul de la portée de perception (capteurs disponibles)
      const range = this._getPerception(eid);

      // Accumuler les drives
      const drives = [];
// ── CONFUSION (Mucus, Ink, Tentacle) ──────────────────────────────────
if (nav.confusionTicks > 0) {

      const ink  = this.em.getComponent(eid, 'Ink');
  nav.confusionTicks--;
  if(ink&&ink.inkCloud)
    ink.inkCloud.opacity=Math.min(0.1,ink.inkCloud.opacity-0.1 )
  const cf = nav.confusionFactor ?? 0;
  if (Math.random() < cf) {
    // Direction aléatoire avec score potentiellement élevé
    drives.push({
      dir: this._DIRS[Math.floor(Math.random() * 8)],
      score: cf * 0.9,
      type: 'confused'
    });
  }
}
      // ── 1. FUITE ──────────────────────────────────────────────────────────
      if (range > 0) {
        const flee = this._fleeDrive(eid, pos, range);
        if (flee) drives.push(flee);
      }

      // ── 2. ÉNERGIE / NOURRITURE ───────────────────────────────────────────
      const feed = this._feedDrive(eid, pos, meta, range);
      if (feed) drives.push(feed);

      // ── 3. ANCRAGE (si composant Anchoring présent et pas encore ancré) ──
      if (this.em.hasComponent(eid, 'Anchoring') && !nav.isAnchored) {
        const anchor = this._anchorDrive(pos);
        if (anchor) drives.push(anchor);
      }

      // ── 4. REPRODUCTION ───────────────────────────────────────────────────
      const energyRatio = meta.energyStored / meta.maxEnergyStored;
    if (energyRatio > 0.65 && meta.isMature) {
  const mateRange = Math.max(1, range); // Min 1 = contact direct
  const mate = this._mateDrive(eid, pos, mateRange);
        if (mate) drives.push(mate);
      }
// Nouveau drive dans update(), après l'ancrage :
const repulsion = this._repulsionDrive(eid, pos, range);
if (repulsion) drives.push(repulsion);

      // ── 4. EXPLORATION ────────────────────────────────────────────────────
      drives.push(this._exploreDrive(nav));

      // Choisir le drive gagnant (score le plus élevé)
      drives.sort((a, b) => b.score - a.score);
      const winner = drives[0];

      nav.targetDirection = winner.dir;
      nav.motivation      = winner.score;
      nav.driveType       = winner.type; // utile pour debug / LocomotionSystem
    }
  }

  // ── PERCEPTION ─────────────────────────────────────────────────────────────

  /**
   * Retourne un objet décrivant les capacités perceptives de l'entité.
   * Sans capteur → portée 0 (aveugle).
   */
  _getPerception(eid) {
    const biome = this.ocean.getBiome(
      this.em.getComponent(eid, 'Position').x,
      this.em.getComponent(eid, 'Position').y
    );
    const isDark = biome === 'abyssal' || biome === 'hydrothermal';

    let range        = 0;
    let fov          = Math.PI * 2; // omnidirectionnel par défaut
    let threatRange  = 0; // portée spécifique détection prédateurs
    let nutrientSens = 1.0; // sensibilité nutriments/chimie

    // ── EYE ────────────────────────────────────────────────────────────────
    if (this.em.hasComponent(eid, 'Eye') && !isDark) {
      const eye = this.em.getComponent(eid, 'Eye');
      range       = Math.max(range, eye.range ?? 5);
      fov         = eye.fieldOfView ?? Math.PI * 1.5; // ~270°
      threatRange = Math.max(threatRange, eye.range ?? 5);
    }

    // ── ANTENNA ────────────────────────────────────────────────────────────
    // Fonctionne partout, omnidirectionnel, bon pour chimie/nutriments
    if (this.em.hasComponent(eid, 'Antenna')) {
      const ant = this.em.getComponent(eid, 'Antenna');
      const antRange = ant.range ?? 4;
      range        = Math.max(range, antRange);
      threatRange  = Math.max(threatRange, antRange * 0.7); // Moins précis que Eye pour les menaces
      nutrientSens = ant.sensitivity ?? 1.5; // Bonus chimio-détection
    }

    // ── THERMORECEPTOR ─────────────────────────────────────────────────────
    // Détecte la chaleur métabolique des prédateurs + gradients thermiques
    // Utile partout, crucial en hydrothermal et abyssal
    if (this.em.hasComponent(eid, 'Thermoreceptor')) {
      const thermo = this.em.getComponent(eid, 'Thermoreceptor');
      const sensitivity = thermo.sensitivity ?? 1.0;
      // Portée de détection des prédateurs via chaleur métabolique
      const thermoThreatRange = 3 * sensitivity;
      threatRange = Math.max(threatRange, thermoThreatRange);
      // En hydrothermal, le thermoreceptor aide aussi à naviguer
      if (biome === 'hydrothermal') {
        range = Math.max(range, thermoThreatRange);
      }
    }

    return { range, fov, threatRange, nutrientSens, isDark };
  }

  // ── DRIVES ─────────────────────────────────────────────────────────────────
_repulsionDrive(eid, pos, range) {
  if (range === 0) return null;
  const nearby = this._getNearbyEntities(pos, Math.min(range, 3));
  
  let crowdX = 0, crowdY = 0, count = 0;
  for (const other of nearby) {
    if (!this.em.hasComponent(other, 'Metabolism')) continue;
    const oPos = this.em.getComponent(other, 'Position');
    crowdX += oPos.x;
    crowdY += oPos.y;
    count++;
  }
  
  if (count < 3) return null; // Pas assez dense pour fuir
  
  // Fuir le centroïde de la foule
  const cx = crowdX / count;
  const cy = crowdY / count;
  const dir = this._normalizeDir(pos.x - cx, pos.y - cy);
  
  // Score proportionnel à la densité, plafonné à 0.4
  // (jamais prioritaire sur fuite prédateur ou faim)
  const score = Math.min(0.4, count * 0.05);
  return { dir, score, type: 'repulsion' };
}
  /**
   * Fuite : cherche le prédateur le plus proche, fuit dans la direction opposée.
   * Score proportionnel à la proximité (plus c'est proche, plus urgent).
   */
  _fleeDrive(eid, pos, range) {
    const mySize = this._getSize(eid);
    let closestDist = Infinity;
    let threatX = 0, threatY = 0;
    let threatCount = 0;

    const nearby = this._getNearbyEntities(pos, range);
    for (const other of nearby) {
      if (other === eid) continue;
      if (!this._isThreat(other, mySize)) continue;

      const oPos = this.em.getComponent(other, 'Position');
      const d = this._dist(pos, oPos);
      if (d < closestDist) closestDist = d;

      // Centroïde des menaces (pondéré par proximité)
      const w = 1 / (d + 0.1);
      threatX += oPos.x * w;
      threatY += oPos.y * w;
      threatCount++;
    }

    if (threatCount === 0) return null;

    // Direction opposée au centroïde des menaces
    const cx = threatX / threatCount;
    const cy = threatY / threatCount;
    const dir = this._normalizeDir(pos.x - cx, pos.y - cy);

    // Score : 0.95 si tout proche, décroît avec la distance
    const score = 0.95 * Math.max(0, 1 - closestDist / range);

    return { dir, score, type: 'flee' };
  }

  /**
   * Nourriture : selon les composants nutritifs disponibles.
   * Priorité interne : Predator > Filtration/Photosynthesis > Chemosynthesis
   */
  _feedDrive(eid, pos, meta, range) {
    const hunger = 1 - meta.energyStored / meta.maxEnergyStored;
    if (hunger < 0.1) return null; // rassasié

    // ── Prédation active ──
    if (this.em.hasComponent(eid, 'Predator') && range > 0) {
      const prey = this._findPrey(eid, pos, range);
      if (prey) {
        const dir = this._dirToward(pos, prey);
        return { dir, score: 0.7 * hunger, type: 'hunt' };
      }
    }

    // ── Photosynthèse → lumière ──
    if (this.em.hasComponent(eid, 'Photosynthesis')) {
      const grad = this._gradientSample(pos, (x, y) => this.ocean.getLightAt(x, y));
      if (grad.strength > 0.2) {
        return { dir: grad.dir, score: 0.55 * hunger, type: 'photosynth' };
      }
    }

    // ── Filtration → nutriments ──
    if (this.em.hasComponent(eid, 'Filtration')) {
      const grad = this._gradientSample(pos, (x, y) => this.ocean.getNutrients(x, y));
      if (grad.strength > 10) {
        return { dir: grad.dir, score: 0.5 * hunger, type: 'filter' };
      }
    }

    // ── Chimiosynthèse → gradient thermique ──
    if (this.em.hasComponent(eid, 'Chemosynthesis')) {
      const grad = this._gradientSample(pos, (x, y) => this.ocean.getHeat(x, y));
      if (grad.strength > 0.6) {
        return { dir: grad.dir, score: 0.5 * hunger, type: 'chemosynth' };
      }
    }

    return null;
  }

  /**
   * Reproduction : cherche n'importe quel partenaire à portée avec GeneticRecombination.
   * Période Édiacarienne → inter-espèces admis, pas de filtre génétique.
   * Sans GR → reproduction asexuée, pas besoin de se déplacer.
   */
  _mateDrive(eid, pos, range) {
    if (!this.em.hasComponent(eid, 'GeneticRecombination')) return null;
    if (range === 0) return null;

    const nearby = this._getNearbyEntities(pos, range);
    let closestDist = Infinity;
    let closestPos = null;

    for (const other of nearby) {
      if (other === eid) continue;
      if (!this.em.hasComponent(other, 'GeneticRecombination')) continue;

      const otherMeta = this.em.getComponent(other, 'Metabolism');
      if (!otherMeta || otherMeta.energyStored / otherMeta.maxEnergyStored < 0.6) continue;

      const oPos = this.em.getComponent(other, 'Position');
      const d = this._dist(pos, oPos);
      if (d < closestDist) { closestDist = d; closestPos = oPos; }
    }

    if (!closestPos) return null;

    return { dir: this._dirToward(pos, closestPos), score: 0.5, type: 'mate' };
  }

  /**
   * Ancrage : cherche le substrat le plus proche sur 8 directions.
   * Score élevé (0.8) — une créature sessile DOIT s'ancrer pour survivre.
   * Une fois sur substrat adjacent, le LocomotionSystem pourra poser l'ancre
   * (navigation.isAnchored = true) et stopper tout mouvement.
   */
  _anchorDrive(pos) {
    // Vérifier d'abord si on est déjà adjacent à du substrat
    for (const d of this._DIRS) {
      const w = this.ocean.wrap(pos.x + d.dx, pos.y + d.dy);
      if (this.ocean.isSubstrate(w.x, w.y)) {
        // On est au contact → signal fort, direction vers ce substrat
        return { dir: d, score: 0.85, type: 'anchor' };
      }
    }

    // Pas de substrat immédiat → gradient sur portée plus large (5 cases)
    const searchR = 5;
    let closestDist = Infinity;
    let closestDir = null;

    for (let dy = -searchR; dy <= searchR; dy++) {
      for (let dx = -searchR; dx <= searchR; dx++) {
        if (dx === 0 && dy === 0) continue;
        const d2 = dx * dx + dy * dy;
        if (d2 > searchR * searchR) continue;
        const w = this.ocean.wrap(pos.x + dx, pos.y + dy);
        if (this.ocean.isSubstrate(w.x, w.y) && d2 < closestDist) {
          closestDist = d2;
          closestDir = this._normalizeDir(dx, dy);
        }
      }
    }

    if (!closestDir) return null;

    // Score décroît avec la distance (0.8 proche → 0.4 loin)
    const distNorm = Math.sqrt(closestDist) / searchR;
    return { dir: closestDir, score: 0.8 - distNorm * 0.4, type: 'anchor' };
  }

  /** Exploration : légère tendance à continuer dans la même direction (inertie). */
  _exploreDrive(nav) {
    // Inertie : si on avait déjà une direction, on la conserve avec bruit
    if (nav.targetDirection && Math.random() > 0.15) {
      return { dir: nav.targetDirection, score: 0.15, type: 'explore' };
    }
    return { dir: this._DIRS[Math.floor(Math.random() * 8)], score: 0.1, type: 'wander' };
  }

  // ── HELPERS ────────────────────────────────────────────────────────────────

  /** Retourne les entités dans un rayon (scan grille, évite allocation tableau si possible). */
  _getNearbyEntities(pos, range) {
    const result = [];
    const r = Math.ceil(range);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (dx * dx + dy * dy > range * range) continue;
        const wrapped = this.ocean.wrap(pos.x + dx, pos.y + dy);
        const eid = this.ocean.getEntity(wrapped.x, wrapped.y);
        if (eid !== null && eid !== undefined) result.push(eid);
      }
    }
    return result;
  }

  /**
   * Une entité est une menace si :
   * - elle a Predator ET sa taille > 80% de la nôtre
   * - OU elle a Jaw ET Predator (danger amplifié)
   */
  _isThreat(eid, mySize) {
    if (!this.em.hasComponent(eid, 'Predator')) return false;
    const theirSize = this._getSize(eid);
    return theirSize >= mySize * 0.8;
  }

  /** Cherche la proie la plus proche (plus petite, moins bien défendue). */
  _findPrey(eid, pos, range) {
    const mySize = this._getSize(eid);
    let bestDist = Infinity;
    let bestPos = null;

    const nearby = this._getNearbyEntities(pos, range);
    for (const other of nearby) {
      if (other === eid) continue;
      if (!this.em.hasComponent(other, 'Position')) continue;

      const theirSize = this._getSize(other);
      if (theirSize >= mySize * 0.9) continue; // trop gros

      // Bonus si la proie est affaiblie
      const otherMeta = this.em.getComponent(other, 'Metabolism');
      if (!otherMeta) continue;

      const oPos = this.em.getComponent(other, 'Position');
      const d = this._dist(pos, oPos);
      if (d < bestDist) { bestDist = d; bestPos = oPos; }
    }

    return bestPos;
  }

  /** Taille = nombre de cellules dans BodyPlan (proxy de la masse). */
  _getSize(eid) {
    if (!this.em.hasComponent(eid, 'BodyPlan')) return 1;
    return this.em.getComponent(eid, 'BodyPlan').cells?.length ?? 1;
  }

  /**
   * Échantillonnage de gradient sur 8 directions.
   * Retourne la direction vers la valeur maximale.
   */
  _gradientSample(pos, valueFn) {
    let bestDir = this._DIRS[0];
    let maxVal = -Infinity;

    for (const d of this._DIRS) {
      const w = this.ocean.wrap(pos.x + d.dx, pos.y + d.dy);
      const v = valueFn(w.x, w.y);
      if (v > maxVal) { maxVal = v; bestDir = d; }
    }

    return { dir: bestDir, strength: maxVal };
  }

  _dirToward(from, to) {
    return this._normalizeDir(to.x - from.x, to.y - from.y);
  }

  _normalizeDir(dx, dy) {
    if (dx === 0 && dy === 0) return this._DIRS[Math.floor(Math.random() * 8)];
    // Snap vers la direction cardinale/diagonale la plus proche
    const angle = Math.atan2(dy, dx);
    const idx = Math.round(angle / (Math.PI / 4) + 4) % 8;
    // Map angle → index DIRS (ordre : N, NE, E, SE, S, SW, W, NW)
    const MAP = [2, 3, 4, 5, 6, 7, 0, 1]; // atan2 → DIRS index
    return this._DIRS[MAP[((Math.round(angle / (Math.PI / 4)) % 8) + 8) % 8]];
  }

  _dist(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

}