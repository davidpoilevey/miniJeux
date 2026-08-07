// TERRAIN — catalogue statique.
// effets : deltas appliqués au parti qui agit. mediaInfluence est un delta
// numérique appliqué au média choisi (cible: 'media') plutôt qu'un objet fixe.
// effetCible : deltas appliqués au parti visé (cible: 'parti').
// effetCibleMilitantsFacteur : multiplie (au lieu d'additionner) les militants
//         du parti visé — pour un effet du type "perd la moitié de ses troupes".
// effetAlignement : { axe, sens, intensite } — bonus d'estime pour l'acteur,
//         proportionnel à sa propre position sur cet axe (même formule que
//         l'impact d'un événement, voir moteur.js).
// cible : 'aucune' | 'media' | 'parti' — détermine si l'action demande de
//         choisir une cible avant résolution.
// militantsRequis : nombre de militants minimum pour que l'action soit
//         disponible. Purement un facteur d'accès — les militants ne sont
//         jamais consommés par une action, un militant reste disponible pour
//         le tour suivant après une campagne de tractage.
// disponibleAvantElection : n'apparaît que le tour précédant une échéance du
//         calendrier électoral.
// illegale : si true → tirage `risqueExposition` de se faire prendre immédiatement
//            ET dépôt d'une casserole même si ça passe.
export const ACTIONS = [
  // ---- Légales ----
  { id: 'meeting', nom: 'Organiser un meeting', illegale: false, cible: 'aucune',
    cout: { tresorerie: 20 }, militantsRequis: 10,
    effets: { estime: +5, militants: +5 },
    texte: "Un bain de foule pour galvaniser la base." },

  { id: 'tractage', nom: 'Campagne de tractage', illegale: false, cible: 'aucune',
    cout: {}, militantsRequis: 15,
    effets: { estime: +2 },
    texte: "Le porte-à-porte, sans gloire mais efficace." },

  { id: 'interview', nom: 'Interview dans un média', illegale: false, cible: 'media',
    cout: { tresorerie: 5 },
    effets: { estime: +3, mediaInfluence: +10 },
    texte: "Faire passer son message aux heures de grande écoute." },

  { id: 'recrutement', nom: 'Recruter des militants', illegale: false, cible: 'aucune',
    cout: { tresorerie: 15 },
    effets: { militants: +20 },
    texte: "Grossir les rangs pour le travail de terrain." },

  { id: 'renforcerEquipe', nom: 'Renforcer l’équipe de campagne', illegale: false, cible: 'aucune',
    cout: { tresorerie: 100 },
    effets: { actionsBonus: +1 },
    texte: "Stratèges, community managers, avocats à demeure : la campagne peut désormais mener un front de plus, chaque tour, pour de bon (plafond absolu : TUNING.actionsMaxParTour)." },

  // ---- Zone grise / illégales ----
  { id: 'financementOcculte', nom: 'Financement occulte', illegale: true, cible: 'aucune',
    cout: {},
    effets: { tresorerie: +60 },
    risqueExposition: 0.08,
    casserole: { type: 'financement', gravite: 3,
                 titre: 'Financement illégal de campagne' },
    texte: "De l'argent qui ne devrait pas exister. Très pratique." },

  { id: 'intox', nom: 'Planter une intox dans un média', illegale: true, cible: 'aucune',
    cout: { tresorerie: 25 },
    effets: { estime: +8 },     // cible directe pas encore branchée
    risqueExposition: 0.12,
    casserole: { type: 'desinformation', gravite: 2,
                 titre: 'Campagne de désinformation orchestrée' },
    texte: "Une rumeur bien placée vaut mille tracts." },

  { id: 'barbouzerie', nom: 'Barbouzerie sur un rival', illegale: true, cible: 'parti',
    cout: { tresorerie: 40 },
    effets: {},
    effetCible: { estime: -10 },
    risqueExposition: 0.15,
    casserole: { type: 'espionnage', gravite: 4,
                 titre: 'Écoutes et surveillance illégales' },
    texte: "Savoir ce que l'adversaire cache, et s'en servir contre lui." },

  { id: 'denonciation', nom: 'Dénoncer un scandale adverse', illegale: false, cible: 'parti',
    requiertCasseroleCible: true,
    cout: { tresorerie: 15 },
    effets: { estime: +2 },
    exposeCasseroleCible: true,
    texte: "Sortir une affaire du passé pour salir l'adversaire en pleine campagne." },

  // ---- Veille d'élection uniquement ----
  { id: 'trahisonNumero2', nom: 'Trahison du numéro 2', illegale: true, cible: 'parti',
    disponibleAvantElection: true,
    cout: { tresorerie: 30 },
    effets: {},
    effetCibleMilitantsFacteur: 0.5,
    risqueExposition: 0.1,
    casserole: { type: 'trahison', gravite: 3,
                 titre: "Débauchage frauduleux d'un cadre adverse" },
    texte: "Retourner le bras droit d'un rival la veille du vote : sa base s'effondre." },

  { id: 'comingOut', nom: "Coming-out d'un responsable", illegale: false, cible: 'aucune',
    disponibleAvantElection: true,
    cout: { tresorerie: 10 },
    effets: {},
    effetAlignement: { axe: 'societal', sens: 'gauche', intensite: 10 },
    texte: "Un cadre du parti se dévoile en pleine campagne, jouant sur la corde sensible des électeurs progressistes." },
{ id: 'dinerGrandsPatrons', nom: 'Dîner privé avec les grands patrons', illegale: false, cible: 'aucune',
    cout: { tresorerie: 25 },
    effets: { tresorerie: +40, estime: -3 },
    texte: "On parle investissement… et on repart avec un chèque. L’image en prend un coup." },

  { id: 'manifestation', nom: 'Organiser une manifestation de masse', illegale: false, cible: 'aucune',
    cout: { tresorerie: 15 }, militantsRequis: 25,
    effets: { estime: +7, militants: +8 },
    texte: "Remplir les rues, faire du bruit, et espérer que les médias suivent." },

  { id: 'visiteUsine', nom: 'Visite d’usine en combinaison de travail', illegale: false, cible: 'aucune',
    cout: { tresorerie: 8 },
    effets: { estime: +4 },
    texte: "Casque de chantier, photo de face, discours sur « ceux qui produisent ». Classique mais ça marche." },

  { id: 'tribuneLibre', nom: 'Publier une tribune incendiaire', illegale: false, cible: 'aucune',
    cout: { tresorerie: 5 },
    effets: { estime: +4, mediaInfluence: +5 },
    texte: "Un texte long, indigné, partagé 200 000 fois avant même d’être lu." },

  { id: 'formationMilitants', nom: 'Session de formation idéologique', illegale: false, cible: 'aucune',
    cout: { tresorerie: 12 }, militantsRequis: 5,
    effets: { militants: +12, estime: +2 },
    texte: "Transformer des sympathisants en véritables soldats politiques." },

  { id: 'allianceSyndicale', nom: 'Pacte de non-agression avec un gros syndicat', illegale: false, cible: 'aucune',
    cout: { tresorerie: 20 },
    effets: { militants: +15, estime: +3 },
    texte: "On s’engage à ne pas trop les embêter… en échange de leur base." },

  { id: 'operationCharite', nom: 'Grande opération caritative médiatisée', illegale: false, cible: 'aucune',
    cout: { tresorerie: 18 }, militantsRequis: 40,
    effets: { estime: +6 },
    texte: "Distribuer des paniers-repas devant les caméras. L’émotion fait le reste." },

  { id: 'sondageMaison', nom: 'Commander un sondage orienté', illegale: false, cible: 'aucune',
    cout: { tresorerie: 22 },
    effets: { estime: +5, mediaInfluence: +8 },
    texte: "Un institut « indépendant » qui tombe pile sur ce qu’on voulait entendre." },

  { id: 'discoursPatriote', nom: 'Grand discours souverainiste', illegale: false, cible: 'aucune',
    cout: { tresorerie: 10 },
    effets: {},
    effetAlignement: { axe: 'regalien', sens: 'droite', intensite: 8 },
    texte: "Drapeaux, émotion, « on est chez nous ». La base identitaire frémit." },

  { id: 'discoursWoke', nom: 'Grand discours intersectionnel', illegale: false, cible: 'aucune',
    cout: { tresorerie: 10 },
    effets: {},
    effetAlignement: { axe: 'societal', sens: 'gauche', intensite: 8 },
    texte: "Privilèges, oppressions systémiques, micro-agressions… Le public progressiste est en pâmoison." },
    { id: 'achatVotes', nom: 'Achat de votes dans les quartiers sensibles', illegale: true, cible: 'aucune',
    cout: { tresorerie: 45 },
    effets: { estime: +6 },
    risqueExposition: 0.18,
    casserole: { type: 'fraudeElectorale', gravite: 5,
                 titre: 'Achat de voix organisé' },
    texte: "Des enveloppes, des promesses, et des urnes qui se remplissent correctement." },

  { id: 'fakeNewsIA', nom: 'Lancer une deepfake sur un rival', illegale: true, cible: 'parti',
    cout: { tresorerie: 35 },
    effets: {},
    effetCible: { estime: -12 },
    risqueExposition: 0.14,
    casserole: { type: 'desinformation', gravite: 4,
                 titre: 'Diffusion de deepfake à des fins électorales' },
    texte: "Une vidéo ultra-réaliste qui tourne en boucle avant que quiconque puisse la démentir." },

  { id: 'pressionJournaliste', nom: 'Faire pression sur un journaliste gênant', illegale: true, cible: 'media',
    cout: { tresorerie: 20 },
    effets: { mediaInfluence: +15 },
    risqueExposition: 0.11,
    casserole: { type: ' intimidation', gravite: 3,
                 titre: 'Tentative d’intimidation de la presse' },
    texte: "Un petit rappel sur le passé du journaliste… et l’article disparaît." },

  { id: 'detournementSubvention', nom: 'Détournement de subventions associatives', illegale: true, cible: 'aucune',
    cout: {},
    effets: { tresorerie: +50 },
    risqueExposition: 0.09,
    casserole: { type: 'financement', gravite: 4,
                 titre: 'Détournement de fonds publics' },
    texte: "L’asso est censée aider les jeunes… elle aide surtout la campagne." },

  { id: 'infiltrationAdverse', nom: 'Infiltrer le QG d’un rival', illegale: true, cible: 'parti',
    cout: { tresorerie: 30 }, militantsRequis: 5,
    effets: {},
    effetCible: { estime: -6, militants: -10 },
    risqueExposition: 0.16,
    casserole: { type: 'espionnage', gravite: 4,
                 titre: 'Infiltration et vol de documents stratégiques' },
    texte: "Un « militant » un peu trop zélé ramène des documents très intéressants." },

  { id: 'scandaleSexe', nom: 'Monter un scandale sexuel sur un adversaire', illegale: true, cible: 'parti',
    cout: { tresorerie: 40 },
    effets: {},
    effetCible: { estime: -15 },
    risqueExposition: 0.13,
    casserole: { type: 'calomnie', gravite: 4,
                 titre: 'Diffamation et montage de scandale sexuel' },
    texte: "Une accusation bien calibrée, des captures d’écran, et c’est le chaos." },

  { id: 'corruptionEluLocal', nom: 'Acheter un élu local influent', illegale: true, cible: 'aucune',
    cout: { tresorerie: 35 },
    effets: { militants: +18, estime: +3 },
    risqueExposition: 0.10,
    casserole: { type: 'corruption', gravite: 3,
                 titre: 'Corruption d’élu local' },
    texte: "Il change de camp… avec un carnet d’adresses très fourni." },

  { id: 'cyberAttaqueQG', nom: 'Cyberattaque « anonyme » sur un QG adverse', illegale: true, cible: 'parti',
    cout: { tresorerie: 28 },
    effets: {},
    effetCibleMilitantsFacteur: 0.7,
    risqueExposition: 0.17,
    casserole: { type: 'cybercriminalite', gravite: 5,
                 titre: 'Cyberattaque d’origine politique' },
    texte: "Les fichiers militants disparaissent. Quelle malchance…" },

  { id: 'fausseSondage', nom: 'Publier un faux sondage catastrophique pour un rival', illegale: true, cible: 'parti',
    cout: { tresorerie: 18 },
    effets: {},
    effetCible: { estime: -8 },
    risqueExposition: 0.12,
    casserole: { type: 'desinformation', gravite: 3,
                 titre: 'Publication de sondages falsifiés' },
    texte: "« Selon un institut confidentiel… » et la machine à panique se met en route." },

  { id: 'menaceAnonyme', nom: 'Campagne de menaces anonymes contre un cadre adverse', illegale: true, cible: 'parti',
    cout: { tresorerie: 15 },
    effets: {},
    effetCible: { estime: -7, militants: -8 },
    risqueExposition: 0.14,
    casserole: { type: 'intimidation', gravite: 4,
                 titre: 'Campagne de harcèlement et menaces' },
    texte: "Des messages, des appels, des photos… Il finit par se mettre en retrait." }
  ]
;

// Forme d'une casserole déposée dans parti.casseroles
// (créée par la méca au moment de l'action ; forme = terrain)
export function creerCasserole({ type, gravite, titre, tourCreation }) {
  return {
    type, gravite, titre,
    tourCreation,
    exposee: false,   // devient true quand exhumée → déclenche un scandale
  };
}
