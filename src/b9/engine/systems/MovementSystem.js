/**
 * MovementSystem - Gère les déplacements des bactéries
 * Comportement: déplacement aléatoire pondéré par le gène de vitesse
 */

export class MovementSystem {
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
      'Movement'
    ]);

    for (const entityId of entities) {
      const position = this.entityManager.getComponent(entityId, 'Position');
      const genome = this.entityManager.getComponent(entityId, 'Genome');
      
// SKIP si attaché (déjà bougé par AdhesionSystem)
  // const adhesion = this.entityManager.getComponent(entityId, 'Adhesion');
  // if (adhesion && adhesion.attachedTo.length > 0) continue;

      // La vitesse détermine la probabilité de se déplacer
      const speed = genome.handler.readFloat('vitesse');
      
      if (Math.random() < speed * 0.1) { // 10% de chance max par tick
        // Direction aléatoire (8 directions)
        const directions = [
          [-1, -1], [0, -1], [1, -1],
          [-1,  0],          [1,  0],
          [-1,  1], [0,  1], [1,  1]
        ];
        
        const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
        const newPos = this.world.wrap(position.x + dx, position.y + dy);

        // Déplacement si la case est libre
        if (this.world.isFree(newPos.x, newPos.y)) {
          this.world.removeEntity(position.x, position.y);
          position.x = newPos.x;
          position.y = newPos.y;
          this.world.setEntity(position.x, position.y, entityId);
        }
      }
    }
  }
}
