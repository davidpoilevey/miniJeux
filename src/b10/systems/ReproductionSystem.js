
import { ADNHandler, recombinaisonGenetique } from "../../genetic/ADNPlante";
import { CAMB_COMPONENTS } from "../engine/Components";
import { generateComponentParameters } from "../utils/phenotype";

export class ReproductionSystem {
  constructor(entityManager, ocean, createOrganismFunc) {
    this.entityManager = entityManager;
    this.ocean = ocean;
    this.createOrganismFunc=createOrganismFunc;
  }

  update(deltaTime) {
    const organisms = this.entityManager.getEntitiesWithComponents([
      'Position',
      'Genome',
      'Metabolism',
      'BodyPlan'
    ]);

    let asexualBirths = 0;
    let sexualBirths = 0;
    let spores = 0;

    for (const entityId of organisms) {
      const metabolism = this.entityManager.getComponent(entityId, 'Metabolism');
      const bodyPlan = this.entityManager.getComponent(entityId, 'BodyPlan');
      const genome = this.entityManager.getComponent(entityId, 'Genome');

      // Vérifier conditions de reproduction
      if (!this._canReproduce(metabolism, bodyPlan, genome)) continue;

      // Déterminer mode selon composants
      const hasSporulation = this.entityManager.hasComponent(entityId, 'Sporulation');
      const hasSexual = this.entityManager.hasComponent(entityId, 'GeneticRecombination');

      if (hasSporulation) {
        // SPORULATION - Plusieurs spores
        const sporeCount = this._sporulate(entityId);
        spores += sporeCount;
      } 
      else if (hasSexual) {
        // SEXUÉ - Chercher partenaire
        const partner = this._findPartner(entityId);
        if (partner) {
          this._sexualReproduction(entityId, partner);
          sexualBirths++;
        } else {
          // Pas de partenaire → fallback asexué
          this._asexualReproduction(entityId);
          asexualBirths++;
        }
      } 
      else {
        // ASEXUÉ - Clone simple
        this._asexualReproduction(entityId);
        asexualBirths++;
      }
    }

    return { asexualBirths, sexualBirths, spores };
  }

  // ============================================================
  // CONDITIONS
  // ============================================================

  _canReproduce(metabolism, bodyPlan, genome) {
    // Énergie suffisante
    const threshold =  genome.handler.readFloat('reproductionThreshold')*0.5+0.3; // 0.3-0.8
    if (metabolism.energyStored < metabolism.maxEnergyStored*threshold) return false;
    if(!metabolism.isMature) return false;

    // Adulte (fully grown)
    //if (!bodyPlan.isFullyGrown && genome.handler.readBool('attendComplet')) return false;

    // Probabilité
    if (Math.random() > 0.05) return false; // 5% par tick

    return true;
  }

  // ============================================================
  // ASEXUÉ - Clone direct
  // ============================================================

  _asexualReproduction(parentId) {
    const position = this.entityManager.getComponent(parentId, 'Position');
    const genome = this.entityManager.getComponent(parentId, 'Genome');
    const metabolism = this.entityManager.getComponent(parentId, 'Metabolism');

    // Trouver case adjacente libre
    const spawnPos = this._findFreeAdjacentPosition(position, 2); // Rayon 2
    if (!spawnPos) return false;

    // ADN avec mutations
    const childADN = genome.handler.mutatedVersion();

    // Créer enfant
    this._createOffspring(spawnPos.x, spawnPos.y, childADN, parentId);

    // Coût énergétique
    metabolism.energyStored -= 50;

    return true;
  }

  // ============================================================
  // SEXUÉ - Recombinaison avec partenaire
  // ============================================================

