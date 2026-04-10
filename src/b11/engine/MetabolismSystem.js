// MetabolismSystem.js — flux énergétique des organismes
//
// Responsabilités :
//   - Produire l'énergie (photosynthèse, chimiosynthèse, filtration, ingestion buccale)
//   - Déduire le coût de maintenance (avec modificateurs Liver / hypoxie / chaleur thermale)
//   - Incrémenter l'âge et déclencher la mort (énergie ≤ 0 ou âge ≥ maxAge)
//   - Libérer des nutriments à la mort (recyclage écologique)
//
// Séparé de GrowthSystem : opère sur le flux énergétique (Metabolism), pas sur la morphologie.
// Doit être appelé AVANT GrowthSystem dans le tick (l'énergie doit être disponible à la croissance).

// ── Constantes de calibration ─────────────────────────────────────────────

const MOUTH_INTAKE_K         = 1.0;   // nutriments ingérés/tick = Mouth.size × K
const NUTRIENT_TO_ENERGY     = 1.5;   // 1 unité nutriment → 4 énergie
const FILTRATION_EFFICIENCY  = 1.0;   // filtration : moins rentable que l'ingestion directe
const PHOTO_E_FACTOR         = 2.0;   // photosynthèse : lumière × lightToEnergy × K → énergie
const CHEMO_E_FACTOR         = 1.0;   // chimiosynthèse : chaleur × heatToEnergy × K → énergie
const STOMACH_BONUS          = 0.25;  // Stomach amplifie l'efficacité digestive (par size)
const LIVER_MAINT_REDUCTION  = 0.1;  // Liver réduit le coût de maintenance (par size)
const HEART_EFFICIENCY_BONUS = 0.10;  // Heart amplifie toute production (par size)
const O2_CONSUMPTION_K       = 0.01;  // O₂ consommé = oxygenConso × growthFactor × K
const O2_THRESHOLD           = 0.15;  // seuil d'hypoxie
const HYPOXIA_PENALTY_K      = 1.5;   // multiplicateur maintenance en hypoxie
const THERMAL_DAMAGE_K       = 0.20;  // dommages thermaux → surcoût (× maxEnergy)
const NUTRIENT_RELEASE_K     = 0.10;  // fraction de (adultMass × growthFactor) libérée à la mort
const JAW_PREDATION_K        = 3.0;   // énergie volée par tick = Jaw.size × K
const MOUTH_HERBIVORY_K      = 3;   // énergie broutée/tick = Mouth.size × K (végétaux adjacents)
const HERBIVORY_RENDEMENT    = 0.5;  // rendement de l'herbivorie (perte d'énergie dans la digestion du végétal)
const BIOLIGHT_K             = 1.0; // bioluminescence : intensité × K → addBiolight
const TOXIN_RETALIATION_K    = 1.5; // dégâts toxine infligés au prédateur/herbivore (size × K)
const ELECTRIC_SHOCK_K       = 0.5; // choc électrique en retour (voltage × K)
const CHROMA_STEALTH_K       = 0.40;// prob. d'esquive par unité de size (Chromatophore)
const RECOIL_TICKS           = 8;   // ticks d'incapacité du prédateur après une défense réussie
const INK_ENERGY_COST        = 6.0; // coût énergétique par jet d'encre (InkSac)
const ELECTRIC_ENERGY_COST   = 5.0; // coût énergétique par décharge (ElectricOrgan)
const TOXIN_ENERGY_COST      = 2.0; // coût énergétique par sécrétion (ToxinGland)

