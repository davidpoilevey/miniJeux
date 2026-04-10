// Components.js — définitions ECS pour Cambrien11
// Chaque classe = un composant instanciable par createOrganism

// ══════════════════════════════════════════════════════════════════
// COMPOSANTS INFRASTRUCTURE (non-biologiques)
// ══════════════════════════════════════════════════════════════════

export class Position {
  constructor(x, y) { this.x = x; this.y = y; }
}

export class Genome {
  constructor(adn, handler) {
    this.adn = adn;
    this.handler = handler;
    this.silentGenes = [];
  }
}

export class Metabolism {
  constructor(maxEnergy, maxAge) {
    this.energy    = maxEnergy * 0.5;
    this.maxEnergy = maxEnergy;
    this.age       = 0;
    this.maxAge    = maxAge;
    this.alive     = true;

    this.maintenanceCost          = 0;   // calculé par MorphologySystem
    this.oxygenConsumption        = 0;
    this.maturityAge              = 0;
    this.isMature                 = false;
    this.maturityEnergyThreshold  = 0;
    this.recoilTicks              = 0;   // ticks d'incapacité à attaquer après une défense réussie
  }
}

// ══════════════════════════════════════════════════════════════════
// BODY PLANS — un par embranchement
// ══════════════════════════════════════════════════════════════════

export class ChordateBodyPlan {
  constructor() {
    this.phylum     = 'CHORDATA';
    this.segments   = ['HEAD', 'BODY'];
    this.appendices = []; // { type, pairs, size }
    this.bodyMass   = 0;
    // Croissance
    this.growthFactor         = 0.05;  // 0.05 = naissance, 1.0 = adulte
    this.adultMass            = 0;     // calculé par GrowthSystem.initOrganism
    this.segmentSizes         = {};    // { HEAD:{w,h}, BODY:{w,h} } en cellules-monde
    this.locomotionEfficiency = 1.0;   // réduit si MuscleFiber insuffisant pour les appendices
  }
}

export class ArthropodBodyPlan {
  constructor(hasCephalon, hasThorax, hasAbdomen) {
    this.phylum   = 'ARTHROPODA';
    this.segments = [];
    if (hasCephalon) this.segments.push('HEAD');
    if (hasThorax)   this.segments.push('THORAX');
    if (hasAbdomen)  this.segments.push('ABDOMEN');
    this.appendices = [];
    this.bodyMass   = 0;
    // Croissance
    this.growthFactor         = 0.05;
    this.adultMass            = 0;
    this.segmentSizes         = {};
    this.locomotionEfficiency = 1.0;
  }
}

export class MolluscanBodyPlan {
  constructor(hasHead, hasShell) {
    this.phylum   = 'MOLLUSCA';
    this.segments = [];
    if (hasHead) this.segments.push('HEAD');
    this.segments.push('MANTLE', 'FOOT');
    this.hasShell   = hasShell;
    this.appendices = [];
    this.bodyMass   = 0;
    // Croissance
    this.growthFactor         = 0.05;
    this.adultMass            = 0;
    this.segmentSizes         = {};
    this.locomotionEfficiency = 1.0;
  }
}

export class WormBodyPlan {
  constructor(segmentCount) {
    this.phylum       = 'VERMES';
    this.segmentCount = Math.max(1, segmentCount);
    this.segments     = Array(this.segmentCount).fill('SEGMENT');
    this.appendices   = [];
    this.bodyMass     = 0;
    // Croissance
    this.growthFactor         = 0.05;
    this.adultMass            = 0;
    this.segmentSizes         = {};    // clé = index numérique (0..n-1)
    this.locomotionEfficiency = 1.0;
  }
}

export class RadiataBodyPlan {
  constructor() {
    this.phylum     = 'RADIATA';
    this.segments   = ['BODY'];
    this.appendices = [];
    this.bodyMass   = 0;
    // Croissance
    this.growthFactor         = 0.05;
    this.adultMass            = 0;
    this.segmentSizes         = {};
    this.locomotionEfficiency = 1.0;
  }
}

export class VegetalBodyPlan {
  constructor(isAnchored, branchCount) {
    this.kingdom     = 'VEGETAL';
    this.phylum      = 'VEGETAL';
    this.isAnchored  = isAnchored;
    this.branchCount = Math.max(1, branchCount);
    this.segments    = ['BODY'];
    this.bodyMass    = 0;
    // Croissance
    this.growthFactor         = 0.05;
    this.adultMass            = 0;
    this.segmentSizes         = {};
    this.locomotionEfficiency = 1.0;
  }
}

// ══════════════════════════════════════════════════════════════════
// MASSES DES ORGANES (référence tableau utilisateur)
// Utilisé pour calculer le maintenanceCost dans createOrganism
// ══════════════════════════════════════════════════════════════════

