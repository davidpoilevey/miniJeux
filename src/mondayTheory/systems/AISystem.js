import { findEntityByType } from "../ECS";


export function interactionSystem(world) {
  const dt = world.time.deltaSimHours;

  Object.values(world.entities).forEach(entity => {
    const action = entity.currentAction;
    if (!action) return;
    if (action.state !== "interacting") return;

    action.progress += dt;

    applyInteractionEffect(world, entity, action, dt);

    if (action.progress >= action.duration) {
      entity.currentAction = null;
    }
  });
}


export function goalSystem(world) {
  const dt = world.time.deltaSimHours;

  Object.values(world.entities).forEach(entity => {
    const goal = entity.forcedNeed;
    if (!goal) return;

    if (entity.forcedNeed === "work") {
      // PAS encore au travail
      if (entity.position.zone !== "work") {

        if (!entity.currentGoal) {
          entity.currentGoal = "goToCar";
        }
        
        if (entity.currentGoal === "goToCar") {
          const voitureId = findEntityByType(world, "voiture");
          entity.currentGoal = "goToWorkplace";
          
          entity.currentAction = {
            type: 'transport',
            targetId: voitureId,
            state: "moving", 
            duration: 1,
            progress: 0
          };
          
          
        
        }
        else if (entity.currentGoal === "goToWorkplace") {
          const voitureId = findEntityByType(world, "voiture");
          // David monte dans la voiture
          entity.renderable = false;
          entity.inVehicle = voitureId;
          entity.currentGoal = 'working';
          // La voiture se déplace vers dalim
          const voiture = world.entities[voitureId];
          const dalimId = findEntityByType(world, "dalim");
            voiture.currentAction = {
            type: 'transport',
            targetId: dalimId,
            state: "moving",
            duration: 1,
            progress: 0
          };
          
          entity.currentAction = {
            type: 'transport',
            targetId: dalimId,
            state: "moving", // nouveau state pour indiquer qu'on attend dans un véhicule
            duration: 1,
            progress: 0
          };
          return;
        }
        else if (entity.currentGoal === "working") {
          entity.position.zone = "work";
          entity.currentGoal = null;
          entity.currentAction = null;
        }
        return;
      }
      else
        return; // déjà au travail, pas besoin de faire quoi que ce soit
    }

    if (entity.forcedNeed === "home") {

      if (!entity.currentGoal) {
        entity.currentGoal = "goToCar";
      }

      if (entity.currentGoal === "goToCar") {
       
        entity.currentGoal = "goToHome";
         const voitureId = findEntityByType(world, "voiture");
          entity.currentGoal = "goToWorkplace";
          
          entity.currentAction = {
            type: 'transport',
            targetId: voitureId,
            state: "moving", 
            duration: 1,
            progress: 0
          };
          
      }
      else if (entity.currentGoal === "goToHome") {
        const voitureId = findEntityByType(world, "voiture");
        entity.currentGoal = "goToHome";
        
        // David monte dans la voiture
        entity.renderable = false;
        entity.inVehicle = voitureId;
        
        // La voiture se déplace vers entree
        const voiture = world.entities[voitureId];
        const entreeId = findEntityByType(world, "entree");
        
        voiture.currentAction = {
          type: 'transport',
          targetId: entreeId,
          state: "moving",
          duration: 1,
          progress: 0
        };
        
        entity.currentAction = {
          type: 'transport',
          targetId: entreeId,
          state: "moving",
            duration: 1,
          progress: 0
        };
        return;
      }
      else if (entity.currentGoal === "rentrer") {
        entity.position.zone = "home";
        entity.forcedNeed = null;
        entity.currentGoal = null;
        entity.currentAction = null;
      }
    }

    if(entity.forcedNeed === "health") {
         const voitureId = findEntityByType(world, "voiture");
        if (entity.currentGoal === "goToCar") {
       
        entity.currentGoal = "goToDoctor";
          entity.currentGoal = "goToWorkplace";
          
          entity.currentAction = {
            type: 'transport',
            targetId: voitureId,
            state: "moving", 
            duration: 1,
            progress: 0
          };
          
      }
      else if (entity.currentGoal === "goToDoctor") {
        const doctorId = findEntityByType(world, "docteur");
        entity.currentGoal = "healAndGoHome";
        
        // David monte dans la voiture
        entity.renderable = false;
        entity.inVehicle = voitureId;
        
        // La voiture se déplace vers entree
        const voiture = world.entities[voitureId];
        
        voiture.currentAction = {
          type: 'transport',
          targetId: doctorId,
          state: "moving",
          duration: 1,
          progress: 0
        };
        
        entity.currentAction = {
          type: 'transport',
          targetId: doctorId,
          state: "waiting_vehicle",
            duration: 1,
          progress: 0
        };
        return;
      }
      else if (entity.currentGoal === "healAndGoHome") {
        entity.mentalState.maladie = 0;
        entity.forcedNeed = "home";
        entity.currentGoal = null;
        entity.currentAction = null;
      }
    }

    if (entity.forcedNeed === "sleep") {
      if (entity.currentGoal === "goToBed") {
        entity.currentGoal = "bed";
      }
    }
  });
}




function applyInteractionEffect(world, entity, action, dt) {
  const target = world.entities[action.targetId];
  if (!target || !target.provides) return;

  for (const [needKey, delta] of Object.entries(target.provides)) {
    if (!entity.needs[needKey]) continue;

    entity.needs[needKey].value += delta * dt;
    entity.needs[needKey].value = Math.max(
      0,
      Math.min(100, entity.needs[needKey].value)
    );

  }
}
