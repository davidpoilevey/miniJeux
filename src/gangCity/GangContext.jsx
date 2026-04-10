import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import useShowAlert from "../jds/components/Message";
import { loadGame, saveGame } from '../civ/utils/saveGame';
import { BONUS_POOL } from "./MarketView";
import { processEvents, tryTriggerGlobalEvent } from "./GangUtils";


const GangCityContext = createContext(undefined);

export const PROFILES = {
  SALOPE: 'salope',
  PUTE: 'pute',
  ESCORT: 'escort',
  LUXE: 'luxe'
};


export const initialState = {
  turn: 0,
  money: 200,

  districts: [
    {
      id: 'business',
      label: 'Quartier d’affaires',
      entree: 5000,
      mensuel: 800,
      possibleFor: ['luxe', 'escort'],
      demand: { luxe: 2, escort: 1.8, pute: 0.2, salope: 0.8 },
      risk: { police: 0.4, violence: 0.1 }
    }, {
      id: 'parlement',
      label: 'Parlement europeen',
      entree: 10000,
      mensuel: 1400,
      possibleFor: ['luxe'],
      demand: { luxe: 1.8, escort: 1.4, pute: 0.2, salope: 1.5 },
      risk: { police: 0.2, violence: 0.1 }
    }, {
      id: 'fac',
      label: 'Universités',
      entree: 1500,
      mensuel: 220,
      possibleFor: ['pute', 'escort'],
      demand: { luxe: 0.2, escort: 0.7, pute: 1.2, salope: 1 },
      risk: { police: 0.6, violence: 0.2 }
    }, {
      id: 'populo',
      entree: 250,
      mensuel: 280,
      possibleFor: ['pute', 'salope'],
      label: 'Logements sociaux, dortoir etudiants',
      demand: { luxe: 0.02, escort: 0.2, pute: 1.2, salope: 2 },
      risk: { police: 0.01, violence: 0.62 }
    },
    {
      id: 'gare',
      label: 'Quartier de la gare',
      entree: 800,
      mensuel: 540,
      possibleFor: ['pute', 'escort', 'salope'],
      demand: { luxe: 0.2, escort: 1, pute: 1.4, salope: 1.3 },
      risk: { police: 0.2, violence: 0.3 }
    },
    {
      id: 'hopital',
      label: 'Hopitaux',
      entree: 1500,
      mensuel: 350,
      possibleFor: ['pute', 'salope'],
      demand: { luxe: 0.2, escort: 0.4, pute: 1, salope: 1.3 },
      risk: { police: 0.2, violence: 0.4 }
    },
    {
      id: 'centre',
      label: 'Centre-ville',
      entree: 3000,
      mensuel: 1000,
      possibleFor: ['pute', 'escort', 'salope', 'luxe'],
      demand: { luxe: 0.8, escort: 1.8, pute: 0.9, salope: 0.3 },
      risk: { police: 0.5, violence: 0.3 }
    },
    {
      id: 'zone',
      label: 'Zone des rebus',
      entree: 0,
      mensuel: 60,
      possibleFor: ['pute', 'salope'],
      demand: { luxe: 0.1, escort: 0.2, pute: 1.5, salope: 2 },
      risk: { police: 0.3, violence: 0.7 }
    }
  ],

  girls: [

  ],
  turnLogs: [],
  bonuses: [],
  activeBonuses: []
};


