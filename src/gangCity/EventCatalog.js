// ─── EVENT_CATALOG ──────────────────────────────────────────────────────────
// Chaque event est déclaratif. Pour en rajouter un : juste push un objet ici.
// La boucle ne change pas.
//
// effects.girl      : mutations sur la fille qui a triggeré l'event
// effects.player    : mutations sur le joueur (money)
// effects.district  : mutations sur le district (clientele)
//
// Les valeurs numériques dans effects sont des DELTAS (ajoutées au state actuel)
// sauf clienteleLoss qui est un RETRAIT direct sur district.clientele
//
// weight : poids dans la pioche. Plus grand = plus probable parmi les events du même riskType.
// message : fonction (girl, district) → string pour l'alert UI
// severity : 'error' | 'warning' | 'info'

export const EVENT_CATALOG = [

  // ══════════════════════════════════════════════════════════════
  // POLICE
  // ══════════════════════════════════════════════════════════════

  {
    id: 'arrestation',
    riskType: 'police',
    weight: 2,
    severity: 'error',
    message: (girl, district) =>
      `🚨 ${girl.name} a été arrêtée dans ${district.label} ! Elle sera immobilisée quelques tours.`,
    effects: {
      girl: { arrested: true },                          // flag, durée gérée dans processEvents
      player: { money: -Math.round(Math.random() * 500 + 100) },                           // amende de base (modulée par profil dans le moteur)
    },
  },

  {
    id: 'descente',
    riskType: 'police',
    weight: 4,
    severity: 'warning',
    message: (girl, district) =>
      `🚔 Une descente de police dans ${district.label} ! Les clients ont disparu pour un temps.`,
    effects: {
      district: { clienteleLoss: 0.3 },
    },
  },

  {
    id: 'mairie',
    riskType: 'police',
    weight: 2,
    severity: 'warning',
    message: (girl, district) =>
      `📜 Conflit avec la mairie de ${district.label}. Les loyers augmentent`,
    effects: {
      district: { rentModifier: 1.3 },   
    },
  },
  {
    id: 'amende',
    riskType: 'police',
    weight: 2,
    severity: 'warning',
    message: (girl, district) =>
      `📜 Une amende pour activité illicite dans ${district.label}.`,
    effects: {
      player: { money: -Math.round(Math.random() * 300 + 20) },                           // amende fixe, modulée dans le moteur
    },
  },
  {
    id: 'trouvaille',
    riskType: 'violence',
    weight: 2,
    severity: 'success',
    message: (girl, district) =>
      `📜  ${girl.name} a trouvé un porte-feuille par terre. Sympa, elle vous en donne la moitié (800$)`,
    effects: {
      player: { money: Math.round(Math.random() * 1000 + 100) },                           // amende fixe, modulée dans le moteur
    },
  },

  // ══════════════════════════════════════════════════════════════
  // VIOLENCE
  // ══════════════════════════════════════════════════════════════

  {
    id: 'client_violent',
    riskType: 'violence',
    weight: 4,
    severity: 'error',
    message: (girl, district) =>
      `💢 Un client violent s'est en est pris à ${girl.name} dans ${district.label}.`,
    effects: {
      girl: { stress: 20, fatigue: 12 },
    },
  },

  {
    id: 'voisinage',
    riskType: 'violence',
    weight: 2,
    severity: 'success',
    message: (girl, district) =>
      `⚡ le proprio de  ${girl.name} est un connard, vous lui cassez la gueule, les loyers baissent  dans ${district.label}.`,
    effects: {
      district: { rentModifier: 0.7 },   
    },
  },
  {
    id: 'conflit_filles',
    riskType: 'violence',
    weight: 3,
    severity: 'warning',
    message: (girl, district) =>
      `⚡ Une altercation entre les filles de ${district.label}. Le stress monte.`,
    effects: {
      // effects.district.stressAllGirls = true → traité spécialement dans le moteur
      district: { stressAllGirls: 10 },
    },
  },

  {
    id: 'maquereau_rival',
    riskType: 'violence',
    weight: 2,
    severity: 'error',
    message: (girl, district) =>
      `🗡️ Un maquereau rival convoite ${district.label}. ${girl.name} est sous pression.`,
    effects: {
      girl: { stress: 20 },
      district: { clienteleLoss: 0.2 },
    },
  },

];




