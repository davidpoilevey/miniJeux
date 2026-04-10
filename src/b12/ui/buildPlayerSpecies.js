/**
 * buildPlayerSpecies(genes) — SVG composé de l'espèce joueur
 *
 * Chaque gène ajoute ou remplace une pièce visuelle.
 * Appelé uniquement lors des changements de gènes (pas à chaque tick).
 * Résultat mis en cache par combinaison de gènes.
 *
 * viewBox : "0 0 80 70" — poisson orienté vers la droite
 *   Corps    : cx=42, cy=27   (y=15→y=39)
 *   Queue    : x=8→x=22
 *   Nageoire : y=7 (dorsale) → y=42 (pectorale)
 *   Pattes   : y=39→y=57  (seulement si gènes pattes)
 *
 * Pour ajouter une pièce future :
 *   1. Définir la constante SVG en bas de section
 *   2. Ajouter la condition dans buildPlayerSpecies()
 */

// ── Palette ───────────────────────────────────────────────────────────────────

const C = {
  body:        '#00ccaa',
  bodyStroke:  '#007755',
  fin:         '#00aa88',
  finStroke:   '#006644',
  eyeWhite:    '#ffffff',
  pupil:       '#003322',
  mouth:       '#006644',
  scale:       '#009966',
  teeth:       '#f5f5dc',
  jaw:         '#00bb99',
  leg:         '#00aa77',
  foot:        '#008855',
  claw:        '#664400',
  spine:       '#cc6600',
  fur:         '#88bb99',
  lung:        '#ffbbaa',
  lungStroke:  '#cc8877',
  crest:       '#ff6600',
  egg:         '#ffee99',
  heat:        '#ff8800',
};

// ── Base (toujours présent) ───────────────────────────────────────────────────

// Queue fourchue — path avec encoche centrale
const BASE_TAIL = `
  <path d="M22,27 L8,15 L15,27 L8,39 Z"
    fill="${C.fin}" stroke="${C.finStroke}" stroke-width="1.2" stroke-linejoin="round"/>`;

// Corps principal
const BASE_BODY = `
  <ellipse cx="42" cy="27" rx="20" ry="12"
    fill="${C.body}" stroke="${C.bodyStroke}" stroke-width="1.5"/>`;

// Nageoire dorsale (petite)
const BASE_DORSAL_FIN = `
  <polygon points="34,15 40,7 48,15"
    fill="${C.fin}" stroke="${C.finStroke}" stroke-width="1"/>`;

// Nageoire pectorale (côté)
const BASE_PECTORAL_FIN = `
  <polygon points="38,32 32,43 46,39"
    fill="${C.fin}" stroke="${C.finStroke}" stroke-width="1"/>`;

// Oeil
const BASE_EYE = `
  <circle cx="55" cy="23" r="4.5" fill="${C.eyeWhite}" stroke="${C.bodyStroke}" stroke-width="1"/>
  <circle cx="56" cy="23" r="3"   fill="${C.pupil}"/>
  <circle cx="57" cy="22" r="1"   fill="white" opacity="0.7"/>`;

