export class MetabolismSystem {
  constructor(entityManager, ocean) {
    this.entityManager = entityManager;
    this.ocean = ocean;
  }

  update(deltaTime) {
    const organisms = this.entityManager.getEntitiesWithComponents([
      'Position', 'Genome', 'Metabolism', 'BodyPlan'
    ]);

    const toDestroy = [];
    let deaths = 0;

    for (const entityId of organisms) {
      const position   = this.entityManager.getComponent(entityId, 'Position');
      const genome     = this.entityManager.getComponent(entityId, 'Genome');
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
      const bodyPlan   = this.entityManager.getComponent(entityId, 'BodyPlan');

      // ── DORMANCE ────────────────────────────────────────────────────────
      if (metabolism.isDormant) {
        metabolism.energyStored -= metabolism.maintenanceCost * 0.1;
        metabolism.age += deltaTime / 10000;
        if (metabolism.energyStored <= 0) toDestroy.push(entityId);
        continue;
      }

      // ── PARAMÈTRES GÉNÉTIQUES ───────────────────────────────────────────
      const metabolicRate         = genome.handler.readFloat('metabolicRate') * 0.5;
      const absorptionEfficiency  = genome.handler.readFloat('absorptionEfficiency');

      // ── COÛT BASAL ──────────────────────────────────────────────────────
      const cellCount = bodyPlan.cells.length;
const sizeEfficiency = Math.min(0.5, bodyPlan.cells.length * 0.02); // Max -50%
let basalCost = (metabolicRate + metabolism.maintenanceCost + cellCount * 0.01)
  * (metabolism.isMature ? 0.6 : 0.6) // déjà là
  * (1 - sizeEfficiency); // nouveau — gros organismes plus efficaces

// Bonus reproduction : mature + grande taille → énergie bonus périodique
if (metabolism.isMature && bodyPlan.cells.length > 10) {
  const maturityBonus = Math.min(2, bodyPlan.cells.length * 0.1);
  metabolism.energyStored += maturityBonus; // Accumule plus vite → reproduit plus
}
      // Jeune = plus efficace (pas encore à plein régime)
      if (!metabolism.isMature) basalCost *= 0.6;

      // Surcoût si presque plein (inefficacité thermodynamique)
      if (metabolism.energyStored > metabolism.maxEnergyStored * 0.75) basalCost *= 1.3;

      metabolism.energyStored -= basalCost;
      // Dégâts thermiques

const thermalDamage = this.ocean.getThermalDamage(position.x, position.y);
if (thermalDamage > 0) {
  const genome = this.entityManager.getComponent(entityId, 'Genome');
  const resistance = genome.handler.readFloat('thermalResistance') * 0.2; // 0-0.2
  const actualDamage = thermalDamage * (1 - resistance) * 100;
  metabolism.energyStored -= actualDamage;
}

      // ── ABSORPTION NUTRIMENTS (base) ─────────────────────────────────────
      const absorbed = this.ocean.consumeNutrients(
        position.x, position.y,
        absorptionEfficiency * 2.0
      );
     // metabolism.energyStored += absorbed * 0.5;
      metabolism.energyStored += absorbed * 2.0;

      // ── NUTRITION ENVIRONNEMENTALE ────────────────────────────────────────
      
      metabolism.energyStored += this._environmentalNutrition(entityId, position, cellCount);

      // ── RESPIRATION ──────────────────────────────────────────────────────
      const oxygenNeed      = cellCount * metabolism.oxygenConsumption;
      const oxygenAvailable = this.ocean.consumeOxygen(position.x, position.y, oxygenNeed);

      if (oxygenAvailable > 0) {
        metabolism.energyStored += oxygenAvailable * 0.3;
      } else {
        metabolism.energyStored -= oxygenNeed * 0.5;
      }
      
if (this.entityManager.hasComponent(entityId, 'Bioluminescence')) {
  const bio = this.entityManager.getComponent(entityId, 'Bioluminescence');
  const biome = this.ocean.getBiome(position.x, position.y);
  // Seulement utile en zone sombre
  if (biome === 'abyssal' || biome === 'hydrothermal') {
    // Coût énergétique — briller coûte
    metabolism.energyStored -= bio.intensity * 0.2;
    this.ocean.addBiolight(position.x, position.y, bio.intensity);
  }
}
      // ── PLAFOND ÉNERGIE ──────────────────────────────────────────────────
      const hasStorage = this.entityManager.hasComponent(entityId, 'EnergyStorage');
      const maxEnergy  = hasStorage
        ? (this.entityManager.getComponent(entityId, 'EnergyStorage').maxCapacity ?? metabolism.maxEnergyStored * 2)
        : metabolism.maxEnergyStored;

      metabolism.energyStored = Math.min(maxEnergy, Math.max(0, metabolism.energyStored));

      // ── VIEILLISSEMENT ───────────────────────────────────────────────────
      metabolism.age += deltaTime / 1000;

      // ── MATURITÉ ─────────────────────────────────────────────────────────
      if (!metabolism.isMature) {
        this._checkMaturity(entityId, metabolism);
      }

      // ── MORT ─────────────────────────────────────────────────────────────
      if (metabolism.energyStored <= 0 || metabolism.age >= metabolism.maxAge) {
        toDestroy.push(entityId);
        deaths++;
      }
    }

    // ── DESTRUCTION ──────────────────────────────────────────────────────────
    for (const entityId of toDestroy) {
      this._destroyOrganism(entityId);
    }

    return { alive: organisms.length - deaths, deaths };
  }

  // ── NUTRITION ENVIRONNEMENTALE ─────────────────────────────────────────────

