// Les demandes ne portent que sur des stocks réellement disponibles.
const MATERIALS = ['wood', 'stone', 'iron', 'food', 'laine', 'charbon', 'petrole', 'uranium'];
export const RESOURCE_LABELS = { gold: 'or', wood: 'bois', stone: 'pierre', iron: 'fer', food: 'nourriture', laine: 'laine', charbon: 'charbon', petrole: 'pétrole', uranium: 'uranium', science: 'points de recherche' };

export const tributeStock = (nationId, resource, cities, science = 0) => resource === 'science'
  ? science
  : cities.filter(c => c.owner.id === nationId).reduce((sum, c) => sum + Math.max(0, c.resources[resource] || 0), 0);

export function buildDiplomaticDemand(fromNation, toNation, cities, science = 0) {
  const profile = fromNation.diplomacyProfile || {};
  const warOnRefusal = true;
  if (Math.random() >= (profile.aggressif || 0)) {
    return { type: 'peace', warOnRefusal, text: 'proposent un traité de paix' };
  }
  const canReceiveResources = cities.some(c => c.owner.id === fromNation.id);
  const choices = [...(canReceiveResources ? ['gold', ...MATERIALS] : []), 'science'].filter(resource => tributeStock(toNation.id, resource, cities, science) >= 1);
  if (!choices.length) return { type: 'peace', warOnRefusal, text: 'proposent un traité de paix' };
  const resource = choices[Math.floor(Math.random() * choices.length)];
  const cap = resource === 'gold' ? 100 : resource === 'science' ? 10 : 30;
  const amount = Math.min(cap, Math.floor(tributeStock(toNation.id, resource, cities, science)));
  return { type: 'tribute', resource, amount, warOnRefusal,
    text: `exigent un tribut de ${amount} ${RESOURCE_LABELS[resource]} pour signer la paix` };
}

export function transferTribute(cities, payerId, recipientId, resource, amount) {
  if (!Number.isFinite(amount) || amount <= 0 || resource === 'science') return false;
  const donors = cities.filter(c => c.owner.id === payerId).sort((a, b) => (b.resources[resource] || 0) - (a.resources[resource] || 0));
  const recipient = cities.find(c => c.owner.id === recipientId);
  if (!recipient || tributeStock(payerId, resource, cities) < amount) return false;
  let remaining = amount;
  for (const city of donors) {
    const paid = Math.min(remaining, Math.max(0, city.resources[resource] || 0));
    city.resources = { ...city.resources, [resource]: (city.resources[resource] || 0) - paid };
    remaining -= paid;
    if (remaining === 0) break;
  }
  recipient.resources = { ...recipient.resources, [resource]: (recipient.resources[resource] || 0) + amount };
  return true;
}
