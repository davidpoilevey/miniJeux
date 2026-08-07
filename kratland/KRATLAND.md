# Kratland — notes pour le prochain avatar

Ce fichier existe pour éviter de re-explorer tout le code à chaque session. Lis-le en entier avant de toucher quoi que ce soit — ça prend 5 minutes et ça évite de casser des trucs subtils (voir la section Pièges).

## Où est quoi

- **Code source du jeu** : `site/src/kratland/` (React + MUI). C'est le seul endroit qui compte. Le dossier `site/kratland/` (à la racine, où vit ce fichier) était vide jusqu'ici — ce n'est pas le code, juste un dossier de doc/déploiement à côté.
- **Backend** : PocketBase hébergé sur `https://bdd.poilevey.org`. Client initialisé dans `services/pb.js`. Pas de couche API perso, le front parle directement à PocketBase.
- **Schéma DB à jour** : `src/kratland/DBDESC.md`. Document déjà excellent et à jour — le lire en premier, il évite de deviner la forme des collections. Ce KRATLAND.md le complète avec la mécanique de jeu, pas le schéma.
- **Point d'entrée** : `Kratland.jsx` → `LoginGate` (auth par pseudo, pas de vrai login) → `KratProvider` (state global) → `MainView` (layout) → `HUDJoueur` (sidebar) + `GameMap` (routeur de vues).
- **Tout l'état + toute la logique de jeu** : `context/KratContext.jsx`. Un seul reducer géant + un objet `actions`. C'est LE fichier à lire pour comprendre "comment ça marche". Toutes les mutations DB sont en fire-and-forget (`.catch(() => {})`) après avoir mis à jour le state local en optimiste — pas de rollback si l'écriture PB échoue.
- **Tout le contenu statique du jeu** (items, compétences, rôles de PNJ, géographie des villes, rencontres aléatoires) : `data/catalog.js`. Jamais en base — c'est la référence pour équilibrer/ajouter du contenu.
- **Thème visuel** : `theme.js` (MUI, palette ambre/parchemin, police Newsreader/Noto Serif).

## Le jeu en une phrase

Un RPG textuel multijoueur en navigateur, ton médiéval-fantastique qui glisse volontiers vers l'absurde contemporain (flics, cybercafés, GPT-fanatiques, palanquins Uber...). Pas de temps réel serré : on se déplace case par case sur des grilles, on gère des jauges de ressources, on bosse/vole/combat/commerce, et une bonne partie du contenu est écrite avec un humour noir assumé (les descriptions d'actions, les rencontres aléatoires, les objets).

## Boucle de jeu et navigation

Trois niveaux de carte emboîtés, chacun avec sa propre grille et son propre `currentView` :

1. **`worldmap`** — carte du monde (25×16), on y voit les villes et les autres joueurs/PNJ "en extérieur". Cliquer une ville → `enterCity`.
2. **`city`** — carte d'une ville (dimensions par ville dans `CITY_GEO`), on y voit bâtiments, sorties, PNJ, autres joueurs. Cliquer un bâtiment → `enterBuilding`. Cliquer une sortie → `exitToWorld`.
3. **`building`** (`BuildingRoomView`) — intérieur d'un bâtiment, avec ses pièces (`entrance`, `shop`, `sleeping`, `prison`...) définies par `roomConfig`, et ses actions contextuelles par pièce (`CONTEXTUAL_ACTIONS[type][roomId]`).

Une 4e vue, **`combat`**, se superpose quand un combat démarre (via `startCombat`), déclenché soit manuellement (bouton "Dégainer" ou "Attaquer" sur un PNJ), soit automatiquement (rencontre aléatoire en se déplaçant, ou PNJ hostile présent sur la case où on arrive).

Chaque déplacement (`movePlayer`) coûte de la **Forme** (proportionnel à la distance de Manhattan, modulé par le véhicule possédé — `getSpeedMultiplier`), sauvegarde la position en DB, déplace aussi le groupe de PNJ embauchés, et tire une **rencontre aléatoire** (10% en ville/monde, 1% en mode "discret" qui coûte 2× plus cher).

## Les trois jauges + Points Divins

