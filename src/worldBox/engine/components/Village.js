// Composant Village — attaché à une entité centrale par groupe.
// buildings   : compteur { maison: 2, grenier: 1, ... } (pas encore d'entités spatiales)
// stockpile   : ressources accumulées par les habitants
// communityNeeds : besoins calculés chaque tick par CommunityDecisionSystem
// currentPlan : { buildingId, cost, missing } — bâtiment en cours de planification
// gatherOrder : stockType à collecter en priorité (null = aucun ordre)
export default function Village(groupId, color = '#ffffff', bonus = null) {
  return {
    groupId,
    color,
    bonus,
    stockpile: {
      bois: 0, argile: 0, charbon: 0, silex: 0,
      nourriture: 0, fer: 0, or: 0, argent: 0,
    },
    buildings: {},
    communityNeeds: {
      shelter: 0, food_security: 0, community: 0,
      knowledge: 0, culture: 0, commerce: 0, defense: 0,
    },
    currentPlan:        null,   // { buildingId, cost, missing }
    gatherOrder:        null,   // stockType string | null
    aggressionPressure: 0,      // décroît chaque tick, augmente via SocialSystem
  };
}
