// Nouveau fichier: /src/engine/systems/AdhesionSystem.js

/**
 * AdhesionSystem - Gère les liaisons physiques entre bactéries
 * 
 * Mécanismes:
 * - Adhésion bidirectionnelle (les deux doivent avoir Adhesion)
 * - Formation de chaînes (ver) ou clusters (colonie)
 * - Movement entraîne toute la chaîne attachée
 * - Muscular augmente la force de traction
 */

export class AdhesionSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  cleanHeterogeneousConnections() {
  const adhesives = this.entityManager.getEntitiesWithComponents([
    'Position',
    'Genome',
    'Adhesion'
  ]);

  let disconnections = 0;

  for (const entityId of adhesives) {
    const genome = this.entityManager.getComponent(entityId, 'Genome');
    const adhesion = this.entityManager.getComponent(entityId, 'Adhesion');
    const mySpecies = genome.handler.readFloat('speciesIdentity');

    // Parcourir connexions
    const validConnections = [];
    for (const connectedId of adhesion.attachedTo) {
      const connectedGenome = this.entityManager.getComponent(connectedId, 'Genome');
      if (!connectedGenome) continue;

      const connectedSpecies = connectedGenome.handler.readFloat('speciesIdentity');
      const diff = Math.abs(mySpecies - connectedSpecies);

      // Garder si même espèce OU si les deux ont Movement
      const bothMobile = this.entityManager.hasComponent(entityId, 'Movement') &&
                        this.entityManager.hasComponent(connectedId, 'Movement');

      if (diff < 0.15 || bothMobile) {
        validConnections.push(connectedId);
      } else {
        disconnections++;
      }
    }

    adhesion.attachedTo = validConnections;
  }

  return { disconnections };
}
  /**
   * Phase 1: Établir les connexions d'adhésion
   */
  updateConnections(deltaTime) {
    const adhesives = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Adhesion'
    ]);

    let newConnections = 0;
const ghostResult = this.cleanGhostConnections();
    for (const entityId of adhesives) {
      const position = this.entityManager.getComponent(entityId, 'Position');
      const adhesion = this.entityManager.getComponent(entityId, 'Adhesion');

      // Nettoyer les connexions invalides
      adhesion.attachedTo = adhesion.attachedTo.filter(targetId => {
        return this.entityManager.entities.has(targetId);
      });

      // Maximum de connexions selon strength
      const maxConnections = Math.ceil(adhesion.strength * 4); // 0-4 connexions

      if (adhesion.attachedTo.length >= maxConnections) continue;

      // Chercher des voisins adhésifs
      const neighbors = this.world.getNeighbors(position.x, position.y);

      for (const neighbor of neighbors) {
        if (!neighbor.entity || neighbor.entity === entityId) continue;
        if (adhesion.attachedTo.includes(neighbor.entity)) continue;

        const targetAdhesion = this.entityManager.getComponent(neighbor.entity, 'Adhesion');
        if (!targetAdhesion) continue;

        // Vérifier compatibilité d'espèce (optionnel)
        const genome = this.entityManager.getComponent(entityId, 'Genome');
        const targetGenome = this.entityManager.getComponent(neighbor.entity, 'Genome');
        
        if (genome && targetGenome) {
          const mySpecies = genome.handler.readFloat('speciesIdentity');
          const targetSpecies = targetGenome.handler.readFloat('speciesIdentity');
          
          // Seulement même espèce (différence < 0.2)
          if (Math.abs(mySpecies - targetSpecies) > 0) continue;
        }

        // Connexion bidirectionnelle
        const strengthSum = adhesion.strength + targetAdhesion.strength;
        
        if (Math.random() < strengthSum * 0.5) { // Probabilité selon force
          adhesion.attachedTo.push(neighbor.entity);
          targetAdhesion.attachedTo.push(entityId);
          newConnections++;
          
          if (adhesion.attachedTo.length >= maxConnections) break;
        }
      }
    }

    return { newConnections };
  }

  
/**
 * Phase 2: Déplacement coordonné des chaînes avec direction unifiée
 */
/**
 * Calcule la force de traction et direction unifiée de la chaîne
 * @private
 */