- **Forme** (0–24) : sert de "PV" en combat (0 = défaite auto) et de ressource de déplacement. Se regagne en dormant, mangeant, potions.
- **Faim** (0–20) : baisse avec le temps/actions, remonte en mangeant.
- **Réputation** (0–20) : baisse avec les actions illégales/échecs, monte avec les bonnes actions. **À 0, prison automatique** (effet de bord dans un `useEffect` de `KratContext` — téléporte le joueur dans la cellule de la mairie de sa ville).
- **Points Divins** (0–20, `stats.pointsDivins`) : monnaie de progression méta, gagnée en dormant/priant/certaines actions. Sert à : booster une stat fixe (Force/Intelligence/Charisme, coût = 1 PD par point, coût croissant car le coût = valeur actuelle de la stat), ou acquérir une compétence (coût = n² où n = nombre de compétences déjà possédées — donc 0, 1, 4, 9, 16 PD pour la 1ère, 2e, 3e, 4e, 5e compétence).

## Combat

Tour par tour, N alliés (joueur + `groupe` de PNJ embauchés) vs M ennemis (`activeEnemies`, jusqu'à 10 rounds max sinon match nul). Le joueur choisit une action (arme en inventaire, sort si compétence magique possédée, attaque nue, bloquer, fuir), cible un ennemi par clic ; les alliés tapent automatiquement le premier ennemi vivant ; chaque ennemi vivant riposte (70% sur le joueur, 30% sur un allié aléatoire), avec un rôle (`ROLES` dans catalog.js) qui détermine ses attaques/défenses possibles. Les dégâts subis par le joueur retirent de la **Forme** (pas de PV séparés pour le joueur). Victoire → loot (or + items du champ `hp.loot` du PNJ) + réputation. Défaite → téléportation sur une case adjacente sûre.

## Bâtiments, pièces, actions contextuelles

Un bâtiment a un `type` (taverne, forge, marché, mairie, temple, pharmacie, clinique, cybercafé, garage, bibliothèque, laboratoire, maison, **mine, usine, maison_close**) et un `roomConfig` qui détermine ses pièces. Chaque pièce affiche les actions définies dans `CONTEXTUAL_ACTIONS[type][roomId]` (catalog.js) — c'est là qu'on ajoute une nouvelle interaction de gameplay pour un type de bâtiment. Les actions peuvent être :
- **auto** (résultat déterministe, ex. dormir) → passe direct par `ActionDialog` en mode "roll" avec `successChance` implicite à 100%.
- **à jet de dé** (`successChance` + bonus de compétence `competenceBonus`) → `ActionDialog` affiche la barre de chance et applique `onSuccess`/`onFailure`.
- **formulaire** (`form: [...]`, ex. répandre une rumeur) → écrit dans la collection `kratNews`.
- **spéciales câblées en dur** dans `BuildingRoomView.handleAction` : `exit`, `bureauDuMaire`, `coffre`, `work` (ouvre `TravailDialog`), `evasion`, `costaud` (spawn un garde du corps).

La **boutique** (pièce `shop`) tire aléatoirement la disponibilité des objets à chaque entrée dans le bâtiment selon leur rareté (`rollAvailability` dans `BuildingRoomView`), à partir de tous les `ITEM_TYPES` dont `inBuildingShop === building.type`.

### Bâtiments "gagne-pain" (ajoutés le 15/07/2026)

Le jeu manquait de moyens de gagner sa vie face au nombre de commerces — trois nouveaux types corrigent ça, tous en `roomConfig: 'entrance'` (une seule pièce, pas de boutique) :

- **`mine`** : action `work` "Piocher dans la roche" avec un gain **aléatoire** (`salaryMin: 20, salaryMax: 300`) au lieu du `salary` fixe habituel. Coût : forme -12, faim -7.
- **`usine`** : action `work` "Travailler à la chaîne", salaire fixe généreux (100g) contre un gros coût en forme (-12) et faim (-6), réputation -1 (dur labeur, mal vu).
- **`maison_close`** : pas d'action `work` — trois actions `auto` qui échangent de l'or contre de la Forme (25g/+8, 70g/+16+rép, 150g/+24 soit le plein), sur le modèle des `sleep_room`/`sleep_bnb` de la taverne plutôt que via les items `compagnie_*` existants (ceux-ci sont de type `service`, jamais utilisables depuis l'inventaire — `HUDJoueur` ne permet d'utiliser que `consumable`/`book` — donc un gap préexistant, pas touché ici).

**Mécanique ajoutée à `TravailDialog.jsx`** : le champ `salaryMin`/`salaryMax` sur une action `work` fait tirer le salaire au moment de `handleWork()` (pas à l'ouverture du dialog, pour garder la surprise) au lieu d'utiliser `salary` fixe. `ModeCard` affiche une fourchette (`20–300g`, ajustée par mode) plutôt qu'un montant fixe quand ce champ est présent. Le montant réellement gagné s'affiche maintenant dans l'écran de résultat (`+{salary}g`), ce qui n'existait pas avant pour aucune action de travail.

Pas d'images définies dans `BUILDING_TYPE_IMAGES` pour ces 3 types — à ajouter par Dave avec ses propres assets si besoin, pas de lien deviné pour éviter une image cassée.

## Interactions avec un PNJ ou un autre joueur (`CharacterDialog`)

Menu d'actions filtré par `target.action` (le champ PNJ qui dit ce qu'on peut en faire) : Parler (→ `kratNews`), Séduire (jet charisme → or), Dérober (jet intelligence → or, illégal), Attaquer (→ combat), Embaucher (rejoint `groupe`, coût selon `ROLES[role].cost`), Commercer (boutique PNJ définie dans son champ `shop`), Mission (dialogue à choix, système présent mais peu alimenté en contenu — `mission.intro/questions/options`).

## Groupe (PNJ embauchés)

`groupeChef` sur `kratNpcs` = id du joueur qui les a embauchés. Ils suivent le joueur (position synchronisée à chaque déplacement), combattent à ses côtés, se renvoient via le HUD. Deux sources : embaucher un PNJ existant (`hireNpc`, coûte le `cost` de son rôle) ou en faire spawn un nouveau depuis un template (`spawnNpc`, ex. le garde du corps "costaud" dans les forges, ou les policiers municipaux recrutables par le maire).

## Économie

- **Or** : simple compteur sur `kratPlayers.gold`, pas un item d'inventaire (sauf dans le coffre, où il est stocké à part comme un `typeId: 'gold'`).
- **Inventaire** : liste de `{ typeId, qty }`, les définitions (icône, prix, effets, stackable, maxStack) sont dans `ITEM_TYPES` (catalog.js), jamais dupliquées en DB.
- **Travail** (`TravailDialog`) : 4 modes au choix pour chaque job (sérieux / flemme / gratuit / illégal "piquer dans la caisse"), chacun modulant salaire et malus de jauges différemment, avec un risque de se faire choper si illégal.
- **Marchandage** (`AchatDialog`) : un essai par achat, probabilité de succès dépend de la rareté de l'objet, bonus si compétence `marchandage`, réduction de 25% si succès.
- **Coffre** (`CoffreDialog`, collection `kratItems`, désormais documentée dans `DBDESC.md`) : stockage par bâtiment (`location.buildingId/roomId='coffre'`), accessible librement au propriétaire, ou 50/50 de "forcer" pour un non-propriétaire (échec = -5 réputation).
- **Maison** (`buildHouse`) : 10 planches + 4 fer brut → construit un bâtiment `maison_<playerId>` (unique par joueur), donne accès à un coffre personnel.

## Politique locale

Une ville peut avoir un maire (`kratCities.mayor`, juste une string — pas de vraie relation). Devenir maire : candidature (jet de chance si poste vacant) ou coup d'état (10% de réussite, très risqué, sinon prison). Le maire a accès au **Bureau du Maire** : ajuster le multiplicateur de taxes (`taxMultiplier`, **désormais branché — voir ci-dessous**), publier une annonce officielle (`kratNews` type `official`), recruter des policiers municipaux gratuitement.

### Fiscalité municipale (`taxMultiplier` + `budget`, ajouté le 15/07/2026)

Le maire fixe `taxMultiplier` (1.0 à 3.0) via le slider du Bureau du Maire. Deux effets, calculés à chaque transaction, jamais en amont :

- **Prix des commerces** : dans `BuildingRoomView`, chaque item de boutique voit son `prix` catalogue multiplié par `taxMultiplier` avant affichage et avant l'ouverture d'`AchatDialog` — donc le joueur paie déjà le prix taxé, marchandage éventuel appliqué par-dessus. Un chip rouge "Taxe municipale ×X.X" apparaît dans le panneau boutique quand `taxMultiplier !== 1`.
- **Salaires** : dans `TravailDialog`, le salaire brut (fixe ou tiré au sort pour la mine) est amputé de `taxRate = min(max(taxMultiplier - 1, 0), 1)` — donc ×1.1 = -10%, ×2.0 = -100% (plus aucun salaire, tout part à la ville), et ça ne descend jamais sous 0 même à ×3.0. Le joueur voit le montant net encaissé et la part prélevée dans l'écran de résultat.

Dans les deux cas, la part "impôt" est créditée au **budget de la ville** (`kratCities.budget`, nouvelle colonne) via `actions.addCityBudget(amount)` dans `KratContext` — qui dispatch en optimiste puis re-fetch le record PB avant d'écrire (pas de transaction atomique, deux joueurs qui paient en même temps peuvent s'écraser l'un l'autre — assumé, cohérent avec le reste du projet). Le budget est visible par le maire dans le Bureau du Maire (sous-titre + panneau Taxes).

