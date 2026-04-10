/**
 * Persistance PocketBase pour Carbonifere14 — 3 mondes.
 *
 * Collections :
 *   carbonifere14         — { worldId, worldSeed, tick, seaLevel, geoHistory, plants }
 *   carbonifere14_likes   — { worldId, plantId, flowerId, visitorId }
 *   carbonifere14_commands — { worldId, type, cellX, cellY }
 */

import PocketBase from 'pocketbase';

const PB_URL = 'https://bdd.poilevey.org';
const COL    = 'carbonifere14';
const LIKES  = 'carbonifere14_likes';
const CMDS   = 'carbonifere14_commands';

let _pb = null;
function getPB() {
  if (!_pb) _pb = new PocketBase(PB_URL);
  return _pb;
}

// ── Identité visiteur ─────────────────────────────────────────────────────────

const VISITOR_KEY = 'c14_visitor_id';

export function getVisitorId() {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

// ── Codec ADN ─────────────────────────────────────────────────────────────────

function decodeADN(str) {
  const result = [];
  for (let i = 0; i + 4 <= str.length; i += 4) {
    result.push(str.slice(i, i + 4).split(''));
  }
  return result;
}

function decodePlant(data) {
  const adn = typeof data.adn === 'string' ? decodeADN(data.adn) : data.adn;
  return {
    ...data,
    adn,
    fruits: (data.fruits || []).map(fr => ({
      ...fr,
      adnChild: typeof fr.adnChild === 'string' ? decodeADN(fr.adnChild) : fr.adnChild,
    })),
  };
}

// ── Chargement de tous les mondes ─────────────────────────────────────────────

export async function loadAllWorlds() {
  const pb = getPB();
  try {
    const result = await pb.collection(COL).getList(1, 10, {
      sort: 'worldId', requestKey: null,
    });
    return result.items.map(rec => ({
      worldId:    rec.worldId,
      worldSeed:  rec.worldSeed,
      tick:       rec.tick,
      seaLevel:   rec.seaLevel,
      geoHistory: rec.geoHistory || [],
      plants:     (rec.plants || []).map(decodePlant),
    }));
  } catch (e) {
    console.warn('[C14 PB] Erreur loadAllWorlds:', e?.message ?? e);
    return [];
  }
}

// ── Likes ─────────────────────────────────────────────────────────────────────

const _likedSet = new Set(
  JSON.parse(localStorage.getItem('c14_liked') || '[]')
);

function persistLikedSet() {
  localStorage.setItem('c14_liked', JSON.stringify([..._likedSet].slice(-200)));
}

export async function likeFlower(worldId, plantId, flowerId) {
  const key = `${worldId}:${plantId}:${flowerId}`;
  if (_likedSet.has(key)) return { ok: false, reason: 'already_liked' };

  const pb        = getPB();
  const visitorId = getVisitorId();
  try {
    await pb.collection(LIKES).create({ worldId, plantId, flowerId, visitorId }, { requestKey: null });
    _likedSet.add(key);
    persistLikedSet();
    return { ok: true };
  } catch (e) {
    console.warn('[C14 PB] Erreur like:', e?.message ?? e);
    return { ok: false, reason: 'error' };
  }
}

export function hasLiked(worldId, plantId, flowerId) {
  return _likedSet.has(`${worldId}:${plantId}:${flowerId}`);
}

// ── Commandes géologiques ─────────────────────────────────────────────────────

export async function sendGeoEvent(worldId, type, cellX = null, cellY = null) {
  const pb = getPB();
  try {
    await pb.collection(CMDS).create({ worldId, type, cellX, cellY }, { requestKey: null });
    return { ok: true };
  } catch (e) {
    console.warn('[C14 PB] Erreur sendGeoEvent:', e?.message ?? e);
    return { ok: false, reason: e?.message };
  }
}

export async function sendInteraction(worldId, type, plantId, itemId) {
  const pb = getPB();
  try {
    await pb.collection(CMDS).create({ worldId, type, plantId, itemId }, { requestKey: null });
    return { ok: true };
  } catch (e) {
    console.warn('[C14 PB] Erreur sendInteraction:', e?.message ?? e);
    return { ok: false, reason: e?.message };
  }
}
