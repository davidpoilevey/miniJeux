// TERRAIN — LE tableau de bord de Dave pour chercher l'émergence. Rien de tout ça
// n'est « la mécanique » — ce sont les manettes que la mécanique lira.
export const TUNING = {
  // Rythme
  tresorerieParTour: 10,        // rentrée d'argent légal automatique / tour
  militantsDeclin: 2,           // militants perdus / tour si inactif
  actionsParTour: 2,            // nb d'actions que le joueur peut choisir par tour (socle, avant actionsBonus)
  actionsMaxParTour: 5,         // plafond absolu, quel que soit actionsBonus (voir renforcerEquipe)
  loisParTour: 3,               // nb de lois soumises au vote chaque tour (obligatoire)
  financementParRang: 10,       // frais de campagne remboursés après une élection : × bonusRang(rang, n)

  // Opinion
  estimeMin: 0, estimeMax: 100,
  poidsDistanceIdeo: 0.5,       // combien l'écart parti↔électorat pénalise le vote
  demagogieFacteur: 0.3,        // conversion de la (in)cohérence d'un vote de loi en démagogie cumulée (signée)
  demagogiePenaliteEstime: 0.1, // fraction de |demagogie| retirée à l'estime chaque tour (trop, ou pas assez, coûte cher)

  // Illégalité
  multiplicateurRisque: 1.0,    // ×risqueExposition (monter = partie plus punitive)
  scandaleImpactBase: 8,        // points d'estime perdus × gravite lors d'un scandale
  memoireScandale: 6,           // nb de tours avant que l'opinion « oublie »

  // Média
  effetMediaMax: 2.0,           // multiplicateur d'effet des actions médiatiques

  // IA (valeurs lues par la méca de Dave — PAS l'algo lui-même)
  iaAppetitRisque: 0.3,         // 0 = jamais d'illégalité, 1 = joue avec le feu
  iaBruitDecision: 0.2,         // part d'aléatoire dans les choix (anti-convergence)
};
