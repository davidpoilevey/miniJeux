
export class Metabolism {
  constructor(energyStored = 50, maxAge = 300) {
    this.energyStored = energyStored/2;
    this.maxEnergyStored = energyStored;
    this.age = 0;
    this.maxAge = maxAge;
    this.maintenanceCost = 0; // Coût de maintenance total des composants
    this.isDormant=false;
    // Besoins spécifiques B10
    this.oxygenConsumption = 0.01; // Par cellule de corps
    this.nutrientConsumption = 0.02;
  }
}
export class Navigation {
  constructor(mood) {
    this.targetDirection = null; // { dx, dy } ou null
    this.motivation = 0;          // 0.0-1.0 (urgence du mouvement)
    this.lastMoveSuccess = true;
    this.stuckCounter = 0;
    this.explorationMood=mood||0.5;
  }
}
export class BodyPlan {
  constructor(symmetry, maxSegments, locomotionMode) {
    // Morphologie
    this.symmetry = symmetry;       // 'bilateral' | 'radial3' | 'radial5' | 'asymmetric'
   
this.maxSegments = maxSegments;      // Segments de corps
this.maxTotalCells = maxSegments * 2; // Budget total (appendices inclus)
    this.locomotionMode = locomotionMode; // 'crawl'|'undulate'|'pulse'|'anchored'|'float'

    // État de croissance
    this.cells = [];          // [{ x, y, role, age }]
    this.growthQueue = [];    // Prochaines cellules à faire pousser
    this.isFullyGrown = false;
    this.growthRate = 1;      //integer Cellules ajoutées par tick de croissance
    this.peakCellCount = 0; // max atteint du moment
    // Orientation
    this.headDirection = 0;   // Angle de déplacement (radians)
  }
}
export class Spine {
  constructor( damage, count, angles ) {
    this.damage = damage;
    this.count = count;
    this.angles = angles; // array
  }
}
export class Carapace {
  constructor(protection, coverageRatio, weightPenalty ) {
    this.protection = protection;
    this.coverageRatio = coverageRatio;
    this.weightPenalty = weightPenalty;
  }
}
export class Mucus {
  constructor( viscosity, slowFactor,confusionTicks ) {
    this.viscosity = viscosity;
    this.slowFactor = slowFactor;
    this.confusionTicks = confusionTicks;
  }
}
export class Ink {
  constructor( cloudRadius, confusionDuration, opacity ) {
    this.cloudRadius = cloudRadius;
    this.confusionDuration = confusionDuration;
    this.opacity=opacity??1;
  }
}
export class Eye {
  constructor( range, fieldOfView, acuity ) {
    this.range = range;
    this.fieldOfView = fieldOfView;
    this.acuity = acuity;
  }
}
export class Antenna {
  constructor( sensitivity, range , length) {
    this.sensitivity = sensitivity;
    this.range = range;
    this.length = length;
  }
}
export class Thermoreceptor {
  constructor( sensitivity ) {
    this.sensitivity = sensitivity;
  }
}
export class Jaw {
  constructor( bitePower, handleSize ) {
    this.bitePower = bitePower;
    this.handleSize = handleSize;
  }
}
export class Peduncle {
  constructor( length, flexibility ) {
    this.length = length;
    this.flexibility = flexibility;
  }
}
export class Anchoring {
  constructor( strength, depth ) {
    this.strength = strength;
    this.depth = depth;
  }
}
export class Tentacle {
  constructor( length, count, strength ) {
    this.length = length;
    this.count = count;
    this.strength = strength;
  }
}

export class Bioluminescence {
  constructor( intensity, pattern=5 ) { //pattern is read10
    this.intensity = intensity;
    if(pattern<=2)
    this.pattern = 'steady';// geres steady/puls/flash
    else if(pattern<=6)
    this.pattern = 'pulse';
    else
    this.pattern = 'flash';
  }
}
export class Chemosynthesis {
  constructor( efficiency, heatTolerance ) {
    this.efficiency = efficiency;
    this.heatTolerance = heatTolerance;
  }
}
export class Sporulation {
  constructor( sporeCount, dispersalRange ) {
    this.sporeCount = sporeCount;
    this.dispersalRange = dispersalRange;
  }
}
export class Hibernation {
  constructor( triggerThreshold, recoveryRate ) {
    this.triggerThreshold = triggerThreshold;
    this.recoveryRate = recoveryRate;
  }
}
export class Segmentation {
  constructor( segmentCount, segmentRoles ) {
    this.segmentCount = segmentCount;
    this.segmentRoles = segmentRoles; // array
  }
}
export class Regeneration {
  constructor( regenRate, maxHeals ) {
    this.regenRate = regenRate;
    this.maxHeals = maxHeals;
  }
}

export class Movement {
  constructor(speed) {
    this.speed = speed; // 0.0 - 1.0
  }
  static get COLOR() { return { h: 60, s: 70, label: 'Bouge' }; }
  static get MAINTENANCE_COST() { return 0.01; }
}

