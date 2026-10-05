import { ADNHandler, randomGenome } from '../../genetic/ADNPlante';

// ADN → plan du corps. Seul endroit qui lit l'ADN.
//
// Un corps = jusqu'à 8 nœuds (masses) reliés par des os (longueur fixe) ou des
// muscles (longueur qui oscille). Chaque paire de nœuds a son gène « type » :
// un muscle peut apparaître, devenir un os, ou disparaître par mutation.

export const MAX_NOEUDS = 8;
const GENES_NOEUD = ['vie', 'x', 'y', 'taille', 'organe', 'phase', 'glisse'];
const GENES_ARETE = ['type', 'phase', 'ampli', 'force'];

// ── Clés sans collision ──
// ADNHandler range chaque clé dans hashString(clé) % 400 : deux gènes peuvent partager
// le même chromosome. On sonde l'emplacement de chaque clé avec deux ADN « règle graduée »
// (le chromosome i code i) et on suffixe la clé tant qu'elle tombe sur un emplacement pris.
const LETTRES = ['A', 'T', 'C', 'G']; // l'ordre de tableauVersDecimal
const coder = (v) => [LETTRES[(v >> 6) & 3], LETTRES[(v >> 4) & 3], LETTRES[(v >> 2) & 3], LETTRES[v & 3]];
const NB_CHROMOSOMES = randomGenome().length;
const sondeBas = new ADNHandler(Array.from({ length: NB_CHROMOSOMES }, (_, i) => coder(i & 255)));
const sondeHaut = new ADNHandler(Array.from({ length: NB_CHROMOSOMES }, (_, i) => coder(i >> 8)));
const emplacement = (cle) => Math.round(sondeBas.readFloat(cle) * 255) + 256 * Math.round(sondeHaut.readFloat(cle) * 255);

const NOMS = ['rythme'];
for (let i = 0; i < MAX_NOEUDS; i++) GENES_NOEUD.forEach((g) => NOMS.push(`n${i}.${g}`));
for (let i = 0; i < MAX_NOEUDS; i++)
  for (let j = i + 1; j < MAX_NOEUDS; j++) GENES_ARETE.forEach((g) => NOMS.push(`e${i}${j}.${g}`));

export const CLES = {};
const pris = new Set();
NOMS.forEach((nom) => {
  let cle = nom;
  for (let k = 1; pris.has(emplacement(cle)); k++) cle = `${nom}~${k}`;
  pris.add(emplacement(cle));
  CLES[nom] = cle;
});

// ── Lecture ──
export function lireCorps(adn) {
  const h = new ADNHandler(adn);
  const f = (nom) => h.readFloat(CLES[nom]);

  // Nœuds : 0, 1, 2 existent toujours ; les autres selon leur gène « vie ».
  const noeuds = [];
  for (let i = 0; i < MAX_NOEUDS; i++) {
    if (i >= 3 && f(`n${i}.vie`) >= 0.45) continue;
    noeuds.push({
      gene: i,
      x: (f(`n${i}.x`) - 0.5) * 1.3,
      y: 0.08 + f(`n${i}.y`) * 0.85,
      r: 0.05 + 0.07 * f(`n${i}.taille`),
      // Organe : la tête (nœud 0) porte l'œil ; les autres peuvent être des griffes
      // qui s'accrochent au sol une demi-période sur deux.
      griffe: i > 0 && f(`n${i}.organe`) > 0.85,
      phase: f(`n${i}.phase`) * Math.PI * 2,
      mu: 0.15 + f(`n${i}.glisse`), // frottement de Coulomb : patin (0.15) … semelle (1.15)
    });
  }
  const index = new Map(noeuds.map((n, k) => [n.gene, k]));

  // Arêtes : le gène « type » de chaque paire décide os / muscle / rien
  const aretes = [];
  for (let a = 0; a < noeuds.length; a++)
    for (let b = a + 1; b < noeuds.length; b++) {
      const cle = `e${noeuds[a].gene}${noeuds[b].gene}`;
      const t = f(`${cle}.type`);
      if (t < 0.55) continue;
      aretes.push({
        a, b,
        muscle: t >= 0.76,
        phase: f(`${cle}.phase`) * Math.PI * 2,
        uAmpli: 0.25 + 0.75 * f(`${cle}.ampli`),
        raideur: 0.15 + 0.6 * f(`${cle}.force`),
      });
    }

  // Un membre orphelin se greffe au plus proche nœud du corps par un os :
  // tous les nœuds codés servent, et le corps est toujours d'un seul tenant.
  const relie = new Set([0]);
  const etendre = () => {
    let change = true;
    while (change) {
      change = false;
      aretes.forEach((e) => {
        if (relie.has(e.a) !== relie.has(e.b)) { relie.add(e.a); relie.add(e.b); change = true; }
      });
    }
  };
  etendre();
  while (relie.size < noeuds.length) {
    let meilleur = null, dmin = Infinity;
    relie.forEach((a) => noeuds.forEach((nb, b) => {
      if (relie.has(b)) return;
      const d = Math.hypot(noeuds[a].x - nb.x, noeuds[a].y - nb.y);
      if (d < dmin) { dmin = d; meilleur = [a, b]; }
    }));
    const [a, b] = meilleur;
    aretes.push({ a: Math.min(a, b), b: Math.max(a, b), muscle: false, greffe: true, phase: 0, uAmpli: 0, raideur: 1 });
    relie.add(b);
    etendre();
  }

  // Deux nœuds confondus donneraient une contrainte sans direction
  aretes.forEach((e) => {
    const A = noeuds[e.a], B = noeuds[e.b];
    e.L0 = Math.max(0.04, Math.hypot(A.x - B.x, A.y - B.y));
  });

  marquerMusclesBloques(noeuds, aretes);

  const corps = {
    noeuds,
    aretes,
    rythme: f('rythme'),
    index,
  };
  corps.morphotype = morphotype(corps);
  // Le plan qui définit l'espèce : grossier exprès (nœuds, griffes), sinon chaque muscle
  // gagné ou perdu fonderait une espèce et les lignées deviendraient illisibles.
  corps.plan = `${noeuds.length}·${noeuds.filter((n) => n.griffe).length}`;
  corps.effort = aretes.reduce((s, e) => s + (e.muscle && !e.bloque ? e.uAmpli * e.raideur : 0), 0)
    + noeuds.filter((n) => n.griffe).length * 0.3;
  corps.triangles = trianglesDeChair(noeuds.length, aretes);
  return corps;
}

