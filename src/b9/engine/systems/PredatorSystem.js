/**
 * PredatorSystem - Gère la prédation active
 * 
 * Différence avec Cannibalism:
 * - Prédateur ACTIF : attaque n'importe quelle proie, pas seulement les faibles
 * - Attaque à distance (attackRange)
 * - Damage selon attackPower
 * - Prédateur se déplace vers la proie si Movement
 * - Consomme APRÈS la mort de la victime
 */

export class PredatorSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  /**
   * Mise à jour du système
   * @param {number} deltaTime
   */
  update(deltaTime) {
    const predators = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Metabolism',
      'Predator'
    ]);

    let attacks = 0;
    let kills = 0;
    let energyGained = 0;
    const victims = new Map(); // victimId -> totalDamage

    for (const predatorId of predators) {
      const predatorPos = this.entityManager.getComponent(predatorId, 'Position');
      const predatorMeta = this.entityManager.getComponent(predatorId, 'Metabolism');
      const predator = this.entityManager.getComponent(predatorId, 'Predator');

      // Chercher des proies dans le rayon d'attaque
      const preyInRange = this._findPreyInRange(
        predatorPos.x, 
        predatorPos.y, 
        predator.attackRange,
        predatorId
      );

      if (preyInRange.length === 0) continue;

      // Choisir la proie la plus proche
      const target = preyInRange[0];
      const targetMeta = this.entityManager.getComponent(target.id, 'Metabolism');
      if (!targetMeta) continue;

      // Vérifier l'immunité de la cible
      const targetImmunity = this.entityManager.getComponent(target.id, 'Immunity');
      let defense = 0;
      if (targetImmunity) {
        defense = targetImmunity.defense;
      }
      
      const wall = this.entityManager.getComponent(target.id, 'ReinforcedWall');
      if (wall) {
        defense += wall.protection;
      }
      // Bonus ThickCuticle si présent
      const hasThickCuticle = this.entityManager.hasComponent(target.id, 'ThickCuticle');
      if (hasThickCuticle) {
        const cuticle = this.entityManager.getComponent(target.id, 'ThickCuticle');
        defense += cuticle.defenseBonus; // +3 à +7
      }

      // Calculer les dégâts
      let baseDamage = predator.attackPower;
      
      // Bonus CrystallineCilia si présent
      const hasCilia = this.entityManager.hasComponent(predatorId, 'CrystallineCilia');
      if (hasCilia) {
        const cilia = this.entityManager.getComponent(predatorId, 'CrystallineCilia');
        baseDamage *= (1.0 + cilia.attackBonus); // +30% à +70%
      }
      
      const damageReduction = Math.min(0.9, defense * 0.1); // Max 90% de réduction
      let actualDamage = baseDamage * (1.0 - damageReduction);

if (targetMeta.isDormant) {
  actualDamage *= 0.1; // 90% de réduction
}
      // Infliger les dégâts
      targetMeta.energyStored -= actualDamage;

      // Accumuler les dégâts pour cette victime
      if (!victims.has(target.id)) {
        victims.set(target.id, 0);
      }
      victims.set(target.id, victims.get(target.id) + actualDamage);

      attacks++;

      // Si la proie meurt, le prédateur récupère de l'énergie
      if (targetMeta.energyStored <= 0) {
        // Consommer le cadavre (50% de l'énergie de base de la proie)
        const energyFromKill = targetMeta.maxEnergyStored * 0.5;
        predatorMeta.energyStored += energyFromKill;
        energyGained += energyFromKill;
        kills++;
      }
    }

    // Retirer les victimes mortes
    const deaths = [];
    for (const [victimId, damage] of victims.entries()) {
      const victimMeta = this.entityManager.getComponent(victimId, 'Metabolism');
      if (victimMeta && victimMeta.energyStored <= 0) {
        deaths.push(victimId);
      }
    }

    for (const victimId of deaths) {
      const position = this.entityManager.getComponent(victimId, 'Position');
      if (position) {
        this.world.removeEntity(position.x, position.y);
      }
      this.entityManager.destroyEntity(victimId);
    }

    return {
      predators: predators.length,
      attacks,
      kills,
      energyGained: energyGained.toFixed(2)
    };
  }

  /**
   * Trouve les proies dans le rayon d'attaque
   * @private
   */
  _findPreyInRange(x, y, range, predatorId) {
    const prey = [];

    // Scanner dans un carré de rayon 'range'
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        if (dx === 0 && dy === 0) continue; // Skip self

        const pos = this.world.wrap(x + dx, y + dy);
        const entityId = this.world.getEntity(pos.x, pos.y);

        if (!entityId || entityId === predatorId) continue;

        // Vérifier que c'est une proie valide (a du métabolisme)
        const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
        if (!metabolism) continue;

        // Calculer la distance réelle
        const distance = Math.sqrt(dx * dx + dy * dy);

        prey.push({
          id: entityId,
          distance,
          x: pos.x,
          y: pos.y
        });
      }
    }

    // Trier par distance (plus proche en premier)
    prey.sort((a, b) => a.distance - b.distance);

    return prey;
  }
}