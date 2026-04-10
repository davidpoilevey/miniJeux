


// ─── Utilitaires ────────────────────────────────────────────────────────────

import { EVENT_CATALOG, pickGlobalEvent } from "./EventCatalog";

/** Pioche un élément au hasard pondéré par weight */
const weightedPick = (items) => {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item;
  }
  return items[items.length - 1]; // fallback
};

/** Dure combien de tours une arrestation selon le profil */
const ARREST_DURATION = { salope: 1, pute: 2, escort: 3, luxe: 2 };

/** Amende modulée par profil (plus cher à sortir une escort de prison) */
const ARREST_FINE = { salope: 90, pute: 150, escort: 250, luxe: 800 };



// ─── Moteur principal ───────────────────────────────────────────────────────
//
// Retourne un objet IMMUABLE décrivant toutes les mutations à appliquer.
// La boucle de tour applique ces mutations sur le state — ce fichier ne mutate rien.
//
// Output :
// {
//   girlMutations: Map<girlId, { stress, fatigue, arrestedUntilTurn }>   // deltas cumulés
//   districtMutations: Map<districtId, { clienteleLoss, stressAllGirls }>
//   moneyDelta: number
//   events: [{ eventDef, girl, district }]   // log pour le turnLog
//   messages: [{ text, severity }]           // pour showAlert
// }

export const processEvents = (state) => {
  const girlMutations   = new Map(); // girlId → { stress, fatigue, arrestedUntilTurn }
  const districtMutations = new Map(); // districtId → { clienteleLoss, stressAllGirls }
  let moneyDelta        = 0;
  const events          = [];
  const messages        = [];

  // helper pour accumuler les mutations sans écraser
  const addGirlMut = (girlId, delta) => {
    const prev = girlMutations.get(girlId) || { stress: 0, fatigue: 0, arrestedUntilTurn: null };
    girlMutations.set(girlId, {
      stress:             (prev.stress || 0) + (delta.stress || 0),
      fatigue:            (prev.fatigue || 0) + (delta.fatigue || 0),
      arrestedUntilTurn:  delta.arrestedUntilTurn ?? prev.arrestedUntilTurn,
    });
  };

  const addDistrictMut = (district, delta) => {
    const districtId = district.id;
    const prev = districtMutations.get(districtId) || { clienteleLoss: 0, stressAllGirls: 0, rentModifier: 1
      , pub: district.currentModifiers?.pub, secu: district.currentModifiers?.secu };
    if(delta.clienteleLoss)
      prev.clienteleLoss = delta.clienteleLoss;
    if(delta.stressAllGirls)
      prev.stressAllGirls = delta.stressAllGirls;
    if(delta.rentModifier)
      prev.rentModifier = delta.rentModifier;
    districtMutations.set(districtId, prev);
  };

  // ── Pre-index : filles par district ──
  const girlsByDistrict = new Map();
  state.girls.forEach((g) => {
    if (!g.assignedDistrictId) return;
    const arr = girlsByDistrict.get(g.assignedDistrictId) || [];
    arr.push(g);
    girlsByDistrict.set(g.assignedDistrictId, arr);
  });

  // ── Boucle par district ──
  state.districts.forEach((district) => {
    const girlsHere = girlsByDistrict.get(district.id) || [];
    if (girlsHere.length === 0) return; // pas de filles = pas d'events
districtMutations.set(district.id,{ clienteleLoss: 0, stressAllGirls: 0, rentModifier: 1
  , pub:district.currentModifiers?.pub , secu:district.currentModifiers?.secu }); 
    const riskTypes = ['police', 'violence'];

    riskTypes.forEach((riskType) => {
      const riskValue = district.risk?.[riskType] ?? 0;
      if (riskValue <= 0) return;

      // ── Roll du dé : on compare le risque au hasard ──
      if (Math.random() > riskValue) return; // pas d'event ce tour pour ce risque

      // ── Pioche un event du catalogue pour ce riskType ──
      const candidates = EVENT_CATALOG.filter((e) => e.riskType === riskType);
      if (candidates.length === 0) return;

      const eventDef = weightedPick(candidates);

      // ── On choisit une fille au hasard dans le district comme "victime" ──
      const targetGirl = girlsHere[Math.floor(Math.random() * girlsHere.length)];

      // ── Appliquer les effets ──

      // effets sur la fille
      if (eventDef.effects.girl) {
        const girlEff = { ...eventDef.effects.girl };

        // cas spécial : arrestation
        if (girlEff.arrested) {
          const duration = ARREST_DURATION[targetGirl.profile] ?? 3;
          girlEff.arrestedUntilTurn = state.turn + duration;
          delete girlEff.arrested;

          // amende liée à l'arrestation (remplace le money de l'event)
          moneyDelta -= ARREST_FINE[targetGirl.profile] ?? 500;
        } else if (eventDef.effects.player?.money) {
          // amende police classique, modulée par profil
          moneyDelta -= Math.abs(eventDef.effects.player.money); // on ignore la valeur du catalog, on use POLICE_FINE
        }

        addGirlMut(targetGirl.id, girlEff);
      }

      // effets sur le district
      if (eventDef.effects.district) {
        addDistrictMut(district, eventDef.effects.district);
      }

      // effets sur le joueur (si pas déjà traité par arrestation/amende ci-dessus)
      if (eventDef.effects.player && !eventDef.effects.girl) {
        moneyDelta += eventDef.effects.player.money || 0;
      }

      // ── Log + message ──
      events.push({ eventDef, girl: targetGirl, district });
      messages.push({
        text: eventDef.message(targetGirl, district),
        severity: eventDef.severity,
      });
    });
  });

  return { girlMutations, districtMutations, moneyDelta, events, messages };
};


