export default class EntityManager {
  constructor() {
    this._nextId    = 1;
    this._entities  = new Set();
    this._components = new Map(); // componentName → Map<entityId, component>
  }

  createEntity() {
    const id = this._nextId++;
    this._entities.add(id);
    return id;
  }

  destroyEntity(id) {
    this._entities.delete(id);
    for (const map of this._components.values()) map.delete(id);
  }

  addComponent(id, name, data) {
    if (!this._components.has(name)) this._components.set(name, new Map());
    this._components.get(name).set(id, data);
  }

  getComponent(id, name) {
    return this._components.get(name)?.get(id);
  }

  removeComponent(id, name) {
    this._components.get(name)?.delete(id);
  }

  // Returns all entity ids that have every listed component
  query(...names) {
    const result = [];
    for (const id of this._entities) {
      if (names.every(n => this._components.get(n)?.has(id))) result.push(id);
    }
    return result;
  }

  get count() { return this._entities.size; }

  // ── Sérialisation ──────────────────────────────────────────
  toSave() {
    const components = {};
    for (const [name, map] of this._components) {
      components[name] = Object.fromEntries(map);
    }
    return { nextId: this._nextId, entities: [...this._entities], components };
  }

  static fromSave(data) {
    const em = new EntityManager();
    em._nextId   = data.nextId;
    em._entities = new Set(data.entities);
    for (const [name, obj] of Object.entries(data.components)) {
      const map = new Map();
      for (const [id, comp] of Object.entries(obj)) map.set(Number(id), comp);
      em._components.set(name, map);
    }
    return em;
  }
}
