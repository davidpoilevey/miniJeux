import { TUNING } from './data/tuning';
import { creerCasserole } from './data/actions';

const clampEstime = (valeur) => Math.min(TUNING.estimeMax, Math.max(TUNING.estimeMin, valeur));

// impact de l'événement en cours sur UN parti : positif si sa position sur
// l'axe visé est alignée avec le pôle favorisé, négatif si à l'opposé.
// Transitoire — ne modifie pas l'estime du parti, ne joue que sur le sondage
// de ce tour (pas de mémoire d'un tour à l'autre pour l'instant).
export function impactEvenement(parti, evenement) {
  if (!evenement) return 0;
  const position = parti.positions[evenement.axe] ?? 0;
  const alignement = evenement.sens === 'gauche' ? -position : position;
  return (alignement / 100) * evenement.intensite;
}

// sondage = reflet de l'estime + des militants + l'impact de l'événement du
// tour, normalisé en %. L'influence média n'est pas encore branchée.
// multiplicateurEvenement : 2 le jour d'une élection — l'actualité du moment
// pèse deux fois plus lourd sur le résultat que sur un sondage ordinaire.
export function calculerSondage(partis, evenement, multiplicateurEvenement = 1) {
  const scores = partis.map((p) => ({
    id: p.id,
    score: Math.max(0, p.estime) + p.militants / 5 + impactEvenement(p, evenement) * multiplicateurEvenement,
  }));
  const total = scores.reduce((sum, s) => sum + Math.max(0, s.score), 0);
  if (total === 0) return Object.fromEntries(partis.map((p) => [p.id, 0]));
  return Object.fromEntries(
    scores.map((s) => [s.id, Math.round((Math.max(0, s.score) / total) * 100)])
  );
}

// bonus/malus lié à un rang électoral : +N/2 en tête, -N/2 en dernier,
// linéaire entre les deux (N = nombre de partis). Partagé par le bonus de
// "champ politique" (calculerResultatElection) et le financement public
// post-élection (voir PolitiqueContext).
export function bonusRang(rang, n) {
  if (!rang || n <= 1) return 0;
  return (n / 2) - (rang - 1) * (n / (n - 1));
}

// résultat électoral : contrairement au sondage courant, ne compte PAS les
// militants (le terrain convainc, il ne vote pas à leur place) — seulement
// l'estime et l'impact (doublé) de l'actualité du jour. S'y ajoute le
// bonus/malus de "champ politique" (`bonusRang`) calculé sur le classement du
// DERNIER scrutin : les partis en tête captent par défaut le vote des
// indécis, le dernier de la classe en paie le prix. Pas de bonus tant
// qu'aucune élection n'a encore eu lieu (pas de classement de référence). Le
// classement de CETTE élection est renvoyé (`rangs`, 1 = en tête) pour être
// réutilisé tel quel par la prochaine élection et par le financement public.
export function calculerResultatElection(partis, evenement, champPolitiqueActuel, multiplicateurEvenement = 2) {
  const n = partis.length;
  const rangsPrecedents = champPolitiqueActuel ? champPolitiqueActuel.rangs : null;

  const scores = partis.map((p) => ({
    id: p.id,
    score: Math.max(0, p.estime) + impactEvenement(p, evenement) * multiplicateurEvenement
           + bonusRang(rangsPrecedents ? rangsPrecedents[p.id] : null, n),
  }));
  const total = scores.reduce((sum, s) => sum + Math.max(0, s.score), 0);
  const resultats = total === 0
    ? Object.fromEntries(partis.map((p) => [p.id, 0]))
    : Object.fromEntries(scores.map((s) => [s.id, Math.round((Math.max(0, s.score) / total) * 100)]));

  const rangs = Object.fromEntries(
    [...partis]
      .sort((a, b) => resultats[b.id] - resultats[a.id])
      .map((p, i) => [p.id, i + 1])
  );

  return { resultats, rangs };
}

