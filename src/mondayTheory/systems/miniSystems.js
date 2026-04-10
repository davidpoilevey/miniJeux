
const growthPerHour = 0.02; // croissance lente, global, mais tu peux le fdaire varier par plante

export function plantGrowthSystem(world, delta) {
    const deltaHours = world.time.deltaSimHours;
  Object.values(world.entities).forEach(entity => {
    if (!entity.growth) return;

    entity.growth.size += growthPerHour * deltaHours;

    if (entity.growth.size > entity.growth.max) {
      entity.growth.size = entity.growth.max;
    }
  });
}


export function mentalStateSystem(world) {
  const dtHours = world.time.deltaSimHours;

  Object.values(world.entities).forEach(entity => {
    if (!entity.mentalState) return;
    if (!entity.needs) return;

    const ms = entity.mentalState;

    // ============= DECAY NATUREL (retour à l'équilibre) =============
    for (const key in ms) {
      // Toutes les mentalStates diminuent naturellement
      ms[key] = Math.max(0, ms[key] - dtHours * 0.5); // ajuste le 0.5 pour la vitesse de retour
    }

    // ============= IMPACTS SUR LES NEEDS =============
    
    // STRESS : augmente l'energy (fatigue nerveuse)
    if (ms.stress > 30) {
      entity.needs.energy.value += (ms.stress / 100) * dtHours * 1.5;
    }

    // MALADIE : augmente l'hygiene progressivement
    if (ms.maladie > 20) {
      entity.needs.hygiene.value += (ms.maladie / 100) * dtHours * 2;
    }

    // LUXURE : augmente social et fun
    if (ms.luxure > 40) {
      entity.needs.social.value += (ms.luxure / 100) * dtHours * 1;
      entity.needs.fun.value += (ms.luxure / 100) * dtHours * 0.5;
    }

    // INTOXICATION : ajoute un need "thirst" si pas déjà présent
    if (ms.intoxication > 30) {
      if (!entity.needs.thirst) {
        entity.needs.thirst = { value: 50, decay: 3 };
      }
      entity.needs.thirst.value += (ms.intoxication / 100) * dtHours * 2;
    }
    else {
      // Si intoxication redescend, on peut retirer le need "thirst"
      if (entity.needs.thirst) {
        delete entity.needs.thirst;
      }
    }

    // Clamp tous les needs
    for (const needKey in entity.needs) {
      entity.needs[needKey].value = Math.max(0, Math.min(100, entity.needs[needKey].value));
    }
  });
}