export const ORGAN_MASSES = {
  // Vitaux
  Mouth:          1,
  Gut:            2,
  // Circulatoires
  BloodVessel:    1,
  Heart:          2,
  // Respiratoires
  Gill:           2,
  Lung:           2,
  // Digestif avancé
  Stomach:        3,
  Liver:          3,
  // Système nerveux
  GanglionCluster:1,
  Brain:          4,
  // Sensoriel
  Eye:            2,
  LateralLine:    1,
  Chemoreceptor:  1,
  Antenna:        1,
  // Musculo-squelettique
  MuscleFiber:    2,
  Notochord:      3,
  Exoskeleton:    3,
  Mantle:         2,
  Carapace:       3,
  // Reproducteur
  Gonad:          2,
  Uterus:         3,
  // Défense / attaque
  Jaw:            1,
  VenomGland:     2,
  InkSac:         1,
  ToxinGland:     1,
  Spine:          1,
  // Spéciaux
  ElectricOrgan:  3,
  Bioluminescence:1,
  Chromatophore:  1,
  Wing:           2,
  Tentacle:       1,
  // Autotrophie
  Photosynthesis: 1,
  Chemosynthesis: 1,
  // Divers
  Regeneration:   2,
  Mucus:          1,
  Sporulation:    1,
  Filtration:     1,
  Anchoring:      1,
  Segmentation:   0,
};

// ══════════════════════════════════════════════════════════════════
// COMPOSANTS D'ORGANES
// Convention : constructor(size = 1.0)
//   size : facteur 0.1–2.0 issu du génome, module l'effet de l'organe
//   mass : masse fixe (cf. ORGAN_MASSES) — coût de maintenance
// ══════════════════════════════════════════════════════════════════

// ── Vitaux ──────────────────────────────────────────────────────
export class Mouth {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Mouth;
    this.size   = size;   // → débit d'ingestion
    this.active = true;
  }
}

export class Gut {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Gut;
    this.size   = size;   // → efficacité digestive
    this.active = true;
  }
}

// ── Circulatoires ───────────────────────────────────────────────
export class BloodVessel {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.BloodVessel;
    this.size   = size;
    this.active = true;
  }
}

export class Heart {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Heart;
    this.size   = size;   // → % amplification des autres organes
    this.active = true;
  }
}

// ── Respiratoires (non exclusifs) ───────────────────────────────
export class Gill {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Gill;
    this.size   = size;   // → taux d'oxygénation aquatique
    this.active = true;
  }
}

export class Lung {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Lung;
    this.size   = size;   // → taux d'oxygénation aérien
    this.active = true;
  }
}

// ── Digestif avancé ─────────────────────────────────────────────
export class Stomach {
  constructor(size = 1.0) {
    this.mass     = ORGAN_MASSES.Stomach;
    this.size     = size;
    this.capacity = size * 50;  // → réserve énergétique tamponnée
    this.active   = true;
  }
}

export class Liver {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Liver;
    this.size   = size;   // → amplifie EnergyStorage, réduit coût maintenance
    this.active = true;
  }
}

export class Jaw {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Jaw;
    this.size   = size;
    this.active = true;
  }
}

// ── Système nerveux ─────────────────────────────────────────────
export class GanglionCluster {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.GanglionCluster;
    this.size   = size;   // → SN primitif : réflexes de fuite/attraction
    this.active = true;
  }
}

export class Brain {
  constructor(size = 1.0) {
    this.mass        = ORGAN_MASSES.Brain;
    this.size        = size;   // → navigation complexe, mémoire court terme
    this.memorySlots = Math.ceil(size * 4);
    this.active      = true;
  }
}

// ── Sensoriel ────────────────────────────────────────────────────
export class Eye {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Eye;
    this.size   = size;   // → portée et précision de détection lumineuse
    this.active = true;
  }
}

export class LateralLine {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.LateralLine;
    this.size   = size;   // → détection vibrations / courants
    this.active = true;
  }
}

export class Chemoreceptor {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Chemoreceptor;
    this.size   = size;   // → olfaction chimique (nutriments et prédateurs)
    this.active = true;
  }
}

export class Antenna {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Antenna;
    this.size   = size;
    this.active = true;
  }
}

// ── Musculo-squelettique ────────────────────────────────────────
export class MuscleFiber {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.MuscleFiber;
    this.size   = size;   // → vitesse max et force des appendices
    this.active = true;
  }
}

export class Notochord {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Notochord;
    this.size   = size;   // → ondulation efficace, amplifie MuscleFiber
    this.active = true;
  }
}

export class Exoskeleton {
  constructor(size = 1.0) {
    this.mass           = ORGAN_MASSES.Exoskeleton;
    this.size           = size;   // → protection + ancrage musculaire
    this.armorRating    = size * 0.5;
    this.active         = true;
  }
}

export class Mantle {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Mantle;
    this.size   = size;
    this.active = true;
  }
}

export class Carapace {
  constructor(size = 1.0) {
    this.mass        = ORGAN_MASSES.Carapace;
    this.size        = size;
    this.armorRating = size * 0.7;
    this.active      = true;
  }
}

// ── Reproducteur ─────────────────────────────────────────────────
export class Gonad {
  constructor(size = 1.0) {
    this.mass      = ORGAN_MASSES.Gonad;
    this.size      = size;   // → fréquence reproductive
    this.active    = true;
  }
}

