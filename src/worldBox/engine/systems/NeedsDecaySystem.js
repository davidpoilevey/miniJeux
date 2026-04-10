// Décrémente les besoins de chaque habitant à chaque tick.
// Fait vieillir les habitants (0.1 age/tick) et les tue de vieillesse.
// Les vitesses de décroissance sont modulées par les stats.

const AGE_RATE = 0.1; // 1 unité d'âge par 10 ticks → maxAge~70 → ~700 ticks de vie

export default class NeedsDecaySystem {
  update({ em, onDeath }) {
    const toDestroy = [];

    for (const id of em.query('Needs', 'Stats')) {
      const needs = em.getComponent(id, 'Needs');
      const stats = em.getComponent(id, 'Stats');

      // Force élevée → moins faim (métabolisme efficace)
      const hungerDecay = 0.6 - stats.force * 0.002;         // 0.4..0.58
      // Intelligence élevée → moins de fatigue (gestion de l'énergie)
      const energyDecay = 0.15 - stats.intelligence * 0.001; // 0.26..0.34
      // Social décroît lentement, indépendant des stats pour l'instant
      const socialDecay = 0.08;
      const foiDecay    = 0.01;

      em.addComponent(id, 'Needs', {
        hunger: Math.max(0, needs.hunger - hungerDecay),
        energy: Math.max(0, needs.energy - energyDecay),
        social: Math.max(0, needs.social - socialDecay),
        foi:    Math.max(0, needs.foi    - foiDecay),
      });

      // Mort par épuisement (energy atteint 0)
      const freshNeeds = em.getComponent(id, 'Needs');
      if ((freshNeeds.energy ?? 1) < 1) {
        toDestroy.push(id);
        continue;
      }

      // Vieillissement
      const age = em.getComponent(id, 'Age');
      if (age) {
        const newAge = age.age + AGE_RATE;
        if (newAge >= age.maxAge) {
          toDestroy.push(id);
        } else {
          em.addComponent(id, 'Age', { ...age, age: newAge });
        }
      }
    }

    // Morts de vieillesse (après la boucle pour éviter l'invalidation du query)
    for (const id of toDestroy) {
      em.destroyEntity(id);
      onDeath?.();
    }
  }
}