export const useMaqCity = () => {
  const context = useContext(GangCityContext);
  if (!context) {
    throw new Error("useGangCity doit être utilisé dans un GangCityProvider");
  }
  return context;
};
export function MaqCityProvider({ children }) {


  const { showAlert, SnackbarComponent } = useShowAlert({ verticalAnchor: 'bottom' });
  const [state, setState] = useState(initialState);
  useEffect(() => {
    const data = loadGame('maqCity');
    if (data != null)
      setState(data);
  }, []);
  useEffect(() => {
    //save each tour
    saveGame(state, 'maqCity');
  }, [state]);

  const reset = () => {
    setState(initialState);
  }
  const fairePret=()=>{
    setState(prev=>({...prev, money:prev.money+1000}))
  }


  const recruitGirl = girl => {
    setState(prev => {
      if (prev.money < girl.price) return prev;

      return {
        ...prev,
        money: prev.money - girl.price,
        girls: [
          ...prev.girls,
          {
            ...girl,
            fatigue: 0,
            id: 'g' + Date.now(),
            assignedDistrictId: null
          }
        ]
      };
    });
    showAlert(girl.name + ' a ete recrutée');
  };

  const assignGirlToDistrict = (girlId, districtId) => {
    setState(prev => {
      const girl = prev.girls.find(g => g.id === girlId);
      const district = prev.districts.find(d => d.id === districtId);
      if(prev.paidFee==null)
        prev.paidFee=[];
      if (!girl) return prev;
      
      if (district!=null&&!district.possibleFor.includes(girl.profile)) {
        showAlert('Profil non autorisé dans ce quartier', 'error');
        return prev;
      }

      if (district!=null&&!prev.paidFee.includes(district.id)&&prev.money < district.entree) {
        showAlert('Pas assez d’argent pour le droit d’entrée', 'warning');
        return prev;
      }
      let newMoney = prev.money;
      if(district!=null&&!prev.paidFee.includes(district.id)){
        newMoney-=district.entree;
        prev.paidFee.push(district.id);
      }
if(district==null){
         showAlert('Va te reposer '+girl.name);
      }
      else
      showAlert(`Vous avez assigné ${girl.name} a ${district.label}`)
      return {
        ...prev,
        money: newMoney,
        girls: prev.girls.map(g =>
          g.id === girlId
            ? {
              ...g,
              assignedDistrictId: districtId,
              monthlyCost: district?.mensuel||0
            }
            : g
        )
      };
    });
  };

  const activateGlobalBonus = (bonusDef) => {
    setState(prev => ({
      ...prev,
      bonuses: prev.bonuses.filter(b => b.id !== bonusDef.id),
      activeBonuses: [
        ...prev.activeBonuses,
        {
          id: bonusDef.id,
          target: "global",
          targetId: null,
          remaining: bonusDef.duree
        }
      ]
    }));
  };
  const updateGirl=girl=>{
     setState(prev => ({...prev, girls:[...prev.girls.filter(g => g.id != girl.id), girl]}));
  }
  const removeGirl = (girl) => {
    setState(prev => ({ ...prev
      , girls: prev.girls.filter(g => g.id != girl.id) }))
  }
  const applyBonusToDistrict = (bonusId,poolId, districtId) => {
    const bonusDef = BONUS_POOL.find((x) => x.id === poolId);
    const bonus = state.bonuses.find(b => b.id === bonusId);
    const activeBonus = state.activeBonuses.find(b => b.id === bonusId);
    const district = state.districts.find(g => g.id === districtId);

    if (!bonus || !district) return;

    const updatedDistrict = { ...district };
    const updatedBonus = activeBonus?{...activeBonus}:{ ...bonus, targetId: district.id };

    // application de l'effet
    bonusDef.effect(updatedDistrict, state, updatedBonus.doneOnce);

    // décrémentation
    updatedBonus.remaining -= 1;
    const prev ={...state};
    if(updatedBonus.remaining<=0 && bonusDef.onEnd)
      bonusDef.onEnd(prev, updatedBonus.targetId);
     

      // update girl
      prev.districts= prev.districts.map(g =>
        g.id === districtId ? updatedDistrict : g
      );

      // update / remove bonus
      const newActiveBonuses = [...state.activeBonuses?.filter(b=>b.id!=bonusId)
            ,updatedBonus];
            
      prev.activeBonuses=newActiveBonuses;
      prev.bonuses = prev.bonuses.filter(b=>b.id!==bonusId);

    setState(prev);

    showAlert(
      `${bonusDef.name} appliqué à ${updatedDistrict.label}`,
      'info'
    );

  };
  const applyBonusToGirl = (bonusId, poolId, girlId) => {
    const bonusDef = BONUS_POOL.find((x) => x.id === poolId);
    const bonus = state.bonuses.find(b => b.id === bonusId);
    const activeBonus = state.activeBonuses.find(b => b.id === bonusId);
    const girl = state.girls.find(g => g.id === girlId);

    if (!bonus || !girl) return;

    const updatedGirl = { ...girl };
    const updatedBonus = activeBonus?{...activeBonus}:{ ...bonus, targetId: girl.id };

    // application de l'effet
    bonusDef.effect(updatedGirl, state, activeBonus?.doneOnce);

    // décrémentation
    updatedBonus.remaining -= 1;

    const prev ={...state};
    if(updatedBonus.remaining<=0 && bonusDef.onEnd)
      bonusDef.onEnd(prev, updatedBonus.targetId);

const newActiveBonuses = [...state.activeBonuses?.filter(b=>b.id!=bonusId)
            ,updatedBonus];

    setState({
      ...prev,
bonuses: prev.bonuses.filter(b=>b.id!==bonusId),
      // update girl
      girls: prev.girls.map(g =>
        g.id === girlId ? updatedGirl : g
      ),

      // update / remove bonus
      activeBonuses:newActiveBonuses
        
    });

    showAlert(
      `${bonusDef.name} appliqué à ${updatedGirl.name}`,
      'info'
    );

  };


  const endTurn = () => {
    setState(prev => simulateTurn(prev, showAlert));
  };


  return (
    <GangCityContext.Provider value={{
      endTurn, setState, assignGirlToDistrict, applyBonusToDistrict, recruitGirl, updateGirl
      , showAlert, activateGlobalBonus, applyBonusToGirl,fairePret, removeGirl, reset, state
    }}>
      {children}
      {SnackbarComponent}
    </GangCityContext.Provider>
  );
}