  _findPartner(entityId) {
    const position = this.entityManager.getComponent(entityId, 'Position');
    const bodyPlan = this.entityManager.getComponent(entityId, 'BodyPlan');

    // Chercher dans un rayon large (vu la taille des organismes)
    const searchRadius = 10 + Math.max(bodyPlan.maxSegments, 5);

    const organisms = this.entityManager.getEntitiesWithComponents([
      'Position',
      'BodyPlan',
      'Metabolism'
    ]);

    let closestPartner = null;
    let minDistance = Infinity;

    for (const otherId of organisms) {
      if (otherId === entityId) continue;

      const otherPos = this.entityManager.getComponent(otherId, 'Position');
      const otherBody = this.entityManager.getComponent(otherId, 'BodyPlan');
      const otherMeta = this.entityManager.getComponent(otherId, 'Metabolism');

      // Partenaire doit être adulte et avoir de l'énergie
      if (!otherBody.isFullyGrown) continue;
      if (otherMeta.energyStored < 50) continue;

      // Distance entre HEAD positions
      const dx = position.x - otherPos.x;
      const dy = position.y - otherPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < searchRadius && distance < minDistance) {
        minDistance = distance;
        closestPartner = otherId;
      }
    }

    return closestPartner;
  }

  _sexualReproduction(parent1Id, parent2Id) {
    const pos1 = this.entityManager.getComponent(parent1Id, 'Position');
    const genome1 = this.entityManager.getComponent(parent1Id, 'Genome');
    const meta1 = this.entityManager.getComponent(parent1Id, 'Metabolism');

    const genome2 = this.entityManager.getComponent(parent2Id, 'Genome');
    const meta2 = this.entityManager.getComponent(parent2Id, 'Metabolism');

    // Trouver position entre les deux parents
    const midX = Math.floor((pos1.x + this.entityManager.getComponent(parent2Id, 'Position').x) / 2);
    const midY = Math.floor((pos1.y + this.entityManager.getComponent(parent2Id, 'Position').y) / 2);
    
    const spawnPos = this._findFreeAdjacentPosition({ x: midX, y: midY }, 5);
    if (!spawnPos) return false;

    // RECOMBINAISON GÉNÉTIQUE
    
    const [childADN, unusedADN] = recombinaisonGenetique(
      genome1.handler.adn,
      genome2.handler.adn
    );

    // Créer enfant
    this._createOffspring(spawnPos.x, spawnPos.y, childADN, parent1Id);

    // Coût énergétique partagé
    meta1.energyStored -= 30;
    meta2.energyStored -= 30;

    return true;
  }

  // ============================================================
  // SPORULATION - Plusieurs spores dispersées
  // ============================================================

