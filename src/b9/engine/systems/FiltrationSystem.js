// Nouveau fichier: /src/engine/systems/FiltrationSystem.js

/**
 * FiltrationSystem - Absorption sélective avec spécialisation
 * 
 * Trade-off:
 * - 'organic': Excellent près des cadavres, MAUVAIS zones fertiles
 * - 'mineral': Excellent zones fertiles, MAUVAIS zones de combat
 * - 'all': Moyen partout (pas de bonus, pas de malus)
 * 
 * Crée des niches écologiques distinctes
 */

export class FiltrationSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
    this.recentDeaths = new Map(); // index → ticks depuis mort
    this.deathDecayRate = 100; // Disparaît après 100 ticks
  }

  /**
   * Enregistre un cadavre (appelé depuis MetabolismSystem)
   */
  registerDeath(x, y) {
    const { x: wx, y: wy } = this.world.wrap(x, y);
    const index = this._toIndex(wx, wy);
    this.recentDeaths.set(index, 0); // 0 ticks depuis mort
  }

  /**
   * Mise à jour
   */
  update(deltaTime) {
    // Dégrader les cadavres
    for (const [index, age] of this.recentDeaths.entries()) {
      this.recentDeaths.set(index, age + 1);
      if (age >= this.deathDecayRate) {
        this.recentDeaths.delete(index);
      }
    }

    const filterers = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Metabolism',
      'Filtration'
    ]);

    let organicBonuses = 0;
    let mineralBonuses = 0;
    let organicPenalties = 0;
    let mineralPenalties = 0;

    for (const entityId of filterers) {
      const position = this.entityManager.getComponent(entityId, 'Position');
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
      const filtration = this.entityManager.getComponent(entityId, 'Filtration');
// Dans FiltrationSystem, bonus si mobile

const hasAdhesion = this.entityManager.hasComponent(entityId, 'Adhesion');
const hasMovement = this.entityManager.hasComponent(entityId, 'Movement');

      // Analyser le contexte local
      const organicDensity = this._getOrganicDensity(position.x, position.y);
      const mineralQuality = this._getMineralQuality(position.x, position.y);

      let bonus = 0;

      switch (filtration.filterType) {
        case 'organic':
          // Excellent près des cadavres
          bonus = organicDensity * filtration.efficiency * 0.8;
          
          // PÉNALITÉ en zones fertiles (compétition inefficace)
          if (mineralQuality > 0.6) {
            bonus -= mineralQuality * 0.5;
            if (bonus < 0) organicPenalties++;
          } else if (bonus > 0) {
            organicBonuses++;
          }
          break;

        case 'mineral':
          // Excellent zones fertiles
          bonus = mineralQuality * filtration.efficiency * 0.8;
          
          // PÉNALITÉ zones de combat (ne peut pas exploiter cadavres)
          if (organicDensity > 0.6) {
            bonus -= organicDensity * 0.5;
            if (bonus < 0) mineralPenalties++;
          } else if (bonus > 0) {
            mineralBonuses++;
          }
          break;

        case 'all':
          // Polyvalent mais sans bonus ni malus
          bonus = (organicDensity * 0.5 + mineralQuality * 0.5) * filtration.efficiency * 0.8;
          break;
          default:
      }

      metabolism.energyStored += bonus;
    }

    return {
      filterers: filterers.length,
      organicBonuses,
      mineralBonuses,
      organicPenalties,
      mineralPenalties
    };
  }

  /**
   * Densité organique (cadavres récents)
   * @private
   */
// Dans FiltrationSystem.js

_getOrganicDensity(x, y) {
  let density = 0;
  const radius = 2; // Réduit de 3 → 2 (9×9 → 5×5 = 64% moins de cellules)

  // Early exit si pas de cadavres proches
  if (this.recentDeaths.size === 0) return 0;

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const pos = this.world.wrap(x + dx, y + dy);
      const index = this._toIndex(pos.x, pos.y);
      
      if (this.recentDeaths.has(index)) {
        const age = this.recentDeaths.get(index);
        const freshness = 1.0 - (age / this.deathDecayRate);
        const distance = Math.sqrt(dx * dx + dy * dy);
        const distanceFactor = Math.max(0, 1.0 - distance / radius);
        
        density += freshness * distanceFactor;
      }
    }
  }

  return Math.min(1.0, density / 3); // Ajusté diviseur
}

  /**
   * Qualité minérale (fertilité du sol)
   * @private
   */
  _getMineralQuality(x, y) {
    const reserve = this.world.getReserve(x, y);
    const potential = this.world.getPotential(x, y);
    
    // Zones fertiles = bon pour mineral
    // Zones épuisées = mauvais
    return Math.min(1.0, (reserve / potential));
  }

  _toIndex(x, y) {
    return y * this.world.width + x;
  }
}