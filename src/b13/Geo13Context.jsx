import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import generateWorld, { DEFAULT_SEA_LEVEL } from './world/WorldGenerator';
import { SEASONS } from './ecs/systems/SeasonSystem';
import { GRID_COLS, GRID_ROWS } from './world/WorldGrid';
import {
  GEO_EVENTS, POSITIONED_EVENTS,
  applyVolcano, applyEarthquake, applyFlood, applyDrought, applyMeteor, applyMountainRange,
  applyWarming, applyGlaciation,
} from './world/GeoEvents';
import Engine from './ecs/Engine';

const Geo13Context = createContext(null);

export function Geo13Provider({ children }) {
  const [grid, setGrid]               = useState(null);
  const [speed, setSpeedState]        = useState(1);
  const [seaLevel, setSeaLevel]       = useState(DEFAULT_SEA_LEVEL);
  const [activeEvent, setActiveEvent] = useState(null);
  const [gridVersion, setGridVersion] = useState(0);
  const [entityVersion, setEntityVersion] = useState(0);
  const [tick, setTick]               = useState(0);
  const [isRunning, setIsRunning]     = useState(false);
  const [cellSize, setCellSizeState]  = useState(20);
  const [lastAutoEvent, setLastAutoEvent] = useState(null);
  const [season, setSeason]               = useState(SEASONS[0]);

  const setCellSize = useCallback((v) => {
    setCellSizeState(Math.max(10, Math.min(40, Math.round(v))));
  }, []);

  const engineRef  = useRef(null);
  const seaLevelRef = useRef(DEFAULT_SEA_LEVEL);

  // Génération du monde
  useEffect(() => {
    const seed = Math.floor(Math.random() * 10000);
    setGrid(generateWorld(GRID_COLS, GRID_ROWS, seed));
  }, []);

  // Démarre l'engine quand la grid est prête
  useEffect(() => {
    if (!grid) return;
    const engine = new Engine(grid, DEFAULT_SEA_LEVEL, () => {
      setEntityVersion(v => v + 1);
      setTick(v => v + 1);
    }, (newSeason) => {
      setSeason(newSeason);
      setGridVersion(v => v + 1);
    });
    engineRef.current = engine;
    engine.start();
    setIsRunning(true);
    return () => engine.stop();
  }, [grid]);

  // Synchronise le seaLevel dans l'engine (inondations / sécheresses)
  useEffect(() => {
    seaLevelRef.current = seaLevel;
    engineRef.current?.setSeaLevel(seaLevel);
  }, [seaLevel]);

  // Événements géologiques automatiques toutes les 100 ticks
  useEffect(() => {
    if (!grid || tick === 0 || tick % 100 !== 0) return;
    const types = Object.values(GEO_EVENTS);
    const type  = types[Math.floor(Math.random() * types.length)];
    let cx = 0, cy = 0;
    if (POSITIONED_EVENTS.has(type)) {
      cx = Math.floor(Math.random() * grid.cols);
      cy = Math.floor(Math.random() * grid.rows);
    }
    const sl = seaLevelRef.current;
    let newSl = sl;
    switch (type) {
      case GEO_EVENTS.VOLCANO:        applyVolcano(grid, cx, cy, sl);           break;
      case GEO_EVENTS.EARTHQUAKE:     applyEarthquake(grid, cx, cy, sl);        break;
      case GEO_EVENTS.FLOOD:          newSl = applyFlood(grid, sl);             break;
      case GEO_EVENTS.DROUGHT:        newSl = applyDrought(grid, sl);           break;
      case GEO_EVENTS.METEOR:         applyMeteor(grid, cx, cy, sl);            break;
      case GEO_EVENTS.MOUNTAIN_RANGE: applyMountainRange(grid, cx, cy, sl);     break;
      case GEO_EVENTS.WARMING:        newSl = applyWarming(grid, sl);           break;
      case GEO_EVENTS.GLACIATION:     newSl = applyGlaciation(grid, sl);        break;
      case GEO_EVENTS.PREDATOR_BOOST: engineRef.current?.seedNewPredators(10);  break;
      default: break;
    }
    if (newSl !== sl) setSeaLevel(newSl);
    setGridVersion(v => v + 1);
    setLastAutoEvent({ type, tick });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const toggleRun = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.isRunning) { engine.stop(); setIsRunning(false); }
    else                  { engine.start(); setIsRunning(true); }
  }, []);

  // Synchronise la vitesse dans l'engine
  const setSpeed = useCallback((s) => {
    setSpeedState(s);
    engineRef.current?.setSpeed(s);
  }, []);

  // Déclenche un événement géologique.
  // Pour les événements positionnés (volcano, séisme, meteor), cellX/cellY = case cliquée.
  // Pour les événements globaux (flood, drought), x/y sont ignorés.
  const applyGeoEvent = useCallback((type, cellX, cellY) => {
    if (!grid) return;

    switch (type) {
      case GEO_EVENTS.VOLCANO:
        applyVolcano(grid, cellX, cellY, seaLevel);
        setActiveEvent(null);
        break;
      case GEO_EVENTS.EARTHQUAKE:
        applyEarthquake(grid, cellX, cellY, seaLevel);
        setActiveEvent(null);
        break;
      case GEO_EVENTS.METEOR:
        applyMeteor(grid, cellX, cellY, seaLevel);
        setActiveEvent(null);
        break;
      case GEO_EVENTS.MOUNTAIN_RANGE:
        applyMountainRange(grid, cellX, cellY, seaLevel);
        setActiveEvent(null);
        break;
      case GEO_EVENTS.FLOOD: {
        const newSL = applyFlood(grid, seaLevel);
        setSeaLevel(newSL);
        break;
      }
      case GEO_EVENTS.DROUGHT: {
        const newSL = applyDrought(grid, seaLevel);
        setSeaLevel(newSL);
        break;
      }
      case GEO_EVENTS.WARMING: {
        const newSL = applyWarming(grid, seaLevel);
        setSeaLevel(newSL);
        break;
      }
      case GEO_EVENTS.GLACIATION: {
        const newSL = applyGlaciation(grid, seaLevel);
        setSeaLevel(newSL);
        break;
      }
      case GEO_EVENTS.PREDATOR_BOOST:
        engineRef.current?.seedNewPredators(15);
        break;
      default: break;
    }

    setGridVersion(v => v + 1);
  }, [grid, seaLevel]);

  return (
    <Geo13Context.Provider value={{
      grid,
      speed, setSpeed,
      seaLevel, setSeaLevel,
      activeEvent, setActiveEvent,
      gridVersion,
      entityVersion,
      tick,
      isRunning, toggleRun,
      engineRef,
      applyGeoEvent,
      cellSize, setCellSize,
      lastAutoEvent,
      season,
    }}>
      {children}
    </Geo13Context.Provider>
  );
}

export { POSITIONED_EVENTS, GEO_EVENTS };
export function useGeo13() {
  return useContext(Geo13Context);
}
