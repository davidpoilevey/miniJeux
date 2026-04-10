export class GrowthSystem {
  constructor(entityManager, ocean) {
    this.entityManager = entityManager;
    this.ocean = ocean;
  }

  update(deltaTime) {
    const organisms = this.entityManager.getEntitiesWithComponents([
      'Position', 'Genome', 'Metabolism', 'BodyPlan'
    ]);

    let growthEvents = 0;
    let deathByAttrition = 0;
    
    for (const entityId of organisms) {
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
      const bodyPlan   = this.entityManager.getComponent(entityId, 'BodyPlan');
          const genome   = this.entityManager.getComponent(entityId, 'Genome');

      // 1. Mort par attrition
      if (this._checkAttritionDeath(entityId, bodyPlan)) {
        deathByAttrition++;
        continue;
      }
      // Après _checkAttritionDeath :
if (this._checkOvercrowding(entityId, bodyPlan)) continue;
     this._checkSuffocation(entityId, bodyPlan);

      // 2. Vieillir les cellules
      this._ageCells(bodyPlan, deltaTime);

      // 3. Croissance
      if (!bodyPlan.isFullyGrown) {
        if (this._canGrow(entityId, metabolism, bodyPlan, genome)) {
          const position = this.entityManager.getComponent(entityId, 'Position');
          const grew = this._grow(entityId, position, genome, metabolism, bodyPlan);
          if (grew) growthEvents++;
        }
      } else {
        // Régénération possible si on a perdu des cellules
        const regen = this.entityManager.getComponent(entityId, 'Regeneration');
        if (regen && bodyPlan.cells.length < bodyPlan.peakCellCount) {
          bodyPlan.isFullyGrown = false;
        }
      }

      // 4. Mise à jour maintenance
      this._updateMaintenanceCost(entityId, metabolism, bodyPlan);
    }

    return { growthEvents, deathByAttrition };
  }
  // mort par suffocation
_checkOvercrowding(entityId, bodyPlan) {
  const head = bodyPlan.cells[0];
  const neighbors = this.ocean.getNeighbors(head.x, head.y);
  
  let occupied = 0;
  for (const n of neighbors) {
    if (n.entity !== null && n.entity !== entityId) occupied++;
  }

  // 8/8 voisins occupés = asphyxie totale
  if (occupied >= 7) { // >=7 laisse une petite tolérance
    this._destroyOrganism(entityId);
    return true;
  }
  return false;
}

_checkSuffocation(entityId, bodyPlan) {
  const toRemove = [];

  for (const cell of bodyPlan.cells) {
    if (cell.role === 'HEAD') continue; // HEAD immortelle

    const neighbors = this.ocean.getNeighbors(cell.x, cell.y);
    let freeSpace = 0;
    let ownCells = 0;
for (const n of neighbors) {
  if (n.entity === null || this.ocean.isSubstrate(n.x, n.y)) freeSpace++;
  else if (n.entity === entityId) ownCells++;
}

// Cellule centrale → protégée
if (ownCells > 5) continue;

// Aucune case vide autour → asphyxie
if (freeSpace <=2) toRemove.push(cell);
  }

  for (const cell of toRemove) {
    this.ocean.removeEntity(cell.x, cell.y);
    bodyPlan.cells.splice(bodyPlan.cells.indexOf(cell), 1);
  }
}
  // ── MORT PAR ATTRITION ────────────────────────────────────────────────────

  _checkAttritionDeath(entityId, bodyPlan) {
    if (bodyPlan.peakCellCount === 0) return false;
    if (bodyPlan.cells.length < Math.ceil(bodyPlan.peakCellCount * 0.5)) {
      this._destroyOrganism(entityId);
      return true;
    }
    return false;
  }

  _destroyOrganism(entityId) {
    const bodyPlan = this.entityManager.getComponent(entityId, 'BodyPlan');
    const position = this.entityManager.getComponent(entityId, 'Position');

    // Bug fix : coordonnées absolues, pas dx/dy
    if (bodyPlan?.cells) {
      for (const cell of bodyPlan.cells) {
        this.ocean.removeEntity(cell.x, cell.y);
      }
    }

    if (position) {
      const biomass = (bodyPlan?.cells.length ?? 1) * 2;
      this.ocean.addNutrients(position.x, position.y, biomass);
    }

    this.entityManager.destroyEntity(entityId);
  }

  // ── CONDITIONS DE CROISSANCE ──────────────────────────────────────────────

  _canGrow(entityId, metabolism, bodyPlan, genome) {
    // Plafond atteint
    if (bodyPlan.cells.length >= bodyPlan.maxTotalCells) {
      bodyPlan.isFullyGrown = true;
      return false;
    }

    // Immature → plafond jeune lu depuis l'ADN (1-10 cellules max avant maturité)
    if (!metabolism.isMature) {
      const genome = this.entityManager.getComponent(entityId, 'Genome');
      const juvenileMax = genome.handler.read10('juvenileMaxCells')+2;
      if (bodyPlan.cells.length >= juvenileMax) return false;
    }
    const maturethreshold = genome.handler.readFloat('maturethreshold');
    // Seuil d'énergie — plus élevé pour les matures (croissance coûteuse)
    const energyThreshold = metabolism.isMature ? maturethreshold*160 : maturethreshold*100;
    if (metabolism.energyStored < energyThreshold) return false;

    // Probabilité de croissance par tick (lente !)
    // Immature : très lent (0.03), mature : normal (0.08)
    const growthChance = metabolism.isMature ? 0.08 : 0.03;
    if (Math.random() > growthChance) return false;

    return true;
  }

  // ── CROISSANCE ────────────────────────────────────────────────────────────

  _grow(entityId, position, genome, metabolism, bodyPlan) {
    const growthPlan = this._buildGrowthPlan(entityId, genome, bodyPlan);
    if (growthPlan.length === 0) return false;

    const isRadial = bodyPlan.symmetry === 'radial3' || bodyPlan.symmetry === 'radial5';
    let cellsAdded = 0;

    for (let i = 0; i < bodyPlan.growthRate && growthPlan.length > 0; i++) {
      const nextCell = growthPlan.shift();

      if (!isRadial) {
        const env = this._getEnvironmentalInfluence(
          nextCell.x + position.x,  // Bug fix : utiliser x/y pas dx/dy
          nextCell.y + position.y,
          entityId
        );
        nextCell.x += env.dxOffset;
        nextCell.y += env.dyOffset;
      }

      const absX = position.x + nextCell.x;
      const absY = position.y + nextCell.y;
      const wrapped = this.ocean.wrap(absX, absY);

      if (!this.ocean.isFree(wrapped.x, wrapped.y)) continue;

      bodyPlan.cells.push({
        x: wrapped.x,   // Coordonnées absolues, cohérent avec LocomotionSystem
        y: wrapped.y,
        role: nextCell.role,
        age: 0,
        componentSource: nextCell.componentSource
      });

      this.ocean.setEntity(wrapped.x, wrapped.y, entityId);
      cellsAdded++;
    }

    const costPerCellFactor = genome.handler.readFloat('costPerCell')*40;
    // Coût énergétique — significatif pour freiner la croissance
    const costPerCell = metabolism.isMature ? costPerCellFactor : costPerCellFactor/2;
    metabolism.energyStored -= cellsAdded * costPerCell;

    bodyPlan.growthQueue = growthPlan;
    bodyPlan.peakCellCount = Math.max(bodyPlan.peakCellCount, bodyPlan.cells.length);

    return cellsAdded > 0;
  }

  // ── PLANS DE CROISSANCE ───────────────────────────────────────────────────

  _buildGrowthPlan(entityId, genome, bodyPlan) {
    if (bodyPlan.growthQueue?.length > 0) return bodyPlan.growthQueue;

    const plan = [];
    switch (bodyPlan.symmetry) {
      case 'bilateral':  this._buildBilateralPlan(entityId, genome, bodyPlan, plan); break;
      case 'radial3':
      case 'radial5':    this._buildRadialPlan(entityId, genome, bodyPlan, plan, bodyPlan.symmetry); break;
      default:           this._buildAsymmetricPlan(entityId, genome, bodyPlan, plan);
    }
    return plan;
  }

  _buildBilateralPlan(entityId, genome, bodyPlan, plan) {
    const mainAxis   = genome.handler.readFloat('growthAxis') * Math.PI * 2;
    const mainDx     = Math.round(Math.cos(mainAxis));
    const mainDy     = Math.round(Math.sin(mainAxis));
    const axisSegs   = Math.floor(bodyPlan.maxSegments * 0.6);

    for (let i = 0; i < axisSegs; i++) {
      const segX = mainDx * i;
      const segY = mainDy * i;

      plan.push({ x: segX, y: segY, role: 'SEGMENT', componentSource: null });

      // Épines bilatérales (même gène des deux côtés = symétrie)
      if (genome.handler.readBool(`hasSpineOn_${i}_left`)) {
        plan.push({ x: segX - mainDy, y: segY + mainDx, role: 'SPINE', componentSource: 'Spine' });
        plan.push({ x: segX + mainDy, y: segY - mainDx, role: 'SPINE', componentSource: 'Spine' });
      }

      // Filtres (milieu du corps)
      if (i > axisSegs * 0.3 && i < axisSegs * 0.7 && genome.handler.readBool(`hasFilterOn_${i}`)) {
        plan.push({ x: segX - mainDy, y: segY + mainDx, role: 'FILTER', componentSource: 'Filtration' });
        plan.push({ x: segX + mainDy, y: segY - mainDx, role: 'FILTER', componentSource: 'Filtration' });
      }
    }

    this._addHeadAppendices(entityId, genome, plan, mainDx, mainDy);
  }

  _buildRadialPlan(entityId, genome, bodyPlan, plan, symmetry) {
    const armCount     = symmetry === 'radial3' ? 3 : 5;
    const segsPerArm   = Math.floor(bodyPlan.maxSegments / armCount);

    if (segsPerArm < 2) {
      this._buildBilateralPlan(entityId, genome, bodyPlan, plan);
      return;
    }

    for (let arm = 0; arm < armCount; arm++) {
      const angle  = (arm / armCount) * Math.PI * 2;
      const armDx  = Math.cos(angle);
      const armDy  = Math.sin(angle);

      for (let seg = 1; seg <= segsPerArm; seg++) {
        const rx = Math.round(armDx * seg);
        const ry = Math.round(armDy * seg);

        plan.push({ x: rx, y: ry, role: 'SEGMENT', componentSource: null });

        if (this.entityManager.hasComponent(entityId, 'Spine') &&
            genome.handler.readBool(`armSpine_${arm}_${seg}`)) {
          const perpAngle = angle + Math.PI / 2;
          plan.push({
            x: Math.round(rx + Math.cos(perpAngle)),
            y: Math.round(ry + Math.sin(perpAngle)),
            role: 'SPINE', componentSource: 'Spine'
          });
        }

        if (this.entityManager.hasComponent(entityId, 'Filtration') &&
            seg > segsPerArm * 0.6 &&
            genome.handler.readBool(`armFilter_${arm}_${seg}`)) {
          plan.push({ x: rx, y: ry, role: 'FILTER', componentSource: 'Filtration' });
        }
      }

      if (this.entityManager.hasComponent(entityId, 'Eye') && arm < 3) {
        plan.push({ x: Math.round(armDx), y: Math.round(armDy), role: 'EYE', componentSource: 'Eye' });
      }
    }
  }

  _buildAsymmetricPlan(entityId, genome, bodyPlan, plan) {
    const baseAxis  = genome.handler.readFloat('growthAxis') * Math.PI * 2;
    const curvature = genome.handler.readFloat('asymmetric_curvature') * 0.5;

    let angle = baseAxis, cx = 0, cy = 0;

    for (let i = 0; i < bodyPlan.maxSegments; i++) {
      angle += (genome.handler.readFloat(`curve_${i}`) - 0.5) * curvature;
      cx += Math.round(Math.cos(angle));
      cy += Math.round(Math.sin(angle));

      plan.push({ x: cx, y: cy, role: 'SEGMENT', componentSource: null });

      if (genome.handler.readBool(`appendix_${i}`)) {
        const aAngle = genome.handler.readFloat(`appendAngle_${i}`) * Math.PI * 2;
        const isSpine = genome.handler.readBool(`isSpine_${i}`);
        plan.push({
          x: cx + Math.round(Math.cos(aAngle)),
          y: cy + Math.round(Math.sin(aAngle)),
          role: isSpine ? 'SPINE' : 'FILTER',
          componentSource: isSpine ? 'Spine' : 'Filtration'
        });
      }
    }
  }

  _addHeadAppendices(entityId, genome, plan, mainDx, mainDy) {
    if (this.entityManager.hasComponent(entityId, 'Jaw')) {
      plan.push({ x: -mainDx, y: -mainDy, role: 'JAW', componentSource: 'Jaw' });
    }
    if (this.entityManager.hasComponent(entityId, 'Eye')) {
      const eye = this.entityManager.getComponent(entityId, 'Eye');
      if (!eye.count || eye.count === 1) {
        plan.push({ x: -mainDx, y: -mainDy, role: 'EYE', componentSource: 'Eye' });
      }
    }
    if (this.entityManager.hasComponent(entityId, 'Peduncle')) {
      const len = this.entityManager.getComponent(entityId, 'Peduncle').length ?? 3;
      for (let l = 1; l <= len; l++) {
        plan.push({ x: 0, y: l, role: 'PEDUNCLE', componentSource: 'Peduncle' });
      }
    }
    if (this.entityManager.hasComponent(entityId, 'Antenna')) {
      const len = this.entityManager.getComponent(entityId, 'Antenna').length ?? 2;
      for (let l = 1; l <= len; l++) {
        plan.push({ x: -mainDx * l, y: -mainDy * l, role: 'ANTENNA', componentSource: 'Antenna' });
      }
    }
  }

  // ── INFLUENCE ENVIRONNEMENTALE ────────────────────────────────────────────

  _getEnvironmentalInfluence(absX, absY, entityId) {
    const biome     = this.ocean.getBiome(absX, absY);
    const nutrients = this.ocean.getNutrients(absX, absY);
    const light     = this.ocean.getLightAt(absX, absY);

    let dxOffset = 0, dyOffset = 0;

    if (this.entityManager.hasComponent(entityId, 'Photosynthesis') && light > 0.5) dyOffset -= 0.5;
    if (nutrients > 50) {
      dxOffset += (Math.random() - 0.5) * 0.3;
      dyOffset += (Math.random() - 0.5) * 0.3;
    }
    if (biome === 'hydrothermal' && this.entityManager.hasComponent(entityId, 'Chemosynthesis')) dxOffset += 0.5;
    if (biome === 'abyssal') { dxOffset *= 0.3; dyOffset *= 0.3; }

    return { dxOffset: Math.round(dxOffset), dyOffset: Math.round(dyOffset) };
  }

  // ── MAINTENANCE ───────────────────────────────────────────────────────────

  _ageCells(bodyPlan, deltaTime) {
    for (const cell of bodyPlan.cells) cell.age += deltaTime;
  }

  _updateMaintenanceCost(entityId, metabolism, bodyPlan) {
    let cost = bodyPlan.cells.length * 0.01;
    for (const cell of bodyPlan.cells) {
      switch (cell.role) {
        case 'EYE':      cost += 0.01; break;
        case 'JAW':      cost += 0.05; break;
        case 'TENTACLE': cost += 0.01; break;
        case 'SPINE':    cost += 0.01; break;
        case 'PEDUNCLE': cost += 0.001; break;
        case 'FILTER':   cost += 0.03; break;
      }
    }
    if (this.entityManager.hasComponent(entityId, 'Carapace')) cost += bodyPlan.cells.length * 0.005;
    metabolism.maintenanceCost = cost;
  }
}