import { adresse, dossiers, examiner, ouvrirPlan, plier, trouverPlis } from './pli';

function suivrePlis(plan, etapes) {
  return etapes.reduce((avant, [axe, trait]) => {
    const pli = trouverPlis(avant).find(candidat => candidat.axe === axe && candidat.trait === trait);
    expect(pli).toBeDefined();
    return plier(avant, pli);
  }, plan);
}

test('le volet inverse ses couches et conserve leur orientation sur chaque axe', () => {
  const plan = ouvrirPlan({ largeur: 4, hauteur: 4 });
  const plie = suivrePlis(plan, [['x', 2], ['y', 2]]);
  const caseC3 = plie.find(({ x, y }) => adresse(x, y) === 'C3');

  expect(caseC3.couches).toEqual([
    { id: 'C3', x: 2, y: 2, miroirX: false, miroirY: false },
    { id: 'B3', x: 1, y: 2, miroirX: true, miroirY: false },
    { id: 'B2', x: 1, y: 1, miroirX: true, miroirY: true },
    { id: 'C2', x: 2, y: 1, miroirX: false, miroirY: true },
  ]);
  expect(plan.find(({ x, y }) => adresse(x, y) === 'B2').couches[0].miroirX).toBe(false);
});

test.each([
  [3, [['x', 4], ['y', 5], ['y', 3]], [['x', 4], ['y', 3], ['y', 5]]],
  [4, [['x', 4], ['x', 5], ['y', 5], ['y', 4]], [['x', 3], ['x', 4], ['y', 4], ['y', 3]]],
  [5, [['x', 7], ['x', 4], ['x', 2], ['y', 1], ['y', 2]], [['x', 4], ['x', 6], ['x', 7], ['y', 1], ['y', 2]]],
])('la tournée d’index %i distingue deux plis qui couvrent toutes ses lettres', (index, valide, piege) => {
  const dossier = dossiers[index];
  const plan = ouvrirPlan(dossier);
  const livraisons = etapes => suivrePlis(plan, etapes)
    .map(({ couches }) => examiner(couches, dossier))
    .filter(({ oublies }) => oublies.length === 0);

  expect(livraisons(valide)).toEqual([{ distribues: dossier.courrier, oublies: [], touches: [] }]);
  const refus = livraisons(piege);
  expect(refus).toHaveLength(1);
  expect(refus[0].touches.length).toBeGreaterThan(0);
});