**Décisions prises sans demander, à corriger si ce n'est pas ce que tu voulais** :
- Seuls les commerces "de bâtiment" (`inBuildingShop` dans `ITEM_TYPES`, consommé par `BuildingRoomView`/`AchatDialog`) sont taxés. Les boutiques *portées par un PNJ* (`CommercePanel` dans `CharacterDialog`, prix custom par PNJ) ne sont pas touchées — mécanique différente, prix fixés à la main par l'admin, pas de lien avec le catalogue.
- La revente de ses objets au marché (`sellItem`) n'est pas taxée — la demande parlait de prix "à la vente" par les commerces, pas du rachat au joueur.
- Le calcul de la taxe sur un achat se base sur le prix catalogue (`ITEM_TYPES[itemKey].prix`), pas sur le prix effectivement payé après marchandage — pour éviter qu'un marchandage réussi ne fasse aussi baisser les recettes de la ville.

## Prison et évasion

Réputation ≤ 0 → téléportation automatique en cellule (pièce `prison` de la mairie). Une seule action possible : tenter de s'évader (`EvasionDialog`), avec une chance de base + bonus (Forme actuelle, compétences Discrétion/Survie, corruption à 50g, hypnose si compétence Mentalisme). Échec = perte de Forme sans sortir. Succès = replacé en `entrance`.

