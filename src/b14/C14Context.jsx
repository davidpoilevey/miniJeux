import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import generateWorld, { DEFAULT_SEA_LEVEL } from '../b13/world/WorldGenerator';
import { GRID_COLS, GRID_ROWS } from '../b13/world/WorldGrid';
import { GEO_EVENTS, POSITIONED_EVENTS, applyVolcano, applyEarthquake, applyMeteor, applyMountainRange, applyFlood, applyDrought, applyWarming, applyGlaciation } from '../b13/world/GeoEvents';
import { loadAllWorlds, likeFlower as pbLikeFlower, sendGeoEvent, sendInteraction, hasLiked as pbHasLiked } from './persistence/C14PocketBase';
import { soundManager } from "../rpg/sons/SoundManager";
import geoEventSound from './broum.mp3';

const POLL_INTERVALS = [null, 30000, 10000, 5000, 2000];

// Noms des mondes (mirror de WORLD_DEFS dans c14-server.mjs)
export const WORLD_NAMES = {
  pangee:   'Dagobah',
  gondwana: 'Endor',
  laurasie: 'Tatooine',
};

const C14Context = createContext(null);

export function C14Provider({ children }) {
  // ── État du monde sélectionné (exposé aux composants) ──────────────────────
  const [grid, setGrid]               = useState(null);
  const [worldSeed, setWorldSeed]     = useState(null);
  const [plants, setPlants]           = useState([]);
  const [tick, setTick]               = useState(0);
  const [seaLevel, setSeaLevel]       = useState(DEFAULT_SEA_LEVEL);
  const [gridVersion, setGridVersion] = useState(0);
  const [statsCache, setStatsCache]   = useState({ alive: 0, flowers: 0, fruits: 0 });

  // ── État multi-mondes ──────────────────────────────────────────────────────
  const [worldIds, setWorldIds]             = useState([]);    // liste ordonnée des worldIds connus
  const [selectedWorldId, setSelectedWorldId] = useState(null);

  // ── État UI ────────────────────────────────────────────────────────────────
  const [speed, setSpeedState]        = useState(2);
  const [isPolling, setIsPolling]     = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [cellSize, setCellSizeState]  = useState(16);
  const [selectedFlower, setSelectedFlower] = useState(null);
  const [selectedFruit,  setSelectedFruit]  = useState(null);
  const [loading, setLoading]         = useState(true);
  const [serverStatus, setServerStatus] = useState('connecting');

  // ── Refs internes ──────────────────────────────────────────────────────────
  const plantsRef         = useRef([]);
  const timerRef          = useRef(null);
  // Par worldId : { grid, seed, geoHistoryLen, worldData }
  const worldGrids        = useRef(new Map());
  const worldSeeds        = useRef(new Map());
  const worldGeoLengths   = useRef(new Map());
  const worldDataCache    = useRef(new Map());   // dernier état complet par worldId
  const selectedWorldIdRef = useRef(null);

  useEffect(() => { plantsRef.current = plants; }, [plants]);
  useEffect(() => { selectedWorldIdRef.current = selectedWorldId; }, [selectedWorldId]);

  useEffect(() => {
    soundManager.loadSounds({ geoEvent: geoEventSound });
  }, []);

  const setCellSize = useCallback((v) => {
    setCellSizeState(Math.max(6, Math.min(40, Math.round(v))));
  }, []);

  // ── Replay historique géologique ──────────────────────────────────────────
  const replayGeoHistory = useCallback((grid, history, sl) => {
    let currentSeaLevel = sl ?? DEFAULT_SEA_LEVEL;
    for (const cmd of history) {
      const cx = cmd.cellX ?? 0;
      const cy = cmd.cellY ?? 0;
      switch (cmd.type) {
        case GEO_EVENTS.VOLCANO:        applyVolcano(grid, cx, cy, currentSeaLevel);              break;
        case GEO_EVENTS.EARTHQUAKE:     applyEarthquake(grid, cx, cy, currentSeaLevel);           break;
        case GEO_EVENTS.METEOR:         applyMeteor(grid, cx, cy, currentSeaLevel);               break;
        case GEO_EVENTS.MOUNTAIN_RANGE: applyMountainRange(grid, cx, cy, currentSeaLevel);        break;
        case GEO_EVENTS.FLOOD:          currentSeaLevel = applyFlood(grid, currentSeaLevel);      break;
        case GEO_EVENTS.DROUGHT:        currentSeaLevel = applyDrought(grid, currentSeaLevel);    break;
        case GEO_EVENTS.WARMING:        currentSeaLevel = applyWarming(grid, currentSeaLevel);    break;
        case GEO_EVENTS.GLACIATION:     currentSeaLevel = applyGlaciation(grid, currentSeaLevel); break;
        default: break;
      }
    }
  }, []);

  // ── Traitement d'un monde individuel depuis PB ────────────────────────────
  const processWorldData = useCallback((saved) => {
    const wid     = saved.worldId;
    const history = saved.geoHistory || [];
    const prevSeed    = worldSeeds.current.get(wid);
    const prevGeoLen  = worldGeoLengths.current.get(wid) ?? -1;
    const needRegen   = saved.worldSeed !== prevSeed || history.length !== prevGeoLen;

    let grid;
    if (needRegen) {
      grid = generateWorld(GRID_COLS, GRID_ROWS, saved.worldSeed);
      replayGeoHistory(grid, history, saved.seaLevel || DEFAULT_SEA_LEVEL);
      worldGrids.current.set(wid, grid);
      worldSeeds.current.set(wid, saved.worldSeed);
      worldGeoLengths.current.set(wid, history.length);
    } else {
      grid = worldGrids.current.get(wid);
    }

    return { grid, ...saved, gridChanged: needRegen };
  }, [replayGeoHistory]);

  // ── Applique le monde sélectionné à l'état React ─────────────────────────
  const activateWorld = useCallback((worldData) => {
    const g = worldGrids.current.get(worldData.worldId);
    if (g) {
      setGrid(g);
      // Ne redessine le terrain que si la grille a vraiment changé
      if (worldData.gridChanged) setGridVersion(v => v + 1);
    }
    setWorldSeed(worldData.worldSeed);
    plantsRef.current = worldData.plants;
    setPlants(worldData.plants);
    setTick(worldData.tick);
    setSeaLevel(worldData.seaLevel || DEFAULT_SEA_LEVEL);
    worldDataCache.current.set(worldData.worldId, worldData);

    const alive   = worldData.plants.filter(p => p.alive).length;
    const flowers = worldData.plants.reduce((s, p) => s + p.flowers.length, 0);
    const fruits  = worldData.plants.reduce((s, p) => s + p.fruits.length, 0);

    const sl = worldData.seaLevel || DEFAULT_SEA_LEVEL;
    let sumTemp = 0, sumHum = 0, landCount = 0;
    if (g) {
      for (let y = 0; y < g.rows; y++) {
        for (let x = 0; x < g.cols; x++) {
          const cell = g.getCell(x, y);
          if (!cell || cell.altitude < sl) continue;
          sumTemp += cell.temperature;
          sumHum  += cell.humidity;
          landCount++;
        }
      }
    }
    const avgTemp = landCount > 0 ? Math.round(sumTemp / landCount) : 0;
    const avgHum  = landCount > 0 ? Math.round(sumHum  / landCount) : 0;

    setStatsCache({ alive, flowers, fruits, avgTemp, avgHum });
  }, []);

  // ── Applique tous les mondes reçus de PB ──────────────────────────────────
  const applyAllWorlds = useCallback((savedWorlds) => {
    if (!savedWorlds?.length) { setServerStatus('error'); return; }

    const processed = savedWorlds.map(processWorldData);
    const ids = processed.map(w => w.worldId);
    setWorldIds(ids);
    setServerStatus('ok');

    // Sélectionne le premier monde au démarrage
    const currentId = selectedWorldIdRef.current ?? ids[0];
    if (!selectedWorldIdRef.current) setSelectedWorldId(currentId);

    const active = processed.find(w => w.worldId === currentId) ?? processed[0];
    if (active) activateWorld(active);
  }, [processWorldData, activateWorld]);

  // ── Chargement initial ─────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      setLoading(true);
      const worlds = await loadAllWorlds();
      applyAllWorlds(worlds);
      setLoading(false);
      setIsPolling(true);
    }
    init();
  }, [applyAllWorlds]);

  // ── Boucle de poll ─────────────────────────────────────────────────────────
  const doPoll = useCallback(async () => {
    const worlds = await loadAllWorlds();
    applyAllWorlds(worlds);
  }, [applyAllWorlds]);
  
  // ── Quand selectedWorldId change, affiche ce monde ─────────────────────────
  useEffect(() => {
    if (!selectedWorldId) return;
    const cached = worldDataCache.current.get(selectedWorldId);
    if (cached) {
      activateWorld({ ...cached, gridChanged: true });
    } else {
      // Monde pas encore en cache : fetch immédiat + loading
      setLoading(true);
      doPoll().finally(() => setLoading(false));
    }
  }, [selectedWorldId, activateWorld, doPoll]);


  const startPoll = useCallback((spd) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    const delay = POLL_INTERVALS[spd];
    if (delay) timerRef.current = setInterval(doPoll, delay);
  }, [doPoll]);

  useEffect(() => {
    if (!isPolling) return;
    startPoll(speed);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPolling, speed, startPoll]);

  const togglePoll = useCallback(() => {
    setIsPolling(prev => {
      if (prev) { clearInterval(timerRef.current); timerRef.current = null; }
      return !prev;
    });
  }, []);

  const setSpeed = useCallback((s) => {
    setSpeedState(s);
    if (isPolling) startPoll(s);
  }, [isPolling, startPoll]);

  // ── Like ──────────────────────────────────────────────────────────────────
  const likeFlower = useCallback(async (plantId, flowerId) => {
    const wid = selectedWorldIdRef.current;
    const result = await pbLikeFlower(wid, plantId, flowerId);
    if (!result.ok) return result;
    setPlants(prev => prev.map(p => {
      if (p.id !== plantId) return p;
      return {
        ...p,
        likes: p.likes + 1,
        flowers: p.flowers.map(fl =>
          fl.id === flowerId ? { ...fl, likes: (fl.likes || 0) + 1 } : fl
        ),
      };
    }));
    return result;
  }, []);

  const hasLiked = useCallback((plantId, flowerId) => {
    return pbHasLiked(selectedWorldIdRef.current, plantId, flowerId);
  }, []);

  const fecondFlower = useCallback(async (plantId, flowerId) => {
    return sendInteraction(selectedWorldIdRef.current, GEO_EVENTS.FECOND_FLOWER, plantId, flowerId);
  }, []);

  const germerFruit = useCallback(async (plantId, fruitId) => {
    return sendInteraction(selectedWorldIdRef.current, GEO_EVENTS.GERME_FRUIT, plantId, fruitId);
  }, []);

  // ── GeoEvent ──────────────────────────────────────────────────────────────
  const applyGeoEvent = useCallback(async (type, cellX, cellY) => {
    setActiveEvent(null);
    soundManager.play('geoEvent');
    const result = await sendGeoEvent(selectedWorldIdRef.current, type, cellX ?? null, cellY ?? null);
    console.log('[C14] sendGeoEvent result:', result);
  }, []);

  return (
    <C14Context.Provider value={{
      grid, worldSeed,
      plants, tick,
      speed, setSpeed,
      isPolling, togglePoll,
      seaLevel,
      gridVersion,
      activeEvent, setActiveEvent,
      cellSize, setCellSize,
      selectedFlower, setSelectedFlower,
      selectedFruit,  setSelectedFruit,
      loading, serverStatus,
      statsCache,
      applyGeoEvent,
      likeFlower, fecondFlower,
      germerFruit,
      hasLiked,
      plantsRef,
      // multi-mondes
      worldIds,
      selectedWorldId,
      setSelectedWorldId,
    }}>
      {children}
    </C14Context.Provider>
  );
}

export { GEO_EVENTS, POSITIONED_EVENTS };
export function useC14() { return useContext(C14Context); }
