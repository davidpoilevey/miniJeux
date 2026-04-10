

/**
 * Composants ECS pour Bactérie 9.0
 * Architecture Entity-Component-System
 */

// ============================================================================
// COMPOSANTS OBLIGATOIRES
// ============================================================================

/**
 * Position - Composant obligatoire
 * Représente la position dans la grille toroïdale
 */
export class Position {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

/**
 * Genome - Composant obligatoire
 * Contient l'ADN et le handler pour lire les gènes
 */
export class Genome {
  constructor(adn, adnHandler) {
    this.adn = adn;
    this.handler = adnHandler;
  }
}

/**
 * Metabolism - Composant obligatoire
 * Gère l'énergie, la consommation, et le stockage
 */
export class Metabolism {
  constructor(energyStored = 50, maxAge = 300) {
    this.energyStored = energyStored/2;
    this.maxEnergyStored = energyStored;
    this.age = 0;
    this.maxAge = maxAge;
    this.oxygenConsumption=0;
    this.maintenanceCost = 0; // Coût de maintenance total des composants
  }
}

// ============================================================================
// COMPOSANTS OPTIONNELS - INTERACTION ENVIRONNEMENTALE
// ============================================================================

export class Movement {
  constructor(speed) {
    this.speed = speed; // 0.0 - 1.0
  }
  static get COLOR() { return { h: 60, s: 70, label: 'Bouge' }; }
  static get MAINTENANCE_COST() { return 0.01; }
}


export class ChemicalReceptor {
  constructor(sensitivity, detectionRadius, reactions) {
    this.sensitivity = sensitivity; // 0.0 - 1.0
    this.detectionRadius = detectionRadius; // en cellules
    this.reactions = reactions; // { A: 'ATTRACT', B: 'REPEL', C: 'TOXIN', D: 'NUTRIENT' }
  }
  
  static get COLOR() { return { h: 320, s: 80, label: 'Récepteur chimique' }; }
  static get MAINTENANCE_COST() { return 0.1; }
}

export class ChemicalEmitter {
  constructor(emittedMolecules, emissionRate) {
    this.emittedMolecules = emittedMolecules; // Array: ['A', 'B', 'C', 'D']
    this.emissionRate = emissionRate; // quantité par tick par molécule
  }
  
  static get COLOR() { return { h: 320, s: 80, label: 'Emetteur chimique' }; }
  static get MAINTENANCE_COST() { return 0.1; }
}

export class Photosynthesis {
  constructor(efficiency) {
    this.efficiency = efficiency; // 0.0 - 1.0
  }
  static get COLOR() { return { h: 120, s: 70, label: 'Algue' }; } // Vert
  static get MAINTENANCE_COST() { return 0.1; } // Pas de coût, c'est un producteur
}

export class Filtration {
  constructor(filterType, efficiency) {
    this.filterType = filterType; // 'organic', 'mineral', 'all'
    this.efficiency = efficiency; // 0.0 - 1.0
  }
  static get COLOR() { return { h: 200, s: 50, label: 'Filtreur' }; } // Bleu clair
  static get MAINTENANCE_COST() { return 0.15; }
}

export class EnergyStorage {
  constructor(maxCapacity) {
    this.maxCapacity = maxCapacity; // capacité maximale
  }
  
  static get MAINTENANCE_COST() { return 0.1; }
}

export class ToxinTolerance {
  constructor(tolerance) {
    this.tolerance = tolerance; // 0.0 - 1.0
  }
  