  /**
   * Photosynthesis, Chemosynthesis, Filtration.
   * Chaque composant est scalé sur le nombre de cellules du rôle correspondant
   * dans le BodyPlan — plus l'organisme est spécialisé, plus il gagne.
   */
  _environmentalNutrition(entityId, position, cellCount) {
    let gain = 0;
    const em = this.entityManager;

    // ── PHOTOSYNTHESIS ───────────────────────────────────────────────────────
    if (em.hasComponent(entityId, 'Photosynthesis')) {
      const light = this.ocean.getLightAt(position.x, position.y);
      if (light > 0) {
        const photo = em.getComponent(entityId, 'Photosynthesis');
        // Efficacité génétique * lumière * surface exposée (cellules FILTER ou SEGMENT)
        const efficiency = photo.efficiency ?? 1.0;
        const exposedCells = this._countCellsByRole(entityId, ['SEGMENT', 'FILTER']);
        const crowding = this.ocean.crowdingCache[
          position.y * this.ocean.width + position.x
        ];
        gain += light * efficiency * exposedCells  * (1 - crowding);
        // Produit de l'oxygène en bonus
        this.ocean.addOxygen(position.x, position.y, light * 0.05);
      }
    }

    // ── CHEMOSYNTHESIS ───────────────────────────────────────────────────────
    if (em.hasComponent(entityId, 'Chemosynthesis')) {
      const heat = this.ocean.getHeat(position.x, position.y);
      if (heat > 0.6) {
        const chemo = em.getComponent(entityId, 'Chemosynthesis');
        const efficiency = chemo.efficiency ?? 1.0;
        // La chaleur remplace la lumière — très rentable en hydrothermal
         const crowding = this.ocean.crowdingCache[
          position.y * this.ocean.width + position.x
        ];
        gain += heat * efficiency * cellCount* 0.3 * (1 - crowding);
        // Consomme un peu de nutriments chimiques
        this.ocean.consumeNutrients(position.x, position.y, heat);
      }
    }

    // ── FILTRATION ────────────────────────────────────────────────────────────
    if (em.hasComponent(entityId, 'Filtration')) {
      const nutrients = this.ocean.getNutrients(position.x, position.y);
      if (nutrients > 0) {
        const filtr = em.getComponent(entityId, 'Filtration');
        const efficiency = filtr.efficiency ?? 1.0;
        // Bonus si Cilia présent (densité de filtration amplifiée)
        const ciliaBonus = em.hasComponent(entityId, 'Cilia')
          ? 1 + (em.getComponent(entityId, 'Cilia').density ?? 0.5)
          : 1.0;
        const filterCells = this._countCellsByRole(entityId, ['FILTER']);
        // Consomme les nutriments, convertit en énergie
        const toConsume = Math.min(nutrients, efficiency * ciliaBonus * filterCells * 1.5);
        const consumed  = this.ocean.consumeNutrients(position.x, position.y, toConsume);
        gain += consumed;
      }
    }
    // Prédateurs : absorption passive des nutriments via Jaw
if (em.hasComponent(entityId, 'Predator')) {
  const predator = em.getComponent(entityId, 'Predator');
  const absorbed = this.ocean.consumeNutrients(position.x, position.y, predator.attackPower);
  gain += absorbed * 1.5; // Meilleure conversion que filtration basique
}
    // À la fin, remplacer return gain :
const hasStorage = em.hasComponent(entityId, 'EnergyStorage');
const mb = em.getComponent(entityId, 'Metabolism');
const absorptionCap = hasStorage
  ? mb.maxEnergyStored * 0.3  // EnergyStorage double la capacité d'absorption
  : mb.maxEnergyStored * 0.1;

return Math.min(gain, absorptionCap);

  }

  /** Compte les cellules d'un organisme selon leurs rôles. */
  _countCellsByRole(entityId, roles) {
    const bodyPlan = this.entityManager.getComponent(entityId, 'BodyPlan');
    if (!bodyPlan?.cells) return 1;
    return bodyPlan.cells.filter(c => roles.includes(c.role)).length || 1;
  }

  // ── MATURITÉ ───────────────────────────────────────────────────────────────

  _checkMaturity(entityId, metabolism) {
    // Critère 1 : âge minimum
    if (metabolism.age < metabolism.maturityAge) return;

    // Critère 2 : énergie accumulée
    if (metabolism.energyStored < metabolism.maturityEnergyThreshold * metabolism.maxEnergyStored) return;

    // Critère 3 : ancrage (seulement si composant Anchoring présent)
    if (this.entityManager.hasComponent(entityId, 'Anchoring')) {
      const nav = this.entityManager.getComponent(entityId, 'Navigation');
      if (!nav?.isAnchored) return;
    }

    metabolism.isMature = true;
  }

  // ── DESTRUCTION ────────────────────────────────────────────────────────────

  _destroyOrganism(entityId) {
    const position = this.entityManager.getComponent(entityId, 'Position');
    const bodyPlan = this.entityManager.getComponent(entityId, 'BodyPlan');

    if (bodyPlan?.cells) {
      for (const cell of bodyPlan.cells) {
        // Bug fix : les cellules ont des coords absolues, pas cell.dx/cell.dy
        this.ocean.removeEntity(cell.x, cell.y);
      }
    }

    // Décomposition → nutriments
    if (position) {
      const biomass = (bodyPlan?.cells.length ?? 1) * 2;
      this.ocean.addNutrients(position.x, position.y, biomass);
    }

    this.entityManager.destroyEntity(entityId);
  }
}