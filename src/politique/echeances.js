import { CALENDRIER, TYPES_ECHEANCE } from './data/calendrier';

export const nomEcheance = (type) => TYPES_ECHEANCE[type]?.nom || type;

export const echeanceAuTour = (tour) => CALENDRIER.find((e) => e.tour === tour) || null;

// "le tour d'avant l'élection" : le tour en cours est-il celui juste avant une échéance ?
export const estVeilleElection = (tour) => CALENDRIER.some((e) => e.tour === tour + 1);

export const prochaineEcheance = (tour) =>
  CALENDRIER.filter((e) => e.tour >= tour).sort((a, b) => a.tour - b.tour)[0] || null;
