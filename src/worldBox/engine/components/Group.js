// Appartenance à un village / groupe
// role: 'member' | 'chief'
export default function Group(groupId, role = 'member') {
  return { groupId, role };
}
