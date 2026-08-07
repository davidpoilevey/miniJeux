// TERRAIN — forme de l'entité. Les VALEURS de départ sont du contenu ci-dessous.
// Une fonction factory pure est OK (pas de décision, juste de la construction).
export function creerParti({ id, nom, couleur, positions, estJoueur = false }) {
  return {
    id,
    nom,
    couleur,                 // pour les pastilles MUI / graphes simples
    estJoueur,               // true = c'est Dave
    positions,               // { eco, societal, regalien, ecolo, europe } chacun -100..100

    // Ressources
    tresorerie: 0,           // argent légal disponible
    estime: 50,              // capital de sympathie populaire 0..100
    militants: 0,            // force de terrain (meetings, tractage)
    mediaInfluence: {},      // { [mediaId]: 0..100 } emprise sur chaque média
    demagogie: 0,            // cumul des votes de lois qui trahissent ses propres positions
    actionsBonus: 0,         // actions/tour en plus du socle TUNING.actionsParTour (voir renforcerEquipe)

    // Le "casier"
    casseroles: [],          // liste de Casserole (voir actions.js)

    // Historique (rempli par la résolution — pas ici)
    historique: [],          // log d'événements lisibles par le joueur
  };
}

// TERRAIN — contenu, 100% ajustable
export const PARTIS_INITIAUX = [
  { id: 'unite',    nom: "Rassemblement pour l'Unité", couleur: '#1565C0',
    positions: { eco: 30, societal: 40, regalien: 45, ecolo: -10, europe: 60 } },
  { id: 'avenir',   nom: 'Avenir Écologiste',          couleur: '#2E7D32',
    positions: { eco: -40, societal: -50, regalien: -30, ecolo: 80, europe: 40 } },
  { id: 'peuple',   nom: 'La Voix du Peuple',           couleur: '#C62828',
    positions: { eco: -70, societal: -60, regalien: -20, ecolo: 30, europe: -20 } },
  { id: 'ordre',    nom: "Front de l'Ordre National",   couleur: '#4E342E',
    positions: { eco: 20, societal: 70, regalien: 85, ecolo: -40, europe: -70 } },
  { id: 'centre',   nom: 'Alliance Centriste',          couleur: '#F9A825',
    positions: { eco: 10, societal: 0, regalien: 10, ecolo: 10, europe: 50 } },
    { id: 'revol',    nom: "Front Révolutionnaire Permanent", couleur: '#B71C1C',
    positions: { eco: -95, societal: -90, immigration: -80, ecolo: 40, regalien: 70 } },
  { id: 'nation',   nom: "Ligue de la Pureté Nationale",    couleur: '#1A237E',
    positions: { eco: 40, societal: 95, immigration: 100, ecolo: -70, regalien: -90 } },
  { id: 'liberte',  nom: "Parti de la Liberté Absolue",     couleur: '#FF6F00',
    positions: { eco: 90, societal: -80, immigration: -40, ecolo: -50, regalien: 85 } },
  { id: 'gaia',     nom: "Croisade pour Gaïa",              couleur: '#1B5E20',
    positions: { eco: -60, societal: -70, immigration: -30, ecolo: 100, regalien: 30 } },
  { id: 'techno',   nom: "Alliance Transhumaniste",         couleur: '#6A1B9A',
    positions: { eco: 70, societal: -95, immigration: -60, ecolo: -20, regalien: 50 } }
];
