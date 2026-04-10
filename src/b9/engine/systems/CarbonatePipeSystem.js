// Nouveau fichier: /src/engine/systems/CarbonatePipeSystem.js

import { ADNHandler } from '../../../genetic/ADNPlante.js';
import { generateComponentParameters } from '../../utils/RandomBacteriaGenerator.js';
import { CarbonatePipe, Genome, Metabolism, OPTIONAL_COMPONENTS, Position, SPECIALIZATION_COMPONENTS } from '../components/Components.js';

/**
 * CarbonatePipeSystem - Construction de structures linéaires
 * 
 * Comportement:
 * - Croissance unidirectionnelle (comme racines/piliers)
 * - Clone jusqu'à obstacle ou maxLength
 * - Coût unique pour toute la structure (pas par clone)
 * - Forme murs, piliers, racines, arches
 */

export class CarbonatePipeSystem {
  constructor(entityManager, world) {
    this.entityManager = entityManager;
    this.world = world;
  }

  update(deltaTime) {
    const builders = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Genome',
      'Metabolism',
      'CarbonatePipe'
    ]);

    let newStructures = 0;
    let totalSegments = 0;

    for (const builderId of builders) {
      const position = this.entityManager.getComponent(builderId, 'Position');
      const genome = this.entityManager.getComponent(builderId, 'Genome');
      const metabolism = this.entityManager.getComponent(builderId, 'Metabolism');
      const carbonatePipe = this.entityManager.getComponent(builderId, 'CarbonatePipe');

      // Seulement les racines peuvent initier construction
      if (!carbonatePipe.isRoot) continue;

      // A déjà construit ce cycle
      if (carbonatePipe.hasGrown) continue;

      // Vérifier énergie (coût unique pour toute la structure)
      const reproductionThreshold = 50 + genome.handler.readFloat('reproductionThreshold') * 100;
      if (metabolism.energyStored < reproductionThreshold) continue;

      // Probabilité de croissance (10% par tick si conditions ok)
      if (Math.random() > 0.1) continue;

      // CONSTRUIRE LA STRUCTURE
      const segments = this._buildStructure(
        builderId,
        position,
        genome,
        metabolism,
        carbonatePipe
      );

      if (segments > 0) {
        // Coût unique (pas par segment)
        metabolism.energyStored -= reproductionThreshold;
        carbonatePipe.hasGrown = true;
        
        newStructures++;
        totalSegments += segments;
      }
    }

    return {
      builders: builders.length,
      newStructures,
      totalSegments
    };
  }

  /**
   * Construit une structure linéaire complète
   * @private
   */
 // Dans CarbonatePipeSystem._buildStructure()

