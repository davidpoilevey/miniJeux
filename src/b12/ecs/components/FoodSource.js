/**
 * FoodSource — patch de végétation
 * Entités placées dans le biome actif. Se régénèrent chaque tick.
 * Mangeable par : prey, herbivore, omnivore, filtrer (joueur).
 */
export class FoodSource {
  constructor(maxEnergy = 100) {
    this.energy    = maxEnergy;
    this.maxEnergy = maxEnergy;
    this.regenRate = 0.4; // énergie récupérée par tick
  }
}
