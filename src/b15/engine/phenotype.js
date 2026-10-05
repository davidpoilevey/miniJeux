import { ADNHandler } from '../../genetic/ADNPlante';

// 18 gènes, pas un de plus. Le comportement n'est pas codé : il émerge de ces
// poids appliqués à un monde que les bactéries écrivent elles-mêmes.
// Noms choisis pour n'avoir aucune collision de hash (hashString % 400).
export const GUILDES = ['Brouteurs', 'Recycleurs', 'Fossoyeurs'];
export const GUILDE_COULEURS = ['#5dff8a', '#ffab40', '#6fa8ff'];
export const ARMES = ['Tueuses', 'Résistantes', 'Sensibles'];
export const ARME_COULEURS = ['#ff3232', '#288cff', '#ebdc78'];
const ARMES_RGB = [[255, 50, 50], [40, 140, 255], [235, 220, 120]];

const lerp = (a, b, t) => a + (b - a) * t;

export function lirePhenotype(adn) {
  const h = new ADNHandler(adn);
  const f = (k) => h.readFloat(k);

  // Enzymes : ce que la bactérie sait digérer (A sucre, B acide, C déchet)
  const eA = f('enzymeA'), eB = f('enzymeB'), eC = f('enzymeC');

  const ph = {
    eA, eB, eC,
    // Chimiotactisme à deux humeurs : poids attirance (+) / répulsion (−) pour
    // A, B, C et la toxine T quand on a faim, puis quand on est repu. La bactérie
    // interpole selon sa réserve : c'est une règle condition → action, pas un curseur.
    faim: [f('faimA'), f('faimB'), f('faimC'), f('faimT')].map((v) => v * 2 - 1),
    repu: [f('repuA'), f('repuB'), f('repuC'), f('repuT')].map((v) => v * 2 - 1),
    // Colicine : produire la toxine (cher, et protège) / s'en immuniser (moins cher).
    // Aucun pierre-feuille-ciseaux n'est codé : il naît de l'ordre des coûts.
    toxine: h.readBool('toxine') ? f('toxine') * 2 : 0, // readBool ⇒ f < 0.5, donc [0, 1)
    resistance: f('immunite'),
    portee: 1 + Math.round(f('porteeCapteur') * 5), // 1..6 cases
    mobilite: f('mobilite') ** 3,                    // proba de bouger par tick (biais sédentaire)
    errance: f('errance') * 0.5,                     // bruit dans le choix de direction
    seuilDivision: lerp(1.2, 3.5, f('seuilDivision')),
    longevite: Math.round(lerp(150, 1200, f('longevite'))),
    // Marqueur neutre : aucune pression de sélection, il dérive → trace les lignées
    teinte: f('teinte'),
  };

  const total = eA + eB + eC || 1;
  ph.sommeEnzymes = eA + eB + eC;
  // Comme chez E. coli, l'immunité est couplée à la production : une vraie tueuse ne s'empoisonne pas
  ph.protection = Math.min(1, ph.resistance + 2 * ph.toxine);
  // Stratégie dominante : 0 tueuse, 1 résistante, 2 sensible
  ph.arme = ph.toxine > 0.3 ? 0 : ph.resistance > 0.5 ? 1 : 2;
  ph.guilde = eA >= eB && eA >= eC ? 0 : eB >= eC ? 1 : 2;

  // Couleurs pré-calculées une fois pour toutes (le rendu ne touche plus à l'ADN)
  ph.rgbRegime = [
    Math.min(255, Math.round(70 + 185 * (eB / total) + 30 * (eC / total))),
    Math.min(255, Math.round(70 + 185 * (eA / total) + 70 * (eB / total))),
    Math.min(255, Math.round(70 + 185 * (eC / total))),
  ];
  ph.rgbLignee = hslVersRgb(ph.teinte, 0.85, 0.6);
  // Tueuse = rouge, résistante = bleu, sensible = jaune pâle : couleurs franches, lisibles
  ph.rgbArmes = ARMES_RGB[ph.arme];
  return ph;
}

function hslVersRgb(h, s, l) {
  const k = (n) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const c = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return [c(0), c(8), c(4)];
}