export class MetabolismSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world         = world;
  }

  // ── API publique ──────────────────────────────────────────────────────

  update(_deltaTime) {
    const entities = this.entityManager.getEntitiesWithComponents(['Metabolism', 'Position']);
    const toRemove  = [];

    for (const entityId of entities) {
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
      if (!metabolism.alive) { toRemove.push(entityId); continue; }

      const position = this.entityManager.getComponent(entityId, 'Position');
      const bodyPlan = this.entityManager.getComponent(entityId, 'BodyPlan');

      // 1. Production d'énergie (autotrophie + ingestion + prédation + herbivorie)
      const produced  = this._produceEnergy(entityId, position, bodyPlan);
      const predated  = this._predation(entityId, position);
      const grazed    = this._herbivory(entityId, position);
      metabolism.energy = Math.min(metabolism.maxEnergy, metabolism.energy + produced + predated + grazed);

      // 2. Coût de maintenance (avec modificateurs)
      const cost = this._effectiveMaintenance(entityId, metabolism, position, bodyPlan);
      metabolism.energy -= cost;

      // 3. Vieillissement + décompte recoil
      metabolism.age++;
      if (metabolism.recoilTicks > 0) metabolism.recoilTicks--;

      // Bioluminescence — contribue au lightGrid (reset chaque tick par World.update)
      const biolum = this.entityManager.getComponent(entityId, 'Bioluminescence');
      if (biolum) this.world.addBiolight(position.x, position.y, biolum.intensity * BIOLIGHT_K);

      // 4. Mort par épuisement ou vieillesse
      if (metabolism.energy <= 0 || metabolism.age >= metabolism.maxAge) {
        metabolism.alive = false;
        toRemove.push(entityId);
      }
    }

    // Traitement des morts après l'itération (modification safe de l'entityManager)
    for (const entityId of toRemove) {
      this._die(entityId);
    }
  }

  // ── Production d'énergie ──────────────────────────────────────────────

  _produceEnergy(entityId, position, bodyPlan) {
    const { x, y } = position;
    const biome    = this.world.getBiome(x, y);
    const respEff  = this._respirationEfficiency(entityId, biome);

    // Heart amplifie tous les flux énergétiques
    const heart      = this.entityManager.getComponent(entityId, 'Heart');
    const heartBonus = heart ? 1 + heart.size * HEART_EFFICIENCY_BONUS : 1.0;

    let energy = 0;

    // ── Autotrophie ────────────────────────────────────────────────────

    const photo = this.entityManager.getComponent(entityId, 'Photosynthesis');
    if (photo) {
      const light = this.world.getLightAt(x, y);
      energy += light * photo.lightToEnergy * PHOTO_E_FACTOR * respEff;
    }

    const chemo = this.entityManager.getComponent(entityId, 'Chemosynthesis');
    if (chemo) {
      const heat = this.world.getHeat(x, y);
      energy += heat * chemo.heatToEnergy * CHEMO_E_FACTOR * respEff;
    }

    // ── Ingestion buccale (hétérotrophie active) ──────────────────────

    const mouth = this.entityManager.getComponent(entityId, 'Mouth');
    if (mouth) {
      const intake    = mouth.size * MOUTH_INTAKE_K;
      const consumed  = this.world.consumeNutrients(x, y, intake);
      const gut       = this.entityManager.getComponent(entityId, 'Gut');
      const stomach   = this.entityManager.getComponent(entityId, 'Stomach');
      const digestEff = (gut ? gut.size : 0.5)
                      * (1 + (stomach ? stomach.size * STOMACH_BONUS : 0));
      energy += consumed * NUTRIENT_TO_ENERGY * digestEff * respEff * heartBonus;
    }

    // ── Filtration (hétérotrophie passive) ────────────────────────────

    const filtration = this.entityManager.getComponent(entityId, 'Filtration');
    if (filtration) {
      const consumed = this.world.consumeNutrients(x, y, filtration.filterRate);
      energy += consumed * FILTRATION_EFFICIENCY * respEff * heartBonus;
    }

    // ── Régénération passive ──────────────────────────────────────────

    const regen = this.entityManager.getComponent(entityId, 'Regeneration');
    if (regen) energy += regen.healRate;

    return energy;
  }

  // ── Coût de maintenance effectif ─────────────────────────────────────

  _effectiveMaintenance(entityId, metabolism, position, bodyPlan) {
    let cost = metabolism.maintenanceCost;

    // Liver réduit le coût de maintenance
    const liver = this.entityManager.getComponent(entityId, 'Liver');
    if (liver) cost *= Math.max(0, 1 - liver.size * LIVER_MAINT_REDUCTION);

    // Oxygénation : hypoxie ou consommation normale
    const oxygen = this.world.getOxygen(position.x, position.y);
    if (oxygen < O2_THRESHOLD) {
      cost *= HYPOXIA_PENALTY_K;
    } else {
      const o2demand = metabolism.oxygenConsumption
                     * (bodyPlan?.growthFactor ?? 1)
                     * O2_CONSUMPTION_K;
      this.world.consumeOxygen(position.x, position.y, o2demand);
    }

    // Dommages thermaux (surges hydrothermaux)
    const thermalDmg = this.world.getThermalDamage(position.x, position.y);
    if (thermalDmg > 0) {
      cost += thermalDmg * metabolism.maxEnergy * THERMAL_DAMAGE_K;
    }

    return Math.max(0, cost);
  }

  // ── Herbivorie adjacente (Mouth) ──────────────────────────────────────────
  //
  // Un organisme avec Mouth broute le végétal adjacent le plus proche.
  // L'énergie est volée directement à la plante (pas des nutriments dissous).
  // Si la plante tombe à 0, elle est marquée morte.
  // Un prédateur (Jaw) n'utilise PAS cette méthode — il passe par _predation
  // qui peut déjà attaquer les végétaux (sans Jaw).

  _herbivory(entityId, position) {
    const mouth = this.entityManager.getComponent(entityId, 'Mouth');
    if (!mouth) return 0;

    const neighbors = this.world.getNeighbors(position.x, position.y);
    for (const n of neighbors) {
      if (n.entity === null || n.entity === entityId) continue;

      const preyPlan = this.entityManager.getComponent(n.entity, 'BodyPlan');
      if (!preyPlan || preyPlan.phylum !== 'VEGETAL') continue;

      const preyMeta = this.entityManager.getComponent(n.entity, 'Metabolism');
      if (!preyMeta?.alive) continue;

      const eaten = Math.min(preyMeta.energy, mouth.size * MOUTH_HERBIVORY_K);
      preyMeta.energy -= eaten;
      if (preyMeta.energy <= 0) preyMeta.alive = false;

      // ── Défenses passives de la plante ────────────────────────
      const herbivoreMeta = this.entityManager.getComponent(entityId, 'Metabolism');

      const toxin = this.entityManager.getComponent(n.entity, 'ToxinGland');
      if (toxin && herbivoreMeta) {
        herbivoreMeta.energy -= toxin.size * TOXIN_RETALIATION_K;
        this.world.addInkCloud(n.x, n.y, Math.ceil(toxin.size * 2), 20, 'toxin');
      }

      const spine = this.entityManager.getComponent(n.entity, 'Spine');
      if (spine && herbivoreMeta) herbivoreMeta.energy -= spine.passiveDmg;

      return eaten*HERBIVORY_RENDEMENT;
    }
    return 0;
  }

  // ── Prédation adjacente (Jaw) ─────────────────────────────────────────────
  //
  // Appelée chaque tick pour tout organisme vivant.
  // Un organisme sans Jaw retourne 0 sans coût.
  // Avec Jaw : cherche parmi les 8 voisins un organisme plus faible (pas de Jaw
  // ou Jaw.size inférieur) et lui vole jaw.size × JAW_PREDATION_K énergie.
  // Si la proie tombe à 0, elle est marquée morte (nettoyée à la fin du tick).

  _predation(entityId, position) {
    const jaw = this.entityManager.getComponent(entityId, 'Jaw');
    if (!jaw) return 0;

    // Recoil : le prédateur est momentanément incapable d'attaquer après une défense
    const attackerMeta = this.entityManager.getComponent(entityId, 'Metabolism');
    if (attackerMeta?.recoilTicks > 0) return 0;

    // Nuage d'encre : le prédateur est aveuglé, rate son attaque (80 %)
    if (this.world.isInInkCloud(position.x, position.y) && Math.random() < 0.80) return 0;

    const neighbors = this.world.getNeighbors(position.x, position.y);
    for (const n of neighbors) {
      if (n.entity === null || n.entity === entityId) continue;

      const preyMeta = this.entityManager.getComponent(n.entity, 'Metabolism');
      if (!preyMeta?.alive) continue;

      // Avantage de mâchoire
      const preyJaw = this.entityManager.getComponent(n.entity, 'Jaw');
      if (preyJaw && preyJaw.size >= jaw.size) continue;

      // Chromatophore : camouflage → chance d'éviter la détection
      const chroma = this.entityManager.getComponent(n.entity, 'Chromatophore');
      if (chroma && Math.random() < chroma.size * CHROMA_STEALTH_K) continue;

      // Attaque réussie
      const stolen = Math.min(preyMeta.energy, jaw.size * JAW_PREDATION_K);
      preyMeta.energy -= stolen;
      if (preyMeta.energy <= 0) preyMeta.alive = false;

      // ── Défenses réactives de la proie ────────────────────────────────
      // Chaque défense coûte de l'énergie à la proie ET inflige un recoil à l'attaquant.
      let defended = false;

      // InkSac — nuage aveuglant + coût énergétique
      const ink = this.entityManager.getComponent(n.entity, 'InkSac');
      if (ink && preyMeta.alive) {
        preyMeta.energy -= ink.size * INK_ENERGY_COST;
        this.world.addInkCloud(n.x, n.y, ink.radius, 40, 'ink');
        defended = true;
      }

      // ElectricOrgan — choc en retour + flash visuel + coût énergétique
      const electric = this.entityManager.getComponent(n.entity, 'ElectricOrgan');
      if (electric) {
        preyMeta.energy -= electric.size * ELECTRIC_ENERGY_COST;
        if (attackerMeta) attackerMeta.energy -= electric.voltage * ELECTRIC_SHOCK_K;
        this.world.addInkCloud(n.x, n.y, electric.range, 5, 'electric');
        defended = true;
      }

      // ToxinGland — empoisonnement + nuage vert + coût énergétique
      const toxin = this.entityManager.getComponent(n.entity, 'ToxinGland');
      if (toxin) {
        preyMeta.energy -= toxin.size * TOXIN_ENERGY_COST;
        if (attackerMeta) attackerMeta.energy -= toxin.size * TOXIN_RETALIATION_K;
        this.world.addInkCloud(n.x, n.y, Math.ceil(toxin.size * 3), 25, 'toxin');
        defended = true;
      }

      // Spine — dégâts passifs, pas de coût énergétique (passif)
      const spine = this.entityManager.getComponent(n.entity, 'Spine');
      if (spine && attackerMeta) {
        attackerMeta.energy -= spine.passiveDmg;
        defended = true;
      }

      // Recoil global si au moins une défense s'est activée
      if (defended && attackerMeta) attackerMeta.recoilTicks = RECOIL_TICKS;

      return stolen;
    }
    return 0;
  }

  // ── Efficacité respiratoire ────────────────────────────────────────────
  //
  //   aerial / ground → Lung optimale ; Gill = échanges cutanés (0.3)
  //   marine / deep   → Gill optimale ; Lung = gulper de surface (0.6)
  //                     ni l'un ni l'autre → diffusion cutanée (0.5)

  _respirationEfficiency(entityId, biome) {
    const hasGill = this.entityManager.hasComponent(entityId, 'Gill');
    const hasLung = this.entityManager.hasComponent(entityId, 'Lung');

    if (biome === 'aerial' || biome === 'ground') {
      if (hasLung) return 1.0;
      if (hasGill) return 0.3;
      return 0.3;   // échanges cutanés primitifs
    } else {
      // marine, deep
      if (hasGill) return 1.0;
      if (hasLung) return 0.6;  // surface breathing / air gulper
      return 0.5;               // diffusion cutanée (petits organismes)
    }
  }

  // ── Mort et recyclage nutritif ─────────────────────────────────────────

  _die(entityId) {
    const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
    if (!metabolism) return;   // déjà détruit

    const position = this.entityManager.getComponent(entityId, 'Position');
    const bodyPlan = this.entityManager.getComponent(entityId, 'BodyPlan');

    // Recyclage : la biomasse devient des nutriments
    if (position && bodyPlan) {
      const mass = (bodyPlan.adultMass ?? 10) * (bodyPlan.growthFactor ?? 0.05);
      this.world.addNutrients(position.x, position.y, mass * NUTRIENT_RELEASE_K);
      this.world.removeEntity(position.x, position.y);
    }

    this.entityManager.destroyEntity(entityId);
  }
}
