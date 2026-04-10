import { createContext, useContext, useEffect, useState } from "react";
import { WG_UNITS } from "./data/units";
import { WG_UPGRADES } from "./data/upgrades";
import { usePreloadedImages } from "../civ/utils/hooks";
import { AllImageSources } from "../civ/utils/imagesImports";
import {
  generateHexGrid,
  placeEnemyUnitsOnMap,
  placePlayerUnitsOnMap,
  hexDistance,
  moveToward,
} from "./hooks/hexUtils";
import imgUpgrade from './data/wgSprite.png';

export const WarGameContext = createContext();
export const useWG = () => useContext(WarGameContext);

const imgToLoad={...AllImageSources, upgrades:imgUpgrade};
export function WarGameProvider({ children }) {
  const [phase, setPhase] = useState('MISSION_CHOICE');
  const [turn, setTurn] = useState(1);
  const [currentMission, setCurrentMission] = useState(null);
  const [advUnits, setAdvUnits] = useState([]);
  const [userUnits, setUserUnits] = useState([]);
  const [grid, setGrid] = useState(new Map());
  const [unitSelected, setSelectedUnit] = useState(null);
  const [tileSelected, setTileSelected] = useState(null);
  const [explosionEffect, addExplosionEffect] = useState(null);

  // Images partagées (chargées une seule fois)
  const images = usePreloadedImages(imgToLoad);

  // Caserne
  const [credits, setCredits] = useState(1000);
  const [purchasedUnits, setPurchasedUnits] = useState([]);
  const [acquiredUpgrades, setAcquiredUpgrades] = useState([]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const reset = () => {
    setPhase('MISSION_CHOICE');
    setCurrentMission(null);
    setTurn(1);
    setSelectedUnit(null);
    setTileSelected(null);
    setGrid(new Map());
    setAdvUnits([]);
    setUserUnits([]);
    setPurchasedUnits([]);
  };

  // Bouton "Caserne" dans l'AppBar : consultation sans mission
  const enterCaserne = () => {
    setPhase('CASERNE');
  };

  // "Lancer la mission" depuis WGMissionPanel → Caserne
  const startMission = (mission) => {
    setCurrentMission(mission);
    setPurchasedUnits([]);
    setPhase('CASERNE');
  };

  // ── Caserne ─────────────────────────────────────────────────────────────────

  const buyUpgrade = (upgradeId) => {
    const upgrade = WG_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade || credits < upgrade.cost || acquiredUpgrades.includes(upgradeId)) return;
    setCredits(c => c - upgrade.cost);
    setAcquiredUpgrades(prev => [...prev, upgradeId]);
  };

  // Applique les upgrades acquises aux stats d'un modèle d'unité
  const applyUpgrades = (model, upgrades) => {
    let result = { ...model };
    for (const upId of upgrades) {
      const up = WG_UPGRADES.find(u => u.id === upId);
      if (!up) continue;
      const { type, ...stats } = up.effect;
      if (type === 'all' || type === result.type) {
        for (const [stat, val] of Object.entries(stats)) {
          if (typeof result[stat] === 'number') result[stat] += val;
        }
      }
    }
    return result;
  };

  const buyUnit = (unitType) => {
    const model = WG_UNITS.find(u => u.type === unitType);
    if (!model || credits < model.cost) return;
    setCredits(c => c - model.cost);
    setPurchasedUnits(prev => [...prev, { ...model, _purchaseId: crypto.randomUUID() }]);
  };

  const sellUnit = (purchaseId) => {
    const unit = purchasedUnits.find(u => u._purchaseId === purchaseId);
    if (!unit) return;
    setCredits(c => c + unit.cost);
    setPurchasedUnits(prev => prev.filter(u => u._purchaseId !== purchaseId));
  };

  // "Partir en mission" : génère la carte et démarre le jeu
  const launchMission = () => {
    if (!currentMission) return;

    const map = generateHexGrid(15);
    setGrid(map);

    // Unités gratuites thématiques + unités achetées, avec upgrades appliquées
    const freeModels = currentMission.playerUnitTypes
      .map(type => WG_UNITS.find(u => u.type === type))
      .filter(Boolean);
    const allPlayerModels = [...freeModels, ...purchasedUnits]
      .map(model => applyUpgrades(model, acquiredUpgrades));
    setUserUnits(placePlayerUnitsOnMap(map, allPlayerModels));

    // Unités ennemies par groupe
    const allEnemies = [];
    for (const group of currentMission.enemyGroups) {
      const model = WG_UNITS.find(u => u.type === group.unitType);
      if (!model) continue;
      const extra = {};
      if (group.isChief) extra.isChief = true;
      if (group.isBase)  extra.isBase  = true;
      const zone = group.isBase ? { qMin: 7, qMax: 10 } : { qMin: 3, qMax: 6 };
      const excluded = allEnemies.map(e => e.position);
      const placed = placeEnemyUnitsOnMap(map, { ...model, ...extra }, group.count, excluded, zone);
      allEnemies.push(...placed);
    }
    setAdvUnits(allEnemies);

    setTurn(1);
    setSelectedUnit(null);
    setTileSelected(null);
    setPhase('PLAYER_TURN');
  };

  // ── Combats ──────────────────────────────────────────────────────────────────

  const checkVictory = (remainingEnemies, killedUnit) => {
    if (!currentMission) return remainingEnemies.length === 0;
    switch (currentMission.objective) {
      case 'DESTROY_ALL':     return remainingEnemies.length === 0;
      case 'DESTROY_CHIEF':   return killedUnit?.isChief === true;
      case 'DESTROY_BASE':    return killedUnit?.isBase  === true;
      case 'SURVIVE_N_TURNS': return false;
      default:                return remainingEnemies.length === 0;
    }
  };

  const attaque = (fromUnit, onUnit) => {
    const killed = onUnit.damagePoints + fromUnit.attack >= onUnit.defense;
    if (killed) {
      addExplosionEffect(onUnit.position);
      setAdvUnits(prev => {
        const next = prev.filter(a => a.id !== onUnit.id);
        if (checkVictory(next, onUnit)) setPhase('VICTORY');
        return next;
      });
    } else {
      setAdvUnits(prev =>
        prev.map(a => a.id === onUnit.id ? { ...a, damagePoints: a.damagePoints + fromUnit.attack } : a)
      );
    }
    setUserUnits(prev =>
      prev.map(u => u.id === fromUnit.id ? { ...u, hasAttacked: true } : u)
    );
    setSelectedUnit(prev =>
      prev?.id === fromUnit.id ? { ...prev, hasAttacked: true } : prev
    );
  };

  const moveUnit = (unit, targetHex) => {
    setUserUnits(prev =>
      prev.map(u => u.id === unit.id ? { ...u, position: targetHex, hasMoved: true } : u)
    );
    setSelectedUnit(prev =>
      prev?.id === unit.id ? { ...prev, position: targetHex, hasMoved: true } : prev
    );
  };

  const endTurn = () => {
    setPhase('ENEMY_TURN');

    let newUserUnits = [...userUnits];
    let newAdvUnits  = [...advUnits];

    for (let i = 0; i < newAdvUnits.length; i++) {
      if (newUserUnits.length === 0) break;
      const enemy = newAdvUnits[i];
      if (enemy.isBase) continue;

      const nearest = newUserUnits.reduce((best, u) =>
        hexDistance(enemy.position, u.position) < hexDistance(enemy.position, best.position) ? u : best
      , newUserUnits[0]);

      const dist = hexDistance(enemy.position, nearest.position);

      const tryAttack = (target, units) => {
        if (target.damagePoints + enemy.attack >= target.defense) {
          return units.filter(u => u.id !== target.id);
        }
        return units.map(u =>
          u.id === target.id ? { ...u, damagePoints: u.damagePoints + enemy.attack } : u
        );
      };

      if (dist <= enemy.range) {
        newUserUnits = tryAttack(nearest, newUserUnits);
      } else {
        const occupied = [
          ...newUserUnits.map(u => u.position),
          ...newAdvUnits.filter(e => e.id !== enemy.id).map(e => e.position),
        ];
        const newPos = moveToward(enemy.position, nearest.position, enemy.movement, grid, occupied);
        newAdvUnits = newAdvUnits.map(e => e.id === enemy.id ? { ...e, position: newPos } : e);
        if (hexDistance(newPos, nearest.position) <= enemy.range) {
          newUserUnits = tryAttack(nearest, newUserUnits);
        }
      }
    }

    setAdvUnits(newAdvUnits);

    if (newUserUnits.length === 0) {
      setUserUnits([]);
      setPhase('DEFEAT');
    } else if (currentMission?.objective === 'SURVIVE_N_TURNS' && turn >= currentMission.objectiveParams.turns) {
      setUserUnits(newUserUnits);
      setPhase('VICTORY');
    } else {
      setUserUnits(newUserUnits.map(u => ({ ...u, hasMoved: false, hasAttacked: false })));
      setSelectedUnit(null);
      setPhase('PLAYER_TURN');
      setTurn(t => t + 1);
    }
  };

  useEffect(() => {
    if(phase==='VICTORY'){
      setCredits(cr=>cr+(currentMission.reward||100))
    }
    if(phase==='DEFEAT'){
      setCredits(cr=>cr+(100))
    }
  }, [phase]);
  useEffect(() => {
    if (!explosionEffect) return;
    const timer = setTimeout(() => addExplosionEffect(null), 600);
    return () => clearTimeout(timer);
  }, [explosionEffect]);

  return (
    <WarGameContext.Provider value={{
      phase, turn, currentMission,
      reset, enterCaserne, startMission, launchMission,
      // Caserne
      credits, purchasedUnits, buyUnit, sellUnit,
      acquiredUpgrades, buyUpgrade,
      images,
      // Game
      unitSelected, setSelectedUnit,
      advUnits, userUnits,
      tileSelected, setTileSelected,
      grid,
      attaque, moveUnit, endTurn,
      explosionEffect,
    }}>
      {children}
    </WarGameContext.Provider>
  );
}