// ─── Helpers ────────────────────────────────────────────────────────────────

/** Une fille est indisponible si elle est arrêtée ou épuisée */
export const isGirlUnavailable = (girl, currentTurn) => {
  if (girl.arrestedUntilTurn != null && currentTurn < girl.arrestedUntilTurn)
    return true;
  if ((girl.fatigue ?? 0) >= 100||(girl.stress ?? 0) >= 100)
    return true;
  return false;
};

/** Raison lisible pour l'UI */
export const getUnavailabilityReason = (girl, currentTurn) => {
  if (girl.arrestedUntilTurn != null && currentTurn < girl.arrestedUntilTurn)
    return `arrêtée pendant ${girl.arrestedUntilTurn-currentTurn} tours`;
  if ((girl.fatigue ?? 0) >= 100)
    return 'fatigue maximale';
  if ((girl.stress ?? 0) >= 100)
    return 'stress maximale';
  return 'indisponible';
};

/** Récupération naturelle de la clientele : +0.1 par tour, plafond 1 */
const CLIENTELE_RECOVERY = 0.1;


// ─── Boucle principale ──────────────────────────────────────────────────────

export function simulateTurn(state, showAlert) {
  let income = 0;
  let rent   = 0;
  const byGirl     = [];
  const byDistrict = [];
  const nextTurn   = state.turn + 1;

  // ── 1. Avancer les bonus (ta fonction existante) ──
  const wBonusState = advanceTurn({ ...state });

  // ── 2. Récupération clientele sur tous les districts ──
  const districtsWithClientele = wBonusState.districts.map((d) => ({
    ...d,
    clientele: Math.min(1, (d.clientele ?? 1) + CLIENTELE_RECOVERY),
  }));

  // ── 3. Traiter les événements (risks police / violence) ──
  const stateForEvents = { ...wBonusState, districts: districtsWithClientele, turn: nextTurn };
  const eventResult = processEvents(stateForEvents);

  // Afficher les alertes
  eventResult.messages.forEach(({ text, severity }) => showAlert(text, severity));

  // ── 4. Appliquer les mutations de districts (clienteleLoss, stressAllGirls) ──
  const districtsAfterEvents = districtsWithClientele.map((d) => {
    const mut = eventResult.districtMutations.get(d.id);
    if (!mut) return d;

    let clientele = d.clientele - (mut.clienteleLoss || 0);
    clientele = Math.max(0.1, clientele); // on ne descend jamais à 0
    mut.clienteleLoss=0;
    let newMensuel = d.mensuel * (mut.rentModifier || 1);
mut.rentModifier=null;
    return { ...d, mensuel:newMensuel, clientele, currentModifiers:mut };
  });

  // ── 5. Appliquer les mutations de filles (stress, fatigue, arrestation) + stressAllGirls ──
  const girlsAfterEvents = wBonusState.girls.map((g) => {
    let { stress, fatigue, arrestedUntilTurn } = g;

    // mutations individuelles depuis les events
    const girlMut = eventResult.girlMutations.get(g.id);
    if (girlMut) {
      stress             = Math.min(100, stress + (girlMut.stress || 0));
      fatigue            = Math.min(100, fatigue + (girlMut.fatigue || 0));
      arrestedUntilTurn  = girlMut.arrestedUntilTurn ?? arrestedUntilTurn;
    }

    // stressAllGirls : si la fille est dans un district qui a eu un conflit
    if (g.assignedDistrictId) {
      const dMut = eventResult.districtMutations.get(g.assignedDistrictId);
      if (dMut?.stressAllGirls) {
        stress = Math.min(100, stress + dMut.stressAllGirls);
      }
    }

    return { ...g, stress, fatigue, arrestedUntilTurn };
  });

  // ── 6. Détection "fille vient de devenir indisponible" ──
  girlsAfterEvents.forEach((g, i) => {
    const wasDispo  = !isGirlUnavailable(wBonusState.girls[i], nextTurn);
    const nowInDispo = isGirlUnavailable(g, nextTurn);
    if (wasDispo && nowInDispo) {
      showAlert(`${g.name} est hors service (${getUnavailabilityReason(g, nextTurn)}).`, 'error');
    }
  });

  // ── 7. Calculer fatigue / stress naturels (quand elle est assignée ou libre) ──
  const updatedGirls = girlsAfterEvents.map((g) => {
    const district = districtsAfterEvents.find((d) => d.id === g.assignedDistrictId);

    // Si elle est arrêtée, elle ne travaille pas → pas de fatigue supplémentaire
    if (isGirlUnavailable(g, nextTurn) && g.arrestedUntilTurn != null && nextTurn < g.arrestedUntilTurn) {
      // En prison : stress et fatigue descendent un peu (elle se repose forcément)
      return {
        ...g,
        stress:  Math.max(0, g.stress - 3),
        fatigue: Math.max(0, g.fatigue - 5),
      };
    }

    const fatigueDelta = district
      ? computeFatigueDelta(g, district)
      : -g.stats.endurance * 10;   // libre → elle récupère

    const stressDelta = district
      ? computeStressDelta(g, district)
      : -g.stats.autonomie * 5;    // libre → elle récupère

    return {
      ...g,
      stress:  Math.min(100, Math.max(0, g.stress + stressDelta)),
      fatigue: Math.min(100, Math.max(0, g.fatigue + fatigueDelta)),
    };
  });

  // ── 8. Calculer revenus par district ──
  districtsAfterEvents.forEach((d) => {
    let districtIncome = 0;
    let districtRent   = 0;

    const girlsHere = updatedGirls.filter((g) => g.assignedDistrictId === d.id);

    girlsHere.forEach((g) => {
      // une fille indisponible ne rapporte rien
      if (isGirlUnavailable(g, nextTurn)) {
        byGirl.push({
          girlId: g.id, name: g.name, profile: g.profile,
          districtId: d.id, gross: 0, rent: d.mensuel, net: -d.mensuel/2,
          modifiers: { demand: 0, clientele: d.clientele ?? 1, unavailable: true
            ,stress:    g.stress,unavailabilityReason:getUnavailabilityReason(g,nextTurn),
          fatigue:   g.fatigue },
        });
        //districtRent += d.mensuel/2;// mais ne coute rien non plus
        return;
      }

      // computeGirlIncome déjà integre demand — on multiplie par clientele en plus
      const gross = computeGirlIncome(g, d) * (d.clientele ?? 1);
      const girlRent = d.mensuel;
      const prixPasse = computePrixPasse(g,d);
      const nbPasses = computePasses(g,d);

      districtIncome += Math.round(gross);
      districtRent   += girlRent;

      byGirl.push({
        girlId: g.id, name: g.name, profile: g.profile,
        districtId: d.id,
        gross: Math.round(gross),
        rent: girlRent,
        net: Math.round(gross) - girlRent,
        modifiers: {
          demand:    d.demand?.[g.profile] ?? 0.5,
          clientele: d.clientele ?? 1,
          specialites:prixPasse.supplements,
          stress:    g.stress,
          fatigue:   g.fatigue,
          nbPasses
        },
      });
    });

    byDistrict.push({
      districtId: d.id,
      label: d.label,
      income: districtIncome,
      rent: -districtRent,
      net: districtIncome - districtRent,
      clientele: d.clientele ?? 1,
      girls: girlsHere.map((g) => g.id),
    });

    income += districtIncome;
    rent   += districtRent;
  });

  // ── 9. Assembler le nouveau state ──
  const totalMoneyDelta = income - rent + eventResult.moneyDelta;
  const newState = {
    ...wBonusState,
    girls:     updatedGirls,
    districts: districtsAfterEvents,
    turn:      nextTurn,
    money:     wBonusState.money + totalMoneyDelta,
    turnLogs: [
      ...state.turnLogs,
      {
        turn: nextTurn,
        summary: {
          income,
          rent: -rent,
          eventDelta: eventResult.moneyDelta,
          net: totalMoneyDelta,
        },
        byDistrict,
        byGirl,
        events: eventResult.events.map(({ eventDef, girl, district }) => ({
          eventId:    eventDef.id,
          riskType:   eventDef.riskType,
          girlId:     girl.id,
          girlName:   girl.name,
          districtId: district.id,
        })),
      },
    ],
  }
 const { updatedState } = tryTriggerGlobalEvent(newState);
  return updatedState;
}

