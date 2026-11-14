import test from 'node:test';
import assert from 'node:assert/strict';
import { pb, makeWorldState, initWorld, resetWorld, applyPendingCommands } from './c14-server.mjs';

const world = () => makeWorldState({ id: 'pangee', name: 'Dagobah' });

test('une erreur de lecture ne crée jamais un monde', async () => {
  let writes = 0;
  pb.collection = () => ({ getList: async () => { throw new Error('PB indisponible'); }, create: async () => { writes++; } });
  await assert.rejects(initWorld(world()), /PB indisponible/);
  assert.equal(writes, 0);
});

test('un monde éteint est restauré sans réensemencement ni nouvelle entrée', async () => {
  let writes = 0;
  pb.collection = () => ({ getList: async () => ({ items: [{ id: 'original', worldSeed: 42, tick: 123, plants: [], geoHistory: [], seaLevel: 30 }] }), create: async () => { writes++; }, update: async () => { writes++; } });
  const w = world();
  await initWorld(w);
  assert.equal(w.recordId, 'original');
  assert.equal(w.tick, 123);
  assert.equal(w.worldSeed, 42);
  assert.deepEqual(w.plants, []);
  assert.equal(writes, 0);
});

test('reset change le relief, crée 80 plantes et conserve l’identité PocketBase', () => {
  const w = { ...world(), recordId: 'original', worldSeed: 42, tick: 123, seaLevel: 99, geoHistory: [{ type: 'flood' }] };
  resetWorld(w);
  assert.equal(w.recordId, 'original');
  assert.notEqual(w.worldSeed, 42);
  assert.equal(w.tick, 0);
  assert.equal(w.seaLevel, 30);
  assert.deepEqual(w.geoHistory, []);
  assert.equal(w.plants.length, 80);
  assert.ok(w.plants.every(p => p.alive));
});

test('la commande reset remplace l’ancien état, annule les commandes antérieures et persiste les curseurs', async () => {
  const w = { ...world(), recordId: 'original', worldSeed: 42, tick: 123 };
  let saved;
  pb.collection = () => ({
    getList: async () => ({ items: [
      { type: 'flood', created: '2026-11-03 10:00:00.000Z' },
      { type: 'resetWorld', created: '2026-11-03 10:00:01.000Z' },
    ] }),
    update: async (id, data) => { assert.equal(id, 'original'); saved = data; },
  });
  await applyPendingCommands(w);
  assert.equal(saved.plants.length, 80);
  assert.deepEqual(saved.geoHistory, []);
  assert.equal(saved.tick, 0);
  assert.equal(saved.lastLikeSyncISO, '2026-11-03 10:00:01.000Z');
  assert.equal(saved.lastCmdSyncISO, '2026-11-03 10:00:01.000Z');
});