_calculateChainPull(chain) {
  let totalPull = 0;
  let totalDx = 0;
  let totalDy = 0;
  let muscularCount = 0;
  let movementCount = 0;
  let guidedDirection = null;

  for (const entityId of chain) {
    const movement = this.entityManager.getComponent(entityId, 'Movement');
    const muscular = this.entityManager.getComponent(entityId, 'Muscular');
    const adhesion = this.entityManager.getComponent(entityId, 'Adhesion');
    const enhancedSensors = this.entityManager.getComponent(entityId, 'EnhancedSensors');
    const genome = this.entityManager.getComponent(entityId, 'Genome');

    // TOUT Movement contribue
    if (movement) {
      totalPull += movement.speed;
      movementCount++;
    }

    // PRIORITÉ 1 : Direction guidée par EnhancedSensors
    if (enhancedSensors && adhesion?.guidedDirection) {
      guidedDirection = adhesion.guidedDirection;
      totalPull += 2.0; // Boost vision
    }
    // PRIORITÉ 2 : Muscular = GROS BONUS
    else if (muscular) {
      totalPull += muscular.movementBonus * 3.0; // ×3 bonus !
      muscularCount++;

      if (genome) {
        const dirAngle = genome.handler.readFloat('muscleDirection') * Math.PI * 2;
        totalDx += Math.cos(dirAngle) * muscular.movementBonus;
        totalDy += Math.sin(dirAngle) * muscular.movementBonus;
      }
    }
  }

  // Direction finale
  let direction = null;
  
  if (guidedDirection) {
    direction = guidedDirection;
  } else if (muscularCount > 0) {
    const magnitude = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
    if (magnitude > 0.1) {
      direction = {
        dx: Math.round(totalDx / magnitude),
        dy: Math.round(totalDy / magnitude)
      };
    }
  }

  return { totalPull, direction };
}

/**
 * Déplace les chaînes adhésives
 */
