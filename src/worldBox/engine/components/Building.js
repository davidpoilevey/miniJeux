// Composant Building — attaché à une entité spatiale représentant un bâtiment construit.
// type    : identifiant du bâtiment (ex: 'maison', 'grenier')
// label   : libellé lisible (ex: 'Maison')
// groupId : nom du village propriétaire
export default function Building(type, label, groupId) {
  return { type, label, groupId, hp: 200, maxHp: 200 };
}
