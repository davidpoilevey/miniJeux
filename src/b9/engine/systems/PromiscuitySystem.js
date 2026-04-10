/**
 * PromiscuitySystem - Gère la tolérance à la densité et l'espace personnel
 * 
 * Mécanismes:
 * - Compte le nombre de voisins immédiats
 * - Si trop de voisins et faible tolérance → stress énergétique
 * - Si haute tolérance → aucun effet (bénéfice en zone dense)
 * - Interaction avec Adhesion (adhésion réduit le stress)
 * 
 * Évolution attendue:
 * - En zones denses : sélection pour haute promiscuityTolerance
 * - En zones clairsemées : tolérance n'importe pas
 * - Avec Adhesion : promiscuity négligeable (volontairement collés)
 */

export class PromiscuitySystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  /**
   * Mise à jour du système
   * @param {number} deltaTime
   */
  update(deltaTime) {
    const entities = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Genome',
      'Metabolism'
    ]);

  let xenophobiaEvents = 0;
    let stressedBacteria = 0;
    let totalStressCost = 0;

    for (const entityId of entities) {
      const position = this.entityManager.getComponent(entityId, 'Position');
      const genome = this.entityManager.getComponent(entityId, 'Genome');
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');


      // Lire la tolérance à la promiscuité depuis le génome
      const promiscuityTolerance = genome.handler.readFloat('promiscuityTolerance');

    const mySpeciesId = genome.handler.readFloat('speciesIdentity');
    const xenophobia = genome.handler.readFloat('xenophobia'); // 0.0-1.0
    
    // Compter les voisins ET identifier les aliens
    const neighbors = this.world.getNeighbors(position.x, position.y);
    let sameSpeciesCount = 0;
    let alienSpeciesCount = 0;
    const aliens = []; // Stocker les aliens pour réaction

    for (const neighbor of neighbors) {
      if (neighbor.entity === null) continue;
      
      const neighborGenome = this.entityManager.getComponent(neighbor.entity, 'Genome');
      if (!neighborGenome) continue;
      
      const neighborSpeciesId = neighborGenome.handler.readFloat('speciesIdentity');
      const speciesDifference = Math.abs(mySpeciesId - neighborSpeciesId);
      
      // Seuil de différence : >0.2 = espèce différente
      if (speciesDifference > 0.2) {
        alienSpeciesCount++;
        aliens.push(neighbor);
      } else {
        sameSpeciesCount++;
      }
    }

    // Vérifier Adhesion (volontairement collé)
    const hasAdhesion = this.entityManager.hasComponent(entityId, 'Adhesion');
    
    // STRESS DE PROMISCUITÉ (même espèce)
    if (!hasAdhesion) {
      const stressThreshold = 2 + Math.floor(promiscuityTolerance * 6);
      if (sameSpeciesCount >= stressThreshold) {
        const overcrowding = sameSpeciesCount - stressThreshold;
        const stressFactor = (1.0 - promiscuityTolerance);
        const stressCost = overcrowding * stressFactor * 3.0; // Ton coût actuel
        
        metabolism.energyStored -= stressCost;
        totalStressCost += stressCost;
        stressedBacteria++;
      }
    }

    // STRESS XÉNOPHOBE (espèce différente)
    if (alienSpeciesCount > 0) {
      const xenophobiaStress = alienSpeciesCount * xenophobia * 2.0;
      metabolism.energyStored -= xenophobiaStress;
      totalStressCost += xenophobiaStress;
      xenophobiaEvents++;

      // RÉACTION : Attaque ou fuite
      if (xenophobia > 0.5 && aliens.length > 0) {
        this._reactToAliens(entityId, aliens, xenophobia);
      }
    }
  }

  return {
    totalBacteria: entities.length,
    stressedBacteria,
    totalStressCost: totalStressCost.toFixed(2),
    stressPercentage: entities.length > 0 
      ? ((stressedBacteria / entities.length) * 100).toFixed(1)
      : 0,
    xenophobiaEvents
  };
}

/**
 * Réaction xénophobe : attaque ou fuite
 * @private
 */
_reactToAliens(entityId, aliens, xenophobia) {
  const hasPredator = this.entityManager.hasComponent(entityId, 'Predator');
  const hasMovement = this.entityManager.hasComponent(entityId, 'Movement');
  const position = this.entityManager.getComponent(entityId, 'Position');
  
  // Si prédateur : attaquer (déjà géré par PredatorSystem)
  // On augmente juste la motivation
  
  // Si mobile : FUIR
  if (hasMovement && Math.random() < xenophobia * 0.3) {
    // Calculer direction de fuite (opposée aux aliens)
    let fleeX = 0;
    let fleeY = 0;
    
    for (const alien of aliens) {
      const dx = position.x - alien.x;
      const dy = position.y - alien.y;
      fleeX += dx;
      fleeY += dy;
    }
    
    // Normaliser et choisir direction
    const magnitude = Math.sqrt(fleeX * fleeX + fleeY * fleeY);
    if (magnitude > 0) {
      const dirX = Math.round(fleeX / magnitude);
      const dirY = Math.round(fleeY / magnitude);
      
      const newPos = this.world.wrap(position.x + dirX, position.y + dirY);
      
      if (this.world.isFree(newPos.x, newPos.y)) {
        this.world.removeEntity(position.x, position.y);
        position.x = newPos.x;
        position.y = newPos.y;
        this.world.setEntity(position.x, position.y, entityId);
      }
    }
  }
}
  /**
   * Calcule la densité moyenne globale
   */
  getGlobalDensity() {
    const totalCells = this.world.width * this.world.height;
    const occupiedCells = this.entityManager.getEntityCount();
    return (occupiedCells / totalCells).toFixed(3);
  }
}