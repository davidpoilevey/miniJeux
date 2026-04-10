// philogenie.js — résolution génome → embranchement + composants
// Séparé de l'engine pour garder createOrganism lisible

import {
  ArthropodBodyPlan, ChordateBodyPlan, MolluscanBodyPlan,
  RadiataBodyPlan, VegetalBodyPlan, WormBodyPlan
} from "../engine/Components";

// ── Bases ──────────────────────────────────────────────────────
const ANIMAL_COMPONENTS_BASE = ['Mouth', 'Gut', 'GanglionCluster', 'MuscleFiber', 'Gonad'];
const VEGETAL_COMPONENTS_BASE = ['Photosynthesis'];

// Catalogue exhaustif pour _collectSilentGenes.
// Tout ce qui peut être exprimé mais ne l'est pas = gène silencieux transmissible.
const ALL_POSSIBLE = [
  // Plan corporel
  'Notochord', 'Exoskeleton', 'Mantle', 'Carapace', 'Segmentation',
  // Circulatoire
  'BloodVessel', 'Heart',
  // Respiratoire (non exclusifs — amphibiens)
  'Lung', 'Gill',
  // Digestif
  'Jaw', 'Stomach', 'Liver',
  // Système nerveux / sensoriel
  'Brain', 'Eye', 'LateralLine', 'Chemoreceptor', 'Antenna',
  // Locomoteur
  'Wing',
  // Reproducteur additionnel
  'Uterus',
  // Défense / attaque
  'VenomGland', 'InkSac', 'ToxinGland', 'Spine',
  // Spéciaux (expression rare, avantage fort)
  'Bioluminescence', 'Chromatophore', 'ElectricOrgan',
  // Autotrophie
  'Photosynthesis', 'Chemosynthesis',
  // Divers
  'Regeneration', 'Mucus', 'Sporulation',
  'Tentacle', 'Filtration', 'Anchoring',
];

// ── Utilitaires d'expression ────────────────────────────────────

/**
 * Ajoute `organ` seulement si `condition` est vraie
 * ET que tous les organes prérequis sont déjà dans `components`.
 * Centralise la logique de dépendances inter-organes.
 */
function _addIf(components, organ, condition, ...requiredDeps) {
  if (condition && requiredDeps.every(dep => components.has(dep))) {
    components.add(organ);
  }
}

/**
 * Respiration — non exclusive : Lung et Gill peuvent coexister (amphibiens).
 * Fallback Gill si aucun gène ne s'exprime (milieu marin cambrien par défaut).
 */
function _resolveRespiration(components, handler, gillThreshold = 0.35, lungThreshold = 0.45) {
  if (handler.readFloat('hasGill') > gillThreshold) components.add('Gill');
  if (handler.readFloat('hasLung') > lungThreshold) components.add('Lung');
  if (!components.has('Gill') && !components.has('Lung')) components.add('Gill');
}

/**
 * Organes spéciaux partagés par tous les embranchements animaux.
 * Seuils élevés : expression rare, avantage fort.
 * ElectricOrgan nécessite Brain — vérifié via _addIf.
 */
function _resolveSpecials(components, handler) {
  if (handler.readFloat('hasBiolum')        > 0.75) components.add('Bioluminescence');
  if (handler.readFloat('hasChromatophore') > 0.65) components.add('Chromatophore');
  _addIf(components, 'ElectricOrgan', handler.readFloat('hasElectric') > 0.80, 'Brain');
}

// ── Entrée principale ──────────────────────────────────────────
export function resolvePhylogeny(handler) {
  // Règne
  if (handler.readFloat('isAnimal') < 0.5) return _resolveVegetal(handler);

  // Radiata — symétrie radiale (éponges, méduses, coraux)
  if (handler.readFloat('isBilateral') < 0.1) return _resolveRadiata(handler);

  // Bilatériens — duel d'embranchement par score génétique
  const scores = {
    CHORDATA:   handler.readFloat('hasNotochord'),
    ARTHROPODA: handler.readFloat('hasExoskeleton'),
    MOLLUSCA:   handler.readFloat('hasMantle'),
  };

  const winner = Object.entries(scores)
    .filter(([, v]) => v > 0.4)
    .sort(([, a], [, b]) => b - a)[0]?.[0]
    ?? 'VERMES';

  switch (winner) {
    case 'CHORDATA':   return _resolveChordate(handler);
    case 'ARTHROPODA': return _resolveArthropod(handler);
    case 'MOLLUSCA':   return _resolveMollusc(handler);
    default:           return _resolveWorm(handler);
  }
}

