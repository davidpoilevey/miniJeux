// Bactérie 16 — tous les boutons.
// Les réglages marqués `gen` ne sont pris en compte qu'à la génération suivante.

export const DEFAULT_PARAMS = {
  // ── Évolution ──
  population: 100,          // gen — individus par génération
  tauxMutation: 0.004,      // passé à mutationADN (la bible : 0.05, bien trop pour un corps)
  croisement: 0.25,         // proba qu'un enfant ait deux parents (même espèce ; en course des champions : n'importe qui, par introgression)
  elites: 4,                // champions recopiés tels quels (le n°1 + le meilleur d'autres espèces)
  tournoi: 4,               // taille du tournoi de sélection
  partage: 0.5,             // partage de fitness : fitness / taille_espèce^partage (0 = aucun)
  immigrants: 0.03,         // part de génomes neufs à chaque génération
  // Course des champions
  vieFondateurs: 5,         // générations de brassage : tant que les fondateurs vivent, tout le monde se reproduit
  brassage: 0.2,            // pendant le brassage : part des gènes (entiers) reçus du second parent
  introgression: 0.1,       // après le brassage : idem, pour les croisements (libres entre espèces)
  croissance: 1.5,          // la population est multipliée par ça à chaque génération jusqu'à `population`

  // ── Épreuve ──
  duree: 15,                // gen — secondes simulées par génération
  echauffement: 1.5,        // secondes sans mesure (les muscles montent en puissance, le corps se pose)
  coutEnergie: 0.004,       // mètres retirés par unité d'effort musculaire (élague les muscles inutiles)
  relief: 1,                // gen — 0 = piste plate, 1 = relief normal, 2 = montagne

  // ── Physique (garde-fous anti-triche) ──
  freqMin: 0.4,             // Hz — rythme le plus lent
  freqMax: 1.6,             // Hz — plafond : pas de vibration exploitable
  ampliMax: 0.35,           // un muscle change sa longueur de ±35 % au plus
  gravite: 9.81,
  forceMuscle: 150,         // N pour un muscle de force max (le gène « force » en prend 15 à 75 %)

  // ── Affichage ──
  vitesse: 2,               // pas de 1/60 s simulés par image
  turbo: false,             // simule à fond, n'affiche que de temps en temps
};

export const PARAM_GROUPS = [
  {
    titre: 'Évolution',
    params: [
      ['tauxMutation', 'Taux de mutation', 0.0005, 0.03, 0.0005, 'Par nucléotide. Au-delà de 0.01, les enfants ne ressemblent plus aux parents.'],
      ['population', 'Population', 20, 300, 10, 'Appliquée à la génération suivante.'],
      ['croisement', 'Croisement', 0, 1, 0.05, 'Proba de reproduction à deux parents (de la même espèce).'],
      ['elites', 'Élites', 0, 10, 1, 'Recopiés sans mutation : le record ne peut pas régresser.'],
      ['tournoi', 'Tournoi', 2, 10, 1, 'Plus grand = sélection plus dure, convergence plus rapide.'],
      ['partage', 'Partage', 0, 1, 0.05, "Protège les espèces minoritaires (et donc les innovations)."],
      ['immigrants', 'Immigrants', 0, 0.2, 0.01, 'Génomes neufs injectés à chaque génération.'],
    ],
  },
  {
    titre: 'Course des champions',
    params: [
      ['vieFondateurs', 'Vie des fondateurs', 1, 20, 1, "Générations de brassage : tant qu'ils vivent, tous ceux qui avancent se reproduisent autant, sans sélection. À leur mort, la sélection reprend."],
      ['brassage', 'Introgression du brassage', 0.02, 0.5, 0.01, 'Part des gènes pris au second parent pendant le brassage. Haut = vraies mosaïques, mais creux profond à la mort des fondateurs.'],
      ['introgression', 'Introgression ensuite', 0.02, 0.5, 0.01, "Après le brassage, pour les croisements. 0.1 = on garde le corps, on emprunte un détail (une griffe, un rythme)."],
      ['croissance', 'Croissance', 1.1, 3, 0.1, 'La population part d\'un exemplaire par champion et grandit de ×1.5 par génération.'],
    ],
  },
  {
    titre: 'Épreuve',
    params: [
      ['duree', 'Durée (s)', 6, 40, 1, 'Plus long = les sauts et chutes comptent moins.'],
      ['coutEnergie', "Coût de l'effort", 0, 0.03, 0.001, 'Pénalise les muscles qui ne servent à rien.'],
      ['relief', 'Relief', 0, 2, 0.1, 'Hauteur des dunes, cailloux et pentes.'],
    ],
  },
  {
    titre: 'Physique',
    params: [
      ['freqMax', 'Fréquence max (Hz)', 0.6, 4, 0.1, 'Au-delà de 2 Hz, les vibrations deviennent rentables.'],
      ['ampliMax', 'Amplitude max', 0.05, 0.6, 0.01, 'Course maximale des muscles.'],
      ['forceMuscle', 'Force musculaire', 10, 300, 5, 'Trop fort : les corps se catapultent au lieu de marcher.'],
      ['gravite', 'Gravité', 2, 20, 0.1, 'La Lune à 1.6, Jupiter à 24.'],
    ],
  },
];
