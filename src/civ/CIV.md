# CIV.md — Architecture et logique du jeu Civilization

Hommage à Civilization I (1991), en React + Konva + Material UI. Jeu en tour par tour
sur grille hexagonale, contre des IA, avec brouillard de guerre, diplomatie, recherche,
merveilles, barbares et événements aléatoires.

## Arborescence

```
src/civ/
├── Civilization.jsx        # Racine : menu principal / choix de nation / partie en cours
├── CivContext.jsx          # ⭐ Tout l'état du jeu + logique de tour (le "moteur")
├── CivMap.jsx              # Vue carte (Konva) : tuiles, unités, villes, brouillard
├── CivCity.jsx             # Vue ville : production, bâtiments, garnison, zone d'influence
├── CivRecherche.jsx        # Vue arbre technologique
├── CivSumUp.jsx            # Vue résumé : journal d'événements, villes, unités
├── CivPalmares.jsx         # Vue classement des civilisations (score, démographie)
├── CivMiniMap.jsx          # Minimap canvas 2D (coin bas-droit de la carte)
├── data/
│   ├── unitTypes.js        # UNIT_TYPES : stats, coûts, actions de chaque unité
│   ├── buildingTypes.js    # BUILDING_TYPES + MERVEILLES_DU_MONDE
│   ├── techTree.js         # TECHNOLOGIES : coût, prérequis, débloque quoi
│   ├── civilzationTypes.js # CIVILIZATIONS (8 nations jouables) + BARBARE_CIV
│   ├── economy.js          # Coûts en boucliers, conversion des matériaux/laine et migration
│   ├── cityTypes.js        # computeCityResources : récolte d'une ville par tour
│   └── randomEvents.js     # RANDOM_EVENTS + pickRandomEvent (tirage pondéré)
└── utils/
    ├── diplomacy.js        # Demandes de paix/tribut, stocks et transfert réel
    ├── hexUtils.js         # Grille hex : coordonnées axiales (q,r), A*, index WeakMap
    ├── utils.js            # IA, brouillard, assignation de tuiles, stats, newUid
    ├── mapGenerator.js     # Génération de carte (blobs de terrain + features)
    ├── Dialogs.jsx         # NationDialog, CityNameDialog, CivilDialog, Audience, GameOver
    ├── CivDashboard.jsx    # Tableau de bord latéral : navigation, journal, fin de tour
    ├── AddToProductionPopover.jsx  # Dialog de choix de production d'une ville
    ├── ZoneInfluenceCanvas.jsx     # Mini-canvas d'assignation de citoyens aux tuiles
    ├── MarchePanel.jsx     # Marché (échange de ressources, taux fluctuants)
    ├── MainMenu.jsx        # Écran d'accueil (nouvelle partie / charger)
    ├── civUI.jsx           # Composants stylés partagés (TypoCiv, ButtonCiv, DialogCiv…)
    ├── saveGame.jsx        # localStorage (clé "civ_savegame")
    ├── imagesImports.js    # AllImageSources : type/feature/unité → PNG
    └── hooks.jsx           # usePreloadedImages
```

## Modèles de données

### Tile (tuile)
```js
{ q, r,                  // coordonnées hexagonales axiales
  type,                  // 'plain' | 'forest' | 'mountain' | 'water' | 'desert'
  feature,               // null | 'mineOr' | 'puitsPetrole' | 'verger' | 'zone' | ...
  yield,                 // { food, gold, ... } = BASE_TILE_YIELD[type] + FEATURE_YIELD[feature]
  unit,                  // null | Unit — UNE seule unité par tuile
  hasCity, hasRoad,      // booléens (la ville elle-même vit dans `cities`)
  explored, visible,     // brouillard : explored est permanent, visible recalculé chaque tour
  assignedTo }           // id de la ville qui exploite cette tuile
```