export class Uterus {
  constructor(size = 1.0) {
    this.mass           = ORGAN_MASSES.Uterus;
    this.size           = size;
    this.gestationTime  = Math.ceil(size * 100);  // → viviparité, progéniture robuste
    this.active         = true;
  }
}

// ── Défense / Attaque ────────────────────────────────────────────
export class VenomGland {
  constructor(size = 1.0) {
    this.mass     = ORGAN_MASSES.VenomGland;
    this.size     = size;
    this.potency  = size;   // → dégâts / paralysie
    this.active   = true;
  }
}

export class InkSac {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.InkSac;
    this.size   = size;
    this.radius = Math.ceil(size * 5);  // → rayon du nuage de confusion
    this.active = true;
  }
}

export class ToxinGland {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.ToxinGland;
    this.size   = size;
    this.active = true;
  }
}

export class Spine {
  constructor(size = 1.0) {
    this.mass        = ORGAN_MASSES.Spine;
    this.size        = size;
    this.passiveDmg  = size * 0.3;  // → dégâts passifs aux attaquants
    this.active      = true;
  }
}

// ── Spéciaux ─────────────────────────────────────────────────────
export class ElectricOrgan {
  constructor(size = 1.0) {
    this.mass     = ORGAN_MASSES.ElectricOrgan;
    this.size     = size;
    this.voltage  = size * 10;  // → intensité du choc
    this.range    = Math.ceil(size * 3);
    this.active   = true;
  }
}

export class Bioluminescence {
  constructor(size = 1.0) {
    this.mass      = ORGAN_MASSES.Bioluminescence;
    this.size      = size;
    this.intensity = size;   // → portée du signal lumineux
    this.active    = true;
  }
}

export class Chromatophore {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Chromatophore;
    this.size   = size;
    this.active = true;
    // → camouflage (réduction détection) ou signalisation reproductive
  }
}

export class Wing {
  constructor(size = 1.0) {
    this.mass       = ORGAN_MASSES.Wing;
    this.size       = size;
    this.liftFactor = size;   // → capacité de vol (biome aérien)
    this.active     = true;
  }
}

export class Tentacle {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Tentacle;
    this.size   = size;
    this.reach  = Math.ceil(size * 3);
    this.active = true;
  }
}

// ── Autotrophie ──────────────────────────────────────────────────
export class Photosynthesis {
  constructor(size = 1.0) {
    this.mass         = ORGAN_MASSES.Photosynthesis;
    this.size         = size;
    this.lightToEnergy = size * 0.8;
    this.active       = true;
  }
}

export class Chemosynthesis {
  constructor(size = 1.0) {
    this.mass          = ORGAN_MASSES.Chemosynthesis;
    this.size          = size;
    this.heatToEnergy  = size * 0.6;  // → exploite la chaleur hydrothermale
    this.active        = true;
  }
}

// ── Divers ───────────────────────────────────────────────────────
export class Filtration {
  constructor(size = 1.0) {
    this.mass         = ORGAN_MASSES.Filtration;
    this.size         = size;
    this.filterRate   = size * 2;  // → particules filtrées par tick
    this.active       = true;
  }
}

export class Anchoring {
  constructor(size = 1.0) {
    this.mass         = ORGAN_MASSES.Anchoring;
    this.size         = size;
    this.holdStrength = size;
    this.active       = true;
  }
}

export class Regeneration {
  constructor(size = 1.0) {
    this.mass     = ORGAN_MASSES.Regeneration;
    this.size     = size;
    this.healRate = size * 0.1;  // → énergie récupérée par tick
    this.active   = true;
  }
}

export class Mucus {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Mucus;
    this.size   = size;
    this.active = true;
  }
}

export class Sporulation {
  constructor(size = 1.0) {
    this.mass   = ORGAN_MASSES.Sporulation;
    this.size   = size;
    this.active = true;
  }
}

export class Segmentation {
  constructor(count = 1) {
    this.mass   = ORGAN_MASSES.Segmentation;
    this.count  = count;
    this.active = true;
  }
}

// ══════════════════════════════════════════════════════════════════
// REGISTRE DES COMPOSANTS
// Clé = nom de composant (string dans philogenie.js)
// Valeur = classe à instancier dans createOrganism
// ══════════════════════════════════════════════════════════════════

export const ORGAN_COMPONENTS = {
  Mouth,       Gut,            BloodVessel,    Heart,
  Gill,        Lung,           Stomach,        Liver,        Jaw,
  GanglionCluster, Brain,
  Eye,         LateralLine,    Chemoreceptor,  Antenna,
  MuscleFiber, Notochord,      Exoskeleton,    Mantle,       Carapace,
  Gonad,       Uterus,
  VenomGland,  InkSac,         ToxinGland,     Spine,
  ElectricOrgan, Bioluminescence, Chromatophore, Wing, Tentacle,
  Photosynthesis, Chemosynthesis,
  Filtration,  Anchoring,      Regeneration,   Mucus,        Sporulation,
  Segmentation,
};
