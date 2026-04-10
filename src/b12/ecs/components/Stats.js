/**
 * Stats — état physiologique d'une entité individuelle
 * Utilisé par les systèmes Movement, Predation, Reproduction (à venir).
 */

// [min, max] ticks de vie selon le rôle
// Les prédateurs/apex vivent plus longtemps pour compenser la difficulté de chasse
const MAX_AGE_BY_ROLE = {
  filtrer:   [350, 600],
  herbivore: [500, 700],
  omnivore:  [500, 800],
  predator:  [650, 1050],
  apex:      [800, 1300],
};

export class Stats {
  constructor({ maxAge, role } = {}) {
    this.energy    = 50;
    this.maxEnergy = 100;
    this.age       = 0;
    if (maxAge != null) {
      this.maxAge = maxAge;
    } else {
      const [lo, hi] = MAX_AGE_BY_ROLE[role] ?? [300, 700];
      this.maxAge = lo + Math.floor(Math.random() * (hi - lo));
    }
    this.alive = true;
  }
}