moveChains(deltaTime) {
  const movers = this.entityManager.getEntitiesWithComponents([
    'Position',
    'Movement',
    'Adhesion'
  ]);

  let chainMoves = 0;

  for (const leaderId of movers) {
    const leaderPos = this.entityManager.getComponent(leaderId, 'Position');
    const leaderAdhesion = this.entityManager.getComponent(leaderId, 'Adhesion');

    // Skip si pas attaché
    if (leaderAdhesion==null||leaderAdhesion.attachedTo.length === 0) continue;

    // Construire la chaîne complète
    const chain = this._buildChain(leaderId);

    // Calculer force de traction collective
    const { totalPull, direction } = this._calculateChainPull(chain);

    if (totalPull === 0) continue;

    // Probabilité AMÉLIORÉE : sqrt(pull/weight) pour réduire pénalité
    const chainWeight = Math.sqrt(chain.length); // Racine carrée !
    const moveProbability = Math.min(0.8, (totalPull / chainWeight) * 0.3);

    if (Math.random() > moveProbability) continue;

    // Direction
    let dx, dy;
    if (direction) {
      dx = direction.dx;
      dy = direction.dy;
    } else {
      // Aléatoire
      const directions = [
        [-1, -1], [0, -1], [1, -1],
        [-1,  0],          [1,  0],
        [-1,  1], [0,  1], [1,  1]
      ];
      [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
    }

    // Tenter de déplacer
    if (this._tryMoveChain(chain, dx, dy)) {
      chainMoves++;
    }
  }

  return { chainMoves };
}

  /**
   * Construit la chaîne complète à partir d'un leader (BFS)
   * @private
   */
  _buildChain(startId) {
    const visited = new Set();
    const queue = [startId];
    const chain = [];

    while (queue.length > 0) {
      const current = queue.shift();
      if (visited.has(current)) continue;
      
      visited.add(current);
      chain.push(current);

      const adhesion = this.entityManager.getComponent(current, 'Adhesion');
      if (!adhesion) continue;

      for (const attached of adhesion.attachedTo) {
        if (!visited.has(attached)) {
          queue.push(attached);
        }
      }
    }

    return chain;
  }

  /**
   * Tente de déplacer une chaîne entière
   * @private
   */
// Dans AdhesionSystem._tryMoveChain()

_tryMoveChain(chain, dx, dy) {
  const moves = [];
  const chainSet = new Set(chain);
  const phagocytosisTargets = []; // Victimes à dévorer

  // Vérifier espèce de la chaîne (doit être homogène pour phagocyter)
  const chainSpecies = this._getChainSpecies(chain);
  const canPhagocytose = chainSpecies !== null && chain.length >= 3; // Min 3 cellules

  for (const entityId of chain) {
    const pos = this.entityManager.getComponent(entityId, 'Position');
    if (!pos) return false;

    const newPos = this.world.wrap(pos.x + dx, pos.y + dy);
    const occupant = this.world.getEntity(newPos.x, newPos.y);

    // Case libre ou occupée par la chaîne → OK
    if (occupant === null || chainSet.has(occupant)) {
      moves.push({ entityId, oldPos: pos, newX: newPos.x, newY: newPos.y });
      continue;
    }

    // Case occupée par un étranger → Phagocytose ?
    if (canPhagocytose) {
      const canEat = this._canPhagocytose(occupant, chainSpecies);
      if (canEat) {
        phagocytosisTargets.push(occupant);
        moves.push({ entityId, oldPos: pos, newX: newPos.x, newY: newPos.y });
        continue;
      }
    }

    // Bloqué → Échec
    return false;
  }

  // PHAGOCYTOSE : Dévorer les victimes
  for (const victimId of phagocytosisTargets) {
    const victimPos = this.entityManager.getComponent(victimId, 'Position');
    const victimMeta = this.entityManager.getComponent(victimId, 'Metabolism');

    // Récupérer énergie de la victime (distribuer dans la chaîne)
    if (victimMeta) {
      const energyPerCell = victimMeta.energyStored / chain.length;
      for (const chainId of chain) {
        const chainMeta = this.entityManager.getComponent(chainId, 'Metabolism');
        if (chainMeta) {
          chainMeta.energyStored += energyPerCell * 0.9; // 50% efficacité
        }
      }
    }

    // Détruire la victime
    if (victimPos) {
      this.world.removeEntity(victimPos.x, victimPos.y);
    }
    this.entityManager.destroyEntity(victimId);
  }

  // Déplacer la chaîne
  for (const { entityId, oldPos } of moves) {
    this.world.removeEntity(oldPos.x, oldPos.y);
  }

  for (const { entityId, oldPos, newX, newY } of moves) {
    oldPos.x = newX;
    oldPos.y = newY;
    this.world.setEntity(newX, newY, entityId);
  }

  return true;
}

/**
 * Récupère l'espèce de la chaîne (null si hétérogène)
 * @private
 */
_getChainSpecies(chain) {
  if (chain.length === 0) return null;

  const firstGenome = this.entityManager.getComponent(chain[0], 'Genome');
  if (!firstGenome) return null;

  const speciesId = firstGenome.handler.readFloat('speciesIdentity');

  // Vérifier homogénéité
  for (const entityId of chain) {
    const genome = this.entityManager.getComponent(entityId, 'Genome');
    if (!genome) return null;

    const otherSpecies = genome.handler.readFloat('speciesIdentity');
    if (Math.abs(speciesId - otherSpecies) > 0.15) {
      return null; // Chaîne hétérogène
    }
  }

  return speciesId;
}
cleanGhostConnections() {
  const adhesives = this.entityManager.getEntitiesWithComponents([
    'Position',
    'Adhesion'
  ]);

  let ghostsRemoved = 0;

  for (const entityId of adhesives) {
    const position = this.entityManager.getComponent(entityId, 'Position');
    const adhesion = this.entityManager.getComponent(entityId, 'Adhesion');

    const validConnections = [];

    for (const connectedId of adhesion.attachedTo) {
      const connectedPos = this.entityManager.getComponent(connectedId, 'Position');
      const connectedAdhesion = this.entityManager.getComponent(connectedId, 'Adhesion');
      
      // Entité n'existe plus
      if (!connectedPos || !connectedAdhesion) {
        ghostsRemoved++;
        continue;
      }

      // Vérifier adjacence
      const dx = Math.abs(position.x - connectedPos.x);
      const dy = Math.abs(position.y - connectedPos.y);
      const wrapDx = Math.min(dx, this.world.width - dx);
      const wrapDy = Math.min(dy, this.world.height - dy);

      if (wrapDx <= 1 && wrapDy <= 1) {
        // Vérifier connexion bidirectionnelle
        if (connectedAdhesion.attachedTo.includes(entityId)) {
          validConnections.push(connectedId);
        } else {
          // Connexion asymétrique → Supprimer
          ghostsRemoved++;
        }
      } else {
        ghostsRemoved++;
      }
    }

    adhesion.attachedTo = validConnections;
  }

  return { ghostsRemoved };
}

/**
 * Vérifie si une cible peut être phagocytée
 * @private
 */
_canPhagocytose(victimId, chainSpecies) {
  // Vérifier espèce différente
  const victimGenome = this.entityManager.getComponent(victimId, 'Genome');
  if (!victimGenome) return false;

  const victimSpecies = victimGenome.handler.readFloat('speciesIdentity');
  const speciesDiff = Math.abs(chainSpecies - victimSpecies);
  
  // Ne mange pas sa propre espèce
  if (speciesDiff < 0.15) return false;

  // Vérifier que victime est ISOLÉE (pas dans une chaîne)
  const victimAdhesion = this.entityManager.getComponent(victimId, 'Adhesion');
  if (victimAdhesion && victimAdhesion.attachedTo.length > chainSpecies.length/2) {
    return false; // Fait partie d'une colonie trop grosse → Ne peut pas phagocyter
  }

  // Vérifier défense de la victime
  const victimImmunity = this.entityManager.getComponent(victimId, 'Immunity');
  const victimCuticle = this.entityManager.getComponent(victimId, 'ThickCuticle');
  let defense = 0;
  
  if (victimImmunity) defense += victimImmunity.defense;
  if (victimCuticle) defense += victimCuticle.defenseBonus;

  // Défense > 10 → Trop blindé
  if (defense > 12) return false;

  return true;
}
}