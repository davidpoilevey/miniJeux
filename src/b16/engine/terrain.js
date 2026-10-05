// La piste : la même pour tous, découpée en paliers de difficulté.
// Pré-échantillonnée (pas de 2 cm) : la physique ne fait qu'une interpolation par contact.

// adherence : multiplie le frottement de chaque nœud (griffes comprises) posé sur la zone.
// surface : couche peinte sur le sol (optionnelle).
export const ZONES = [
  { x: -1e9, nom: 'Plaine', couleur: '#7cb342', adherence: 1 },
  { x: 8, nom: 'Dunes', couleur: '#d4a24c', adherence: 0.6, surface: 'rgba(232,196,120,0.75)' },
  { x: 16, nom: 'Glace', couleur: '#3fa9e0', adherence: 0.15, surface: 'rgba(214,240,255,0.92)' },
  { x: 23, nom: 'Cailloux', couleur: '#8d8d8d', adherence: 1.4 },
  { x: 36, nom: 'Côte', couleur: '#8d6e63', adherence: 1 },
  { x: 55, nom: 'Sommets', couleur: '#b0bec5', adherence: 0.5 },
];
const zone = (nom) => ZONES.find((z) => z.nom === nom);
const GLACE = zone('Glace'), CAILLOUX = zone('Cailloux'), COTE = zone('Côte'), SOMMETS = zone('Sommets');
const APRES_GLACE = ZONES[ZONES.indexOf(GLACE) + 1].x;

const X_MIN = -20, X_MAX = 460, PAS = 0.02;

// Montée douce à partir de x0, pleine à x0 + l
const fenetre = (x, x0, l = 2) => (x <= x0 ? 0 : x >= x0 + l ? 1 : (1 - Math.cos(((x - x0) / l) * Math.PI)) / 2);

// Pseudo-aléa déterministe : la piste ne change pas d'une génération à l'autre
const bruit = (k) => {
  const s = Math.sin(k * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export class Terrain {
  constructor(relief = 1) {
    this.relief = relief;
    const n = Math.ceil((X_MAX - X_MIN) / PAS) + 1;
    this.hs = new Float32Array(n);
    this.adh = new Float32Array(n);
    for (let k = 0; k < n; k++) {
      this.hs[k] = this.calculer(X_MIN + k * PAS);
      this.adh[k] = ZONES[this.zoneEn(X_MIN + k * PAS)].adherence;
    }
  }

  calculer(x) {
    const r = this.relief;
    // Dunes : longues ondulations
    let y = fenetre(x, 8) * 0.11 * (1 - Math.cos(((x - 8) / 2.6) * Math.PI * 2)) / 2;
    // Cailloux : bosses rondes semées au hasard
    if (x > CAILLOUX.x - 1) {
      const k0 = Math.floor((x - CAILLOUX.x) / 1.4);
      for (let k = k0 - 1; k <= k0 + 1; k++) {
        if (k < 0) continue;
        const cx = CAILLOUX.x + k * 1.4 + bruit(k) * 0.8;
        const larg = 0.12 + bruit(k + 50) * 0.14;
        const haut = 0.06 + bruit(k + 99) * 0.12 + Math.min(0.08, k * 0.004);
        const d = (x - cx) / larg;
        if (d > -3 && d < 3) y += haut * Math.exp(-d * d);
      }
    }
    // Lac gelé : dunes et cailloux s'effacent, la surface est plate et lisse
    y *= 1 - fenetre(x, GLACE.x - 1, 1) * (1 - fenetre(x, APRES_GLACE, 1.5));
    // Côte puis sommets : la pente s'ajoute au reste
    y += fenetre(x, COTE.x, 4) * (x - COTE.x) * 0.05;
    y += fenetre(x, SOMMETS.x, 4) * (x - SOMMETS.x) * 0.05;
    return y * r;
  }

  hauteur(x) {
    const u = (x - X_MIN) / PAS;
    if (u <= 0) return this.hs[0];
    const k = u | 0;
    if (k >= this.hs.length - 1) return this.hs[this.hs.length - 1];
    const t = u - k;
    return this.hs[k] * (1 - t) + this.hs[k + 1] * t;
  }

  pente(x) {
    const u = (x - X_MIN) / PAS;
    const k = Math.max(0, Math.min(this.hs.length - 2, u | 0));
    return (this.hs[k + 1] - this.hs[k]) / PAS;
  }

  adherence(x) {
    const k = Math.round((x - X_MIN) / PAS);
    return this.adh[k < 0 ? 0 : k >= this.adh.length ? this.adh.length - 1 : k];
  }

  zoneEn(x) {
    let z = 0;
    for (let k = 0; k < ZONES.length; k++) if (x >= ZONES[k].x) z = k;
    return z;
  }
}