// ── VÉGÉTAL ────────────────────────────────────────────────────
function _resolveVegetal(handler) {
  const components = new Set(VEGETAL_COMPONENTS_BASE);

  // Chimiosynthèse en zone sombre (remplace la photosynthèse)
  if (handler.readFloat('hasChemosynthesis') > 0.6) {
    components.delete('Photosynthesis');
    components.add('Chemosynthesis');
  }

  if (handler.readFloat('hasAnchoring')   > 0.4) components.add('Anchoring');
  if (handler.readFloat('hasToxin')       > 0.5) components.add('ToxinGland');
  if (handler.readFloat('hasMucus')       > 0.5) components.add('Mucus');
  if (handler.readFloat('hasSpine')       > 0.6) components.add('Spine');
  if (handler.readFloat('hasSporulation') > 0.2) components.add('Sporulation');
  if (handler.readFloat('hasBiolum')      > 0.75) components.add('Bioluminescence');

  return {
    bodyPlan: new VegetalBodyPlan(
      handler.readFloat('hasAnchoring') > 0.4,
      Math.ceil(handler.readFloat('branchCount') * 5)
    ),
    components,
    silentGenes: _collectSilentGenes(components),
  };
}

// ── RADIATA ────────────────────────────────────────────────────
function _resolveRadiata(handler) {
  const components = new Set(['Filtration', 'Gonad']);

  if (handler.readFloat('hasAnchoring')     > 0.5)  components.add('Anchoring');
  if (handler.readFloat('hasToxin')         > 0.5)  components.add('ToxinGland');
  if (handler.readFloat('hasBiolum')        > 0.55) components.add('Bioluminescence');
  if (handler.readFloat('hasTentacle')      > 0.4)  components.add('Tentacle');
  if (handler.readFloat('hasChromatophore') > 0.65) components.add('Chromatophore');

  return {
    bodyPlan: new RadiataBodyPlan(),
    components,
    silentGenes: _collectSilentGenes(components),
  };
}

// ── CHORDÉ ─────────────────────────────────────────────────────
function _resolveChordate(handler) {
  const components = new Set([...ANIMAL_COMPONENTS_BASE, 'Notochord', 'BloodVessel']);

  // ── Circulatoire ──────────────────────────────────────────────
  _addIf(components, 'Heart', handler.readFloat('hasHeart') > 0.35, 'BloodVessel');

  // ── Système nerveux ───────────────────────────────────────────
  // Brain nécessite GanglionCluster (base) + BloodVessel (base)
  _addIf(components, 'Brain',
    handler.readFloat('hasBrain') > 0.4, 'GanglionCluster', 'BloodVessel');

  // ── Respiration (non exclusive — amphibiens possibles) ────────
  _resolveRespiration(components, handler);

  // ── Sensoriel (nécessitent GanglionCluster — déjà en base) ───
  if (handler.readFloat('hasEye')           > 0.3)  components.add('Eye');
  if (handler.readFloat('hasLateralLine')   > 0.4)  components.add('LateralLine');
  if (handler.readFloat('hasChemoreceptor') > 0.4)  components.add('Chemoreceptor');

  // ── Digestif avancé ───────────────────────────────────────────
  if (handler.readFloat('hasJaw')     > 0.4) components.add('Jaw');
  if (handler.readFloat('hasStomach') > 0.3) components.add('Stomach');
  // Liver nécessite Heart
  _addIf(components, 'Liver', handler.readFloat('hasLiver') > 0.4, 'Heart');

  // ── Reproducteur avancé ───────────────────────────────────────
  // Uterus nécessite Gonad (base)
  _addIf(components, 'Uterus', handler.readFloat('hasUterus') > 0.5, 'Gonad');

  // ── Défense / Attaque ─────────────────────────────────────────
  // VenomGland nécessite Mouth (base)
  _addIf(components, 'VenomGland', handler.readFloat('hasVenom') > 0.65, 'Mouth');
  if (handler.readFloat('hasInk') > 0.70) components.add('InkSac');

  // ── Spéciaux (biolum, chromatophore, electricOrgan) ──────────
  _resolveSpecials(components, handler);

  // ── Appendices ────────────────────────────────────────────────
  const appendices = [];

  // Nageoires
  const finPairs = Math.ceil(handler.readFloat('finPairs') * 3);
  if (finPairs > 0)
    appendices.push({ type: 'Fin', pairs: finPairs, size: handler.readFloat('finSize') });

  // Ailes (seuil élevé — prépare le biome aérien)
  if (handler.readFloat('hasWing') > 0.80) {
    appendices.push({ type: 'Wing', pairs: 1, size: handler.readFloat('wingSize') });
    components.add('Wing');
  }

  return {
    bodyPlan: Object.assign(new ChordateBodyPlan(), { appendices }),
    components,
    silentGenes: _collectSilentGenes(components),
  };
}

