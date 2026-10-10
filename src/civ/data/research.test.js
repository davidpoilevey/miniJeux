import { researchCost, researchRate } from './research';
import { TECHNOLOGIES } from './techTree';
test('les premiers travaux prennent douze tours au rythme de base et une école accélère la recherche', () => {
  const nation = { bonuses: { science: 3 } };
  expect(researchCost(TECHNOLOGIES.agriculture)).toBe(12);
  expect(researchRate(0, nation)).toBe(1);
  expect(researchRate(5, nation)).toBe(2);
  expect(researchRate(25, nation)).toBe(6);
});
