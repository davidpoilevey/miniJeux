// Nouveau fichier: /src/engine/systems/SymbiosisSystem.js

/**
 * SymbiosisSystem - Partage d'énergie mutuellement bénéfique
 * 
 * Mécanisme:
 * - Détecte un partenaire (première rencontre)
 * - Stocke son speciesIdentity
 * - Partage d'énergie entre symbiotes
 * - Bonus défensif mutuel
 */

export class SymbiosisSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  update(deltaTime) {
    const symbiotes = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Genome',
      'Metabolism',
      'Symbiosis'
    ]);

    let partnerships = 0;
    let energyShared = 0;

    for (const symbioteId of symbiotes) {
      const position = this.entityManager.getComponent(symbioteId, 'Position');
      const genome = this.entityManager.getComponent(symbioteId, 'Genome');
      const metabolism = this.entityManager.getComponent(symbioteId, 'Metabolism');
      const symbiosis = this.entityManager.getComponent(symbioteId, 'Symbiosis');

      const mySpeciesId = genome.handler.readFloat('speciesIdentity');

      // Chercher des partenaires
      const neighbors = this.world.getNeighbors(position.x, position.y);

      for (const neighbor of neighbors) {
        if (!neighbor.entity || neighbor.entity === symbioteId) continue;

        const partnerGenome = this.entityManager.getComponent(neighbor.entity, 'Genome');
        const partnerMeta = this.entityManager.getComponent(neighbor.entity, 'Metabolism');
        const partnerSymbiosis = this.entityManager.getComponent(neighbor.entity, 'Symbiosis');

        if (!partnerGenome || !partnerMeta) continue;

        const partnerSpeciesId = partnerGenome.handler.readFloat('speciesIdentity');

        // Établir partenariat si pas encore défini
        if (symbiosis.acceptedPartners.length === 0) {
          symbiosis.acceptedPartners.push(partnerSpeciesId);
        }

        // Vérifier compatibilité
        const isCompatible = symbiosis.acceptedPartners.some(
          partnerId => Math.abs(partnerId - partnerSpeciesId) < 0.2
        );

        if (!isCompatible) continue;

        // Partage d'énergie : rééquilibrage
        const energyDiff = metabolism.energyStored - partnerMeta.energyStored;
        
        if (Math.abs(energyDiff) > 5) {
          const shareAmount = energyDiff * symbiosis.shareRate * 0.5; // 50% du diff × shareRate
          
          metabolism.energyStored -= shareAmount;
          partnerMeta.energyStored += shareAmount;
          
          energyShared += Math.abs(shareAmount);
          partnerships++;
        }

        // Bonus : Si partenaire a aussi Symbiosis, bonus défensif mutuel
        if (partnerSymbiosis) {
          // Les deux gagnent temporairement en défense (simulé par léger boost d'énergie)
          const mutualBonus = 0.1;
          metabolism.energyStored += mutualBonus;
          partnerMeta.energyStored += mutualBonus;
        }

        break; // Un partenaire par tick
      }
    }

    return {
      symbiotes: symbiotes.length,
      partnerships,
      energyShared: energyShared.toFixed(2)
    };
  }
}