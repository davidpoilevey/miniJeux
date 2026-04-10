import { useMemo } from "react";

export const useKamon = (reset) => {
  const grid = useMemo(() => {
    const g = new Map();

    // 1. Construction du plateau hexagonal (rayon 3)
    const hexes = [];
    for (let q = -3; q <= 3; q++) {
      for (let r = -3; r <= 3; r++) {
        const s = -q - r;
        if (Math.abs(s) <= 3) {
          hexes.push({ q, r, s , key: `${q},${r},${s}` } );
        }
      }
    }

    // 2. Définir les 6 couleurs et 6 symboles
    const colors = ["red", "blue", "green", "yellow", "purple", "black"];
    const symbols = ["sun", "moon", "flower", "wave", "mountain", "star"];

    // 3. Créer toutes les combinaisons uniques (36)
    const combos = [];
    for (let c of colors) {
      for (let s of symbols) {
        combos.push({ color: c, symbol: s });
      }
    }

    // 4. Mélanger les combinaisons et les hexagones
    const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
    shuffle(combos);
    shuffle(hexes);

    // 5. Associer les 36 premières combinaisons
    for (let i = 0; i < 36; i++) {
      const h = hexes[i];
      const combo = combos[i];
      g.set(`${h.q},${h.r},${h.s}`, { ...h, ...combo });
    }

    // 6. La 37e case (joker)
    const joker = hexes[36];
    g.set(`${joker.q},${joker.r},${joker.s}`, {
      ...joker,
      key: `${joker.q},${joker.r},${joker.s}`,
      color: colors[Math.floor(Math.random() * colors.length)],
      symbol: symbols[Math.floor(Math.random() * symbols.length)]
    });

    return g;
  }, [reset]);
  const attachToPlayer = (hexKey, player) => {
    const hex = grid.get(hexKey);
    if (hex) {
      hex.belongTo = player;
    }
  }

  return { grid, attachToPlayer };
};

// Renvoie les 6 voisins axiaux d'une tuile
function getNeighbors(hex) {
  const directions = [
    { q: +1, r: 0, s: -1 },
    { q: +1, r: -1, s: 0 },
    { q: 0, r: -1, s: +1 },
    { q: -1, r: 0, s: +1 },
    { q: -1, r: +1, s: 0 },
    { q: 0, r: +1, s: -1 },
  ];
  return directions.map(d => ({
    q: hex.q + d.q,
    r: hex.r + d.r,
    s: hex.s + d.s,
    key: `${hex.q + d.q},${hex.r + d.r},${hex.s + d.s}`,
  }));
}

// Vérifie si un joueur relie ses deux bords
export function checkVictoryByConnection(player, grid, size = 3) {
  const tiles = Array.from(grid.values()).filter(t => t.belongTo === player);
//  playersTile.includes(key) ? 'player' : IATile.includes(key) ? 'ia' : null
  if (tiles.length === 0) return false;

  // Définis les bords selon le joueur
  const isOnStart = t =>
    player === "user" ? t.q === -size : t.r === -size;
  const isOnEnd = t =>
    player === "user" ? t.q === size : t.r === size;

  const visited = new Set();
  const frontier = tiles.filter(isOnStart);

  while (frontier.length > 0) {
    const current = frontier.pop();
    if (isOnEnd(current)) return true;

    for (const n of getNeighbors(current)) {
      const neighbor = grid.get(n.key);
      if (
        neighbor &&
        neighbor.belongTo === player &&
        !visited.has(neighbor.key)
      ) {
        visited.add(neighbor.key);
        frontier.push(neighbor);
      }
    }
  }

  return false;
}
export function checkVictoryByEnclosure(player, grid, size = 3) {
  const visited = new Set();

  // Fonction pour vérifier si une case est sur un bord
  const isOnEdge = t =>
    Math.abs(t.q) === size || Math.abs(t.r) === size || Math.abs(t.s) === size;

  const others = Array.from(grid.values()).filter(
    t => t.belongTo !== player && !visited.has(t.key)
  );

  for (const start of others) {
    if (visited.has(start.key)) continue;

    let touchesEdge = false;
    const zone = [start];
    visited.add(start.key);

    for (let i = 0; i < zone.length; i++) {
      const current = zone[i];
      if (isOnEdge(current)) touchesEdge = true;

      for (const n of getNeighbors(current)) {
        const neighbor = grid.get(n.key);
        if (
          neighbor &&
          neighbor.belongTo !== player &&
          !visited.has(neighbor.key)
        ) {
          visited.add(neighbor.key);
          zone.push(neighbor);
        }
      }
    }

    // Si la zone n’a pas touché le bord, elle est enfermée
    if (!touchesEdge) {
      return true;
    }
  }

  return false;
}
