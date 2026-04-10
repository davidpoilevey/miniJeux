import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import generateWorld from "../b13/world/WorldGenerator";
import WBEngine from "./engine/WBEngine";

const DEFAULT_SEA_LEVEL = 30;
export const GRID_COLS = 200;
export const GRID_ROWS = 80;

const WBContext = createContext(null);
export const useWB = () => useContext(WBContext);

function buildGrid(seed, seaLevel) {
  return generateWorld(GRID_COLS, GRID_ROWS, seed, seaLevel);
}

export function WBProvider({ children }) {
  const [tick, setTick]            = useState(0);
  const [isRunning, setIsRunning]  = useState(false);
  const [cellSize, setCellSizeRaw] = useState(12);
  const [grid, setGrid]            = useState(null);
  const [speed, setSpeedState]     = useState(1);
  const [seaLevel, setSeaLevel]    = useState(DEFAULT_SEA_LEVEL);
  const [selected, setSelected]    = useState(null);
  const [hasSave, setHasSave]      = useState(() => WBEngine.hasSave());

  const engineRef = useRef(null);
  const seedRef   = useRef(null); // seed courante, injectée dans l'engine

  const setCellSize = useCallback((v) => {
    setCellSizeRaw(Math.max(8, Math.min(48, Math.round(v))));
  }, []);

  // ── Démarre un engine (nouveau monde ou depuis sauvegarde) ───
  const _startEngine = useCallback((grid, seaLevel, seed, savedState = null) => {
    engineRef.current?.stop();
    const engine = new WBEngine(grid, seaLevel, () => setTick(v => v + 1), savedState);
    engine._seed  = seed; // injecté pour que _autoSave sache le seed à écrire
    engineRef.current = engine;
    engine.start();
    setIsRunning(true);
  }, []);

  // ── Nouveau monde ────────────────────────────────────────────
  const generateNewWorld = useCallback(() => {
    setSelected(null);
    const seed = Math.floor(Math.random() * 100000);
    seedRef.current = seed;
    const g = buildGrid(seed, DEFAULT_SEA_LEVEL);
    setGrid(g);
    setTick(0);
    _startEngine(g, DEFAULT_SEA_LEVEL, seed, null);
  }, [_startEngine]);

  // ── Charger la sauvegarde ────────────────────────────────────
  const loadSave = useCallback(() => {
    const save = WBEngine.readSave();
    if (!save) return;
    setSelected(null);
    const seed = save.seed;
    seedRef.current = seed;
    const g = buildGrid(seed, save.seaLevel ?? DEFAULT_SEA_LEVEL);
    setGrid(g);
    setSeaLevel(save.seaLevel ?? DEFAULT_SEA_LEVEL);
    setTick(save.tick ?? 0);
    _startEngine(g, save.seaLevel ?? DEFAULT_SEA_LEVEL, seed, save);
  }, [_startEngine]);

  // ── Sauvegarder manuellement ─────────────────────────────────
  const saveGame = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    try {
      localStorage.setItem('worldbox_autosave', JSON.stringify(engine.getSaveData()));
      setHasSave(true);
    } catch { /* quota */ }
  }, []);

  const clearSave = useCallback(() => {
    WBEngine.clearSave();
    setHasSave(false);
  }, []);

  // ── Démarrage initial : charge la save si elle existe ────────
  useEffect(() => {
    if (WBEngine.hasSave()) {
      loadSave();
    } else {
      generateNewWorld();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    engineRef.current?.setSeaLevel(seaLevel);
     const g = buildGrid(seedRef.current, seaLevel);
    setGrid(g);
  }, [seaLevel]);

  // Mise à jour de hasSave après chaque auto-save (toutes les 50 ticks)
  useEffect(() => {
    if (tick > 0 && tick % 50 === 0) setHasSave(WBEngine.hasSave());
  }, [tick]);

  // ── Actions ──────────────────────────────────────────────────
  const toggleRun = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.isRunning) { engine.stop();  setIsRunning(false); }
    else                  { engine.start(); setIsRunning(true);  }
  }, []);

  const setSpeed = useCallback((v) => {
    setSpeedState(v);
    engineRef.current?.setSpeed(v);
  }, []);

  const value = {
    tick, grid, isRunning, cellSize, speed, seaLevel, selected, hasSave,
    engineRef,
    setCellSize, setSpeed, setSeaLevel, toggleRun, setSelected,
    generateNewWorld, loadSave, saveGame, clearSave,
  };

  return (
    <WBContext.Provider value={value}>
      {children}
    </WBContext.Provider>
  );
}