// ── ARTHROPODE ─────────────────────────────────────────────────
function _resolveArthropod(handler) {
  // Note : Exoskeleton incompatible Notochord — garanti par le switch
  const components = new Set([...ANIMAL_COMPONENTS_BASE, 'Exoskeleton', 'BloodVessel']);

  // ── Circulatoire ──────────────────────────────────────────────
  _addIf(components, 'Heart', handler.readFloat('hasHeart') > 0.35, 'BloodVessel');

  // ── Respiration ───────────────────────────────────────────────
  // Arthropodes aquatiques : Gill. Terrestres : trachées (pas modélisées ici, Lung par analogie)
  _resolveRespiration(components, handler, 0.40, 0.55);

  // ── Segments ──────────────────────────────────────────────────
  const hasCephalon = handler.readFloat('hasCephalon') > 0.3;
  const hasThorax   = handler.readFloat('hasThorax')   > 0.3;
  const hasAbdomen  = handler.readFloat('hasAbdomen')  > 0.3;

  const appendices = [];

  if (hasCephalon) {
    components.add('Eye');
    components.add('Chemoreceptor');
    if (handler.readFloat('hasJaw')     > 0.4) components.add('Jaw');
    if (handler.readFloat('hasAntenna') > 0.4) components.add('Antenna');
    _addIf(components, 'Brain',
      handler.readFloat('hasBrain') > 0.5, 'GanglionCluster', 'BloodVessel');
  }

  if (hasThorax) {
    const pairs = Math.ceil(handler.readFloat('thoraxLegPairs') * 3); // 1–3 paires
    if (pairs > 0)
      appendices.push({ type: 'Leg', pairs, segment: 'THORAX', size: handler.readFloat('legSize') });
    // Ailes — rares, débloquent biome aérien
    if (handler.readFloat('hasWing') > 0.75) {
      appendices.push({ type: 'Wing', pairs: 1, segment: 'THORAX', size: handler.readFloat('wingSize') });
      components.add('Wing');
    }
  }

  if (hasAbdomen) {
    const pairs = Math.ceil(handler.readFloat('abdomenLegPairs') * 5); // 1–5 paires
    if (pairs > 0)
      appendices.push({ type: 'Leg', pairs, segment: 'ABDOMEN', size: handler.readFloat('legSize') * 0.7 });
    // Stinger → VenomGland (nécessite Mouth en base)
    _addIf(components, 'VenomGland', handler.readFloat('hasStinger') > 0.6, 'Mouth');
  }

  // ── Digestif ──────────────────────────────────────────────────
  if (handler.readFloat('hasStomach') > 0.3) components.add('Stomach');
  _addIf(components, 'Liver', handler.readFloat('hasLiver') > 0.5, 'Heart');

  // ── Reproducteur avancé ───────────────────────────────────────
  _addIf(components, 'Uterus', handler.readFloat('hasUterus') > 0.6, 'Gonad');

  // ── Défense ───────────────────────────────────────────────────
  if (handler.readFloat('hasInk') > 0.75) components.add('InkSac');

  // ── Spéciaux ─────────────────────────────────────────────────
  _resolveSpecials(components, handler);

  return {
    bodyPlan: Object.assign(
      new ArthropodBodyPlan(hasCephalon, hasThorax, hasAbdomen),
      { appendices }
    ),
    components,
    silentGenes: _collectSilentGenes(components),
  };
}

