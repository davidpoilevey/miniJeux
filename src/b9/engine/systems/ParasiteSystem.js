// Nouveau fichier: /src/engine/systems/ParasiteSystem.js

/**
 * ParasiteSystem - Drainage énergétique des vivants
 * 
 * Différence avec Cannibalism:
 * - Cible N'IMPORTE QUI (pas seulement les faibles)
 * - Maintient la proie EN VIE (drainage modéré)
 * - Relation durable parasite-hôte
 */

export class ParasiteSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  update(deltaTime) {
    const parasites = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Metabolism',
      'Parasite'
    ]);

    let feedingEvents = 0;
    let energyDrained = 0;

    for (const parasiteId of parasites) {
      const parasitePos = this.entityManager.getComponent(parasiteId, 'Position');
      const parasiteMeta = this.entityManager.getComponent(parasiteId, 'Metabolism');
      const parasite = this.entityManager.getComponent(parasiteId, 'Parasite');

      // Chercher des hôtes adjacents
      const neighbors = this.world.getNeighbors(parasitePos.x, parasitePos.y);

      for (const neighbor of neighbors) {
        if (!neighbor.entity || neighbor.entity === parasiteId) continue;

        const hostMeta = this.entityManager.getComponent(neighbor.entity, 'Metabolism');
        if (!hostMeta) continue;

        // Cible : N'IMPORTE QUI avec énergie > 10 (garde l'hôte vivant)
        if (hostMeta.energyStored <= 10) continue;
if (hostMeta.isDormant) continue; 
        // Immunité réduit le drainage
        const hostImmunity = this.entityManager.getComponent(neighbor.entity, 'Immunity');
        let immunityResistance = 0;
        if (hostImmunity) {
          immunityResistance = Math.min(0.8, hostImmunity.defense * 0.08); // Max 80%
        }

        // Drainage modéré (garde l'hôte vivant)
        const drainAmount = parasite.drainRate * (1.0 - immunityResistance);
        const actualDrain = Math.min(hostMeta.energyStored - 10, drainAmount); // Garde 10E à l'hôte

        if (actualDrain <= 0) continue;

        hostMeta.energyStored -= actualDrain;
        parasiteMeta.energyStored += actualDrain * 0.9; // 90% efficacité (meilleur que Cannibalism)

        energyDrained += actualDrain;
        feedingEvents++;

        // Un seul hôte par tick (relation stable)
        break;
      }
    }

    return {
      parasites: parasites.length,
      feedingEvents,
      energyDrained: energyDrained.toFixed(2)
    };
  }
}