### Unit (unité)
Créée par spread d'un `UNIT_TYPES[type]` + `{ id: newUid(type), owner: <objet civ>, remainingMovement }`.
Champs clés : `attack/defense/hp/hpMax/movement/range`, `armee` ('none' pour les civils
— déterminant pour `isMilitaryUnit`), `canCrossWater`, `actions` (menu contextuel carte),
`fortified`, `veterancy`, `targetDestination` (déplacement longue distance automatique),
`targetCitySpot` (pionnier IA).

### City (ville)
```js
{ id: newUid('city'), name, position: {q, r}, owner: <objet civ>,
  population,            // 1 pop = 1000 habitants, max 10
  buildings: [],         // ids de BUILDING_TYPES
  productionQueue: [], currentProduction, productionProgress, // boucliers investis
  autoConvertEnergy,     // true par défaut : matériaux alimentent le chantier
  autoConvertWool,       // true par défaut : laine vers nourriture
  garnison: [],          // unités stockées dans la ville (défense)
  assignedTiles: [],     // {q,r}[] — tuiles exploitées (max = population)
  resources: { food, gold, stone, iron, wood, laine, charbon, petrole, uranium, happiness, science } }
```

### Civilization
8 nations (`CIVILIZATIONS`) : `bonuses` (par type de terrain + happiness/science),
`militaryBonus`, `buildingBonus`, `populationGrowthBonus`, `diplomacyProfile`
(`aggressif/genereux/protectionniste/opportuniste` ∈ [0,1]), `startingTechs`.
`civ.technologies` : techs débloquées par l'IA en cours de partie (le joueur utilise `techsUnlocked`).
`BARBARE_CIV` (id `'barbare'`) est **hors** `CIVILIZATIONS` : pas de diplomatie (toujours
'war'), pas d'élimination, pas de villes — des hordes qui pillent.

## CivContext — le moteur

