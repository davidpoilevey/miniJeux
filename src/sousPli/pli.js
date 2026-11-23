export const dossiers = [
  {
    nom: 'La rue du Marché',
    largeur: 5,
    hauteur: 3,
    budget: 1,
    courrier: ['A2', 'D2'],
    scelles: ['B2'],
    carte: { x: 65, y: 15, pas: 119 },
    pliGuide: { axe: 'x', trait: 2 },
  },
  {
    nom: 'Les deux rives',
    largeur: 6,
    hauteur: 5,
    budget: 2,
    courrier: ['A1', 'F1', 'A4', 'F4'],
    scelles: ['B1', 'E4', 'F5'],
    carte: { x: 445, y: 90, pas: 135 },
  },
  {
    nom: 'Le dernier départ',
    largeur: 8,
    hauteur: 6,
    budget: 3,
    courrier: ['A2', 'B2', 'E2', 'A5', 'E5'],
    scelles: ['F2', 'D1', 'G4', 'C5'],
    carte: { x: 935, y: 446, pas: 74 },
  },
  {
    nom: 'La place des Tilleuls',
    largeur: 7,
    hauteur: 6,
    budget: 3,
    courrier: ['B2', 'B5', 'B6', 'G5', 'G6'],
    scelles: ['B1'],
    carte: { x: 5, y: 454, pas: 93 },
  },
  {
    nom: 'Le parc des Serres',
    largeur: 8,
    hauteur: 6,
    budget: 4,
    courrier: ['C4', 'C5', 'D4', 'D6', 'E5', 'E6'],
    scelles: ['B4', 'C3'],
    carte: { x: 888, y: 35, pas: 80 },
  },
  {
    nom: 'La dernière levée',
    largeur: 8,
    hauteur: 7,
    budget: 5,
    courrier: ['B1', 'C1', 'C2', 'C3', 'F2', 'F3', 'G1', 'H3'],
    scelles: ['A1', 'D1', 'B4'],
    carte: { x: 175, y: 8, pas: 144 },
  },
];

export const colonne = x => String.fromCharCode(65 + x);
export const adresse = (x, y) => `${colonne(x)}${y + 1}`;

export function ouvrirPlan({ largeur, hauteur }) {
  return Array.from({ length: hauteur }, (_, y) =>
    Array.from({ length: largeur }, (_, x) => ({
      x, y, couches: [{ x, y, id: adresse(x, y), miroirX: false, miroirY: false }],
    }))
  ).flat();
}

export function trouverPlis(plan) {
  return ['x', 'y'].flatMap(axe => {
    const positions = plan.map(casePlan => casePlan[axe]);
    const debut = Math.min(...positions);
    const fin = Math.max(...positions);
    return Array.from({ length: fin - debut }, (_, i) => {
      const trait = debut + i + 1;
      return { axe, trait, deplaceDebut: trait - debut <= fin - trait + 1 };
    });
  });
}

export function seDeplace(casePlan, { axe, trait, deplaceDebut }) {
  return (casePlan[axe] < trait) === deplaceDebut;
}

export function plier(plan, pli) {
  const { axe, trait } = pli;
  const orientation = axe === 'x' ? 'miroirX' : 'miroirY';
  const fixe = new Map();
  const mobile = [];
  for (const casePlan of plan) {
    if (seDeplace(casePlan, pli)) mobile.push(casePlan);
    else fixe.set(adresse(casePlan.x, casePlan.y), casePlan);
  }
  for (const casePlan of mobile) {
    const miroir = { ...casePlan, [axe]: 2 * trait - casePlan[axe] - 1 };
    const cle = adresse(miroir.x, miroir.y);
    const dessous = fixe.get(cle);
    const rabattues = casePlan.couches.slice().reverse().map(couche => ({
      ...couche,
      [orientation]: !couche[orientation],
    }));
    fixe.set(cle, { ...dessous, couches: [...dessous.couches, ...rabattues] });
  }
  return [...fixe.values()];
}

export function examiner(couches, { courrier, scelles }) {
  const adresses = new Set(couches.map(couche => couche.id));
  return {
    distribues: courrier.filter(id => adresses.has(id)),
    oublies: courrier.filter(id => !adresses.has(id)),
    touches: scelles.filter(id => adresses.has(id)),
  };
}