// Bouche simple
const BASE_MOUTH = `
  <path d="M62,25 Q64,27 62,29"
    stroke="${C.mouth}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;

// Fentes branchiales — toujours visibles (légères)
const BASE_GILLS = `
  <line x1="51" y1="20" x2="50" y2="34" stroke="${C.bodyStroke}" stroke-width="1"   opacity="0.5"/>
  <line x1="48" y1="19" x2="47" y2="35" stroke="${C.bodyStroke}" stroke-width="0.8" opacity="0.35"/>`;

// ── ALIMENTATION ──────────────────────────────────────────────────────────────

// Dents primitives — deux petits triangles ivoire
const TEETH_PRIMITIVE = `
  <polygon points="62,26 64,23 66,26" fill="${C.teeth}" stroke="#bbaa44" stroke-width="0.5"/>
  <polygon points="62,28 64,31 66,28" fill="${C.teeth}" stroke="#bbaa44" stroke-width="0.5"/>`;

// Mâchoire puissante — extension de tête + grandes dents
const TEETH_JAW = `
  <ellipse cx="63" cy="27" rx="6" ry="8" fill="${C.jaw}" stroke="${C.bodyStroke}" stroke-width="1"/>
  <polygon points="60,24 62,20 64,24" fill="${C.teeth}" stroke="#bbaa44" stroke-width="0.5"/>
  <polygon points="64,24 66,20 68,24" fill="${C.teeth}" stroke="#bbaa44" stroke-width="0.5"/>
  <polygon points="60,30 62,34 64,30" fill="${C.teeth}" stroke="#bbaa44" stroke-width="0.5"/>
  <polygon points="64,30 66,34 68,30" fill="${C.teeth}" stroke="#bbaa44" stroke-width="0.5"/>`;

// ── LOCOMOTION ────────────────────────────────────────────────────────────────

// Nageoires renforcées — grande dorsale + grande pectorale (remplace les nageoires de base)
const FINS_LARGE = `
  <polygon points="30,15 38,4 52,15"
    fill="${C.fin}" stroke="${C.finStroke}" stroke-width="1"/>
  <polygon points="36,39 28,52 50,48 52,39"
    fill="${C.fin}" stroke="${C.finStroke}" stroke-width="1"/>`;

// Poumons primitifs — deux petits lobes roses sur le dessus de la tête
const LUNG_BUMPS_PRIMITIVE = `
  <circle cx="46" cy="16" r="4"   fill="${C.lung}" stroke="${C.lungStroke}" stroke-width="1" opacity="0.85"/>
  <circle cx="38" cy="16" r="3.5" fill="${C.lung}" stroke="${C.lungStroke}" stroke-width="1" opacity="0.85"/>`;

// Poumons développés — lobes plus grands, plus proéminents
const LUNG_BUMPS_DEVELOPED = `
  <circle cx="46" cy="14" r="5.5" fill="${C.lung}" stroke="${C.lungStroke}" stroke-width="1.2" opacity="0.9"/>
  <circle cx="38" cy="14" r="5"   fill="${C.lung}" stroke="${C.lungStroke}" stroke-width="1.2" opacity="0.9"/>
  <circle cx="42" cy="13" r="3"   fill="#ffccbb"   stroke="${C.lungStroke}" stroke-width="0.8" opacity="0.7"/>`;

// Pattes primitives — 2 courtes pattes stub
const LEGS_PRIMITIVE = `
  <rect x="34" y="38" width="6" height="10" rx="3" fill="${C.leg}" stroke="${C.finStroke}" stroke-width="1"/>
  <ellipse cx="37" cy="50" rx="5" ry="2.5" fill="${C.foot}" stroke="${C.finStroke}" stroke-width="1"/>
  <rect x="44" y="38" width="6" height="10" rx="3" fill="${C.leg}" stroke="${C.finStroke}" stroke-width="1"/>
  <ellipse cx="47" cy="50" rx="5" ry="2.5" fill="${C.foot}" stroke="${C.finStroke}" stroke-width="1"/>`;

// Pattes puissantes — 2 pattes longues et épaisses
const LEGS_STRONG = `
  <rect x="32" y="38" width="8" height="14" rx="3.5" fill="${C.leg}" stroke="${C.finStroke}" stroke-width="1"/>
  <ellipse cx="36" cy="54" rx="6" ry="3"   fill="${C.foot}" stroke="${C.finStroke}" stroke-width="1.2"/>
  <rect x="44" y="38" width="8" height="14" rx="3.5" fill="${C.leg}" stroke="${C.finStroke}" stroke-width="1"/>
  <ellipse cx="48" cy="54" rx="6" ry="3"   fill="${C.foot}" stroke="${C.finStroke}" stroke-width="1.2"/>`;

// Griffes — petites lignes aux extrémités des pattes
const CLAWS = `
  <line x1="31" y1="55" x2="28" y2="58" stroke="${C.claw}" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="36" y1="56" x2="36" y2="59" stroke="${C.claw}" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="41" y1="55" x2="44" y2="58" stroke="${C.claw}" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="44" y1="55" x2="41" y2="58" stroke="${C.claw}" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="48" y1="56" x2="48" y2="59" stroke="${C.claw}" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="53" y1="55" x2="56" y2="58" stroke="${C.claw}" stroke-width="1.5" stroke-linecap="round"/>`;

// ── DÉFENSE ───────────────────────────────────────────────────────────────────

// Écailles renforcées — motif de cercles en quinconce
const SCALES = `
  <circle cx="35" cy="25" r="4.5" fill="none" stroke="${C.scale}" stroke-width="0.8" opacity="0.6"/>
  <circle cx="42" cy="23" r="4.5" fill="none" stroke="${C.scale}" stroke-width="0.8" opacity="0.6"/>
  <circle cx="49" cy="25" r="4.5" fill="none" stroke="${C.scale}" stroke-width="0.8" opacity="0.6"/>
  <circle cx="36" cy="32" r="4.5" fill="none" stroke="${C.scale}" stroke-width="0.8" opacity="0.6"/>
  <circle cx="43" cy="31" r="4.5" fill="none" stroke="${C.scale}" stroke-width="0.8" opacity="0.6"/>
  <circle cx="29" cy="28" r="3.5" fill="none" stroke="${C.scale}" stroke-width="0.8" opacity="0.5"/>`;

// Camouflage — taches irrégulières
const CAMOUFLAGE_SPOTS = `
  <ellipse cx="34" cy="24" rx="5.5" ry="3"   fill="#009966" opacity="0.35"/>
  <ellipse cx="43" cy="30" rx="4.5" ry="2.5" fill="#008855" opacity="0.3"/>
  <ellipse cx="50" cy="23" rx="3.5" ry="2"   fill="#009966" opacity="0.35"/>
  <ellipse cx="37" cy="33" rx="4"   ry="2"   fill="#006644" opacity="0.3"/>
  <ellipse cx="28" cy="27" rx="3"   ry="2.5" fill="#008855" opacity="0.25"/>`;

// Venin — épines acérées sur le dos et la queue
const VENOM_SPINES = `
  <line x1="34" y1="15" x2="32" y2="8"  stroke="${C.spine}" stroke-width="2"   stroke-linecap="round"/>
  <line x1="40" y1="15" x2="40" y2="6"  stroke="${C.spine}" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="46" y1="15" x2="48" y2="8"  stroke="${C.spine}" stroke-width="2"   stroke-linecap="round"/>
  <line x1="23" y1="21" x2="19" y2="14" stroke="${C.spine}" stroke-width="1.5" stroke-linecap="round"/>
  <circle cx="40" cy="6"  r="1.5" fill="${C.spine}"/>
  <circle cx="32" cy="8"  r="1.2" fill="${C.spine}"/>
  <circle cx="48" cy="8"  r="1.2" fill="${C.spine}"/>`;

// Fourrure légère — courbes légères autour du contour
const FUR_LIGHT = `
  <path d="M26,22 Q24,18 28,15" stroke="${C.fur}" stroke-width="0.9" fill="none" opacity="0.65"/>
  <path d="M34,16 Q36,12 42,13" stroke="${C.fur}" stroke-width="0.9" fill="none" opacity="0.65"/>
  <path d="M46,14 Q50,12 54,16" stroke="${C.fur}" stroke-width="0.9" fill="none" opacity="0.65"/>
  <path d="M26,32 Q24,36 28,39" stroke="${C.fur}" stroke-width="0.9" fill="none" opacity="0.65"/>
  <path d="M34,39 Q38,43 44,42" stroke="${C.fur}" stroke-width="0.9" fill="none" opacity="0.65"/>`;

// Fourrure épaisse — silhouette hérissée dense
const FUR_THICK = `
  <path d="M23,27 Q21,22 24,17 Q28,12 34,13 Q40,11 46,12 Q52,13 57,18 Q60,22 62,27"
    stroke="${C.fur}" stroke-width="2" fill="none" opacity="0.8"/>
  <path d="M23,27 Q21,32 24,37 Q28,42 34,43 Q40,45 46,43 Q52,42 57,38 Q60,33 62,27"
    stroke="${C.fur}" stroke-width="2" fill="none" opacity="0.8"/>
  <path d="M27,19 Q25,15 28,12" stroke="${C.fur}" stroke-width="1.2" fill="none" opacity="0.6"/>
  <path d="M36,13 Q35,9  38,8"  stroke="${C.fur}" stroke-width="1.2" fill="none" opacity="0.6"/>
  <path d="M44,12 Q44,8  47,9"  stroke="${C.fur}" stroke-width="1.2" fill="none" opacity="0.6"/>
  <path d="M27,35 Q25,39 28,42" stroke="${C.fur}" stroke-width="1.2" fill="none" opacity="0.6"/>
  <path d="M36,43 Q36,47 39,46" stroke="${C.fur}" stroke-width="1.2" fill="none" opacity="0.6"/>`;

// ── SOCIAL ────────────────────────────────────────────────────────────────────

// Comportement territorial — bande de couleur distinctive
const TERRITORY_STRIPE = `
  <line x1="24" y1="27" x2="62" y2="27"
    stroke="#ff9900" stroke-width="2" opacity="0.4" stroke-linecap="round"/>`;

// ── REPRODUCTION ──────────────────────────────────────────────────────────────

// Sélection sexuelle — crête dorsale colorée (remplace la nageoire dorsale de base)
const SELECTION_CREST = `
  <polygon points="30,15 38,4 50,15"
    fill="${C.crest}" stroke="#cc4400" stroke-width="1" opacity="0.9"/>`;

// Ponte optimisée + vivipare — amas d'oeufs visible dans le ventre
const BELLY_EGGS = `
  <ellipse cx="40" cy="31" rx="8" ry="4.5"
    fill="${C.egg}" stroke="#ccaa44" stroke-width="0.8" opacity="0.65"/>
  <circle cx="37" cy="31" r="2" fill="#ffdd88" opacity="0.9"/>
  <circle cx="41" cy="31" r="2" fill="#ffdd88" opacity="0.9"/>
  <circle cx="45" cy="31" r="2" fill="#ffdd88" opacity="0.9"/>`;

// ── ADAPTATION ────────────────────────────────────────────────────────────────

// Thermorégulation — auréoles de chaleur autour du corps
const HEAT_GLOW = `
  <ellipse cx="42" cy="27" rx="26" ry="17"
    fill="none" stroke="${C.heat}" stroke-width="1.2" opacity="0.25"/>
  <ellipse cx="42" cy="27" rx="30" ry="20"
    fill="none" stroke="${C.heat}" stroke-width="0.8" opacity="0.15"/>`;

// ── Cache ─────────────────────────────────────────────────────────────────────

const _cache = new Map();

/**
 * Génère (et met en cache) le SVG data-URL de l'espèce joueur.
 * @param {string[]|Set<string>} genes
 * @returns {string}  data:image/svg+xml;... URL utilisable par <img> ou Konva Image
 */
export function buildPlayerSpecies(genes) {
  const g   = genes instanceof Set ? genes : new Set(genes);
  const key = [...g].sort().join(',');
  if (_cache.has(key)) return _cache.get(key);

  const parts = [];

  // ── Effets d'arrière-plan ────────────────────────────────────────────────
  if (g.has('thermoregulation')) parts.push(HEAT_GLOW);

  // ── Queue (derrière le corps) ────────────────────────────────────────────
  parts.push(BASE_TAIL);

  // ── Corps ────────────────────────────────────────────────────────────────
  parts.push(BASE_BODY);

  // ── Superpositions corps (écailles, camo, fourrure) ──────────────────────
  if (g.has('ecailles_renforcees'))  parts.push(SCALES);
  if (g.has('camouflage'))           parts.push(CAMOUFLAGE_SPOTS);
  if (g.has('fourrure_epaisse'))     parts.push(FUR_THICK);
  else if (g.has('fourrure_legere')) parts.push(FUR_LIGHT);

  // Bande territoriale (sous les nageoires)
  if (g.has('comportement_territorial')) parts.push(TERRITORY_STRIPE);

  // ── Nageoires ────────────────────────────────────────────────────────────
  if (g.has('nageoires_renforcees')) {
    parts.push(FINS_LARGE);
  } else {
    parts.push(BASE_DORSAL_FIN);
    parts.push(BASE_PECTORAL_FIN);
  }

  // ── Pattes (après le corps pour paraître attachées) ───────────────────────
  if (g.has('pattes_puissantes'))         parts.push(LEGS_STRONG);
  else if (g.has('pattes_primitives'))    parts.push(LEGS_PRIMITIVE);

  if (g.has('griffes') && (g.has('pattes_primitives') || g.has('pattes_puissantes'))) {
    parts.push(CLAWS);
  }

  // ── Adaptation — poumons ─────────────────────────────────────────────────
  if (g.has('poumons_developpes'))       parts.push(LUNG_BUMPS_DEVELOPED);
  else if (g.has('poumons_primitifs'))   parts.push(LUNG_BUMPS_PRIMITIVE);

  // ── Épines venimeuses ────────────────────────────────────────────────────
  if (g.has('venin'))                    parts.push(VENOM_SPINES);

  // ── Crête de sélection sexuelle (remplace la nageoire dorsale de base) ───
  if (g.has('selection_sexuelle'))       parts.push(SELECTION_CREST);

  // ── Oeil et branchies (toujours au-dessus du corps) ──────────────────────
  parts.push(BASE_EYE);
  parts.push(BASE_GILLS);

  // ── Bouche et dents ──────────────────────────────────────────────────────
  if (g.has('machoire_puissante'))       parts.push(TEETH_JAW);
  else if (g.has('dents_primitives'))    parts.push(TEETH_PRIMITIVE);
  else                                   parts.push(BASE_MOUTH);

  // ── Ventre (oeufs) ───────────────────────────────────────────────────────
  if (g.has('ponte_optimisee') || g.has('vivipare')) parts.push(BELLY_EGGS);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 70">${parts.join('')}</svg>`;
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  _cache.set(key, src);
  return src;
}

/** Vide le cache (après un reset de partie). */
export function clearPlayerSpeciesCache() {
  _cache.clear();
}