// applique le coût + les effets d'UNE action à un parti. `contexte` porte la
// cible choisie par le joueur : { mediaId } si action.cible === 'media',
// { partiCible } (l'objet parti visé) si action.cible === 'parti'.
// Retourne le parti acteur mis à jour, le parti cible mis à jour (ou null),
// et un message de journal.
export function appliquerAction(parti, action, tour, contexte = {}) {
  const { mediaId, partiCible } = contexte;
  const suivant = { ...parti, mediaInfluence: { ...parti.mediaInfluence } };
  suivant.tresorerie -= action.cout.tresorerie || 0;

  Object.entries(action.effets || {}).forEach(([cle, delta]) => {
    if (cle === 'mediaInfluence') {
      if (mediaId) suivant.mediaInfluence[mediaId] = (suivant.mediaInfluence[mediaId] || 0) + delta;
    } else {
      suivant[cle] = (suivant[cle] || 0) + delta;
    }
  });
  if (action.effetAlignement) {
    suivant.estime = clampEstime(suivant.estime + impactEvenement(suivant, action.effetAlignement));
  }
  suivant.estime = clampEstime(suivant.estime);

  let message = action.texte;
  let cibleMaj = partiCible ? { ...partiCible } : null;

  if (cibleMaj && action.effetCible) {
    Object.entries(action.effetCible).forEach(([cle, delta]) => {
      cibleMaj[cle] = (cibleMaj[cle] || 0) + delta;
    });
    cibleMaj.estime = clampEstime(cibleMaj.estime);
  }

  if (cibleMaj && action.effetCibleMilitantsFacteur != null) {
    cibleMaj.militants = Math.floor(cibleMaj.militants * action.effetCibleMilitantsFacteur);
  }

  if (cibleMaj && action.exposeCasseroleCible) {
    const casseroleVisee = cibleMaj.casseroles.find((c) => !c.exposee);
    if (casseroleVisee) {
      const perte = TUNING.scandaleImpactBase * casseroleVisee.gravite;
      cibleMaj.casseroles = cibleMaj.casseroles.map((c) =>
        c === casseroleVisee ? { ...c, exposee: true } : c);
      cibleMaj.estime = clampEstime(cibleMaj.estime - perte);
      message = `${casseroleVisee.titre} de ${cibleMaj.nom} éclate au grand jour (-${perte} estime pour eux) !`;
    } else {
      message = `Aucune affaire à sortir sur ${cibleMaj.nom} pour l'instant.`;
    }
  }

  if (action.illegale) {
    const risque = action.risqueExposition * TUNING.multiplicateurRisque;
    if (Math.random() < risque) {
      const perte = TUNING.scandaleImpactBase * action.casserole.gravite;
      suivant.estime = clampEstime(suivant.estime - perte);
      message = `Scandale ! ${action.casserole.titre} est exposé au grand jour (-${perte} estime).`;
    } else {
      suivant.casseroles = [
        ...suivant.casseroles,
        creerCasserole({ ...action.casserole, tourCreation: tour }),
      ];
      message = `${action.nom} passe inaperçu... pour l'instant.`;
    }
  }
  return { parti: suivant, cible: cibleMaj, message };
}

// applique le vote (`'pour'` | `'contre'`) d'un parti sur une loi.
// Pour chaque axe visé : l'estime bouge selon la cohérence entre le vote et
// la propre position du parti (même formule que impactEvenement), MÊME
// quand l'impact populaire immédiat de la loi (indépendant de l'idéologie,
// ex : des éoliennes qui défigurent le paysage) va dans l'autre sens.
//
// `demagogie` est un curseur à double sens, pas un simple compteur : voter
// contre ses propres convictions (alignement < 0, populisme, dire ce que la
// foule veut entendre) le pousse vers le positif ; voter en cohérence avec
// ses convictions (alignement > 0) le pousse vers le négatif — l'excès de
// rigidité idéologique, insensible au coût humain immédiat d'une loi. Aucun
// des deux extrêmes n'est sain ; c'est `appliquerEffetsPassifs` qui pénalise
// l'estime sur la valeur ABSOLUE de `demagogie`, pas son signe.
export function resoudreVoteLoi(parti, loi, vote) {
  let suivant = { ...parti };
  loi.axes.forEach(({ axe, sens, intensite }) => {
    const sensEffectif = vote === 'contre' ? (sens === 'gauche' ? 'droite' : 'gauche') : sens;
    const alignement = impactEvenement(suivant, { axe, sens: sensEffectif, intensite });
    suivant.estime = clampEstime(suivant.estime + alignement);
    suivant.demagogie = (suivant.demagogie || 0) - alignement * TUNING.demagogieFacteur;
  });
  const impactPopulaire = (loi.impactPopulaire || {})[vote] || 0;
  suivant.estime = clampEstime(suivant.estime + impactPopulaire);
  const message = `Vote ${vote === 'pour' ? 'POUR' : 'CONTRE'} — ${loi.nom}.`;
  return { parti: suivant, message };
}

// revenu/déclin automatique de fin de tour, avant résolution des actions.
// Le peuple finit par remarquer un parti trop démagogue (demagogie >> 0)
// comme un parti trop rigide/inhumain (demagogie << 0) — dans les deux cas,
// l'estime s'érode d'une fraction de |demagogie|.
export function appliquerEffetsPassifs(parti) {
  const demagogie = parti.demagogie || 0;
  return {
    ...parti,
    tresorerie: parti.tresorerie + TUNING.tresorerieParTour,
    militants: Math.max(0, parti.militants - TUNING.militantsDeclin),
    estime: clampEstime(parti.estime - Math.abs(demagogie) * TUNING.demagogiePenaliteEstime),
  };
}