// ─── Configuration ──────────────────────────────────────────────────────────

const GLOBAL_EVENT_PROBABILITY = 0.2; // 20% de chance par tour


// ─── Moteur d'événements globaux ────────────────────────────────────────────

/**
 * Appelé à la fin de simulateTurn, juste avant de retourner le nouveau state.
 * Décide si un événement global doit se déclencher au prochain tour.
 * 
 * Retourne :
 *   - pendingGlobalEvent: l'event à résoudre (ou null)
 *   - updatedState: le state avec pendingGlobalEvent ajouté
 */
export function tryTriggerGlobalEvent(state) {
  // Ne trigger pas si un event est déjà en attente
  if (state.pendingGlobalEvent) {
    return { pendingGlobalEvent: state.pendingGlobalEvent, updatedState: state };
  }

  // Roll du dé : 20% de chance
  if (Math.random() > GLOBAL_EVENT_PROBABILITY) {
    return { pendingGlobalEvent: null, updatedState: state };
  }

  // Pioche un événement
  const event = pickGlobalEvent();

  return {
    pendingGlobalEvent: event,
    updatedState: { ...state, pendingGlobalEvent: event },
  };
}


/**
 * Appelé quand le joueur résout l'événement (choix fait dans le dialogue).
 * Applique les mutations retournées par choice.consequences().
 * 
 * Params:
 *   - state: le state actuel
 *   - resolution: { mutations, resultMessage, eventId }
 *   - showAlert: fonction pour afficher le message de résultat
 * 
 * Retourne: le nouveau state avec mutations appliquées et pendingGlobalEvent retiré
 */
export function resolveGlobalEvent(state, resolution, showAlert) {
  const { mutations, resultMessage } = resolution;

  // Appliquer les mutations
  let newState = { ...state };

  if (mutations.money !== undefined) {
    newState.money = mutations.money;
  }

  if (mutations.girls) {
    newState.girls = mutations.girls;
  }

  if (mutations.districts) {
    newState.districts = mutations.districts;
  }

  // Retirer le pending event
  newState.pendingGlobalEvent = null;

  // Afficher le message de résultat
  if (resultMessage) {
    showAlert(resultMessage, 'info');
  }

  return newState;
}