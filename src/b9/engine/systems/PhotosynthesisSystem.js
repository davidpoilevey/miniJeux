/**
 * PhotosynthesisSystem - Gère la production d'énergie par photosynthèse
 * 
 * Mécanisme:
 * - Produit de l'énergie depuis la lumière (cycle jour/nuit)
 * - Efficacité variable selon le génome
 * - Bonus si proche de la surface (haut de la grille)
 */

export class PhotosynthesisSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  /**
   * Mise à jour du système
   * @param {number} deltaTime - Temps écoulé depuis le dernier tick (ms)
   */
  update(deltaTime) {
    const entities = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Metabolism',
      'Photosynthesis'
    ]);

    let totalProduced = 0;

    for (const entityId of entities) {
      const position = this.entityManager.getComponent(entityId, 'Position');
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
      const photosynthesis = this.entityManager.getComponent(entityId, 'Photosynthesis');

      // Intensité lumineuse basée sur le cycle jour/nuit
      const dayNightRatio = this.world.getDayNightRatio();
      let lightIntensity = Math.max(0.1, dayNightRatio); // Minimum 10% la nuit

// ÉVÉNEMENT : Gouffre central réduit lumière
if (this.world.centralVoid?.active) {
  const dx = position.x - this.world.centralVoid.centerX;
  const dy = position.y - this.world.centralVoid.centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < this.world.centralVoid.radius) {
    const voidPenalty = 1 - (distance / this.world.centralVoid.radius); // 1 au centre, 0 aux bords
    lightIntensity *= (0.2 + voidPenalty * 0.3); // 20-50% lumière
  }
}

// ÉVÉNEMENT : Gradient lumière horizontal
if (this.world.lightGradient?.active) {
  const ratio = position.x / this.world.width;
  lightIntensity *= (2.0 - ratio * 1.8); // Ouest bright, Est dark
}
      // Bonus de position : plus on est en "haut" (y faible), plus c'est efficace
      // Simule l'accès à la lumière en surface
      const surfaceBonus = 1.0 + (0.5 * (1.0 - position.y / this.world.height));

      // Production d'énergie
      const baseProduction = 0.6; // Production de base par tick
      let energyProduced = 
        baseProduction * 
        photosynthesis.efficiency * 
        lightIntensity * 
        surfaceBonus;
      
      // Bonus MetabolicBoost si présent
      const hasMetabolicBoost = this.entityManager.hasComponent(entityId, 'MetabolicBoost');
      if (hasMetabolicBoost) {
        const boost = this.entityManager.getComponent(entityId, 'MetabolicBoost');
        energyProduced *= (1.0 + boost.photosynthesisBonus); // +30% à +70%
      }
      // Dans PhotosynthesisSystem, ajouter détection d'ombre

// Vérifier si cellule au-dessus a CarbonatePipe
const abovePos = this.world.wrap(position.x, position.y - 2);
const aboveEntity = this.world.getEntity(abovePos.x, abovePos.y);
let shadeFactor = 1.0;

if (aboveEntity) {
  const hasCarbonatePipe = this.entityManager.hasComponent(aboveEntity, 'CarbonatePipe');
  if (hasCarbonatePipe) {
    shadeFactor = 0.3; // -70% production si sous structure
  }
}

energyProduced *= shadeFactor;

      metabolism.energyStored += energyProduced;
      totalProduced += energyProduced;

      // Limiter le stockage si pas de EnergyStorage
      const hasStorage = this.entityManager.hasComponent(entityId, 'EnergyStorage');
      if (!hasStorage) {
        metabolism.energyStored = Math.min(metabolism.maxEnergyStored, metabolism.energyStored);
      } else {
        const storage = this.entityManager.getComponent(entityId, 'EnergyStorage');
        metabolism.energyStored = Math.min(storage.maxCapacity, metabolism.energyStored);
      }
    }

    return {
      photosynthesizers: entities.length,
      totalProduced: totalProduced.toFixed(2)
    };
  }
}