_buildStructure(rootId, rootPos, rootGenome, rootMeta, rootPipe) {
    
  // Direction de base (génétique)
  let angle = rootPipe.growthDirection;
  
  // CHIMIOTACTISME : Modifier angle selon gradients chimiques
  const chemicalInfluence = this._getChemicalInfluence(rootPos, rootGenome);
  angle += chemicalInfluence; // Déviation de l'angle

  const dx = Math.round(Math.cos(angle));
  const dy = Math.round(Math.sin(angle));

  let currentX = rootPos.x;
  let currentY = rootPos.y;
  let segmentsBuilt = 0;

  // Construire jusqu'à obstacle ou maxLength
  for (let i = 1; i <= rootPipe.maxLength; i++) {
    // RECALCULER angle à chaque segment (croissance dynamique)
    if (i > 1) {
      const newInfluence = this._getChemicalInfluence({ x: currentX, y: currentY }, rootGenome);
      angle = rootPipe.growthDirection + newInfluence * (i / rootPipe.maxLength); // Influence progressive
      
      // Recalculer direction
      const newDx = Math.round(Math.cos(angle));
      const newDy = Math.round(Math.sin(angle));
      
      currentX += newDx;
      currentY += newDy;
    } else {
      currentX += dx;
      currentY += dy;
    }

    const wrappedPos = this.world.wrap(currentX, currentY);

    if (!this.world.isFree(wrappedPos.x, wrappedPos.y)) {
      break;
    }

    // CRÉER SEGMENT (code existant)
    const segmentId = this.entityManager.createEntity();
    
    this.entityManager.addComponent(segmentId, 'Position', 
      new Position(wrappedPos.x, wrappedPos.y)
    );
    this.world.setEntity(wrappedPos.x, wrappedPos.y, segmentId);

    const childADN = rootGenome.handler.adn.map(chromosome => [...chromosome]);
    const childHandler = new ADNHandler(childADN);
    this.entityManager.addComponent(segmentId, 'Genome', 
      new Genome(childADN, childHandler)
    );

    const segmentMeta = new Metabolism(rootMeta.maxEnergyStored, rootMeta.maxAge);
    segmentMeta.maintenanceCost = CarbonatePipe.MAINTENANCE_COST;
    segmentMeta.energyStored=10;
    this.entityManager.addComponent(segmentId, 'Metabolism', segmentMeta);

    const segmentPipe = new CarbonatePipe(
      rootPipe.growthDirection,
      rootPipe.structuralStrength
    );
    segmentPipe.isRoot = false;
    segmentPipe.generation = i;
    segmentPipe.hasGrown = true;
    this.entityManager.addComponent(segmentId, 'CarbonatePipe', segmentPipe);

    this._inheritStructuralComponents(rootId, segmentId);

    segmentsBuilt++;
  }

  return segmentsBuilt;
}

/**
 * Calcule l'influence chimique sur l'angle de croissance
 * @private
 */
_getChemicalInfluence(position, genome) {
  // Lire préférences génétiques (molécule attractive/répulsive)
  const attractedTo = ['A', 'B', 'C', 'D'][Math.floor(genome.handler.readFloat('pipeAttractMolecule') * 4)];
  const repelledBy = ['A', 'B', 'C', 'D'][Math.floor(genome.handler.readFloat('pipeRepelMolecule') * 4)];
  const sensitivity = genome.handler.readFloat('pipeChemicalSensitivity'); // 0.0-1.0

  let totalInfluence = 0;

  // Gradient de la molécule attractive
  const attractGradient = this.world.getChemicalGradient(
    position.x,
    position.y,
    attractedTo,
    3 // Petit rayon
  );

  if (attractGradient.strength > 0.5) {
    // Calculer angle vers le gradient
    const attractAngle = Math.atan2(attractGradient.dy, attractGradient.dx);
    totalInfluence += attractAngle * sensitivity * attractGradient.strength * 0.5;
  }

  // Gradient de la molécule répulsive
  const repelGradient = this.world.getChemicalGradient(
    position.x,
    position.y,
    repelledBy,
    3
  );

  if (repelGradient.strength > 0.5) {
    // Calculer angle opposé au gradient
    const repelAngle = Math.atan2(repelGradient.dy, repelGradient.dx);
    totalInfluence -= repelAngle * sensitivity * repelGradient.strength * 0.5;
  }

  return totalInfluence;
}

  /**
   * Hérite uniquement composants structurels (défense, adhésion)
   * @private
   */
  _inheritStructuralComponents(parentId, childId) {
    const structuralComponents = [
      'ReinforcedWall',
      'Immunity',
      'ThickCuticle',
      'Adhesion'
    ];


    const childGenome = this.entityManager.getComponent(childId, 'Genome');
const ALL_COMPONENTS = { ...OPTIONAL_COMPONENTS , ...SPECIALIZATION_COMPONENTS };
    for (const compName of structuralComponents) {
      if (this.entityManager.hasComponent(parentId, compName)) {
        const ComponentClass = ALL_COMPONENTS[compName];
        const params = generateComponentParameters(compName, childGenome.handler);
        const instance = new ComponentClass(...params);
        
        this.entityManager.addComponent(childId, compName, instance);
      }
    }
  }
}