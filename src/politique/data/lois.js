// TERRAIN — catalogue de lois soumises au vote chaque tour (obligatoire).
// axes : liste de { axe, sens, intensite } — une loi peut toucher plusieurs
// axes à la fois. Voter POUR aligne sur ces pôles, CONTRE aligne sur les
// pôles opposés — l'effet sur l'estime du VOTANT dépend de sa cohérence avec
// sa propre position (voir moteur.js : resoudreVoteLoi).
// impactPopulaire : { pour, contre } — effet immédiat sur l'estime, direct et
// indépendant de l'idéologie (ex : un plan d'éoliennes reste impopulaire
// localement même pour un parti sincèrement écolo).
export const LOIS = [
  // === Originaux ===
  {
    id: 'eoliennes', nom: "Plan national d'éoliennes", poids: 3,
    axes: [{ axe: 'ecolo', sens: 'droite', intensite: 8 }],
    impactPopulaire: { pour: -6, contre: +2 },
    texte: "Un grand plan d'éoliennes terrestres, contesté pour son impact sur le paysage.",
  },
  {
    id: 'baisseImpots', nom: "Baisse d'impôts pour les entreprises", poids: 3,
    axes: [{ axe: 'eco', sens: 'droite', intensite: 7 }],
    impactPopulaire: { pour: +3, contre: -1 },
    texte: "Alléger la fiscalité des entreprises pour stimuler l'investissement.",
  },
  {
    id: 'droitsFamiliaux', nom: "Extension des droits familiaux", poids: 2,
    axes: [{ axe: 'societal', sens: 'gauche', intensite: 6 }],
    impactPopulaire: { pour: +2, contre: -2 },
    texte: "Élargir l'accès à certains droits familiaux.",
  },
  {
    id: 'quotasImmigration', nom: "Quotas d'immigration par métier", poids: 2,
    axes: [{ axe: 'immigration', sens: 'droite', intensite: 6 }],
    impactPopulaire: { pour: +4, contre: -2 },
    texte: "Conditionner l'immigration de travail à des quotas sectoriels.",
  },
  {
    id: 'referendumEurope', nom: "Référendum sur un traité européen", poids: 2,
    axes: [{ axe: 'regalien', sens: 'gauche', intensite: 7 }],
    impactPopulaire: { pour: +1, contre: 0 },
    texte: "Soumettre au vote populaire un nouveau traité européen.",
  },
  {
    id: 'surveillanceNumerique', nom: "Loi de surveillance numérique", poids: 2,
    axes: [
      { axe: 'regalien', sens: 'droite', intensite: 5 },
      { axe: 'societal', sens: 'droite', intensite: 3 },
    ],
    impactPopulaire: { pour: +3, contre: -1 },
    texte: "Renforcer la surveillance des communications au nom de la sécurité.",
  },
  {
    id: 'simplificationAdmin', nom: "Simplification administrative", poids: 1,
    axes: [{ axe: 'eco', sens: 'droite', intensite: 2 }],
    impactPopulaire: { pour: +1, contre: -1 },
    texte: "Un texte technique, anecdotique mais consensuel.",
  },

  // === Nouvelles lois (version sans filtre) ===
  {
    id: 'interdictionVoituresThermiques', nom: "Interdiction totale des voitures thermiques d'ici 2030", poids: 3,
    axes: [
      { axe: 'ecolo', sens: 'gauche', intensite: 9 },
      { axe: 'eco', sens: 'gauche', intensite: 4 },
    ],
    impactPopulaire: { pour: -8, contre: +5 },
    texte: "Fin pure et simple du moteur thermique. Les constructeurs et les classes populaires hurlent.",
  },
  {
    id: 'nationalisationEnergie', nom: "Nationalisation complète du secteur de l'énergie", poids: 3,
    axes: [
      { axe: 'eco', sens: 'gauche', intensite: 9 },
      { axe: 'regalien', sens: 'droite', intensite: 4 },
    ],
    impactPopulaire: { pour: +4, contre: -3 },
    texte: "L'État reprend le contrôle total d'EDF, Total et des renewables. Les marchés s'effondrent.",
  },
  {
    id: 'expulsionFacile', nom: "Expulsion administrative sans recours judiciaire", poids: 3,
    axes: [
      { axe: 'immigration', sens: 'droite', intensite: 9 },
      { axe: 'societal', sens: 'droite', intensite: 5 },
    ],
    impactPopulaire: { pour: +6, contre: -7 },
    texte: "Le préfet peut expulser en 48h. Les associations parlent de « fascisme administratif ».",
  },
  {
    id: 'mariagePoly', nom: "Légalisation du mariage polyamoureux", poids: 2,
    axes: [{ axe: 'societal', sens: 'gauche', intensite: 8 }],
    impactPopulaire: { pour: -4, contre: +3 },
    texte: "Reconnaissance officielle des unions à plus de deux personnes. Le pays se déchire.",
  },
  {
    id: 'interdictionHijab', nom: "Interdiction totale du voile dans l'espace public", poids: 3,
    axes: [
      { axe: 'societal', sens: 'droite', intensite: 8 },
      { axe: 'immigration', sens: 'droite', intensite: 6 },
    ],
    impactPopulaire: { pour: +5, contre: -8 },
    texte: "Plus aucun signe religieux visible dans la rue. Manifestations monstrueuses en perspective.",
  },
  {
    id: 'revenuUniversel', nom: "Revenu universel de base à 1200€", poids: 3,
    axes: [
      { axe: 'eco', sens: 'gauche', intensite: 9 },
      { axe: 'societal', sens: 'gauche', intensite: 4 },
    ],
    impactPopulaire: { pour: +7, contre: -4 },
    texte: "Chaque adulte touche 1200€ sans condition. Les libéraux crient à la fin du travail.",
  },
  {
    id: 'serviceMilitaire', nom: "Rétablissement du service militaire obligatoire", poids: 2,
    axes: [
      { axe: 'regalien', sens: 'droite', intensite: 7 },
      { axe: 'societal', sens: 'droite', intensite: 5 },
    ],
    impactPopulaire: { pour: +3, contre: -4 },
    texte: "Tous les jeunes de 18 ans font 8 mois sous les drapeaux. Les pacifistes s'étranglent.",
  },
  {
    id: 'taxeFortune', nom: "Rétablissement d'un ISF ultra-renforcé", poids: 3,
    axes: [{ axe: 'eco', sens: 'gauche', intensite: 8 }],
    impactPopulaire: { pour: +5, contre: -6 },
    texte: "Taxe sur le patrimoine à partir de 800 000€. Les riches menacent de partir.",
  },
  {
    id: 'interdictionAvortement', nom: "Restriction sévère du droit à l'avortement", poids: 2,
    axes: [{ axe: 'societal', sens: 'droite', intensite: 9 }],
    impactPopulaire: { pour: -7, contre: +6 },
    texte: "Avortement limité aux cas médicaux et aux 6 premières semaines. Manifestations géantes.",
  },
  {
    id: 'ouvertureFrontieres', nom: "Régularisation massive et ouverture des frontières", poids: 3,
    axes: [
      { axe: 'immigration', sens: 'gauche', intensite: 9 },
      { axe: 'regalien', sens: 'gauche', intensite: 5 },
    ],
    impactPopulaire: { pour: -6, contre: +4 },
    texte: "Tous les sans-papiers présents depuis plus d'un an sont régularisés. La droite parle d'invasion.",
  },
  {
    id: 'peineMort', nom: "Rétablissement de la peine de mort pour terrorisme", poids: 2,
    axes: [
      { axe: 'societal', sens: 'droite', intensite: 9 },
      { axe: 'regalien', sens: 'droite', intensite: 6 },
    ],
    impactPopulaire: { pour: +4, contre: -9 },
    texte: "La guillotine revient pour les attentats. L'Europe menace de sanctions.",
  },
  {
    id: 'interdictionChasse', nom: "Interdiction totale de la chasse", poids: 2,
    axes: [
      { axe: 'ecolo', sens: 'gauche', intensite: 7 },
      { axe: 'societal', sens: 'gauche', intensite: 3 },
    ],
    impactPopulaire: { pour: -5, contre: +3 },
    texte: "Plus aucune chasse sur le territoire. Les ruraux descendent dans la rue.",
  },
  {
    id: 'privatisationSecu', nom: "Privatisation progressive de la Sécurité sociale", poids: 3,
    axes: [{ axe: 'eco', sens: 'droite', intensite: 8 }],
    impactPopulaire: { pour: -4, contre: +2 },
    texte: "La Sécu devient un système d'assurances privées concurrentielles. Les syndicats parlent de crime.",
  },
  {
    id: 'interdictionViande', nom: "Taxe punitive sur la viande et objectif de réduction de 70%", poids: 2,
    axes: [
      { axe: 'ecolo', sens: 'gauche', intensite: 8 },
      { axe: 'eco', sens: 'gauche', intensite: 3 },
    ],
    impactPopulaire: { pour: -7, contre: +4 },
    texte: "La viande devient un luxe. Les éleveurs et les classes populaires sont furieux.",
  },
  {
    id: 'controleParental', nom: "Contrôle parental obligatoire sur tous les écrans", poids: 1,
    axes: [{ axe: 'societal', sens: 'droite', intensite: 5 }],
    impactPopulaire: { pour: +2, contre: -1 },
    texte: "Les parents doivent valider chaque application et site. Les ados et les libéraux protestent.",
  },
  {
    id: 'sortieEuro', nom: "Référendum sur la sortie de l'euro", poids: 3,
    axes: [
      { axe: 'regalien', sens: 'droite', intensite: 9 },
      { axe: 'eco', sens: 'droite', intensite: 6 },
    ],
    impactPopulaire: { pour: +3, contre: -5 },
    texte: "Le peuple décide s'il reste dans la monnaie unique. Les marchés paniquent déjà.",
  },
  {
    id: 'discriminationPositive', nom: "Quotas ethniques obligatoires dans la fonction publique", poids: 2,
    axes: [
      { axe: 'societal', sens: 'gauche', intensite: 7 },
      { axe: 'immigration', sens: 'gauche', intensite: 4 },
    ],
    impactPopulaire: { pour: -5, contre: +3 },
    texte: "30% de postes réservés selon l'origine. Accusations de racisme d'État inversé.",
  },
  {
    id: 'loiSeparatisme', nom: "Loi anti-séparatisme ultra-renforcée", poids: 2,
    axes: [
      { axe: 'immigration', sens: 'droite', intensite: 7 },
      { axe: 'societal', sens: 'droite', intensite: 6 },
    ],
    impactPopulaire: { pour: +5, contre: -4 },
    texte: "Fermeture administrative des mosquées et associations soupçonnées en 72h.",
  },
  {
    id: 'interdictionPublicite', nom: "Interdiction de toute publicité commerciale dans l'espace public", poids: 1,
    axes: [
      { axe: 'ecolo', sens: 'gauche', intensite: 4 },
      { axe: 'eco', sens: 'gauche', intensite: 3 },
    ],
    impactPopulaire: { pour: +1, contre: -2 },
    texte: "Plus d'affichage publicitaire. Les publicitaires et les maires crient à la censure.",
  },
  {
    id: 'euthanasieLibre', nom: "Euthanasie libre dès 18 ans sans condition médicale", poids: 2,
    axes: [{ axe: 'societal', sens: 'gauche', intensite: 8 }],
    impactPopulaire: { pour: -3, contre: +4 },
    texte: "Toute personne majeure peut demander à mourir. Les religieux et une partie de la gauche s'étranglent.",
  },
  {
    id: 'protectionnismeTotal', nom: "Droits de douane de 40% sur tout produit hors UE", poids: 3,
    axes: [
      { axe: 'regalien', sens: 'droite', intensite: 8 },
      { axe: 'eco', sens: 'gauche', intensite: 5 },
    ],
    impactPopulaire: { pour: +4, contre: -3 },
    texte: "Le protectionnisme assumé. L'OMC et les libéraux menacent de représailles.",
  },
];
// tire N lois distinctes, pondérées, sans remise, pour le tour en cours.
export const piocherLois = (n) => {
  const pool = [...LOIS];
  const tirees = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const total = pool.reduce((s, l) => s + l.poids, 0);
    let roll = Math.random() * total;
    let idx = 0;
    for (; idx < pool.length; idx++) {
      roll -= pool[idx].poids;
      if (roll <= 0) break;
    }
    tirees.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return tirees;
};