export class BiologicalClock {
  constructor(period, phase) {
    this.period = period; // période en secondes
    this.phase = phase; // phase actuelle (0.0 - 1.0)
  }
  
  static get MAINTENANCE_COST() { return 0.01; }
}

export class Photosynthesis {
  constructor(efficiency) {
    this.efficiency = efficiency; // 0.0 - 1.0
  }
  static get COLOR() { return { h: 120, s: 70, label: 'Algue' }; } // Vert
  static get MAINTENANCE_COST() { return 0.1; } // Pas de coût, c'est un producteur
}

export class Filtration {
  constructor(efficiency) {
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

export class Predator {
  constructor(attackPower, attackRange) {
    this.attackPower = attackPower; // force d'attaque
    this.attackRange = attackRange; // portée en cellules
  }
  static get COLOR() { return { h: 0, s: 80, label: 'Predateur' }; } // Rouge
  static get MAINTENANCE_COST() { return 0.5; } // c'est cher de courir après les autres
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
export class Cannibalism {
  constructor(consumptionRate) {
    this.consumptionRate = consumptionRate; // vitesse de consommation
  }
  static get COLOR() { return { h: 20, s: 70, label: 'Cannibale' }; } // Rouge sombre
  static get MAINTENANCE_COST() { return 0.05; }
}

export class GeneticRecombination {
  constructor(recombinationAbility, matingPreference) {
    this.recombinationAbility = recombinationAbility; // peut échanger
    this.matingPreference = matingPreference; // sélectivité
  }
  
  static get MAINTENANCE_COST() { return 0.0; }
}



export const CAMB_COMPONENTS={

Movement,          // Déplacement de base (vitesse, direction)
BiologicalClock,   // Rythmes biologiques - gardons-le !

// NUTRITION
Photosynthesis,    // Capte lumière → énergie (littoral/surface)
Filtration,        // Filtre nutrients dissous
Predator,          // Chasse organismes
Parasite,          // Drains hôte vivant
Cannibalism,       // Mange congénères affaiblis
Symbiosis,         // Échange mutuel

// MÉTABOLISME
EnergyStorage,     // Réserve énergétique étendue

// REPRODUCTION
GeneticRecombination, // Brassage génétique sexué
// DÉFENSE PASSIVE
Spine,             // Épines - inflige dégâts à l'attaquant
                   // { damage, count, angle[] }

Carapace,          // Armure dure - réduit dégâts reçus
                   // { protection, coverageRatio, weightPenalty }

Mucus,             // Couche visqueuse - ralentit attaquants
                   // { viscosity, slowFactor }

// DÉFENSE ACTIVE  
Ink,               // Encre/nuage chimique - fuite
                   // { cloudRadius, confusionDuration }
                   Eye,               // Photorécepteur - détecte lumière/mouvement
                   // { range, fieldOfView, acuity }
                   // Donne bonus dans zones éclairées
                   // Inutile en abyssal !

Antenna,           // Détecte vibrations/chimie à distance
                   // { sensitivity, range }
                   // Utile en abyssal où Eye ne sert à rien

Thermoreceptor,    // Détecte gradient thermique
                   // Crucial pour trouver/fuir hydrothermal
                   // { sensitivity }
                   

Jaw,               // Mâchoire - améliore Predator/Cannibalism
                   // { bitePower, handleSize }
                   // Sans Jaw : Prédation lente et risquée
                   // Avec Jaw : Rapide mais coût maintenance élevé

Peduncle,          // Pédoncule - tige d'ancrage au substrat
                   // { length, flexibility }
                   // Combiné avec Anchoring = position fixe stable

Anchoring,         // Enracinement - fixe l'organisme
                   // { strength, depth }
                   // Immunité aux courants
                   // Mais vulnérable aux brouteurs

Tentacle,          // Tentacule préhensile - extension corporelle
                   // { length, count, strength }
                   // Attrape proies à distance
                   // Capture nutrients sans bouger

                   Bioluminescence,   // Lumière propre
                   // { intensity, pattern }
                   // Attire proies en abyssal
                   // Signal reproducteur
                   // Ou... attire prédateurs (risque !)

Chemosynthesis,    // Capte énergie chimique (hydrothermal)
                   // { efficiency, heatTolerance }
                   // Remplace Photosynthesis en zone sombre
                   // Crucial pour coloniser hydrothermal

Sporulation,       // Libère spores (dispersion longue distance)
                   // { sporeCount, dispersalRange }
                   // Hérité CellDivision B9 mais plus ciblé

Hibernation,       // Dormance métabolique
                   // { triggerThreshold, recoveryRate }
                   // Survie en abyssal ou canicule
                   Segmentation,      // Corps segmenté (encode pattern de croissance)
                   // { segmentCount, segmentRole[] }
                   // Amplifie BodyPlan
                   // Perte d'un segment = survie possible !

Regeneration,      // Repousse cellules perdues
                   // { regen rate, maxHeals }
                   // Contre Predator/Spine
                   // Coût énergétique élevé

}