// ─── GLOBAL_EVENTS_CATALOG ──────────────────────────────────────────────────
// Événements globaux qui pausent le jeu et demandent une décision au joueur.
// Déclenchés aléatoirement (20% par tour), résolus au début du tour suivant.
//
// Structure d'un event :
// {
//   id: string,
//   weight: number,                    // poids dans la pioche (plus grand = plus fréquent)
//   title: string | (state) => string, // titre de l'event
//   message: string | (state) => string, // description de l'event
//   choices: [
//     {
//       label: string,
//       consequences: (state) => { mutations, message } // retourne les mutations à appliquer + message de résultat
//     }
//   ]
// }
//
// Si choices.length === 1, c'est juste un "OK" (calamité/bonne nouvelle inévitable)
// Si choices.length > 1, le joueur doit choisir

export const GLOBAL_EVENTS_CATALOG = [

  // ══════════════════════════════════════════════════════════════
  // CALAMITÉS / ÉVÉNEMENTS NÉGATIFS INÉVITABLES
  // ══════════════════════════════════════════════════════════════

  {
    id: 'impots_augmentation',
    weight: 3,
    title: '📜 Impôts locaux augmentés',
    message: 'La mairie a voté une hausse des taxes locales. Tous les loyers de vos quartiers augmentent de 10%.',
    choices: [
      {
        label: 'Tant pis...',
        consequences: (state) => {
          const mutations = {
            districts: state.districts.map((d) => ({
              ...d,
              mensuel: Math.round(d.mensuel * 1.1),
            })),
          };
          return { mutations, message: 'Les loyers ont augmenté de 10%.' };
        },
      },
    ],
  },

  {
    id: 'crise_clientele',
    weight: 2,
    title: '📉 Crise économique',
    message: 'Une crise économique frappe la ville. La demande baisse de 20% dans tous les quartiers pendant 3 tours.',
    choices: [
      {
        label: 'On va tenir le coup',
        consequences: (state) => {
          const mutations = {
            districts: state.districts.map((d) => ({
              ...d,
              demandModifier: (d.demandModifier ?? 1) * 0.8, // on cumule avec les modifiers existants
              demandModifierUntil: state.turn + 3,
            })),
          };
          return { mutations, message: 'La demande est réduite pendant 3 tours.' };
        },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // ÉVÉNEMENTS POSITIFS INÉVITABLES
  // ══════════════════════════════════════════════════════════════

  {
    id: 'session_parlementaire',
    weight: 2,
    title: '🏛️ Session parlementaire',
    message: 'Une session parlementaire importante se tient en ville. Les escorts et filles de luxe sont très demandées pendant 2 tours.',
    choices: [
      {
        label: 'Excellente nouvelle !',
        consequences: (state) => {
          const mutations = {
            districts: state.districts.map((d) => ({
              ...d,
              demand: {
                ...d.demand,
                escort: (d.demand.escort ?? 1) * 1.5,
                luxe: (d.demand.luxe ?? 1) * 1.8,
              },
              demandBoostUntil: state.turn + 2,
            })),
          };
          return { mutations, message: 'La demande luxe/escort explose pendant 2 tours !' };
        },
      },
    ],
  },

  {
    id: 'jackpot',
    weight: 1,
    title: '💰 Jackpot !',
    message: 'Un client généreux laisse un pourboire royal de 5000€.',
    choices: [
      {
        label: 'Merci !',
        consequences: (state) => {
          const mutations = { money: state.money + 5000 };
          return { mutations, message: '+5000€ !' };
        },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════
  // CHOIX AVEC CONSÉQUENCES
  // ══════════════════════════════════════════════════════════════

  {
    id: 'offre_achat_fille',
    weight: 3,
    title: (state) => {
      const girl = pickRandomGirl(state);
      return girl ? `💼 Offre d'achat : ${girl.name}` : "💼 Offre d'achat";
    },
    message: (state) => {
      const girl = pickRandomGirl(state);
      if (!girl) return 'Un maquereau concurrent vous contacte, mais vous n\'avez aucune fille à vendre.';
      
      const multiplier = 0.5 + Math.random(); // 0.5 à 1.5
      const offre = Math.round(girl.price * multiplier);
      
      return `Un maquereau concurrent souhaite vous acheter ${girl.name} pour ${offre}€. Son prix d'achat initial était de ${girl.price}€.`;
    },
    choices: [
      {
        label: 'Accepter',
        consequences: (state) => {
          const girl = pickRandomGirl(state);
          if (!girl) return { mutations: {}, message: 'Aucune fille disponible.' };
          
          const multiplier = 0.5 + Math.random();
          const offre = Math.round(girl.price * multiplier);
          
          const mutations = {
            girls: state.girls.filter((g) => g.id !== girl.id),
            money: state.money + offre,
          };
          
          const profit = offre - girl.price;
          const profitText = profit >= 0 ? `+${profit}€ de bénéfice` : `${profit}€ de perte`;
          
          return { mutations, message: `${girl.name} a été vendue pour ${offre}€ (${profitText}).` };
        },
      },
      {
        label: 'Refuser',
        consequences: () => {
          return { mutations: {}, message: 'Vous gardez votre fille.' };
        },
      },
    ],
  },

  {
    id: 'alerte_terroriste',
    weight: 2,
    title: '🚨 Alerte terroriste',
    message: (state) => {
      const nbFilles = state.girls.length;
      const coutSoudoyer = nbFilles * 200;
      return `Une alerte terroriste met la police sur les dents. Le risque police double dans tous les quartiers pendant 2 tours. Vous pouvez soudoyer pour éviter ça (${coutSoudoyer}€).`;
    },
    choices: [
      {
        label: (state) => `Soudoyer (${state.girls.length * 200}€)`,
        consequences: (state) => {
          const cout = state.girls.length * 200;
          if (state.money < cout) {
            return { mutations: {}, message: 'Pas assez d\'argent pour soudoyer !' };
          }
          
          const mutations = { money: state.money - cout };
          return { mutations, message: `Vous avez soudoyé la police pour ${cout}€.` };
        },
      },
      {
        label: 'Tant pis',
        consequences: (state) => {
          const mutations = {
            districts: state.districts.map((d) => ({
              ...d,
              risk: {
                ...d.risk,
                police: Math.min(1, (d.risk.police ?? 0) * 2),
              },
              policeRiskUntil: state.turn + 2,
            })),
          };
          return { mutations, message: 'Le risque police double pendant 2 tours.' };
        },
      },
    ],
  },

  {
    id: 'descente_coordonnee',
    weight: 2,
    title: '🚔 Opération coup de poing',
    message: 'La police prépare une opération coordonnée dans tous vos quartiers. Vous pouvez payer un informateur (1500€) pour être prévenu et évacuer vos filles à temps.',
    choices: [
      {
        label: 'Payer l\'informateur (1500€)',
        consequences: (state) => {
          if (state.money < 1500) {
            return { mutations: {}, message: 'Pas assez d\'argent !' };
          }
          
          const mutations = { money: state.money - 1500 };
          return { mutations, message: 'Vos filles ont été évacuées à temps. Aucune arrestation.' };
        },
      },
      {
        label: 'Prendre le risque',
        consequences: (state) => {
          // On arrête une fille au hasard
          const workingGirls = state.girls.filter((g) => g.assignedDistrictId != null);
          if (workingGirls.length === 0) {
            return { mutations: {}, message: 'Aucune fille n\'était au travail, ouf !' };
          }
          
          const victim = workingGirls[Math.floor(Math.random() * workingGirls.length)];
          const arrestDuration = 4; // tours
          
          const mutations = {
            girls: state.girls.map((g) =>
              g.id === victim.id
                ? { ...g, arrestedUntilTurn: state.turn + arrestDuration }
                : g
            ),
            money: state.money - 800, // amende
          };
          
          return { mutations, message: `${victim.name} a été arrêtée ! Amende de 800€, libération au tour ${state.turn + arrestDuration}.` };
        },
      },
    ],
  },

];


// ─── Helpers ────────────────────────────────────────────────────────────────

/** Pioche une fille au hasard dans le state (pour events qui ciblent une fille) */
function pickRandomGirl(state) {
  if (state.girls.length === 0) return null;
  return state.girls[Math.floor(Math.random() * state.girls.length)];
}

/** Pioche un événement pondéré au hasard */
export function pickGlobalEvent() {
  const totalWeight = GLOBAL_EVENTS_CATALOG.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;
  
  for (const event of GLOBAL_EVENTS_CATALOG) {
    roll -= event.weight;
    if (roll <= 0) return event;
  }
  
  return GLOBAL_EVENTS_CATALOG[GLOBAL_EVENTS_CATALOG.length - 1]; // fallback
}