### États principaux
`tiles`, `cities`, `turn`, `playerNation`, `CIVILIZATIONS_inGame` (civs encore en jeu,
sous-ensemble choisi au setup), `diplomaticRelations` (clés `"idA-idB"` triées),
`techsUnlocked` / `currentResearch` / `researchProgress` (joueur), `builtWonders`
(`[{id, ownerId}]`), `taux` / `historique` (marché), `eventLog`, `selectedUnitPos`,
`selectedCity`, `mapConfig` (taille de carte + nb d'adversaires), `gameResult`,
`pendingAudience`, `isRunning` (verrou anti double-tour), `fxTrigger` (explosions).

### Le cycle nextTurn() — ordre CRITIQUE
1. **Éliminations** : une civ est vivante si elle a une unité sur carte, une ville ou une garnison.
2. **Fin de partie** : défaite si joueur mort, victoire s'il est seul survivant → `gameResult` + return.
3. **Tour des IA** (`playAITurn` par civ adverse, jamais le joueur) — voir plus bas.
4. **Barbares** : `playAITurn(BARBARE_CIV)` puis spawn probabiliste (cap 6, tuiles inexplorées loin des villes).
5. **Reset des mouvements + régénération HP** (`setTiles`, +20%/tour plafonné à hpMax).
6. **Brouillard** : `applyFogOfWar` (visible recalculé, explored conservé).
7. **Déplacements automatiques** : unités avec `targetDestination` avancent via A*.
8. **Merveilles** : `effectParTurn` sur les villes du propriétaire uniquement.
9. **Marché** : `updateMarketRates` (±10 %/tour, historique 20 points).
10. **Villes** (boucle sur `cities`) : conservation des affectations du joueur (nouveaux citoyens libres ; IA auto-assignée) →
    récolte (`computeCityResources` × (1+buildingBonus)) → croissance démographique
    (coût nourriture réduit par populationGrowthBonus) → production (bâtiment / merveille /
    unité → garnison) → collecte de la science (villes du joueur uniquement).
11. **Événement aléatoire** : ~12 %/tour sur une ville du joueur (`randomEvents.js`).
12. **Recherche** : progression = max(1, ceil((science + bonus civ)/5)), coût = max(12, ancien coût × 3) ; découverte → `techsUnlocked`.
13. `setTurn(+1)`, `setRunning(false)`.

### ⚠️ Le pattern mutation + commit (piège principal du code)
Tout le tour IA (`playAITurn`, `handleUnitAI`, `moveUnitToward`, `spawnBarbares`,
`aiAttaqueCity`) **mute directement** les objets de `tiles` et `cities`. Ces mutations
sont "committées" par les `setTiles(prev => prev.map(...))` suivants de nextTurn, qui
recréent les objets. Ça marche parce que les updaters React s'exécutent APRÈS le corps
de nextTurn. Les déploiements réservent immédiatement leur case et les combats IA appliquent leurs dégâts
immédiatement, pour que les unités suivantes voient le résultat. Les accords diplomatiques IA
modifient les villes avant leur traitement économique. Ne jamais insérer un `setTiles` avec
remplacement complet AVANT la fin des
mutations, et ne pas compter sur un re-render au milieu du tour.

### Performance
`getTileMap(tiles)` (hexUtils) : index `Map("q,r" → tile)` mis en cache dans une
**WeakMap par référence de tableau** — chaque setTiles crée un nouveau tableau donc le
cache se renouvelle seul. Utilisé par A* (`findPath`), `getHexNeighbors`,
`getSurroundingTiles`. Ne JAMAIS revenir à `tiles.find(...)` dans une boucle chaude :
c'était la cause historique des tours qui duraient plusieurs secondes.

### IA (utils.js + CivContext)
- `playAITurn(civ)` : déploie l'excédent de garnison, choisit la production selon le
  `diplomacyProfile` (`chooseCityProduction`), débloque une tech (15 %/tour,
  la moins chère → `civ.technologies`), puis `handleUnitAI` par unité.
- `handleUnitAI` : pionnier → `findCitySpot`/`foundCity` ; militaire →
  `findClosestEnemy` (relation war uniquement) puis approche + attaque
  (ville sans garnison : capture, ou pillage si barbare) ; diplomate →
  `findClosestForeignCity` → `launchDiplomaticInteraction`.
- `moveUnitToward` : A* (`findPath` avec `isTarget:true`), s'arrête AVANT toute tuile
  occupée (sinon il écrasait des unités — le fameux "trou noir").

### Diplomatie
- Premier contact à distance ≤ 3 : une IA neutre/tendue propose la paix ou exige un tribut
  selon son agressivité. Un refus entraîne une déclaration de guerre explicite.
- Tribut : or (max 100), matière première (max 30) ou points de recherche (max 10),
  plafonné aux stocks disponibles. Les ressources sont transférées depuis les villes du payeur
  vers une ville du demandeur. La science est prélevée sur la recherche en cours et créditée
  à la nation demandeuse, sans perte de technologie. Les points reçus peuvent financer une découverte IA.
- Les audiences sont mises en file ; impossible de finir un tour avant de répondre.
  La file et les derniers contacts (délai de 10 tours) sont sauvegardés.
- Relations : `'war' | 'tendu' | 'neutral' | 'peace' | 'allied'`, clé `[idA,idB].sort().join('-')`.
  `civId()` accepte objet ou id — TOUJOURS passer par lui (sinon clé "[object Object]").
- IA→IA / IA→joueur en ville IA : résolution automatique selon profils (`launchDiplomaticInteraction`).
- IA→JOUEUR : `pendingAudience` → `AudienceDialog` (tribut/paix/commerce/alliance),
  résolu par `resolveAudience(accepted)`. Les nouvelles propositions annoncent explicitement la guerre en cas de refus.
- Joueur→ville IA : clic d'un diplomate sur la ville → `DiplomacyDialog`
  (espionner / saboter / parlementer).

### Combat (`resolveCombat`)
Toute attaque exige une relation `war` (barbares toujours en guerre).
La fortification (+5 défense stockée + bonus de combat) disparaît au déplacement,
y compris trajet automatique, déplacement IA et sortie/entrée de garnison.
`atk = attack + vétérance(2) + militaryBonus civ` vs `def = defense + vétérance(1) +
militaryBonus + fortification (1) ou murailles (3)`. Dégâts au défenseur
`max(1, atk-def)`, à l'attaquant `def/2`. Portée vérifiée (`range`, défaut 1), attaquer
consomme tout le mouvement, riposte résolue immédiatement si le défenseur survit ET peut atteindre (aucun timer ne réécrit les unités).
Ville sans garnison : capture (pop-1, moitié des bâtiments pillés) ou rasage si pop
tombe à 0. Les barbares pillent au lieu de capturer.

### Fin de partie
`gameResult = {type, turn, score, classement}` → `GameOverDialog`. Score (source unique
`computeCivStats`) : villes×100 + pop×50 + techs×20 + merveilles×200 + max(0, 300−tour).
"Retour au menu" : `restartGame()` dans Civilization.jsx incrémente `gameId`, la `key`
du provider remonte tout proprement.

### Sauvegarde
`getGameState()/setGameState()` → JSON dans localStorage. Après un load, les objets
`owner` sont des COPIES : toute comparaison doit se faire par `.id`, jamais par `===`.
Le chargement réunit les références de propriétaire par id, pour partager les bonus de merveilles
entre villes, unités et nations. Chaque nouvelle partie clone les nations du catalogue.
Les merveilles ne stockent que `{id, ownerId}` (les fonctions restent dans le code).

## Les vues (onglet `selected` dans Civilization.jsx)
Layout : `CivDashboard` (colonne gauche fixe 260px, thème sombre/or) + contenu.
Le dashboard porte : le bouton **Fin du tour** (LE bouton), les rappels pré-tour
(villes 💤 sans production — aussi badgées sur la carte —, recherche vide), la
navigation, le sélecteur de villes, le **journal** (tous les `addEvent` y vont ;
la snackbar n'interrompt plus que pour warning/error) et l'intendance
(save/load/son/cheat/infos).

- **map** : Stage Konva (dimensions = `mapConfig`). Clic = sélection/mouvement/attaque
  (`handleClick`), menu d'actions contextuel (`ActionMenu` : fortify, road, labour, dig,
  city, heal, nuke, disband). Clavier : flèches = déplacement, Espace = unité suivante,
  Entrée = fin de tour. MiniMap cliquable en bas à droite.
- **city** : ressources, marché (2 dialogs), production en cours + file,
  `AddToProductionPopover` (choix bâtiment/unité/merveille), `ZoneInfluenceCanvas`
  (assignation de citoyens aux tuiles), bâtiments construits (production d'unités),
  garnison (déployer/dissoudre).
- **recherche** : techs disponibles (prérequis remplis) / en cours / acquises.
- **sump** : journal des événements persistants + résumé villes + unités.
- **palmares** : classement par score, barres comparatives (`computeCivStats`).

## Unités (data/unitTypes.js)
Civiles (`armee:'none'`) : pionnier (fonde ville, +1 pop), worker (route/labour/dig),
caravane (or/aide merveille), diplomate (espionnage/sabotage/négoce), moine (heal,
évangélise). Militaires : warrior, archer(r2), legion, spartiate, chevalier, templier
(heal), catapulte/baliste/canon (r2-3), mousquetaire, soldatModerne, tank,
avionChasse, bombeNucleaire (nuke rayon 2 = guerre mondiale) ; navales
(`armee:'naval'`) : drakkar, caravelle, destroyer. Production via bâtiment requis
+ tech (`requirements`), coût en ressources déduit à l'ajout en file.

## Conventions & pièges
- **Ids uniques** : toujours `newUid(prefix)` (jamais `Date.now()` seul — doublons = unités fantômes).
- **Comparaisons de civs** : toujours `a.id === b.id`.
- **Construction** : `productionProgress` compte des boucliers. Le coût est
  `max(4, turns × 4, somme des anciens matériaux / 4 arrondie au supérieur)`.
  Aucun matériau ni or n’est prélevé à l’ajout en file ; les prérequis restent obligatoires.
- **`armee:'none'`** = civil (l'IA ne l'envoie pas au combat).
- Le `<Stage>` Konva n'est pas dans un StrictMode : les updaters ne tournent qu'une fois.
- Textes du jeu en français, ton léger assumé.
- Tests de régression : `CI=true npm test -- --watchAll=false --runInBand --testPathPattern=src/civ`
  (déplacements, navigation, prérequis, garnison, merveilles, chargement, combat, diplomatie et vue ville).

### Affectation des citoyens et Wall Street
La fondation affecte les premiers citoyens. Ensuite, les villes du joueur conservent leurs
choix et leurs citoyens libres ; la croissance ne remplace pas le placement manuel.
Les cases sont réservées via `assignedTo`, et le placement manuel interdit une case
déjà exploitée par une autre ville. Wall Street rapporte entre 1 et 3% du stock d’or
par tour, soit 2% en moyenne (les intérêts restent composés à ce taux modéré).

### Économie hybride (version 2)
Le centre de la ville est récolté gratuitement, une seule fois. Les terrains donnent
1 bouclier en plaine/désert, 2 en forêt/montagne, 0 sur l’eau ; une ville conserve
un minimum de 1 bouclier de production par tour. Chaque citoyen consomme 2 blés :
le surplus nourrit la croissance, le déficit vide le grenier puis réduit la population
(sans descendre sous 1). La recherche repose sur la science produite, avec un socle de 1 point par tour ; le bonheur ne produit plus de science. Joueur et IA utilisent les mêmes coûts et la même progression, sans découverte aléatoire. La vue recherche affiche le rythme et le délai estimé.

`autoConvertEnergy` est activé par défaut, réglable dans la ville et sauvegardé.
Bois/pierre donnent 1 bouclier, fer/charbon/pétrole 2, uranium 4, au maximum 8 boucliers supplémentaires
par tour. La conversion utilise les stocks, récolte du tour incluse, seulement quand
un chantier actif en a besoin après la production normale. Les matières sont consommées
en unités entières, matériaux communs en premier ; rien n’est dépensé si cela dépasse le travail
restant. Sans chantier ou avec la conversion désactivée, les stocks restent au marché.

Les sauvegardes portent `economyVersion: 2`. Le chargement d’un ancien format convertit
l’avancement proportionnellement et rembourse une fois les coûts prépayés des éléments
encore en file. Une nouvelle sauvegarde empêche tout remboursement répété.

`autoConvertWool` est également activé par défaut et sauvegardé indépendamment.
Une laine donne 2 nourritures, au maximum 8 nourritures par tour, après la récolte
et avant la consommation des habitants. La conversion s’arrête quand le grenier
couvre la consommation et le prochain seuil de croissance (à population maximale,
une réserve équivalente à un tour supplémentaire). Désactiver permet de vendre la laine.

Le palmarès permet de déclarer la guerre et d’exiger un tribut sans diplomate.
La déclaration et l’ultimatum demandent confirmation ; le refus du tribut déclenche
la guerre. Les ressources ou points de recherche sont réellement transférés entre
les nations, jamais créés. Le tribut accepté maintient l’alliance si elle existait.
Une attaque à portée contre une nation en paix/alliance propose de rompre le traité.
Annuler ne consomme aucun mouvement ; confirmer déclare la guerre puis attaque.
Le tour et les interactions de carte sont bloqués pendant cette confirmation.
Les confirmations sont abandonnées au chargement d’une sauvegarde.