// ── MOLLUSQUE ──────────────────────────────────────────────────
function _resolveMollusc(handler) {
  const components = new Set([...ANIMAL_COMPONENTS_BASE, 'Mantle', 'BloodVessel']);

  // ── Circulatoire ──────────────────────────────────────────────
  _addIf(components, 'Heart', handler.readFloat('hasHeart') > 0.35, 'BloodVessel');

  // ── Tête ──────────────────────────────────────────────────────
  const hasHead  = handler.readFloat('hasHead')  > 0.4;
  const hasShell = handler.readFloat('hasShell') > 0.5;

  if (hasHead) {
    components.add('Eye');
    if (handler.readFloat('hasChemoreceptor') > 0.4) components.add('Chemoreceptor');
    _addIf(components, 'Brain',
      handler.readFloat('hasBrain') > 0.5, 'GanglionCluster', 'BloodVessel');
  }

  if (hasShell) components.add('Carapace');

  // ── Respiration ───────────────────────────────────────────────
  // Mollusques principalement aquatiques, mais les gastéropodes terrestres ont un poumon
  _resolveRespiration(components, handler, 0.30, 0.60);

  // ── Digestif ──────────────────────────────────────────────────
  if (handler.readFloat('hasJaw')     > 0.4) components.add('Jaw');
  if (handler.readFloat('hasStomach') > 0.3) components.add('Stomach');
  _addIf(components, 'Liver', handler.readFloat('hasLiver') > 0.4, 'Heart');

  // ── Défense / Attaque ─────────────────────────────────────────
  // InkSac : naturel chez les céphalopodes (seuil bas)
  if (handler.readFloat('hasInk')  > 0.40) components.add('InkSac');
  _addIf(components, 'VenomGland', handler.readFloat('hasVenom') > 0.60, 'Mouth');

  // ── Tentacules ────────────────────────────────────────────────
  if (handler.readFloat('hasTentacle') > 0.4) components.add('Tentacle');

  // ── Reproducteur avancé ───────────────────────────────────────
  _addIf(components, 'Uterus', handler.readFloat('hasUterus') > 0.5, 'Gonad');

  // ── Spéciaux ─────────────────────────────────────────────────
  _resolveSpecials(components, handler);

  // ── Appendices ────────────────────────────────────────────────
  const appendices = [];
  const tentaclePairs = Math.ceil(handler.readFloat('tentaclePairs') * 4);
  if (tentaclePairs > 0 && components.has('Tentacle'))
    appendices.push({ type: 'Tentacle', pairs: tentaclePairs, size: handler.readFloat('tentacleSize') });

  return {
    bodyPlan: Object.assign(
      new MolluscanBodyPlan(hasHead, hasShell),
      { appendices }
    ),
    components,
    silentGenes: _collectSilentGenes(components),
  };
}

// ── VER ────────────────────────────────────────────────────────
function _resolveWorm(handler) {
  // Pas de cerveau centralisé, pas d'exosquelette, pas de notochorde — mais viable
  const components = new Set(['Mouth', 'Gut', 'MuscleFiber', 'Gonad']);

  const segmentCount = Math.ceil(handler.readFloat('segmentCount') * 8); // 1–8
  if (segmentCount > 1) components.add('Segmentation');

  // Capteurs primitifs
  if (handler.readFloat('hasChemoreceptor') > 0.5) components.add('Chemoreceptor');

  // Défense
  if (handler.readFloat('hasToxin')        > 0.5) components.add('ToxinGland');
  if (handler.readFloat('hasRegeneration') > 0.6) components.add('Regeneration');

  // Bioluminescence (vers des abysses)
  if (handler.readFloat('hasBiolum')       > 0.75) components.add('Bioluminescence');

  // Autotrophie symbiotique — rare
  if (handler.readFloat('hasPhotosynthesis') > 0.7) components.add('Photosynthesis');

  return {
    bodyPlan: new WormBodyPlan(segmentCount),
    components,
    silentGenes: _collectSilentGenes(components),
  };
}

// ── Gènes silencieux ───────────────────────────────────────────
// Gènes non exprimés dans ce phénotype.
// Conservés pour transmission et mutations futures — potentiel évolutif latent.
function _collectSilentGenes(activeComponents) {
  return ALL_POSSIBLE.filter(g => !activeComponents.has(g));
}
