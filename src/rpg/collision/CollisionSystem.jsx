import { KNIGHT_SIZE } from "../RPGContext";

// collisionSystem.js - Système de collision générique
export class CollisionSystem {
  constructor() {
    this.entities = new Map(); // Stockage des entités avec collision
  }

  // Ajouter une entité avec sa zone de collision
  addEntity(id, entity) {
    entity.bounds = this.calculateBounds(entity);
    this.entities.set(id, entity);
  }

  // Supprimer une entité
  removeEntity(id) {
    this.entities.delete(id);
  }

  clear() {
    this.entities = new Map();
  }
  getEntities() {
    return this.entities;
  }

  // Calculer les limites d'une entité
  calculateBounds(entity) {
    return {
      left: entity.x,
      right: entity.x + entity.width,
      top: entity.y,
      bottom: entity.y + entity.height
    };
  }

  // NEW: Helper to resolve entity box
  getEntityBox(entity) {
    const { x, y } = entity;
    const box = entity.collisionBox || { width: 50, height: 100, offsetX: 0, offsetY: 0 };

    return {
      left: x + box.offsetX,
      top: y + box.offsetY,
      right: x + box.offsetX + box.width,
      bottom: y + box.offsetY + box.height
    };
  }

  checkCollision(pos1, box1, pos2, box2) {
    const bounds1 = {
      left: pos1.x + (box1.offsetX || 0),
      right: pos1.x + (box1.offsetX || 0) + box1.width,
      top: pos1.y + (box1.offsetY || 0),
      bottom: pos1.y + (box1.offsetY || 0) + box1.height
    };

    const bounds2 = {
      left: pos2.x + (box2.offsetX || 0),
      right: pos2.x + (box2.offsetX || 0) + box2.width,
      top: pos2.y + (box2.offsetY || 0),
      bottom: pos2.y + (box2.offsetY || 0) + box2.height
    };

    return !(
      bounds1.right <= bounds2.left ||
      bounds1.left >= bounds2.right ||
      bounds1.bottom <= bounds2.top ||
      bounds1.top >= bounds2.bottom
    );
  }

  // Trouver toutes les collisions pour une position donnée
  getCollisions(position, size, excludeId = null) {
    const collisions = [];

    for (const [id, entity] of this.entities) {
      if (id === excludeId) continue;
      const box = entity.collisionBox || { width: 50, height: 100, offsetX: 0, offsetY: 0 };

      if (this.checkCollision(
        position, size, { x: entity.x, y: entity.y }, box)) {
        collisions.push({ id, entity });
      }

    }

    return collisions;
  }

  // Vérifier si un mouvement est possible
  canMoveTo(currentPos, targetPos, size, excludeId = null) {
    const collisions = this.getCollisions(targetPos, size, excludeId);

    // Séparer les collisions par type
    const obstacles = collisions.filter(c => {
      return c.entity.isObstacle();
    });
    const interactables = collisions.filter(c => c.entity.isInteractable());
    const triggers = collisions.filter(c => c.entity.isTrigger());

    return {
      canMove: obstacles.length === 0,
      obstacles,
      interactables,
      triggers
    };
  }

  isOnGround(position, size) {
    if (size == null)
      size = KNIGHT_SIZE;
    const footPos = {
      x: position.x + size.width / 4,
      y: position.y + size.height + 1 // juste sous le perso
    };

    const groundCollisions = this.getCollisions(footPos, { width: size.width / 2, height: 2 })
      .filter(c => c.entity.type === 'obstacle'); // ← tu dois définir ce type dans tes entités

    return groundCollisions;
  }

  // Corriger une position pour éviter les obstacles
  correctPosition(targetPos, sourcePos, size, excludeId = null, mapWidth=1500) {
    const actualSize = size || KNIGHT_SIZE;
    const prevPos = sourcePos || targetPos;
const clampedX = Math.max(0, Math.min(targetPos.x, mapWidth - actualSize.width));
targetPos.x=clampedX;

    const result = this.canMoveTo(null, targetPos, actualSize, excludeId);

    // Vérifie s’il y a du sol juste en dessous
    const collisionsSol = this.isOnGround(targetPos, actualSize);
    result.falling = collisionsSol.length == 0;

    // ✅ 1. Cas normal : tout va bien
    if (result.canMove) {
      return { position: targetPos, interactions: result };
    }


    // ✅ 3. Défusion intelligente si on est coincé en latéral
    const deltaX = targetPos.x - prevPos.x;
    const collisionObstacles = result.obstacles || [];
    for (const obstacle of collisionObstacles) {
      const obsX = obstacle.entity.x || obstacle.entity.position?.x || 0;
      const obsWidth = obstacle.entity.width || obstacle.entity.position?.width || 0;

      const knightRight = prevPos.x + actualSize.width;
      const knightLeft = prevPos.x;

      const escapeLeft = deltaX < 0 && obsX > knightRight - 24;
      const escapeRight = deltaX > 0 && obsX + obsWidth < knightLeft + 24;

      if (escapeLeft || escapeRight) {
        return {
          position: targetPos,
          interactions: result,
          corrected: true,
          unfused: true
        };
      }
    }
    // ✅ 2. Atterrissage détecté
    if (collisionsSol.length > 0) {
      const groundTopY = Math.min(...collisionsSol.map(c => c.entity.y || c.entity.position?.y || 0));
      const snappedY = groundTopY - size.height;
      if (groundTopY >= targetPos.y)
        return {
          position: { x: targetPos.x, y: snappedY },
          interactions: result,
          snappedToGround: true
        };
    }


    return {
      interactions: result,
      corrected: false
    };
  }
}