_sporulate(parentId) {
  const position   = this.entityManager.getComponent(parentId, 'Position');
  const genome     = this.entityManager.getComponent(parentId, 'Genome');
  const metabolism = this.entityManager.getComponent(parentId, 'Metabolism');
  const sporulation = this.entityManager.getComponent(parentId, 'Sporulation');

  // ── Gardes ───────────────────────────────────────────────────────────────
  const hasClock = this.entityManager.hasComponent(parentId, 'BiologicalClock');

  if (hasClock) {
    // Sporulation synchronisée sur le cycle océan (fenêtre étroite)
    const clock = this.entityManager.getComponent(parentId, 'BiologicalClock');
    const phase = this.ocean.dayNightCycle;
    const targetPhase = clock.sporulationPhase ?? 0.5; // Moment du cycle choisi par ADN
    const window = 0.05; // Fenêtre de 5% du cycle
    if (Math.abs(phase - targetPhase) > window) return 0;
    // Coût réduit car synchronisé (efficacité biologique)
    if (metabolism.energyStored < metabolism.maxEnergyStored * 0.8) return 0;
  } else {
    // Sans horloge : coût et cooldown plus sévères
    if (metabolism.energyStored < metabolism.maxEnergyStored * 0.9) return 0;
    sporulation.cooldown = sporulation.cooldown ?? 0;
    if (sporulation.cooldown > 0) { sporulation.cooldown--; return 0; }
  }

  // ── Nombre de spores — raisonnable via ADN ────────────────────────────────
  // On écrase le sporeCount hérité par quelque chose de viable
  const sporeCount =   hasClock ? sporulation.sporeCount:sporulation.sporeCount-1;
  const dispersalRange = Math.min(sporulation.dispersalRange, 50); // Max 50 cases

  let sporesCreated = 0;
  for (let i = 0; i < sporeCount; i++) {
    const angle    = Math.random() * Math.PI * 2;
    const distance = Math.random() * dispersalRange;
    const wrapped  = this.ocean.wrap(
      Math.round(position.x + Math.cos(angle) * distance),
      Math.round(position.y + Math.sin(angle) * distance)
    );

    if (!this.ocean.isFree(wrapped.x, wrapped.y)) continue;

    const sporeADN = genome.handler.mutatedVersion();
    this._createOffspring(wrapped.x, wrapped.y, sporeADN, parentId);
    sporesCreated++;
  }

  // ── Coût & cooldown ───────────────────────────────────────────────────────
  
  const energyCost = sporesCreated * (hasClock ? 40 : 55);
  metabolism.energyStored -= energyCost;

  if (!hasClock) {
    sporulation.cooldown = genome.handler.read10('sporulationCooldown') * 20; // 20-200 ticks
  }

  return sporesCreated;
}

  // ============================================================
  // CRÉATION ENFANT
  // ============================================================

  _createOffspring(x, y, adn, parentId) {
    const handler = new ADNHandler(adn);

    // Utiliser createOrganism du CambrienEngine
    // Mais besoin d'accès à l'engine... 
    // Solution : passer une référence ou faire autrement

    // TEMPORAIRE : Appeler directement la création
    //const childId = this.entityManager.createEntity();

     const childId = this.createOrganismFunc(x, y, adn);
const childMeta = this.entityManager.getComponent(childId, 'Metabolism');
childMeta.energyStored=10;
childMeta.maxAge=childMeta.maxAge/2;
    // Hériter composants optionnels du parent (avec mutations)
    this._inheritComponents(parentId, childId, handler);

    // Placer HEAD sur grille
    const bodyPlan = this.entityManager.getComponent(childId, 'BodyPlan');
    bodyPlan.cells.push({ dx: 0, dy: 0, role: 'HEAD', age: 0 });
    this.ocean.setEntity(x, y, childId);

    return childId;
  }

  _inheritComponents(parentId, childId, childHandler) {
    // Liste des composants à hériter
  const activeComponents = [];
    
    // LIMITE DE COMPOSANTS
    const MAX_COMPONENTS = Math.round(childHandler.read10('maxComponents')/2)+3; // ou 3 selon ta préférence
    
    // Parcourir tous les composants optionnels possibles
    for (const componentName in CAMB_COMPONENTS) {
      const hasParentComponent = this.entityManager.hasComponent(parentId, componentName);
      
      const inheritProbability = hasParentComponent ? 0.9 : 0.01;
      
      if (Math.random() < inheritProbability) {
        // VÉRIFIER LA LIMITE
        if (activeComponents.length >= MAX_COMPONENTS) {
          // Si mutation (nouveau composant), échanger avec un existant
          if (!hasParentComponent && activeComponents.length > 0) {
            // Retirer un composant aléatoire
            const removeIndex = Math.floor(Math.random() * activeComponents.length);
            const removedComponent = activeComponents.splice(removeIndex, 1)[0];
            this.entityManager.removeComponent(childId, removedComponent);
          } else {
            continue; // Skip si limite atteinte et pas d'échange
          }
        }
        
        const ComponentClass = CAMB_COMPONENTS[componentName];
        const params = generateComponentParameters(componentName, childHandler);
        const instance = new ComponentClass(...params);
        
        this.entityManager.addComponent(childId, componentName, instance);
        activeComponents.push(componentName);
      }
    }
  }

  // Helpers (copier depuis CambrienEngine)
  _readSymmetry(handler) {
    const val = handler.readFloat('symmetry');
    if (val < 0.25) return 'asymmetric';
    if (val < 0.5) return 'bilateral';
    if (val < 0.75) return 'radial3';
    return 'radial5';
  }

  _readLocomotionMode(handler) {
    const val = handler.readFloat('locomotionMode');
    if (val < 0.2) return 'crawl';
    if (val < 0.4) return 'undulate';
    if (val < 0.6) return 'pulse';
    return 'float';
  }

  _findFreeAdjacentPosition(position, radius) {
    for (let r = 1; r <= radius; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) + Math.abs(dy) !== r) continue; // Seulement le périmètre
          
          const wrapped = this.ocean.wrap(position.x + dx, position.y + dy);
          if (this.ocean.isFree(wrapped.x, wrapped.y)) {
            return { x: wrapped.x, y: wrapped.y };
          }
        }
      }
    }
    return null;
  }
}