export class LocomotionSystem {
  constructor(entityManager, ocean) {
    this.entityManager = entityManager;
    this.ocean = ocean;
  }

  update(deltaTime) {
    const organisms = this.entityManager.getEntitiesWithComponents([
      'Position', 'BodyPlan', 'Metabolism', 'Navigation'
    ]);

    let movements = 0;

    for (const entityId of organisms) {
      const navigation = this.entityManager.getComponent(entityId, 'Navigation');
      if (!navigation.targetDirection) continue;

      const bodyPlan = this.entityManager.getComponent(entityId, 'BodyPlan');
      if (bodyPlan.locomotionMode === 'anchored') continue;

      const moved = this._executeMovement(entityId, navigation.targetDirection, bodyPlan.locomotionMode);

      if (moved) {
        movements++;
        navigation.stuckCounter = 0;
      } else {
        navigation.stuckCounter = (navigation.stuckCounter ?? 0) + 1;

        // Bloqué depuis trop longtemps → forcer direction aléatoire
        if (navigation.stuckCounter > 10) {
          const dirs = [
            { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
            { dx: 0, dy:  1 }, { dx: -1, dy: 0 }
          ];
          navigation.targetDirection = dirs[Math.floor(Math.random() * 4)];
          navigation.stuckCounter = 0;
        }
      }
    }

    return { movements };
  }

  _executeMovement(entityId, direction, mode) {
    const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
    const bodyPlan   = this.entityManager.getComponent(entityId, 'BodyPlan');

    // Pas de mouvement si plus d'énergie
    if (metabolism.energyStored <= 0) return false;

    const moveChances = {
      crawl:    0.3,
      undulate: 0.4,
      pulse:    0.2,
      float:    0.5,
      anchored: 0.2
    };

    if (Math.random() > (moveChances[mode] ?? 0.3)) return false;

    switch (mode) {
      case 'crawl':    return this._crawl(entityId, direction, metabolism);
      case 'undulate': return this._undulate(entityId, direction, metabolism, bodyPlan);
      case 'pulse':    return this._pulse(entityId, direction, metabolism, bodyPlan);
        default:    return this._float(entityId, direction, metabolism);
       
    }
  }

  // ── CRAWL ────────────────────────────────────────────────────────────────

  _crawl(entityId, direction, metabolism) {
    const moved = this._moveOrganism(entityId, direction.dx, direction.dy);
    if (moved) metabolism.energyStored -= 0.05;
    return moved;
  }

  // ── UNDULATE ─────────────────────────────────────────────────────────────

  _undulate(entityId, direction, metabolism, bodyPlan) {
    const bodyAngle = Math.atan2(direction.dy, direction.dx);
    // Wiggle basé sur tickCount plutôt que Date.now() — déterministe et perf stable
    const wiggle = Math.sin(bodyPlan._wiggleTick = ((bodyPlan._wiggleTick ?? 0) + 0.3)) * 0.4;

    const finalDx = Math.sign(Math.cos(bodyAngle + wiggle));
    const finalDy = Math.sign(Math.sin(bodyAngle + wiggle));

    const moved = this._moveOrganism(entityId, finalDx || direction.dx, finalDy || direction.dy);
    if (moved) {
      metabolism.energyStored -= 0.07;
      bodyPlan.headDirection = bodyAngle;
    }
    return moved;
  }

  // ── PULSE ────────────────────────────────────────────────────────────────

  _pulse(entityId, direction, metabolism, bodyPlan) {
    bodyPlan.pulsePhase = bodyPlan.pulsePhase ?? 'contract';

    if (bodyPlan.pulsePhase === 'contract') {
      bodyPlan.pulsePhase = 'expand';
      metabolism.energyStored -= 0.02;
      return false;
    }

    bodyPlan.pulsePhase = 'contract';
    const moved = this._moveOrganism(entityId, direction.dx, direction.dy);
    if (moved) metabolism.energyStored -= 0.03;
    return moved;
  }

  // ── FLOAT ────────────────────────────────────────────────────────────────

  _float(entityId, direction, metabolism) {
    const position = this.entityManager.getComponent(entityId, 'Position');
    const props = this.ocean.getBiomeProperties(this.ocean.getBiome(position.x, position.y));

    const driftDx = direction.dx + (Math.random() - 0.5) * props.currentStrength * 2;
    const driftDy = direction.dy + (Math.random() - 0.5) * props.currentStrength * 2;

    // Math.sign évite les grands sauts (driftDx peut dépasser 1)
    const moved = this._moveOrganism(entityId, Math.sign(driftDx) || direction.dx, Math.sign(driftDy) || direction.dy);
    if (moved) metabolism.energyStored -= 0.01;
    return moved;
  }

  // ── MOVE ORGANISM ────────────────────────────────────────────────────────

  /**
   * Déplace toutes les cellules de l'organisme de (dx, dy).
   * Les cellules ont des positions absolues { x, y } dans l'océan.
   */
  _moveOrganism(entityId, dx, dy) {
    if (dx === 0 && dy === 0) return false;

    const bodyPlan = this.entityManager.getComponent(entityId, 'BodyPlan');
    const cells = bodyPlan.cells;

    // ── Vérifier collisions AVANT de bouger ──
    for (const cell of cells) {
      const { x: wx, y: wy } = this.ocean.wrap(cell.x + dx, cell.y + dy);
      // Substrat bloque le mouvement
      if (this.ocean.isSubstrate(wx, wy)) return false;
      // Entité étrangère bloque le mouvement
      const occupant = this.ocean.getEntity(wx, wy);
      if (occupant !== null && occupant !== undefined && occupant !== entityId) return false;
    }

    // ── Libérer anciennes positions ──
    for (const cell of cells) {
      const { x: wx, y: wy } = this.ocean.wrap(cell.x, cell.y);
      this.ocean.removeEntity(wx, wy);
    }

    // ── Déplacer ──
    for (const cell of cells) {
      const wrapped = this.ocean.wrap(cell.x + dx, cell.y + dy);
      cell.x = wrapped.x;
      cell.y = wrapped.y;
    }

    // Mettre à jour Position (HEAD = première cellule)
    const position = this.entityManager.getComponent(entityId, 'Position');
    position.x = cells[0].x;
    position.y = cells[0].y;

    // ── Occuper nouvelles positions ──
    for (const cell of cells) {
      this.ocean.setEntity(cell.x, cell.y, entityId);
    }

    return true;
  }
}