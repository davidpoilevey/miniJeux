// La grid et ses cellules, indépendant de l'ECS
// Cellule: { x, y, altitude, terrainType, temperature, humidity, fertility }

export const CELL_SIZE  = 50;
export const GRID_COLS  = 200;
export const GRID_ROWS  = 160;

export default class WorldGrid {
  constructor(cols = GRID_COLS, rows = GRID_ROWS) {
    this.cols  = cols;
    this.rows  = rows;
    this.cells = new Array(cols * rows);
  }

  _idx(x, y) {
    return y * this.cols + x;
  }

  inBounds(x, y) {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }

  getCell(x, y) {
    if (!this.inBounds(x, y)) return null;
    return this.cells[this._idx(x, y)];
  }

  setCell(x, y, data) {
    if (!this.inBounds(x, y)) return;
    this.cells[this._idx(x, y)] = data;
  }

  // Voisins 4-directionnels (N/S/E/W), filtre les bords
  getNeighbors(x, y) {
    return [[-1,0],[1,0],[0,-1],[0,1]]
      .map(([dx, dy]) => this.getCell(x + dx, y + dy))
      .filter(Boolean);
  }

  // Voisins 8-directionnels
  getNeighbors8(x, y) {
    const result = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const c = this.getCell(x + dx, y + dy);
        if (c) result.push(c);
      }
    }
    return result;
  }
}
