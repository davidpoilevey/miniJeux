import React, { createContext, useReducer, useContext } from 'react';
import { creerParti, PARTIS_INITIAUX } from './data/partis';
import { ACTIONS } from './data/actions';
import { pickEvenement } from './data/evenements';
import { piocherLois } from './data/lois';
import { TUNING } from './data/tuning';
import { appliquerAction, appliquerEffetsPassifs, calculerResultatElection, bonusRang, resoudreVoteLoi } from './moteur';
import { echeanceAuTour, nomEcheance } from './echeances';

const PolitiqueStateContext = createContext();
const PolitiqueDispatchContext = createContext();

// actionsChoisies : [{ actionId, cibleId }] — cibleId est un id de média ou de
// parti selon action.cible, null tant qu'il n'a pas été choisi.
// votesLois : { [loiId]: 'pour' | 'contre' } — vote du joueur, obligatoire
// pour chaque loi de loisCourantes avant de valider le tour.
// champPolitique : dernier résultat électoral figé { tour, type, resultats,
// rangs }, indépendant du sondage courant tant qu'aucune nouvelle élection
// n'a lieu. `rangs` (1 = en tête) sert de base au bonus/malus de la
// prochaine élection, et pourra resservir pour d'autres mécaniques
// post-électorales (financement, etc.).
const initialState = {
  ecran: 'accueil', // 'accueil' | 'jeu'
  tour: 0,
  partis: [],
  evenementCourant: null,
  actionsChoisies: [],
  loisCourantes: [],
  votesLois: {},
  journal: [],
  champPolitique: null,
};

function politiqueReducer(state, action) {
  switch (action.type) {
    case 'CREER_PARTI_JOUEUR': {
      const { nom, positions } = action.payload;
      const joueur = creerParti({ id: 'joueur', nom, positions, estJoueur: true });
      const adversaires = PARTIS_INITIAUX.map((p) => creerParti(p));
      return {
        ...state,
        ecran: 'jeu',
        tour: 1,
        partis: [joueur, ...adversaires],
        evenementCourant: pickEvenement(),
        loisCourantes: piocherLois(TUNING.loisParTour),
        votesLois: {},
      };
    }

    case 'VOTER_LOI': {
      const { loiId, vote } = action.payload;
      return { ...state, votesLois: { ...state.votesLois, [loiId]: vote } };
    }

    case 'TOGGLE_ACTION': {
      const { actionId } = action.payload;
      const joueur = state.partis.find((p) => p.estJoueur);
      const actionsMax = Math.min(TUNING.actionsParTour + (joueur.actionsBonus || 0), TUNING.actionsMaxParTour);
      const dejaChoisie = state.actionsChoisies.some((a) => a.actionId === actionId);
      if (!dejaChoisie && state.actionsChoisies.length >= actionsMax) return state; // cap géré aussi côté UI
      const actionsChoisies = dejaChoisie
        ? state.actionsChoisies.filter((a) => a.actionId !== actionId)
        : [...state.actionsChoisies, { actionId, cibleId: null }];
      return { ...state, actionsChoisies };
    }

    case 'DEFINIR_CIBLE': {
      const { actionId, cibleId } = action.payload;
      const actionsChoisies = state.actionsChoisies.map((a) =>
        a.actionId === actionId ? { ...a, cibleId } : a);
      return { ...state, actionsChoisies };
    }

    case 'VALIDER_TOUR': {
      const journalTour = [];
      let partisMaj = state.partis.map((p) => appliquerEffetsPassifs(p));

      const iJoueurLois = partisMaj.findIndex((p) => p.estJoueur);
      state.loisCourantes.forEach((loi) => {
        const vote = state.votesLois[loi.id];
        if (!vote) return;
        const { parti, message } = resoudreVoteLoi(partisMaj[iJoueurLois], loi, vote);
        partisMaj[iJoueurLois] = parti;
        journalTour.push(message);
      });

      state.actionsChoisies.forEach(({ actionId, cibleId }) => {
        const definitionAction = ACTIONS.find((a) => a.id === actionId);
        const iJoueur = partisMaj.findIndex((p) => p.estJoueur);
        const iCible = cibleId ? partisMaj.findIndex((p) => p.id === cibleId) : -1;

        const contexte = definitionAction.cible === 'media'
          ? { mediaId: cibleId }
          : { partiCible: iCible >= 0 ? partisMaj[iCible] : null };

        const { parti, cible, message } = appliquerAction(partisMaj[iJoueur], definitionAction, state.tour, contexte);
        partisMaj[iJoueur] = parti;
        if (cible && iCible >= 0) partisMaj[iCible] = cible;
        journalTour.push(message);
      });

      const nouveauTour = state.tour + 1;
      const nouvelEvenement = pickEvenement();

      let champPolitique = state.champPolitique;
      const echeance = echeanceAuTour(nouveauTour);
      if (echeance) {
        const { resultats, rangs } = calculerResultatElection(partisMaj, nouvelEvenement, state.champPolitique, 2);
        champPolitique = { tour: nouveauTour, type: echeance.type, resultats, rangs };
        journalTour.push(`🗳️ ${nomEcheance(echeance.type)} : les résultats tombent !`);

        const n = partisMaj.length;
        partisMaj = partisMaj.map((p) => ({
          ...p,
          tresorerie: p.tresorerie + TUNING.financementParRang * bonusRang(rangs[p.id], n),
        }));
        const joueur = partisMaj.find((p) => p.estJoueur);
        const financementJoueur = Math.round(TUNING.financementParRang * bonusRang(rangs[joueur.id], n));
        journalTour.push(`💰 Frais de campagne remboursés (${rangs[joueur.id]}e/${n}) : ${financementJoueur >= 0 ? '+' : ''}${financementJoueur}.`);
      }

      return {
        ...state,
        tour: nouveauTour,
        partis: partisMaj,
        evenementCourant: nouvelEvenement,
        actionsChoisies: [],
        loisCourantes: piocherLois(TUNING.loisParTour),
        votesLois: {},
        journal: [...state.journal, ...journalTour],
        champPolitique,
      };
    }

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export const PolitiqueProvider = ({ children }) => {
  const [state, dispatch] = useReducer(politiqueReducer, initialState);
  return (
    <PolitiqueStateContext.Provider value={state}>
      <PolitiqueDispatchContext.Provider value={dispatch}>
        {children}
      </PolitiqueDispatchContext.Provider>
    </PolitiqueStateContext.Provider>
  );
};

export const usePolitiqueState = () => useContext(PolitiqueStateContext);
export const usePolitiqueDispatch = () => useContext(PolitiqueDispatchContext);
