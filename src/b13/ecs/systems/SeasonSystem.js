// SeasonSystem — cycle annuel de 200 ticks (50 ticks par saison)
//
// À chaque transition, applique un delta de température sur toutes les cellules
// et recalcule les terrainTypes. Le delta net sur un cycle complet = 0 → pas de
// dérive permanente. Les geo-events (warming, glaciation) s'accumulent correctement
// par-dessus les variations saisonnières.
//
// Expose dans ctx.season :
//   { name, icon, fertilityMult, hungerMult, thirstMult, tintColor }

import { getTerrainType } from '../../world/WorldGenerator';

export const SEASON_DURATION = 50;   // ticks par saison
export const YEAR_LENGTH     = 200;  // ticks par année

// tempDelta = delta absolu de température de la saison vs printemps (référence = 0).
// Appliqué par différence lors des transitions → pas de drift.
export const SEASONS = [
  {
    name:          'Printemps',
    icon:          '🌿',
    tempDelta:      0,
    fertilityMult:  2.5,   // pousse explosive
    hungerMult:     1.5,
    thirstMult:     1.0,
    tintColor:      'rgba(60, 200, 80, 0.06)',
  },
  {
    name:          'Été',
    icon:          '☀️',
    tempDelta:     10,
    fertilityMult:  1.8,   // chaleur ok mais sécheresse possible
    hungerMult:     1.2,
    thirstMult:     1.3,   // plus soif par la chaleur
    tintColor:      'rgba(255, 200, 40, 0.07)',
  },
  {
    name:          'Automne',
    icon:          '🍂',
    tempDelta:      0,
    fertilityMult:  0.95,  // végétation qui s'étiole
    hungerMult:     1.6,   // animaux se constituent des réserves
    thirstMult:     1.0,
    tintColor:      'rgba(200, 110, 30, 0.08)',
  },
  {
    name:          'Hiver',
    icon:          '❄️',
    tempDelta:    -10,
    fertilityMult:  0.45,  // dormance végétale partielle
    hungerMult:     2.1,   // survie énergétique coûteuse
    thirstMult:     0.7,   // eau gelée → moins de soif perçue
    tintColor:      'rgba(140, 200, 255, 0.13)',
  },
];

export default class SeasonSystem {
  constructor() {
    this._tickCount   = 0;
    this._seasonIndex = 0; // démarre au printemps
  }

  update({ grid, seaLevel }) {
    this._tickCount++;
    const newIndex = Math.floor((this._tickCount % YEAR_LENGTH) / SEASON_DURATION);
    if (newIndex !== this._seasonIndex) {
      this._applyTransition(grid, seaLevel, this._seasonIndex, newIndex);
      this._seasonIndex = newIndex;
    }
  }

  get season()      { return SEASONS[this._seasonIndex]; }
  get seasonIndex() { return this._seasonIndex; }
  get yearProgress(){ return (this._tickCount % YEAR_LENGTH) / YEAR_LENGTH; }

  // ── Transition : applique le delta de température sur toutes les cellules ──

  _applyTransition(grid, seaLevel, fromIndex, toIndex) {
    const delta = SEASONS[toIndex].tempDelta - SEASONS[fromIndex].tempDelta;
    if (delta === 0) return;
    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        const cell = grid.getCell(x, y);
        if (!cell) continue;
        const newTemp = cell.temperature + delta;
        const newTerr = getTerrainType(cell.altitude, cell.humidity, newTemp, seaLevel);
        grid.setCell(x, y, { ...cell, temperature: newTemp, terrainType: newTerr });
      }
    }
  }
}
