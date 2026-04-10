/**
 * Decision — état décisionnel d'une entité individuelle
 *
 * Mis à jour à chaque tick par DecisionSystem.
 * Consommé par MovementSystem pour le déplacement et les actions.
 *
 * intent : 'eat' | 'hunt' | 'mate' | 'flee' | 'wander'
 */
export class Decision {
  constructor() {
    this.targetPos  = null;     // { x, y } — position cible courante
    this.targetId   = null;     // entityId cible (FoodSource, proie, partenaire)
    this.intent     = 'wander';
    this.matingNeed = 0;        // 0–100 : désir de reproduction
  }
}