const advanceTurn = (nextState) => {
  if (nextState.activeBonuses == null)
    return { ...nextState, activeBonuses: [] }
  
  // 1. appliquer les effets des bonus actifs
  nextState.activeBonuses.forEach(b => {
    const def = BONUS_POOL.find(x => x.id === b.poolId);
    
    if (!def) return;

    if (def.target === "global") {

      def.effect(nextState, b.doneOnce)
    }

    if (def.target === "district") {
      const d = nextState.districts.find(x => x.id === b.targetId);
      if (d) Object.assign(d, def.effect(d, nextState, b.doneOnce));
    }

    if (def.target === "girl") {
      const g = nextState.girls.find(x => x.id === b.targetId);
      if (g) Object.assign(g, def.effect(g, nextState, b.doneOnce));
    }
    b.doneOnce=true;
    if(b.remaining){
      b.remaining--;
      if(b.remaining<=0 && def.onEnd)
        def.onEnd(nextState, b.targetId);

    }
  });

  // 2. décrémenter les durées
  nextState.activeBonuses = nextState.activeBonuses
    .filter(b => b.remaining === null || b.remaining > 0);

  return nextState;
};

// ─── Configuration par profil ───────────────────────────────────────────────
// prix_passe : prix d'une passe à charme max (5), forme parfaite
// passes_max : plafond de passes journalières (une luxe fait peu de passes, mais chacune vaut cher)