## Contenu à connaître dans `catalog.js`

- **4 villes** codées en dur : Haguenau, Strasbourg, Paris, Washington (dimensions + sorties dans `CITY_GEO`, position sur la worldmap incluse).
- **7 rôles de PNJ** (`ROLES`) avec attaques/défenses assignées : monstre, gobelin, bimbo, assistant, bodyguard, avocat, bandit.
- **~50 types d'objets** (`ITEM_TYPES`) répartis en nourriture, boissons, "services" (implicitement des services sexuels abstraits en gameplay — `compagnie_standard/luxe/influence`), véhicules (modifient la vitesse de déplacement), objets illégaux, potions/soins, livres (chacun débloque une compétence), équipement/armes, matériaux de craft, futur high-tech (tablette, drone).
- **9 compétences** (`COMPETENCES`) : discretion, informatique, mentalisme, alchimie, navigation, combat, medecine, survie, marchandage, closeCombat, tir, + 4 magies élémentaires (feu/eau/terre/vent). Chacune débloquée par un livre en bibliothèque, et donne un bonus mécanique précis (combat: nouvelle attaque, discretion: bonus sur les jets illégaux, marchandage: bonus marchandage, etc.) — voir les usages épars dans `CombatView`, `ActionDialog`, `AchatDialog`, `EvasionDialog`.
- **Rencontres aléatoires** (`RANDOM_ENCOUNTERS`) séparées ville / worldmap, avec un ton very "absurde contemporain dans un monde médiéval" (le "Mendiant en auto-entrepreneur", le "Golem de vieux pneus recyclés", la "Licorne sous anti-dépresseurs"...) — c'est la marque de fabrique du jeu, à respecter si on ajoute du contenu.

