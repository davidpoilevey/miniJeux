// Besoins d'un organisme mobile (0-100).
// action    : besoin dominant → 'seekFood' | 'seekWater' | 'seekMate' | 'explore'
// targetX/Y : cellule cible issue de la dernière évaluation
export default function Needs(startX = 0, startY = 0) {
  return {
    hunger:         20,
    thirst:         20,
    mating:         20,  // monte progressivement ; à 70 → priorité sur l'exploration
    explorationUrge: 40,
    action:         'explore',
    targetX:        startX,
    targetY:        startY,
  };
}
