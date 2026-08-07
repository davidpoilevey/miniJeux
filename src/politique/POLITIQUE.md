# POLITIQUE.md — Jeu politique (nom provisoire)

Simulation politique en tours différés, texte + clics. Un joueur = un parti,
N partis IA. Inspiré du réel français mais dénominations neutres.

## Arborescence

```
src/politique/
├── JeuPolitique.jsx       # Racine : Provider + routeur accueil/jeu
├── PolitiqueContext.jsx   # État du jeu + reducer (le "moteur" de tour)
├── AccueilPolitique.jsx   # Création du parti joueur (nom + curseurs d'axes)
├── EcranJeu.jsx           # Écran de jeu : événement, sondage, actions, journal
├── CalendrierSidebar.jsx  # Colonne de gauche : calendrier électoral + pieChart du champ politique
├── moteur.js              # Fonctions pures : sondage, impact événement, résolution d'une action/d'un vote de loi
├── echeances.js           # Helpers calendrier : échéance au tour X, veille d'élection, etc.
└── data/
    ├── axes.js            # AXES : 5 axes idéologiques -100..100
    ├── partis.js          # creerParti (factory) + PARTIS_INITIAUX (contenu)
    ├── actions.js         # ACTIONS (catalogue) + creerCasserole (factory)
    ├── medias.js           # MEDIAS : radios, télés, réseaux sociaux (contenu fictif)
    ├── evenements.js       # EVENEMENTS (catalogue) + pickEvenement (tirage pondéré)
    ├── lois.js             # LOIS (catalogue) + piocherLois (tirage pondéré sans remise)
    ├── calendrier.js       # TYPES_ECHEANCE + CALENDRIER (échéances électorales)
    └── tuning.js           # TUNING — constantes ajustables (le tableau de bord)
```

## Boucle de tour (état actuel)

1. À l'entrée d'un tour : un `evenementCourant` est tiré (`pickEvenement`), il
   biaise le sondage du tour sur l'axe qu'il cible (`impactEvenement`), sans
   toucher à `estime` (effet transitoire, pas de mémoire d'un tour à l'autre).
2. Le sondage (`calculerSondage`) reflète `estime + militants/5 + impact
   événement`, normalisé en %.
3. Chaque tour, `TUNING.loisParTour` lois sont tirées (`piocherLois`) et le
   vote est **obligatoire** (POUR/CONTRE) pour valider le tour. Le joueur
   choisit aussi jusqu'à `TUNING.actionsParTour` actions dans `ACTIONS`
   (certaines demandent une cible : un média ou un parti adverse). Les
   actions marquées `disponibleAvantElection` n'apparaissent que le tour
   précédant une échéance du `CALENDRIER`. Le coût en trésorerie d'une action
   est bien consommé (partagé entre les actions choisies dans le même tour),
   mais les militants ne le sont jamais : `militantsRequis` est un simple
   seuil d'accès (le parti doit disposer d'au moins ce nombre de militants
   pour que l'action soit jouable), pas une dépense. Le nombre d'actions
   disponibles par tour est `TUNING.actionsParTour + parti.actionsBonus`,
   plafonné à `TUNING.actionsMaxParTour` (5) ; l'action `renforcerEquipe`
   (100 de trésorerie) incrémente `actionsBonus` de façon permanente.
4. `VALIDER_TOUR` applique le revenu/déclin passif à tous les partis, puis
   pour le joueur : résolution de chaque vote de loi (`resoudreVoteLoi`),
   puis coût + effets de chaque action choisie (`appliquerAction`), avec
   tirage `risqueExposition` pour les actions illégales.

   `resoudreVoteLoi` compare le vote à la position du parti sur les axes de
   la loi (même formule que `impactEvenement`) : voter en cohérence avec ses
   convictions ajuste l'estime en conséquence. La loi porte aussi un
   `impactPopulaire` {pour, contre} indépendant de l'idéologie — le dilemme
   voulu : un parti sincèrement écolo qui vote pour un plan d'éoliennes reste
   pénalisé par le rejet local (paysage), même si son vote est 100% cohérent
   avec ses idées.

   `demagogie` est un curseur à double sens, pas un simple compteur : voter
   contre ses propres convictions le pousse vers le positif (populisme),
   voter en cohérence avec ses convictions le pousse vers le négatif (excès
   de rigidité idéologique, "décisions inhumaines"). `appliquerEffetsPassifs`
   pénalise l'estime chaque tour d'une fraction de la valeur ABSOLUE de
   `demagogie` (`TUNING.demagogiePenaliteEstime`) — les deux extrêmes coûtent
   cher, il faut viser un entre-deux.
5. Si le nouveau tour correspond à une échéance du calendrier, le résultat
   électoral est calculé par `calculerResultatElection`, distinct du sondage
   courant : il ignore les militants (seul le terrain de campagne les
   valorise, pas l'isoloir), ne garde que l'estime + l'impact de l'événement
   du jour **doublé**, et ajoute un bonus/malus de "champ politique" — les
   partis en tête du **précédent** scrutin captent par défaut le vote des
   indécis, le dernier en paie le prix (linéaire de `+N/2` à `-N/2`, N =
   nombre de partis ; aucun bonus lors de la toute première élection, faute
   de classement de référence). Le résultat est figé dans `champPolitique`
   sous la forme `{ tour, type, resultats, rangs }` — une entité distincte du
   sondage courant, qui ne change qu'à la prochaine élection. `rangs` (1 = en
   tête) sert de base au bonus de l'élection suivante, et déclenche aussitôt
   un remboursement de frais de campagne : chaque parti touche
   `TUNING.financementParRang × bonusRang(rang, n)` en trésorerie (même
   fonction que le bonus/malus de sondage électoral — jackpot pour le 1er,
   facture salée pour le dernier). Affiché en pieChart dans la sidebar,
   indépendamment des sondages en cours.

## Ce qui reste à écrire

- **IA des partis adverses** : ils ne font pour l'instant que subir le
  revenu/déclin passif, aucune décision d'action.
- **Effet de `mediaInfluence`** sur le sondage : le delta est stocké par
  action (`interview`) mais pas encore pris en compte dans `calculerSondage`.
- **Vote des lois par les IA** : `resoudreVoteLoi` n'est appliqué qu'au
  joueur — les 9 partis adverses ne votent jamais, donc leur `estime` ne
  bouge que par le déclin passif et les événements, jamais par les lois.

## Design notes

- 5 axes idéologiques, chaque parti a une position dessus + l'opinion
  publique (barycentre de l'électorat) → mesure de distance parti↔peuple.
- Les casseroles suivent une double détente : tirage `risqueExposition` au
  moment de l'acte illégal (scandale immédiat si perdu), sinon la casserole
  reste dans le casier et peut être exhumée plus tard (action `denonciation`,
  qui cible un parti adverse et ne fonctionne que s'il a une casserole non
  exposée). Un scandale dégrade l'estime mais n'est jamais un game over.
- `TUNING.iaBruitDecision` est prévu pour être le chaos qui empêchera les IA
  de converger vers une stratégie optimale unique — pas encore utilisé tant
  que l'IA n'existe pas.
