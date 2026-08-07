// TERRAIN — catalogue d'événements aléatoires susceptibles de survenir en début
// de tour, avant le sondage. Chaque événement pousse l'opinion sur UN axe vers
// UN pôle, avec une intensité donnée. Comment ce déplacement se traduit
// concrètement dans le sondage (estime des partis, poids des médias, etc.)
// reste à écrire — ce fichier ne fait QUE décrire le contenu, il n'applique rien.
export const EVENEMENTS = [
  // === Originaux ===
  {
    id: 'canicule', nom: 'Canicule historique', poids: 3,
    axe: 'ecolo', sens: 'droite', intensite: 6,
    texte: "Des records de chaleur inédits ravivent l'inquiétude climatique.",
  },
  {
    id: 'secheresse', nom: 'Sécheresse prolongée', poids: 2,
    axe: 'ecolo', sens: 'droite', intensite: 5,
    texte: "Les nappes phréatiques s'assèchent, l'agriculture s'inquiète.",
  },
  {
    id: 'guerreEcoChine', nom: 'Guerre économique avec la Chine', poids: 2,
    axe: 'regalien', sens: 'droite', intensite: 7,
    texte: "De nouvelles taxes douanières ravivent le débat sur la souveraineté économique.",
  },
  {
    id: 'crisePouvoirAchat', nom: 'Crise du pouvoir d\'achat', poids: 3,
    axe: 'eco', sens: 'gauche', intensite: 6,
    texte: "L'inflation ronge les salaires, la demande de protection sociale monte.",
  },
  {
    id: 'attentat', nom: 'Attentat déjoué de justesse', poids: 1,
    axe: 'societal', sens: 'droite', intensite: 8,
    texte: "La menace ravive le débat sur la fermeté sécuritaire.",
  },
  {
    id: 'scandaleSanitaire', nom: 'Scandale sanitaire', poids: 2,
    axe: 'eco', sens: 'gauche', intensite: 5,
    texte: "Un produit toxique relance la défiance envers les grandes entreprises.",
  },
  {
    id: 'naufrageMigrants', nom: 'Naufrage au large des côtes', poids: 2,
    axe: 'immigration', sens: 'droite', intensite: 6,
    texte: "Un nouveau drame en mer relance le débat sur le contrôle des frontières.",
  },

  // === Nouveaux (version émotion + trash) ===
  {
    id: 'covidVague', nom: 'Nouvelle vague épidémique', poids: 3,
    axe: 'societal', sens: 'gauche', intensite: 7,
    texte: "Les hôpitaux saturent à nouveau. Le débat sur les libertés individuelles explose.",
  },
  {
    id: 'passeSanitaire', nom: 'Retour du pass sanitaire', poids: 2,
    axe: 'societal', sens: 'droite', intensite: 8,
    texte: "Manifestations massives contre ce qui est qualifié de « dictature sanitaire ».",
  },
  {
    id: 'guerreUkraine', nom: 'Escalade en Ukraine', poids: 3,
    axe: 'regalien', sens: 'gauche', intensite: 7,
    texte: "L’OTAN s’implique davantage. Les appels à l’unité européenne se multiplient.",
  },
  {
    id: 'prixEnergie', nom: 'Explosion des prix de l’énergie', poids: 3,
    axe: 'eco', sens: 'gauche', intensite: 8,
    texte: "Les factures doublent. La colère contre les « superprofits » devient explosive.",
  },
  {
    id: 'emeutesBanlieue', nom: 'Émeutes urbaines généralisées', poids: 2,
    axe: 'societal', sens: 'droite', intensite: 9,
    texte: "Voitures brûlées, commissariats attaqués. Le pays parle de « guerre civile à bas bruit ».",
  },
  {
    id: 'violCollectif', nom: 'Affaire de viols collectifs médiatisée', poids: 2,
    axe: 'immigration', sens: 'droite', intensite: 8,
    texte: "Les profils des mis en cause relancent le débat sur l’échec de l’intégration.",
  },
  {
    id: 'greveGenerale', nom: 'Grève générale illimitée', poids: 2,
    axe: 'eco', sens: 'gauche', intensite: 6,
    texte: "Transports, écoles, raffineries : le pays est paralysé. Les syndicats crient victoire.",
  },
  {
    id: 'incendieForet', nom: 'Incendies géants incontrôlables', poids: 2,
    axe: 'ecolo', sens: 'gauche', intensite: 7,
    texte: "Des milliers d’hectares partent en fumée. Les écolos accusent le « capitalisme fossiliste ».",
  },
  {
    id: 'inondations', nom: 'Inondations meurtrières', poids: 2,
    axe: 'ecolo', sens: 'gauche', intensite: 6,
    texte: "Des villages sous les eaux. On parle déjà de « réfugiés climatiques ».",
  },
  {
    id: 'scandaleParlement', nom: 'Scandale de corruption au Parlement', poids: 2,
    axe: 'eco', sens: 'gauche', intensite: 5,
    texte: "Des élus soupçonnés d’avoir vendu leur vote à des lobbys étrangers.",
  },
  {
    id: 'attentatEcole', nom: 'Attaque au couteau dans une école', poids: 1,
    axe: 'societal', sens: 'droite', intensite: 9,
    texte: "Un adolescent radicalisé fait plusieurs victimes. L’émotion est à son comble.",
  },
  {
    id: 'criseLogement', nom: 'Crise du logement explosive', poids: 2,
    axe: 'eco', sens: 'gauche', intensite: 6,
    texte: "Des familles dorment dans la rue. On parle d’« apartheid social ».",
  },
  {
    id: 'deportationMasse', nom: 'Vague d’expulsions massives', poids: 2,
    axe: 'immigration', sens: 'gauche', intensite: 7,
    texte: "Des centaines de familles expulsées. Les associations crient au scandale humanitaire.",
  },
  {
    id: 'manifestationLGBT', nom: 'Marche pour les droits LGBT attaquée', poids: 1,
    axe: 'societal', sens: 'gauche', intensite: 6,
    texte: "Violences contre des militants. Le débat sur « l’homophobie d’État » reprend de plus belle.",
  },
  {
    id: 'penurieMedocs', nom: 'Pénurie de médicaments critiques', poids: 2,
    axe: 'regalien', sens: 'droite', intensite: 6,
    texte: "L’Europe dépend trop de l’Asie. Appels à la relocalisation industrielle se multiplient.",
  },
  {
    id: 'scandaleEglise', nom: 'Nouveau scandale d’abus dans l’Église', poids: 1,
    axe: 'societal', sens: 'gauche', intensite: 5,
    texte: "Des milliers de victimes. La confiance dans les institutions religieuses s’effondre.",
  },
  {
    id: 'guerreGaza', nom: 'Escalade au Proche-Orient', poids: 2,
    axe: 'regalien', sens: 'gauche', intensite: 7,
    texte: "Manifestations pro-palestiniennes massives. Accusations d’antisémitisme et d’islamophobie fusent.",
  },
  {
    id: 'fraudeSociale', nom: 'Scandale de fraude sociale massive', poids: 2,
    axe: 'immigration', sens: 'droite', intensite: 6,
    texte: "Des réseaux organisés détournent des millions. La droite parle de « pillage du système ».",
  },
  {
    id: 'suicideAgriculteur', nom: 'Vague de suicides agricoles', poids: 2,
    axe: 'eco', sens: 'gauche', intensite: 5,
    texte: "Un agriculteur se suicide tous les deux jours. Colère contre la grande distribution et Bruxelles.",
  },
  {
    id: 'cyberAttaque', nom: 'Cyberattaque majeure sur les hôpitaux', poids: 1,
    axe: 'regalien', sens: 'droite', intensite: 7,
    texte: "Des systèmes informatiques critiqués sont paralysés. On parle de guerre hybride.",
  },
  {
    id: 'manifestationWoke', nom: 'Universités bloquées par des militants', poids: 1,
    axe: 'societal', sens: 'droite', intensite: 5,
    texte: "Cours annulés, professeurs menacés. Le débat sur le « wokisme » s’enflamme.",
  },
  {
    id: 'criseNatalite', nom: 'Effondrement de la natalité', poids: 1,
    axe: 'societal', sens: 'droite', intensite: 4,
    texte: "Le pays vieillit à grande vitesse. Certains parlent de « suicide démographique ».",
  },
];

// tirage pondéré — helper pur, ne décide de rien d'autre que "quel événement sort"
export const pickEvenement = () => {
  const total = EVENEMENTS.reduce((sum, e) => sum + e.poids, 0);
  if (total === 0) return null;
  let roll = Math.random() * total;
  for (const e of EVENEMENTS) {
    roll -= e.poids;
    if (roll <= 0) return e;
  }
  return EVENEMENTS[EVENEMENTS.length - 1];
};
