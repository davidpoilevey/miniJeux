import { cellToWorld, isCellBlocked, rebuildDynamicGrid, worldToCell } from "../ECS";



export function movementSystem(world) {
  const dt = world.time.deltaSimHours;

  Object.values(world.entities).forEach(entity => {
    const action = entity.currentAction;
    if (!action) return;
    if (action.state !== "moving") return;
    if (!entity.path || entity.path.length === 0) return;

    const nextCell = entity.path[entity.pathIndex];
    
    // Si la prochaine cellule est bloquée, réinitialiser le path pour forcer un recalcul
    if (isCellBlockedForEntity(world, nextCell, entity)) {
      entity.path = [];
      entity.pathIndex = 0;
      return;
    }

    const targetPos = cellToWorld(world, nextCell.col, nextCell.row);
    const reached = moveTowards(entity, targetPos, dt);
    
    if (reached) {
      entity.pathIndex++;

      if (entity.pathIndex >= entity.path.length) {
        entity.path = [];
        action.state = "interacting";
      }
    }
  });
  
  rebuildDynamicGrid(world);
}
function moveTowards(entity, targetPos, dt) {
  let speed = entity.speed || 100;
  // INTOXICATION : réduit le speed
  if (entity.mentalState?.intoxication > 40) {
    const reduction = (entity.mentalState.intoxication / 100) * 0.6;
    speed *= (1 - reduction);
  }

  const dx = targetPos.x - entity.position.x;
  const dy = targetPos.y - entity.position.y;

  const distance = Math.sqrt(dx * dx + dy * dy);

  // Si déjà arrivé
  if (distance < 6) {

  const decalageX = Math.random() * 10 - 5; // -10 à +10
  const decalageY = Math.random() * 10 - 5; // -10 à +10
    entity.position.x = targetPos.x + decalageX*(entity.mentalState?.intoxication/10||1);
    entity.position.y = targetPos.y + decalageY*(entity.mentalState?.intoxication/10||1);
    return true;
  }

  const dirX = dx / distance;
  const dirY = dy / distance;

  // ============= FIX : Clamper le déplacement =============
  const moveDistance = speed * dt;
  // Si on va dépasser, on s'arrête exactement à la cible
  if (moveDistance >= distance) {
    entity.position.x = targetPos.x;
    entity.position.y = targetPos.y;
    return true;
  }

  // Sinon, déplacement normal
  entity.position.x += dirX * moveDistance;
  entity.position.y += dirY * moveDistance;

  return false;
}

export function vehicleSystem(world) {
  Object.values(world.entities).forEach(entity => {
    // Si l'entité est dans un véhicule
    if (entity.inVehicle) {
      const vehicle = world.entities[entity.inVehicle];
      
      if (!vehicle) {
        // Sécurité : le véhicule n'existe plus
        entity.inVehicle = null;
        entity.renderable = true;
        return;
      }
      
      // Synchroniser la position de David avec la voiture
      entity.position.x = vehicle.position.x;
      entity.position.y = vehicle.position.y;
      
      // Vérifier si la voiture a terminé son trajet
      if (vehicle.currentAction?.state === "interacting") {
        // La voiture est arrivée, David descend
        entity.renderable = true;
        entity.inVehicle = null;
        
        // Mettre à jour le goal selon la destination
        if (entity.currentGoal === "goToWorkplace") {
          entity.currentGoal = "working";
          entity.currentAction = {
            state: "interacting"
          };
        } else if (entity.currentGoal === "goToHome") {
          entity.currentGoal = "rentrer";
          entity.currentAction = {
            state: "interacting"
          };
        }
      }
    }
  });
}

export function pathfindingSystem(world) {

  Object.values(world.entities).forEach(entity => {

    const action = entity.currentAction;

    if (!action) return;
    if (action.state !== "moving") return;

    // Si un path existe déjà → on ne recalcule pas
    if (entity.path && entity.path.length > 0) return;

    const target = world.entities[action.targetId];
    if (!target) {
      entity.currentAction = null;
      return;
    }

    const startCell = worldToCell(world, entity.position.x, entity.position.y);
    const targetCell = worldToCell(world, target.position.x, target.position.y);

    if(startCell.col === targetCell.col && startCell.row === targetCell.row) {
      // Déjà arrivé
      action.state = "interacting";
      return;
    }
    
    // PASSE L'ENTITÉ À A* pour qu'elle s'ignore elle-même
    const path = computeAStar(world, startCell, targetCell, entity);

    if (path && path.length > 0) {
      entity.path = path;
      entity.pathIndex = 0;
    } else {
      // Pas de chemin trouvé → abandon action
      entity.currentAction = null;
    }

  });
}



function computeAStar(world, start, goal, movingEntity) {
  const openSet = [];
  const closedSet = new Set();

  const key = (c) => `${c.col},${c.row}`;

  openSet.push({
    col: start.col,
    row: start.row,
    g: 0,
    h: heuristic(start, goal),
    f: 0 + heuristic(start, goal),
    parent: null,
  });

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();

    if (current.col === goal.col && current.row === goal.row) {
      return reconstructPath(current);
    }

    closedSet.add(key(current));

    const neighbors = getNeighbors(current);

    for (const neighbor of neighbors) {
      if (isCellBlockedForEntity(world, neighbor, movingEntity)) continue;
      if (closedSet.has(key(neighbor))) continue;

      const gScore = current.g + 1;

      const existing = openSet.find(n => 
        n.col === neighbor.col && n.row === neighbor.row
      );

      if (!existing) {
        openSet.push({
          col: neighbor.col,
          row: neighbor.row,
          g: gScore,
          h: heuristic(neighbor, goal),
          f: gScore + heuristic(neighbor, goal),
          parent: current,
        });
      } else if (gScore < existing.g) {
        existing.g = gScore;
        existing.f = gScore + existing.h;
        existing.parent = current;
      }
    }
  }

  return [];
}
export function isCellBlockedForEntity(world, cell, movingEntity) {
  const { staticGrid, dynamicGrid, width, height } = world.navigation;
  const { col, row } = cell;

  // hors grille = bloqué
  if (col < 0 || row < 0 || col >= width || row >= height) {
    return true;
  }

  // Obstacles statiques
  if (staticGrid[row][col] === 1) return true;

  // Obstacles dynamiques
  if (dynamicGrid[row][col] === 1) {
    // Ignorer sa propre cellule
    const entityCell = worldToCell(world, movingEntity.position.x, movingEntity.position.y);
    if (entityCell.col === col && entityCell.row === row) {
      return false;
    }
    
    // Ignorer la cellule de destination (target)
    if (movingEntity.currentAction?.targetId) {
      const target = world.entities[movingEntity.currentAction.targetId];
      if (target && target.position) {
        const targetCell = worldToCell(world, target.position.x, target.position.y);
        if (targetCell.col === col && targetCell.row === row) {
          return false;
        }
      }
    }
    
    return true;
  }

  return false;
}
function heuristic(a, b) {
  return Math.abs(a.col - b.col) + Math.abs(a.row - b.row);
}
function getNeighbors(cell) {
  return [
    { col: cell.col + 1, row: cell.row },
    { col: cell.col - 1, row: cell.row },
    { col: cell.col, row: cell.row + 1 },
    { col: cell.col, row: cell.row - 1 },
  ];
}
function reconstructPath(node) {
  const path = [];

  let current = node;

  while (current.parent) {
    path.unshift({ col: current.col, row: current.row });
    current = current.parent;
  }

  return path;
}