  static get COLOR() { return { h: 320, s: 80, label: 'Resistance toxines' }; }
  static get MAINTENANCE_COST() { return 0.1; }
}

// ============================================================================
// COMPOSANTS OPTIONNELS - INTERACTION BIOLOGIQUE
// ============================================================================

export class Predator {
  constructor(attackPower, attackRange) {
    this.attackPower = attackPower; // force d'attaque
    this.attackRange = attackRange; // portée en cellules
  }
  static get COLOR() { return { h: 0, s: 80, label: 'Predateur' }; } // Rouge
  static get MAINTENANCE_COST() { return 0.5; } // c'est cher de courir après les autres
}
// Dans Components.js - Section Structure
// Dans Components.js - Section Structure

export class CarbonatePipe {
  constructor(growthDirection, structuralStrength, maxLength=20) {
    this.growthDirection = growthDirection; // Angle 0-2π (fixé à la naissance)
    this.structuralStrength = structuralStrength; // 0.0-1.0 (résistance)
    this.isRoot = true; // La cellule originale
    this.generation = 0; // Distance depuis la racine
    this.maxLength = maxLength; // Longueur max du pipe
    this.hasGrown = false; // A déjà construit cette génération
  }
  static get COLOR() { return { h: 10, s: 10, label: 'Tuyaux' }; } // Blanc neutre
  static get MAINTENANCE_COST() { return 0.2; } //  faible (structure passive, quand meme, c'est un sacre boost)
}
export class Explosive {
  constructor(blastRadius, damage) {
    this.blastRadius = blastRadius; // 1-3 cellules
    this.damage = damage; // Dégâts infligés (50-150)
    this.triggered = false;
  }
  static get COLOR() { return { h: 30, s: 40, label: 'Explosif' }; } // Orange-rouge explosif
  static get MAINTENANCE_COST() { return 0.01; } // Pas cher, c'est un sacrifice
}
export class Parasite {
  constructor(drainRate) {
    this.drainRate = drainRate; // énergie volée par tick
  }
  static get COLOR() { return { h: 340, s: 70, label: 'Parasite' }; } // Rose
  static get MAINTENANCE_COST() { return 0.2; }
}

export class Symbiosis {
  constructor(shareRate, acceptedPartners) {
    this.shareRate = shareRate; // taux de partage
    this.acceptedPartners = acceptedPartners; // types acceptés
  }
  static get COLOR() { return { h: 160, s: 60, label: 'Symbiotique' }; } // Turquoise
  static get MAINTENANCE_COST() { return 0.05; }
}
export class ChemicalBurst {
  constructor(burstMolecule, burstAmount) {
    this.burstMolecule = burstMolecule; // 'A', 'B', 'C', ou 'D'
    this.burstAmount = burstAmount; // 10-50 (énorme concentration)
    this.triggered = false;
  }
  static get COLOR() { return { h: 320, s: 80, label: 'Bombe chimique' }; } // Fuchsia toxique
  static get MAINTENANCE_COST() { return 0.05; }
}

export class Immunity {
  constructor(defense) {
    this.defense = defense; // niveau de défense
  }
  
  static get MAINTENANCE_COST() { return 0.5; }
}

export class Cannibalism {
  constructor(consumptionRate) {
    this.consumptionRate = consumptionRate; // vitesse de consommation
  }
  static get COLOR() { return { h: 20, s: 70, label: 'Cannibale' }; } // Rouge sombre
  static get MAINTENANCE_COST() { return 0.05; }
}

// ============================================================================
// COMPOSANTS OPTIONNELS - STRUCTURE
// ============================================================================
// Nouveau composant: Pipe
// Dans Components.js - Section Structure

export class Pipe {
  constructor(flowRate, pressure) {
    this.flowRate = flowRate; // Vitesse de transfert 0.5-2.0
    this.pressure = pressure; // Force de connexion 0.0-1.0
    this.connections = []; // IDs des bactéries connectées
    this.isNode = false; // Devient nœud si >2 connexions
  }
  static get COLOR() { return { h: 180, s: 60, label: 'taiChi' }; } // Cyan aqueux
  static get MAINTENANCE_COST() { return 0.08; }
}
export class Adhesion {
  constructor(strength) {
    this.strength = strength; // force d'adhésion
    this.attachedTo = []; // liste d'entités attachées
  }
  static get COLOR() { return { h: 58, s: 60, label: 'Adherent' }; } // Vert lime
  static get MAINTENANCE_COST() { return 0.05; }
}

export class ReinforcedWall {
  constructor(protection, metabolicCost) {
    this.protection = protection; // niveau de protection
    this.metabolicCost = metabolicCost; // coût énergétique
  }
  static get COLOR() { return { h: 0, s: 90, label: 'Carapace' }; } // Gris (neutre)
  static get MAINTENANCE_COST() { return 0.3; } // Augmenté de 0.2 → 0.3
}


export class ColonialMatrix {
  constructor(matrixStrength, radius) {
    this.matrixStrength = matrixStrength; // solidité
    this.radius = radius; // rayon d'effet
  }
  
  static get MAINTENANCE_COST() { return 0.4; } // Augmenté de 0.25 → 0.4
}


export class ProgrammedDeath {
  constructor(lifespan, altruisticTrigger) {
    this.lifespan = lifespan; // durée de vie en ticks
    this.altruisticTrigger = altruisticTrigger; // sacrifice pour le groupe
    this.ticksSinceBirth = 0;
  }
  static get COLOR() { return { h: 270, s: 40, label: 'Suicidaire' }; } // Violet sombre
  static get MAINTENANCE_COST() { return 0.0; }
}

// ============================================================================
// COMPOSANTS OPTIONNELS - DYNAMIQUE INTERNE
// ============================================================================

export class BiologicalClock {
  constructor(period, phase) {
    this.period = period; // période en secondes
    this.phase = phase; // phase actuelle (0.0 - 1.0)
  }
  
