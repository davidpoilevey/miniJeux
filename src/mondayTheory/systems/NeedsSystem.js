import { findEntityByType } from "../ECS";
function getDistance(a, b) {
    let dx = a.x - b.x;
    let dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}


export function needsSystem(world) {
  const dtHours = world.time.deltaSimHours;

  Object.values(world.entities).forEach(entity => {
    if (!entity.needs) return;

    for (const needKey in entity.needs) {
      const need = entity.needs[needKey];

      // évolution basée sur le temps simulé
      need.value += need.decay * dtHours;

      // clamp
      need.value = Math.max(0, Math.min(100, need.value));
    }
  })
}

export function decisionSystem(world) {
  Object.values(world.entities).forEach(entity => {
    if (!entity.needs) return;
    if (entity.currentAction) return;

    const ms = entity.mentalState || {};

     if (ms.maladie > 70 && !entity.forcedNeed) {
      entity.currentGoal = "goToCar";
      entity.forcedNeed = "health";
    }

    // LUXURE > 80 → force le goal 'goToSex'
    if (ms.luxure > 80 && !entity.currentGoal) {
      entity.currentGoal = "goToSex";
      // À implémenter plus tard
      return;
    }

    // INTOXICATION > 70 → décision impulsive (choix aléatoire)
    if (ms.intoxication > 70 && Math.random() < 0.3) {
      const randomTarget = getRandomEntity(world, entity);
      if (randomTarget) {
        const targetId = Object.entries(world.entities).find(([id, e]) => e === randomTarget)[0];
        entity.currentAction = {
          type: 'impulsive',
          targetId: targetId,
          state: "moving",
          duration: randomTarget.duration || 2,
          progress: 0
        };
        return;
      }
    }

    let needs = entity.needs;
    if(entity.position.zone !='work')
      needs = Object.fromEntries(Object.entries(needs).filter(([k,v])=>k!=='work'));



    const urgentNeed = getMostUrgentNeed(needs);
    if (!urgentNeed) return;

    const target = chooseTargetForNeed(world, entity, urgentNeed);
    if (!target) return;
const targetId = Object.entries(world.entities).find(([id, e]) => e === target)[0];
    entity.currentAction = {
      type: urgentNeed,
      targetId: targetId,
      state: "moving",
      duration: target.duration||2,
      progress: 0
    };
  })
}

function chooseTargetForNeed(world, agent, needKey) {

  const candidates = Object.values(world.entities).filter(
    (e) =>
      e.provides &&
      e.position.zone === agent.position.zone &&
      e.provides[needKey] !== undefined &&
e !== agent
  );

  if (candidates.length === 0) return null;

  let best = null;
  let bestScore = -Infinity;

  for (const candidate of candidates) {
    const distance = getDistance(agent.position, candidate.position);

    const effectiveness = Math.abs(candidate.provides[needKey]);
const urgency = needKey===(100 - agent.needs[needKey].value);
    // Score simple : efficacité pondérée par distance
    let score = effectiveness*urgency - distance * 0.5;

    if(agent.mentalState){
      
      // STRESS : pénalise les interactions sociales
      if (needKey === 'social' && agent.mentalState.stress > 50) {
        score *= 0.5; // réduit de 50% l'attractivité
      }

      // LUXURE : favorise les interactions sociales
      if (needKey === 'social' && agent.mentalState.luxure > 60) {
        score *= 1.5; // augmente de 50% l'attractivité
      }

      // LUXURE : favorise le fun
      if (needKey === 'fun' && agent.mentalState.luxure > 60) {
        score *= 1.3;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  return best;
}


function getRandomEntity(world, excludeEntity) {
  const candidates = Object.values(world.entities).filter(
    (e) => e !== excludeEntity && 
           e.position?.zone === excludeEntity.position?.zone &&
           e.provides
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function getMostUrgentNeed(needs) {
  let highest = null;
  let highestValue=0;
  for (const key in needs) {
    if (needs[key].value > highestValue) {
      highest = key;
      highestValue = needs[key].value;
    }
  }


  return highest;
}
