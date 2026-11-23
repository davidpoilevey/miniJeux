// Le village vu de dessus (3/4). Coordonnées logiques : origine en haut à gauche,
// x vers la droite, y vers le bas. Le point du personnage représente ses pieds.
//
// Plan : une rue principale horizontale (y 470–550), une ruelle haute (y 250–320)
// et une ruelle basse (y 780–840), reliées par des passages verticaux.
// Chaque bâtiment regarde vers le bas : sa porte est au milieu de sa base.

export const view = { width: 680, height: 408 };

// x, haut du toit, largeur, base de la façade, abscisse de la porte (relative à x)
export const buildings = [
  // ruelle haute
  { id: 'banque', x: 60, top: 100, width: 170, base: 250, door: 85 },
  { id: 'studio', x: 260, top: 100, width: 150, base: 250, door: 110 },
  { id: 'arcade', x: 560, top: 100, width: 150, base: 250, door: 110 },
  { id: 'poste', x: 740, top: 100, width: 150, base: 250, door: 100 },
  { id: 'usine', x: 960, top: 100, width: 210, base: 250, door: 175 },
  { id: 'dojo', x: 1200, top: 100, width: 140, base: 250, door: 70 },
  // rue principale
  { id: 'maison', x: 50, top: 320, width: 180, base: 470, door: 130 },
  { id: 'pivot', x: 330, top: 320, width: 190, base: 470, door: 95 },
  { id: 'biblio', x: 600, top: 320, width: 200, base: 470, door: 150 },
  { id: 'garage', x: 1000, top: 320, width: 200, base: 470, door: 160 },
  // ruelle basse
  { id: 'winstub', x: 140, top: 630, width: 150, base: 780, door: 110 },
  { id: 'boulangerie', x: 560, top: 630, width: 140, base: 780, door: 105 },
];

// Portes qui s'ouvrent.
const doorIds = ['banque', 'studio', 'arcade', 'poste', 'usine', 'dojo',
  'maison', 'pivot', 'biblio', 'garage', 'winstub', 'boulangerie'];

function door({ x, base, door: offset }) {
  const cx = x + offset;
  return {
    anchor: { x: cx, y: base },
    hitArea: { x: -19, y: -52, width: 38, height: 56 },
    approach: { x: cx, y: base + 20, radius: 30 },
    resume: { x: cx, y: base + 28, facing: 'up' },
  };
}

// Décor qui bloque le passage : fontaine de la place, totem du garage, mare, troncs.
export const props = {
  fountain: { x: 900, y: 400, radius: 30 },
  pond: { x: 900, y: 640, width: 260, height: 120 },
  totem: { x: 1212, y: 392, width: 26, height: 78 },
  cat: { x: 1010, y: 566 },
  trees: [[290, 600], [470, 610], [790, 590], [1240, 600], [1300, 700], [60, 590], [40, 760], [450, 866], [880, 868]],
};

export const villageMap = {
  width: 1360,
  height: 880,
  bounds: { left: 20, top: 100, right: 1340, bottom: 850 },
  spawn: { x: 900, y: 505, facing: 'down' },
  obstacles: [
    ...buildings.map(({ x, top, width, base }) => ({ x, y: top, width, height: base - top })),
    { x: props.fountain.x - 28, y: props.fountain.y - 22, width: 56, height: 40 },
    { x: props.pond.x, y: props.pond.y, width: props.pond.width, height: props.pond.height },
    { x: props.totem.x, y: props.totem.y, width: props.totem.width, height: props.totem.height },
    { x: props.cat.x - 10, y: props.cat.y - 6, width: 20, height: 8 },
    ...props.trees.map(([x, y]) => ({ x: x - 8, y: y - 8, width: 16, height: 10 })),
  ],
  doors: Object.fromEntries(doorIds.map((id) => [id, door(buildings.find((b) => b.id === id))])),
};

// L'eau : on ne peut pas y marcher, mais on peut essayer (plouf).
export function inWater(x, y) {
  const { fountain: f, pond: p } = props;
  const inFountain = ((x - f.x) / 36) ** 2 + ((y - f.y) / 22) ** 2 <= 1;
  const inPond = x >= p.x && x <= p.x + p.width && y >= p.y && y <= p.y + p.height;
  return inFountain || inPond;
}

export function nearCat({ x, y }) {
  return Math.hypot(x - props.cat.x, y - props.cat.y) <= 42;
}