  static get MAINTENANCE_COST() { return 0.01; }
}

// Dans Components.js

export class CellDivision {
  constructor(sporulationPattern, burstThreshold) {
    this.sporulationPattern = sporulationPattern; // 'ring', 'cross', 'random'
    this.burstThreshold = burstThreshold; // Énergie minimale pour sporuler (100-200)
    this.hasSporulated = false;
  }
  static get COLOR() { return { h: 280, s: 70, label: 'Division Cell.' }; } // Violet reproducteur
  static get MAINTENANCE_COST() { return 0.08; }
}

export class GeneticMutation {
  constructor(mutationRate) {
    this.mutationRate = mutationRate; // probabilité de mutation
  }
  static get MAINTENANCE_COST() { return 0.0; }
}

export class GeneticRecombination {
  constructor(recombinationAbility, matingPreference) {
    this.recombinationAbility = recombinationAbility; // peut échanger
    this.matingPreference = matingPreference; // sélectivité
  }
  
  static get MAINTENANCE_COST() { return 0.0; }
}


// ============================================================================
// COMPOSANTS AVANCÉS - SPÉCIALISATIONS
// Obtenus uniquement par transformation (énergie max, pas de place pour diviser)
// ============================================================================

export class EnhancedSensors {
  constructor(detectionBonus) {
    this.detectionBonus = detectionBonus; // +2 à +5 au detectionRadius
  }
  static get COLOR() { return { h: 200, s: 80, label: 'Capteur' }; } // Bleu vif
  static get MAINTENANCE_COST() { return 0.15; }
  static get SPECIALIZATION_COST() { return 100; } // Coût de transformation
}

export class Muscular {
  constructor(movementBonus, adhesionBonus) {
    this.movementBonus = movementBonus; // +0.2 à +0.5 vitesse
    this.adhesionBonus = adhesionBonus; // +0.3 à +0.7 force adhésion
  }
  static get COLOR() { return { h: 20, s: 70, label: 'Muscle' }; } // Orange musclé
  static get MAINTENANCE_COST() { return 0.2; }
  static get SPECIALIZATION_COST() { return 100; }
}

export class CrystallineCilia {
  constructor(attackBonus) {
    this.attackBonus = attackBonus; // +0.3 à +0.7 attackPower (multiplicateur)
  }
  static get COLOR() { return { h: 330, s: 80, label: 'Aiguille' }; } // Rouge cristallin
  static get MAINTENANCE_COST() { return 0.2; }
  static get SPECIALIZATION_COST() { return 100; }
}

export class ThickCuticle {
  constructor(defenseBonus) {
    this.defenseBonus = defenseBonus; // +3 à +7 defense
  }
  static get COLOR() { return { h: 40, s: 50, label: 'Cuticule' }; } // Bronze/cuir
  static get MAINTENANCE_COST() { return 0.15; }
  static get SPECIALIZATION_COST() { return 100; }
}

export class MetabolicBoost {
  constructor(photosynthesisBonus) {
    this.photosynthesisBonus = photosynthesisBonus; // +0.3 à +0.7 production (multiplicateur)
  }
  
  static get MAINTENANCE_COST() { return 0.1; }
  static get SPECIALIZATION_COST() { return 100; }
}


// ============================================================================
// REGISTRY - Liste de tous les composants optionnels
// ============================================================================

export const OPTIONAL_COMPONENTS = {
  // Interaction environnementale
  Movement,
  ChemicalReceptor,
  ChemicalEmitter,
  Photosynthesis,
  Filtration,
  EnergyStorage,
  ToxinTolerance,
  Explosive,
  // Interaction biologique
  Predator,
  Pipe,
  CarbonatePipe,
  Parasite,
  Symbiosis,
  Immunity,
  Cannibalism,
  ChemicalBurst,
  
  // Structure
  Adhesion,
  ReinforcedWall,
  ColonialMatrix,
  ProgrammedDeath,
  
  // Dynamique interne
  BiologicalClock,
  CellDivision,
  GeneticMutation,
  GeneticRecombination
};

// Composants de spécialisation (non inclus dans génération aléatoire initiale)
export const SPECIALIZATION_COMPONENTS = {
  EnhancedSensors,
  Muscular,
  CrystallineCilia,
  ThickCuticle,
  MetabolicBoost
};
