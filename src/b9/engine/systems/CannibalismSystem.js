/**
 * CannibalismSystem - Gère le cannibalisme (consommation de cadavres/faibles)
 * 
 * Mécanisme:
 * - Cherche des voisins de faible énergie (<30% du max)
 * - Ne se déclenche QUE si le cannibale est lui-même affamé (<50% énergie)
 * - Consomme progressivement l'énergie de la victime
 * - La victime meurt quand son énergie atteint 0
 */

export class CannibalismSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  /**
   * Mise à jour du système
   * @param {number} deltaTime
   */
  update(deltaTime) {
    const cannibals = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Metabolism',
      'Cannibalism'
    ]);

    let feedingEvents = 0;
    let energyTransferred = 0;
    const victims = new Set();

    for (const cannibalId of cannibals) {
      const cannibalPos = this.entityManager.getComponent(cannibalId, 'Position');
      const cannibalMeta = this.entityManager.getComponent(cannibalId, 'Metabolism');
      const cannibalism = this.entityManager.getComponent(cannibalId, 'Cannibalism');

      // Le cannibalisme ne se déclenche QUE si affamé
      const hungerThreshold = cannibalMeta.maxEnergyStored * 0.5; // 50% d'une capacité de 200
      if (cannibalMeta.energyStored > hungerThreshold) {
        continue; // Pas assez affamé
      }

      // Chercher des voisins faibles
      const neighbors = this.world.getNeighbors(cannibalPos.x, cannibalPos.y);

      for (const neighbor of neighbors) {
        if (!neighbor.entity || neighbor.entity === cannibalId) continue;

        const victimMeta = this.entityManager.getComponent(neighbor.entity, 'Metabolism');
        if (!victimMeta) continue;
if (victimMeta.isDormant) continue; 
        // La victime doit être faible (<30% énergie)
        const weaknessThreshold = victimMeta.maxEnergyStored * 0.3; // 30% d'une capacité de 200
        if (victimMeta.energyStored > weaknessThreshold) continue;

        // Vérifier si la victime a une immunité
        const victimImmunity = this.entityManager.getComponent(neighbor.entity, 'Immunity');
        let immunityResistance = 0;
        if (victimImmunity) {
          immunityResistance = victimImmunity.defense * 0.1; // 0-1.0 de résistance
        }

        // Drainage d'énergie
        const drainAmount = cannibalism.consumptionRate * (1.0 - immunityResistance);
        const actualDrain = Math.min(victimMeta.energyStored, drainAmount);

        victimMeta.energyStored -= actualDrain;
        cannibalMeta.energyStored += actualDrain * 0.5; // 80% d'efficacité

        energyTransferred += actualDrain;
        feedingEvents++;
        victims.add(neighbor.entity);

        // Une seule victime par tick pour éviter la gourmandise
        break;
      }
    }

    // Tuer les victimes épuisées
    const deaths = [];
    for (const victimId of victims) {
      const victimMeta = this.entityManager.getComponent(victimId, 'Metabolism');
      if (victimMeta && victimMeta.energyStored <= 0) {
        deaths.push(victimId);
      }
    }

    // Retirer les cadavres
    for (const victimId of deaths) {
      const position = this.entityManager.getComponent(victimId, 'Position');
      if (position) {
        this.world.removeEntity(position.x, position.y);
      }
      this.entityManager.destroyEntity(victimId);
    }

    return {
      cannibals: cannibals.length,
      feedingEvents,
      energyTransferred: energyTransferred.toFixed(2),
      deaths: deaths.length
    };
  }
}