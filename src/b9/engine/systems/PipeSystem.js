// Nouveau fichier: /src/engine/systems/PipeSystem.js

/**
 * PipeSystem - Formation de réseaux de tuyauterie biologique
 * 
 * Comportements émergents:
 * - Connexions linéaires (tuyaux)
 * - Nœuds (>2 connexions)
 * - Transfert d'énergie le long des pipes
 * - Préférence pour alignement (forme des lignes droites)
 * - Peut traverser le toroïde (wrap-around)
 */

export class PipeSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  update(deltaTime) {
    // Phase 1: Établir connexions (tendance linéaire)
    const connectionResult = this._updateConnections();
    
    // Phase 2: Transfert d'énergie le long des pipes
    const flowResult = this._updateFlow();
    
    return {
      pipes: connectionResult.pipes,
      newConnections: connectionResult.newConnections,
      nodes: connectionResult.nodes,
      energyFlowed: flowResult.energyFlowed
    };
  }

  /**
   * Phase 1: Établir connexions avec préférence pour alignement
   * @private
   */
  _updateConnections() {
    const pipes = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Pipe'
    ]);

    let newConnections = 0;
    let nodes = 0;

    for (const pipeId of pipes) {
      const position = this.entityManager.getComponent(pipeId, 'Position');
      const pipe = this.entityManager.getComponent(pipeId, 'Pipe');

      // Nettoyer connexions mortes
      pipe.connections = pipe.connections.filter(targetId => {
        return this.entityManager.entities.has(targetId);
      });

      // Déterminer si c'est un nœud
      pipe.isNode = pipe.connections.length > 2;
      if (pipe.isNode) nodes++;

      // Maximum 4 connexions (croix)
      if (pipe.connections.length >= 4) continue;

      // Trouver le meilleur candidat pour connexion
      const candidate = this._findBestPipeCandidate(pipeId, position, pipe);
      
      if (candidate) {
        // Connexion bidirectionnelle
        pipe.connections.push(candidate.id);
        candidate.pipe.connections.push(pipeId);
        newConnections++;
      }
    }

    return {
      pipes: pipes.length,
      newConnections,
      nodes
    };
  }

  /**
   * Trouve le meilleur candidat avec préférence pour alignement
   * @private
   */
  _findBestPipeCandidate(pipeId, position, pipe) {
    const neighbors = this.world.getNeighbors(position.x, position.y);
    
    let bestCandidate = null;
    let bestScore = 0;

    for (const neighbor of neighbors) {
      if (!neighbor.entity || neighbor.entity === pipeId) continue;
      if (pipe.connections.includes(neighbor.entity)) continue;

      const targetPipe = this.entityManager.getComponent(neighbor.entity, 'Pipe');
      if (!targetPipe) continue;

      // Éviter de créer trop de connexions sur la cible
      if (targetPipe.connections.length >= 4) continue;

      const targetPos = this.entityManager.getComponent(neighbor.entity, 'Position');

      // Calculer score de connexion
      let score = pipe.pressure * targetPipe.pressure;

      // BONUS MAJEUR : Alignement linéaire
      if (pipe.connections.length > 0) {
        const lastConnected = pipe.connections[pipe.connections.length - 1];
        const lastPos = this.entityManager.getComponent(lastConnected, 'Position');
        
        if (lastPos) {
          // Vérifier si targetPos est aligné avec lastPos → position (ligne droite)
          const dx1 = position.x - lastPos.x;
          const dy1 = position.y - lastPos.y;
          const dx2 = targetPos.x - position.x;
          const dy2 = targetPos.y - position.y;

          // Alignement parfait si même direction
          if ((dx1 === dx2 && dy1 === dy2) || 
              (dx1 === -dx2 && dy1 === -dy2)) {
            score *= 5.0; // ÉNORME bonus alignement
          }
          // Alignement partiel (orthogonal)
          else if ((dx1 === 0 && dx2 === 0) || (dy1 === 0 && dy2 === 0)) {
            score *= 2.0; // Bonus modéré
          }
        }
      }

      // MALUS : Si target a déjà beaucoup de connexions (éviter nœuds multiples)
      if (targetPipe.connections.length >= 2) {
        score *= 0.3;
      }

      // BONUS : Si target n'a qu'une connexion (prolonger le tuyau)
      if (targetPipe.connections.length === 1) {
        score *= 2.0;
      }

      if (score > bestScore) {
        bestScore = score;
        bestCandidate = {
          id: neighbor.entity,
          pipe: targetPipe,
          pos: targetPos
        };
      }
    }

    return bestCandidate;
  }

  /**
   * Phase 2: Transfert d'énergie le long des pipes
   * @private
   */
  _updateFlow() {
    const pipes = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Metabolism',
      'Pipe'
    ]);

    let energyFlowed = 0;
    const processed = new Set();

    for (const pipeId of pipes) {
      if (processed.has(pipeId)) continue;

      const metabolism = this.entityManager.getComponent(pipeId, 'Metabolism');
      const pipe = this.entityManager.getComponent(pipeId, 'Pipe');

      // Parcourir les connexions
      for (const connectedId of pipe.connections) {
        if (processed.has(connectedId)) continue;

        const connectedMeta = this.entityManager.getComponent(connectedId, 'Metabolism');
        if (!connectedMeta) continue;

        // Transfert d'énergie selon différence de pression (énergie)
        const energyDiff = metabolism.energyStored - connectedMeta.energyStored;
        
        if (Math.abs(energyDiff) > 1) {
          const flowAmount = energyDiff * pipe.flowRate * 0.1; // 10% du diff
          
          metabolism.energyStored -= flowAmount;
          connectedMeta.energyStored += flowAmount * 0.95; // 5% de perte
          
          energyFlowed += Math.abs(flowAmount);
        }
      }

      processed.add(pipeId);
    }

    return {
      energyFlowed: energyFlowed.toFixed(2)
    };
  }
}