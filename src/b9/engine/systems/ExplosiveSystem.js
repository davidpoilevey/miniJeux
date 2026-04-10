// ExplosiveSystem.js - VERSION AVEC PROTECTION FAMILIALE

export class ExplosiveSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
    this.pendingExplosions = [];
  }

  registerExplosion(entityId) {
    const position = this.entityManager.getComponent(entityId, 'Position');
    const explosive = this.entityManager.getComponent(entityId, 'Explosive');
    const genome = this.entityManager.getComponent(entityId, 'Genome'); // AJOUT
    
    if (position && explosive && !explosive.triggered) {
      const kamikazeSpecies = genome?.handler.readFloat('speciesIdentity') || 0; // AJOUT
      
      this.pendingExplosions.push({
        x: position.x,
        y: position.y,
        blastRadius: explosive.blastRadius,
        damage: explosive.damage,
        kamikazeSpecies // AJOUT : ID de famille du kamikaze
      });
      explosive.triggered = true;
    }
  }

  update(deltaTime) {
    let explosionsCount = 0;
    let totalKills = 0;

    while (this.pendingExplosions.length > 0) {
      const explosion = this.pendingExplosions.shift();
      const kills = this._processExplosion(explosion);
      
      explosionsCount++;
      totalKills += kills;
    }

    return {
      explosions: explosionsCount,
      kills: totalKills
    };
  }

  _processExplosion(explosion) {
    const { x, y, blastRadius, damage, kamikazeSpecies } = explosion;
    const victims = [];

    for (let dy = -blastRadius; dy <= blastRadius; dy++) {
      for (let dx = -blastRadius; dx <= blastRadius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > blastRadius) continue;

        const pos = this.world.wrap(x + dx, y + dy);
        const victimId = this.world.getEntity(pos.x, pos.y);
        
        if (victimId === null) continue;

        const metabolism = this.entityManager.getComponent(victimId, 'Metabolism');
        if (!metabolism) continue;

        // VÉRIFIER SI MÊME FAMILLE
        const victimGenome = this.entityManager.getComponent(victimId, 'Genome');
        if (victimGenome) {
          const victimSpecies = victimGenome.handler.readFloat('speciesIdentity');
          const speciesDiff = Math.abs(kamikazeSpecies - victimSpecies);
          
          // Épargner la famille (différence < 0.15)
          if (speciesDiff < 0.15) continue;
        }

        // Calculer dégâts
        const damageMultiplier = 1.0 - (distance / blastRadius);
        let actualDamage = damage * damageMultiplier;

        // Défense
        const immunity = this.entityManager.getComponent(victimId, 'Immunity');
        const thickCuticle = this.entityManager.getComponent(victimId, 'ThickCuticle');
        let defense = 0;
        
        if (immunity) defense += immunity.defense;
        if (thickCuticle) defense += thickCuticle.defenseBonus;
        
        const damageReduction = Math.min(0.7, defense * 0.05);
        actualDamage *= (1.0 - damageReduction);

        // Infliger dégâts
        metabolism.energyStored -= actualDamage;

        if (metabolism.energyStored <= 0) {
          victims.push(victimId);
        }
      }
    }

    // Détruire victimes
    for (const victimId of victims) {
      const victimPos = this.entityManager.getComponent(victimId, 'Position');
      if (victimPos) {
        this.world.removeEntity(victimPos.x, victimPos.y);
      }
      
      // Réaction en chaîne si victime aussi Explosive
      if (this.entityManager.hasComponent(victimId, 'Explosive')) {
        this.registerExplosion(victimId);
      }
      
      this.entityManager.destroyEntity(victimId);
    }

    return victims.length;
  }
}