## Admin (outil de dev, pas pour les joueurs)

`AdminPanel` (accessible via l'icône engrenage discrète du HUD) : CRUD sur `kratCities`, `kratBuildings`, `kratNpcs` (avec éditeur de boutique/mission par PNJ), + bouton "Fin de journée" qui appelle `POST /api/end-of-day` — **cet endpoint n'existe pas dans `src/kratland`, il doit vivre côté serveur du site (pas encore trouvé/exploré)**. À chercher si on doit comprendre le cycle jour/nuit, les libérations de prison automatiques, les destitutions de maire.

## Pièges et zones d'ombre identifiées

- **Pas d'authentification réelle — volontaire, ne pas "corriger" sans demander.** L'identité repose sur `localStorage.kratUser.pbId`, un `create` sur `kratPlayers` suffit à exister. C'est fait exprès : ça permet à Dave de se logger avec plein de users différents et d'en créer à la volée sans gérer de mots de passe. Ne pas proposer d'ajouter une vraie auth sans qu'on en parle d'abord.
- **Écritures PocketBase en fire-and-forget** partout dans `KratContext` (`.catch(() => {})`). Le state local (optimiste) et la DB peuvent diverger silencieusement si une requête échoue — voulu/assumé, pas un système à corriger (voir section "Philosophie de dev" ci-dessous).
- **`taxMultiplier`/`budget`** : désormais branchés sur les prix des commerces et les salaires (voir section Fiscalité municipale ci-dessus). Pas de transaction atomique sur les écritures de `budget` — deux joueurs qui paient un impôt en même temps peuvent s'écraser.
- **`/api/end-of-day`** référencé par le bouton admin mais vit dans le backend du site (hors du dossier `src/kratland` exploré ici) — reset plusieurs valeurs de chaque joueur. Demander l'accès à ce dossier si une tâche en dépend.
- **Système de mission** (`CharacterDialog` → `MissionPanel`) existe côté UI mais quasiment aucun PNJ n'a de `mission` renseignée dans les données vues — feature présente mais peu utilisée pour l'instant.
- Deux dossiers "kratland" distincts sont connectés : `site/kratland/` (racine, contient ce doc) et `site/src/kratland/` (le vrai code React). Ne pas les confondre en pensant que le premier contient le jeu.

## Philosophie de dev (important pour calibrer les suggestions)

Kratland est un projet perso "pour s'amuser", pas un produit en prod avec des utilisateurs à protéger. Conséquences pour la façon de proposer de l'aide :

- Pas de système de sync/consistance entre le state client et PocketBase — c'est assumé (YOLO). Ne pas proposer de grosse refonte "propre" (queue de retry, optimistic UI rollback, etc.) sauf si demandé explicitement.
- Certaines features sont sciemment à moitié branchées ou approximatives (ex. `taxMultiplier`, système de mission). Une imprécision par-ci par-là ne vaut pas la peine d'être signalée systématiquement — Dave préfère qu'on avance plutôt qu'on blinde.
- L'absence d'auth réelle est un choix pratique, pas un oubli.
- Le ton second degré du contenu (rencontres absurdes, objets qui grincent) est une feature, pas un brouillon à "professionnaliser".

## Pour la prochaine session

1. Lire ce fichier + `DBDESC.md`.
2. Si la tâche touche à une mécanique précise, aller direct au fichier concerné listé ci-dessus plutôt que de tout relire.
3. Si le contenu de `catalog.js` change, vérifier qu'on garde le ton "médiéval-absurde-contemporain" cohérent avec l'existant.
4. Mettre à jour ce fichier si une nouvelle mécanique/collection apparaît — c'est le but.