const PROFILE_CONFIG = {
  salope: { prix_passe: 20, passes_max: 16 },
  pute: { prix_passe: 100, passes_max: 12 },
  escort: { prix_passe: 250, passes_max: 8 },
  luxe: { prix_passe: 600, passes_max: 4 },
};


// ─── Calcul du nombre de passes effectuées ─────────────────────────────────
// endurance  (1–5) : limite physique, nombre de passes qu'elle peut faire
// autonomie  (1–5) : capacité à trouver des clients toute seule
//   → facteur autonomie : 0.6 + autonomie * 0.2  (range 0.8 à 1.6)
//   → passes_brut = endurance × facteur_autonomie
//   → passes_effectif = min(passes_brut arrondi, passes_max du profil), minimum 1

const computePasses = (girl, district) => {
  const config = PROFILE_CONFIG[girl.profile];
  if (!config) return 0;

  const { endurance = 1, autonomie = 1 } = girl.stats;
  const facteurAutonomie = 0.6 + autonomie*0.8;
  const passesBrut = (endurance) * facteurAutonomie * (district.clientele||1);

  return Math.max(1, Math.min(Math.round(passesBrut), config.passes_max));
};


// ─── Prix par passe ─────────────────────────────────────────────────────────
// charme (1–5) module le prix de base du profil
//   → facteur charme : 0.6 + (charme - 1) * 0.1  (range 0.6 à 1.0)
//   → prix_passe = prix_base_profil × facteur_charme

// ─── Config existante ───────────────────────────────────────────────────────


/** Liste exhaustive des specialités possibles */
export const ALL_SPECIALITES = [
  'pipe', '69', 'anal', 'cim', 'facesitting',
  'anulingus', 'cunnilingus', 'lingerie', 'squirt',
  'deepthroat', 'fessee', 'dirtytalk', 'roleplay',
  'bdsm', 'groupe',
];


// ─── Helpers ────────────────────────────────────────────────────────────────

/** Pioche n éléments distincts au hasard dans un tableau */
const sampleN = (arr, n) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};


// ─── Prix par passe ─────────────────────────────────────────────────────────

/**
 * Calcule le prix d'une passe :
 *   - base du profil modulée par charme
 *   - + supplement par specialité matchée (2 tirages aléatoires du client)
 *
 * Retourne { prix, supplements } pour permettre un breakdown si nécessaire
 */
