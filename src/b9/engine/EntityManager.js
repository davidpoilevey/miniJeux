/**
 * EntityManager - Gestionnaire d'entités ECS
 * Gère la création, destruction et requêtes d'entités
 */

let nextEntityId = 0;

export class EntityManager {
  constructor() {
    this.entities = new Map(); // entityId -> { id, components: Map }
    this.componentIndex = new Map(); // componentType -> Set(entityIds)
  }

  /**
   * Crée une nouvelle entité
   * @returns {number} - ID de l'entité
   */
  createEntity() {
    const id = nextEntityId++;
    this.entities.set(id, {
      id,
      components: new Map()
    });
    return id;
  }

  /**
   * Détruit une entité et tous ses composants
   * @param {number} entityId
   */
  destroyEntity(entityId) {
    const entity = this.entities.get(entityId);
    if (!entity) return;

    // Retirer des index de composants
    for (const [componentType] of entity.components) {
      const index = this.componentIndex.get(componentType);
      if (index) {
        index.delete(entityId);
      }
    }

    this.entities.delete(entityId);
  }

  /**
   * Ajoute un composant à une entité
   * @param {number} entityId
   * @param {string} componentType - Nom du type de composant
   * @param {*} componentData - Instance du composant
   */
  addComponent(entityId, componentType, componentData) {
    const entity = this.entities.get(entityId);
    if (!entity) return;

    entity.components.set(componentType, componentData);

    // Ajouter à l'index
    if (!this.componentIndex.has(componentType)) {
      this.componentIndex.set(componentType, new Set());
    }
    this.componentIndex.get(componentType).add(entityId);
  }

  /**
   * Récupère un composant d'une entité
   * @param {number} entityId
   * @param {string} componentType
   * @returns {*|null}
   */
  getComponent(entityId, componentType) {
    const entity = this.entities.get(entityId);
    return entity ? entity.components.get(componentType) : null;
  }

  /**
   * Vérifie si une entité a un composant
   * @param {number} entityId
   * @param {string} componentType
   * @returns {boolean}
   */
  hasComponent(entityId, componentType) {
    const entity = this.entities.get(entityId);
    return entity ? entity.components.has(componentType) : false;
  }

  /**
   * Retire un composant d'une entité
   * @param {number} entityId
   * @param {string} componentType
   */
  removeComponent(entityId, componentType) {
    const entity = this.entities.get(entityId);
    if (!entity) return;

    entity.components.delete(componentType);
    
    const index = this.componentIndex.get(componentType);
    if (index) {
      index.delete(entityId);
    }
  }

  /**
   * Récupère toutes les entités ayant un ensemble de composants
   * @param {string[]} componentTypes
   * @returns {number[]} - Liste des IDs d'entités
   */
  getEntitiesWithComponents(componentTypes) {
    if (componentTypes.length === 0) {
      return Array.from(this.entities.keys());
    }

    // Trouver l'intersection des ensembles
    const sets = componentTypes
      .map(type => this.componentIndex.get(type))
      .filter(set => set !== undefined);

    if (sets.length === 0) return [];

    // Commencer avec le plus petit ensemble
    sets.sort((a, b) => a.size - b.size);
    const result = [];

    for (const entityId of sets[0]) {
      if (sets.every(set => set.has(entityId))) {
        result.push(entityId);
      }
    }

    return result;
  }

  /**
   * Compte le nombre d'entités
   * @returns {number}
   */
  getEntityCount() {
    return this.entities.size;
  }

  /**
   * Réinitialise le gestionnaire
   */
  clear() {
    this.entities.clear();
    this.componentIndex.clear();
    nextEntityId = 0;
  }
}