// Un muscle dont la longueur est déjà imposée par les os ne peut que trembler contre eux.
// C'est LA source classique de vibrations exploitables : on le détecte à la naissance
// (rang de la matrice de rigidité) et on l'atrophie.
function marquerMusclesBloques(noeuds, aretes) {
  const n2 = noeuds.length * 2;
  const ligne = (e) => {
    const v = new Float64Array(n2);
    const A = noeuds[e.a], B = noeuds[e.b];
    const dx = A.x - B.x, dy = A.y - B.y;
    v[2 * e.a] = dx; v[2 * e.a + 1] = dy;
    v[2 * e.b] = -dx; v[2 * e.b + 1] = -dy;
    return v;
  };
  const base = [];
  const projeter = (v) => {
    base.forEach((u) => {
      let d = 0;
      for (let k = 0; k < n2; k++) d += v[k] * u[k];
      for (let k = 0; k < n2; k++) v[k] -= d * u[k];
    });
    let norme = 0;
    for (let k = 0; k < n2; k++) norme += v[k] * v[k];
    return Math.sqrt(norme);
  };
  aretes.filter((e) => !e.muscle).forEach((e) => {
    const v = ligne(e);
    const n0 = Math.hypot(...v);
    const n = projeter(v);
    if (n > 1e-6 * n0) base.push(v.map((x) => x / n));
  });
  aretes.filter((e) => e.muscle).forEach((e) => {
    const v = ligne(e);
    const n0 = Math.hypot(...v);
    e.bloque = projeter(v) < 1e-4 * n0;
  });
}

// Triangles dont les trois côtés existent : on les remplit pour donner de la chair au squelette
function trianglesDeChair(n, aretes) {
  const lie = new Set(aretes.map((e) => `${e.a}-${e.b}`));
  const l = (a, b) => lie.has(a < b ? `${a}-${b}` : `${b}-${a}`);
  const t = [];
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++)
      for (let c = b + 1; c < n; c++) if (l(a, b) && l(b, c) && l(a, c)) t.push([a, b, c]);
  return t;
}

// L'espèce = le plan du corps, compté grossièrement. Lisible tel quel :
// « 5·3·2·1 » = 5 nœuds, 3 os, 2 muscles actifs, 1 griffe.
function morphotype(corps) {
  const os = corps.aretes.filter((e) => !e.muscle).length;
  const muscles = corps.aretes.filter((e) => e.muscle && !e.bloque).length;
  const griffes = corps.noeuds.filter((n) => n.griffe).length;
  return `${corps.noeuds.length}·${os}·${muscles}·${griffes}`;
}

export const decrirePlan = (p) => {
  const [n, g] = p.split('·').map(Number);
  return `${n} nœuds${g ? `, ${g} griffe${g > 1 ? 's' : ''}` : ''}`;
};

export const decrireMorphotype = (m) => {
  const [n, o, mu, g] = m.split('·').map(Number);
  const pl = (k, s) => `${k} ${s}${k > 1 ? 's' : ''}`;
  return [pl(n, 'nœud'), pl(o, 'os').replace('oss', 'os'), pl(mu, 'muscle'), g ? pl(g, 'griffe') : null].filter(Boolean).join(', ');
};

// ── Sérialisation : 400 chromosomes de 4 lettres ↔ une chaîne de 1600 lettres ──
export const adnVersTexte = (adn) => adn.map((c) => c.join('')).join('');
export const texteVersAdn = (t) => {
  const adn = [];
  for (let i = 0; i < t.length; i += 4) adn.push(t.slice(i, i + 4).split(''));
  return adn;
};