export const computePrixPasse = (girl) => {
  const config = PROFILE_CONFIG[girl.profile];
  if (!config) return { prix: 0, supplements: [] };

  // ── Base : charme module le prix du profil ──
  const { charme = 1 } = girl.stats;
  const facteurCharme = 0.6 + (charme - 1) * 0.1;
  const base = config.prix_passe * facteurCharme;

  // ── Specialités : le client demande 2 specialités au hasard ──
  const demandesClient = sampleN(ALL_SPECIALITES, 2);
  const girlSpecialites = new Set(girl.specialites || []);

  // Pour chaque demande matchée, on ajoute un supplement
  const supplementBase = 50 + 50 * (SOCIAL_PRESSURE[girl.profile] ?? 1);
  const supplements = demandesClient.filter((s) => girlSpecialites.has(s));
  const totalSupplement = supplements.length * supplementBase;

  return {
    prix: Math.round(base + totalSupplement),
    supplements, // les specialités qui ont matché (utile pour le log / breakdown)
  };
};


// ─── Pénalité d'état (stress + fatigue) ─────────────────────────────────────
// les clients le sentent : une fille épuisée ou stressée ne peut pas demander le même prix
// penalite = 1 - (stress + fatigue) / 200
//   → forme parfaite (0 + 0)   : facteur 1.0
//   → état moyen  (50 + 50)    : facteur 0.5
//   → épave totale (100 + 100) : facteur 0.0 → on floor à 0.2 pour ne jamais tomber à 0

const computePenaliteEtat = (girl) => {
  const stress = girl.stress ?? 0;
  const fatigue = girl.fatigue ?? 0;

  return Math.max(0.2, 1 - (stress + fatigue) / 200);
};


// ─── Multiplicateur district ────────────────────────────────────────────────
// la demande du quartier pour le profil de cette fille
// si le quartier n'a pas de demande pour ce profil, on default à 0.5 (quartier inadapté)

const computeDistrictMultiplier = (district, girl) => {
  return district.demand?.[girl.profile] ?? 0.5;
};


// ─── ENTRY POINT ────────────────────────────────────────────────────────────
// revenu = passes × prix_passe × penalite_etat × multiplicateur_district

export const computeGirlIncome = (girl, district) => {
  if (isGirlUnavailable(girl)) return 0;

  const passes = computePasses(girl, district);
  const prixPasse = computePrixPasse(girl,district);
  const penaliteEtat = computePenaliteEtat(girl);
  const districtMult = computeDistrictMultiplier(district, girl);

  return Math.round(passes * prixPasse.prix * penaliteEtat * districtMult);
};


// ─── Détails pour un débreakdown UI (optionnel) ─────────────────────────────
// utile si tu veux afficher le détail du calcul dans le popup ou une tooltip

export const computeGirlIncomeDetails = (girl, district) => {
  if (isGirlUnavailable(girl)) {
    return { passes: 0, prixPasse: 0, penaliteEtat: 0, districtMult: 0, total: 0 };
  }

  const passes = computePasses(girl, district);
  const prixPasse = computePrixPasse(girl, district);
  const penaliteEtat = computePenaliteEtat(girl);
  const districtMult = computeDistrictMultiplier(district, girl);
  const total = Math.round(passes * prixPasse.prix * penaliteEtat * districtMult);

  return { passes, prixPasse: Math.round(prixPasse.prix), penaliteEtat, districtMult, total };
};

const WORK_LOAD = {
  salope: 0.8,
  pute: 1.0,
  escort: 1.2,
  luxe: 1.4
};
const SOCIAL_PRESSURE = {
  salope: 0.6,
  pute: 0.9,
  escort: 1.1,
  luxe: 1.4
};
const computeStressDelta = (girl, district) => {
  const base = 10 * SOCIAL_PRESSURE[girl.profile];

  const districtRisk =
    ((district.risk?.police ?? 0) +
      (district.risk?.violence ?? 0)) * 15;

  const autonomyReduction =
    girl.stats.autonomie * 10;

  return Math.max(
    1,
    Math.round(base + districtRisk - autonomyReduction)
  );
};

const computeFatigueDelta = (girl, district) => {
  const base = 12 * WORK_LOAD[girl.profile];

  const districtPenalty =
    (district.risk?.violence ?? 0) * 10;

  const enduranceReduction =
    girl.stats.endurance * 8;

  return Math.max(
    1,
    Math.round(base + districtPenalty - enduranceReduction)
  );
};

export const getBaseIncome = (profile) => {
  switch (profile) {
    case 'salope': return 20;
    case 'pute': return 50;
    case 'escort': return 120;
    case 'luxe': return 300;
    default: return 0;
  }
};
