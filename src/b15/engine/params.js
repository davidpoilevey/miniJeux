// Bactérie 15.5 — tous les boutons de la gélose.
// Les paramètres marqués `reset` ne sont lus qu'à la création du monde.

export const DEFAULT_PARAMS = {
  // ── Monde ──
  largeur: 200,            // reset — cases de la grille (1 bactérie max par case)
  hauteur: 125,            // reset
  populationInitiale: 300, // reset
  maxBacteries: 40000,     // garde-fou perf (la grille plafonne déjà à largeur × hauteur)

  // ── Chimie : A (sucre) → B (acide) → C (déchet ultime) ──
  regenA: 0.006,           // repousse de A vers sa capacité locale : LE bouton gaz ↔ cristal
  capaciteA: 1.0,
  contrasteFertilite: 0.75, // 0 = gélose uniforme, 1 = déserts et oasis
  deriveFertilite: 0.00012, // vitesse de dérive des zones fertiles (le climat)
  diffA: 0.15, diffB: 0.2, diffC: 0.2,
  evapB: 0.002, evapC: 0.003,
  rendementA: 1.0, rendementB: 0.85, rendementC: 0.75,
  absorption: 0.2,         // fraction du champ local absorbée par tick (enzyme = 1)
  excretion: 0.85,         // fraction de la matière mangée rejetée au cran suivant
  necromasse: 0.6,         // C déposé à la mort d'une bactérie
  saisonPeriode: 3000,     // durée d'un cycle été + hiver (ticks)
  saisonRigueur: 0,        // 0 = pas de saisons, 1 = plus aucune repousse l'hiver

  // ── Colicine (toxine T) ──
  emissionToxine: 0.1,     // T déposé par tick pour toxine = 1
  degatsToxine: 0.1,       // énergie perdue par unité de T, si non protégée
  diffT: 0.3, evapT: 0.05,

  // ── Coûts métaboliques ──
  coutBase: 0.0025,
  coutMouvement: 0.02,     // par déplacement d'une case
  coutEnzyme: 0.008,       // × (eA + eB + eC)² — pénalise le généraliste
  coutToxine: 0.004,       // × toxine : l'arme coûte cher…
  coutResistance: 0.0015,  // × résistance : …l'armure moins (c'est ce qui fait tourner le manège)

  // ── Génétique ──
  tauxMutation: 0.01,      // passé à mutationADN (la bible : TAUX_MUTATION = 0.05)
  tauxSexe: 0.3,           // proba de chercher un partenaire voisin à la division
  compatibilite: 0.08,     // écart de teinte max pour s'accoupler (isolement reproductif)
  panspermie: 0.002,       // proba par tick qu'une pluie de spores tombe sur la gélose

  // ── Affichage ──
  ticksParFrame: 1,
};

// Milieux prêts à l'emploi : des écarts à DEFAULT_PARAMS, appliqués à chaud.
// Réglés sur image en Node (7 500 ticks). Le récit décrit ce qui a été observé, pas un souhait.
export const MILIEUX = [
  {
    id: 'standard', nom: 'Gélose', emoji: '🧫',
    recit: 'Le manège : tueuses, résistantes et sensibles se poursuivent en domaines.',
    params: {},
  },
  {
    id: 'pauvre', nom: 'Pauvre', emoji: '🏜️',
    recit: "Peu de sucre, l'arme coûte cher : les tueuses se ruinent, la paix s'installe dans les oasis, les cadavres nourrissent les autres.",
    params: { regenA: 0.005, contrasteFertilite: 0.9, rendementB: 0.95, rendementC: 0.9, necromasse: 1.0, coutToxine: 0.006 },
  },
  {
    id: 'riche', nom: 'Riche', emoji: '🍯',
    recit: "Sucre à volonté, toxine dévastatrice : guerre de fronts, les tueuses percent des brèches dans l'armure des résistantes.",
    params: { regenA: 0.01, contrasteFertilite: 0.5, degatsToxine: 0.2, coutToxine: 0.006, coutResistance: 0.002, diffT: 0.4 },
  },
  {
    id: 'extreme', nom: 'Extrême', emoji: '❄️',
    recit: "Étés d'abondance, hivers de famine : 99 % meurent, une poignée de survivantes repeuple tout. Goulot génétique à chaque saison.",
    params: { regenA: 0.007, contrasteFertilite: 0.9, saisonRigueur: 0.9, saisonPeriode: 3000, tauxMutation: 0.02 },
  },
];

// Pour le tiroir de réglages : [clé, label, min, max, pas]
export const PARAM_GROUPS = [
  {
    titre: 'Chimie',
    params: [
      ['regenA', 'Repousse du sucre A', 0, 0.015, 0.0005],
      ['contrasteFertilite', 'Contraste oasis/désert', 0, 1, 0.05],
      ['deriveFertilite', 'Dérive du climat', 0, 0.001, 0.00002],
      ['diffA', 'Diffusion sucre A', 0, 0.5, 0.01],
      ['rendementB', 'Rendement B', 0, 1, 0.05],
      ['rendementC', 'Rendement C', 0, 1, 0.05],
      ['excretion', 'Excrétion', 0, 1, 0.05],
      ['necromasse', 'Nécromasse', 0, 2, 0.1],
      ['saisonRigueur', "Rigueur de l'hiver", 0, 1, 0.05],
      ['saisonPeriode', 'Durée des saisons', 500, 10000, 250],
    ],
  },
  {
    titre: 'Colicine',
    params: [
      ['degatsToxine', 'Dégâts de la toxine', 0, 0.2, 0.005],
      ['coutToxine', 'Coût de la toxine', 0, 0.015, 0.0005],
      ['coutResistance', 'Coût de la résistance', 0, 0.015, 0.0005],
      ['diffT', 'Diffusion toxine', 0, 0.5, 0.01],
      ['evapT', 'Dégradation toxine', 0, 0.2, 0.005],
    ],
  },
  {
    titre: 'Métabolisme',
    params: [
      ['coutBase', 'Coût de base', 0, 0.01, 0.0005],
      ['coutMouvement', 'Coût du mouvement', 0, 0.05, 0.001],
      ['coutEnzyme', 'Coût des enzymes', 0, 0.02, 0.001],
    ],
  },
  {
    titre: 'Génétique',
    params: [
      ['tauxMutation', 'Taux de mutation', 0, 0.1, 0.002],
      ['tauxSexe', 'Sexualité', 0, 1, 0.05],
      ['compatibilite', "Tolérance d'accouplement", 0, 0.5, 0.01],
      ['panspermie', 'Panspermie', 0, 0.02, 0.001],
    ],
  },
];
