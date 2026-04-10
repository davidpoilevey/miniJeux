export function findCaptures(card, table) {
  const direct = table.filter(c => c.rank.value === card.rank.value);
  if (direct.length > 0) return direct.map(c => [c]);

  // combinaisons (simple, améliorable)
  const results = [];
  const recurse = (sum, combo, rest) => {
    if (sum === card.rank.value) {
      results.push(combo);
      return;
    }
    if (sum > card.rank.value) return;

    rest.forEach((c, i) =>
      recurse(sum + c.rank.value, [...combo, c], rest.slice(i + 1))
    );
  };

  recurse(0, [], table);
  return results;
}

