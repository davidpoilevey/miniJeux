# PocketBase — Kratland

**URL** : https://bdd.poilevey.org  
**SDK** : PocketBase JS v0.26.8 — initialisé dans `src/kratland/services/pb.js`, importé partout via `import { pb } from '../services/pb'`

---

## Collection `kratPlayers`

Table centrale — un record par joueur, identifié par son id PB (stocké dans `localStorage` sous `kratUser.pbId`).

| Colonne        | Type          | Notes |
|----------------|---------------|-------|
| `id`           | string (auto) | Clé PB. Utilisé dans tous les `.update(pbId, ...)` |
| `name`         | string        | Nom choisi à la création |
| `gold`         | number        | Monnaie, mis à jour à chaque achat / travail / embauche |
| `avatarUrl`    | string        | URL image avatar |
| `stats`        | JSON          | `{ force, intelligence, charisme, bonus: { force, intelligence, charisme }, competences: { [key]: 1 } }` |
| `jauges`       | JSON          | `{ forme: { current, max }, faim: { current, max }, reputation: { current, max } }` — les `color` ne sont **pas** stockées (calculées côté client via `JAUGE_COLORS`) |
| `location`     | JSON          | `{ position: "col,row"\|null, city: "cityId"\|null, building: "buildingId"\|null, roomId: "roomId"\|null }` |
| `inventaire`   | JSON          | `[{ typeId: "itemKey", qty: number }]` |
| `pointsDivins` | JSON          | `{ current: number, max: 20 }` — Points Divins, régénérés via les actions de sommeil. Coût des compétences (N²) et boosts de stats (1 PD = +1). Max 20. |
| `lastLoginDate`| string        | ISO date, positionné à la création |

**Opérations** : `getOne(pbId)` à l'init ; `update(id, { location, jauges })` à chaque mouvement ; `update(id, { gold, inventaire })` à l'achat ; `update(id, { gold, jauges })` après travail ; `update(id, { stats, pointsDivins })` après boost/compétence.

---

## Collection `kratCities`

Un record par ville instanciée dans le monde. Le catalog statique (`CITY_GEO`) définit les dimensions et exits — PB ajoute les données dynamiques.

| Colonne  | Type          | Notes |
|----------|---------------|-------|
| `id`            | string (auto) | Clé PB interne |
| `cityId`        | string        | Clé sémantique : `"haguenau"`, `"strasbourg"`, etc. Doit correspondre à une clé de `CITY_GEO` |
| `name`          | string        | Nom affiché |
| `mayor`         | string        | Nom du maire actuel |
| `taxMultiplier` | number        | Décret fiscal du maire, 1.0 (exempt) à 3.0 (pillage). Renchérit les prix des commerces de la ville (`prix × taxMultiplier`) et prélève la même proportion (bornée à 100%) sur les salaires versés en ville. Réglable via le Bureau du Maire (`BureauDuMaireDialog` → `TaxesPanel`) |
| `budget`        | number        | Trésor municipal, alimenté par la part "impôt" des ventes et des salaires (voir `KratContext.addCityBudget`). Affiché au maire dans le Bureau du Maire. Pas d'usage de dépense pour l'instant — c'est juste un compteur qui monte |

**Opérations** : `getFullList({ filter: 'cityId="haguenau"' })` au chargement d'une ville. CRUD complet dans l'AdminPanel. `taxMultiplier`/`budget` mis à jour par re-fetch + `update` (pas de transaction atomique — deux joueurs qui paient une taxe en même temps peuvent s'écraser l'un l'autre, acceptable pour ce projet).

> Si aucun record n'existe pour un `cityId`, `fetchCity` utilise `CITY_GEO` comme fallback tout en chargeant quand même les bâtiments.

---

## Collection `kratBuildings`

Un record par bâtiment placé dans une ville. Le catalog (`BUILDING_ASSETS`) définit les assets — PB ajoute la localisation.

| Colonne       | Type          | Notes |
|---------------|---------------|-------|
| `id`          | string (auto) | Clé PB interne |
| `buildingId`  | string        | Clé sémantique : `"gilded-griffin"`, `"blacksmith"`, etc. |
| `cityId`      | string        | Référence la ville parente (ex : `"haguenau"`) |
| `name`        | string        | Nom affiché en jeu |
| `type`        | string        | `"taverne"`, `"forge"`, `"marche"`, `"mairie"`, `"pharmacie"`, `"bibliotheque"`, etc. Détermine les `CONTEXTUAL_ACTIONS` |
| `roomConfig`  | string        | Clé dans `ROOM_CONFIGS` : `"entrance_shop"`, `"entrance_shop_bed"`, etc. |
| `position`    | string        | `"col,row"` sur la grille de la ville (ex : `"5,3"`) |

**Opérations** : `getFullList({ filter: 'buildingId="..."' })` pour un bâtiment ; `getFullList({ filter: 'cityId="..."' })` pour tous les bâtiments d'une ville. CRUD dans l'AdminPanel.

---

## Collection `kratNpcs`

Les personnages non-joueurs présents dans le monde.

| Colonne        | Type          | Notes |
|----------------|---------------|-------|
| `id`           | string (auto) | Clé PB |
| `name`         | string        | Nom |
| `role`         | string        | Rôle du PNJ — doit correspondre à une clé de `ROLES` dans le catalog (`"monstre"`, `"bodyguard"`, `"avocat"`, etc.). Détermine les attaques, défenses et le coût d'embauche |
| `avatarUrl`    | string        | URL image (si vide, l'icône de `ROLES[role].icon` est utilisée en fallback) |
| `action`       | string        | Action principale du PNJ : `"Parler"`, `"Commercer"`, `"Attaquer"`, `"Inspecter"`, `"Embaucher"`. Détermine le comportement dans `CharacterDialog` et le déclenchement automatique du combat |
| `stats`        | JSON          | `{ force, intelligence, charisme }` |
| `hp`           | JSON          | `{ current, max }` |
| `location`     | JSON          | Même structure que `kratPlayers.location` |
| `groupeChef`   | string\|null  | **[À créer]** ID du joueur (`kratPlayers.id`) dont ce PNJ fait partie du groupe. `null` = indépendant. Mis à jour par `hireNpc` / `fireNpc`. Le PNJ se déplace avec le joueur chef et participe à ses combats |
| `respawnDelay` | number\|null  | Délai de respawn en minutes. `null` = immortel |

**Opérations** : `getFullList({ filter: 'location.building="..."' })` dans `fetchBuilding` ; `getFullList()` dans `CityView` + `WorldMapView` ; `getFullList({ filter: "groupeChef='pbId'" })` à l'init pour charger le groupe du joueur ; `update(id, { groupeChef, location })` lors d'une embauche ; `update(id, { groupeChef: null })` lors d'un licenciement ; `update(id, { location })` à chaque déplacement du joueur chef.

---

## Collection `kratNews`

Fil d'actualités du monde, affiché dans l'accordion "Journal" du HUD.

| Colonne      | Type          | Notes |
|--------------|---------------|-------|
| `id`         | string (auto) | |
| `created`    | datetime (auto)| Trié par `-created` |
| `type`       | string        | `"rumor"`, `"official"`, `"note"`, `"misc"`, `"parler"` |
| `text`       | string        | Corps du message |
| `target`     | string        | Cible du message (personne ou lieu, optionnel) |
| `authorId`   | string        | ID du joueur auteur |
| `authorName` | string        | Nom du joueur auteur |

**Opérations** : `getList(1, 20, { sort: '-created' })` au montage du HUD ; `subscribe('*', callback)` pour les nouvelles en temps réel (unsubscribe dans le `useEffect` cleanup) ; `create({...})` lors d'une action "Parler" dans `CharacterDialog`.

---

## Collection `kratItems`

Stockage des coffres (un coffre par bâtiment, créé à la volée au premier dépôt — pas de record tant que le coffre n'a jamais servi). Utilisée uniquement par `CoffreDialog` (`components/dialogs/CoffreDialog.jsx`) et évoquée dans `KratContext.buildHouse` (commentaire "le coffre sera créé à la volée").

| Colonne    | Type          | Notes |
|------------|---------------|-------|
| `id`       | string (auto) | Clé PB |
| `typeId`   | string        | Clé d'objet (`ITEM_TYPES`), ou `"gold"` pour l'or déposé — l'or du coffre est un record comme un autre, distinct de `kratPlayers.gold` |
| `qty`      | number        | Quantité stockée. Le record est supprimé (`delete`) quand `qty` retombe à 0 plutôt que d'être gardé à 0 |
| `location` | JSON          | `{ city: cityId, roomId: 'coffre', buildingId }` — `roomId` vaut toujours la string fixe `'coffre'`, ce n'est pas une vraie pièce de `ROOM_DEFINITIONS` |

**Opérations** : `getFullList()` puis filtre client-side sur `location.roomId === 'coffre' && location.buildingId === buildingId` (pas de filtre serveur sur JSON ici, contrairement à `kratBuildings`/`kratNpcs`) ; `create`/`update(qty)`/`delete` au dépôt/retrait, un record par `typeId` par coffre.

**Accès** : propriétaire du bâtiment (`building.ownerId === player.id` ou `buildingId === 'maison_' + player.id`) → accès libre. Non-propriétaire → tentative de forcer le coffre, 50/50 tiré une seule fois à l'ouverture du dialog (`forcedRef`), échec = -5 réputation et aucun accès au contenu.

---

## Données statiques (catalog.js — jamais en base)

| Export            | Description |
|-------------------|-------------|
| `ROOM_DEFINITIONS`| Définitions de pièces (`entrance`, `shop`, `sleeping`, `bed`) |
| `ROOM_CONFIGS`    | Combinaisons de pièces par clé (`entrance_shop`, etc.) |
| `BUILDING_TYPES`  | Types de bâtiments avec label et icône |
| `CONTEXTUAL_ACTIONS` | Actions disponibles par type de bâtiment et par pièce |
| `COMPETENCES`     | Compétences acquérables (`closeCombat`, `combat`, `survie`, `magieFeu`, `magieEau`, `magieTerre`, `magieVent`, ...) |
| `ITEM_TYPES`      | Items (type `"weapon"` pour les armes de combat, `"stackable"` pour les consommables) |
| `ROLE_ATTACKS`    | Attaques définies par id : `{ label, dmgMin, dmgMax, icon, special? }` |
| `ROLE_DEFENSES`   | Défenses passives définies par id : `{ label, dmgMult, icon, special? }` |
| `ROLES`           | Rôles de PNJ : `{ cost, label, icon, attacks[], defenses[] }`. `cost` = prix d'embauche en gold, `icon` = fallback si pas d'`avatarUrl` |
| `CITY_GEO`        | Dimensions et exits des villes (`width`, `height`, `exits[]`) |
| `BUILDING_ASSETS` | Assets décoratifs des bâtiments (`description`, `roomImageUrl`) |
| `RANDOM_ENCOUNTERS` | Rencontres aléatoires pour le WorldMap et la ville |

---

## Notes générales

- **Pas d'authentification** : tout est en accès public, les règles PB doivent autoriser les opérations sans auth. L'identité joueur repose uniquement sur `localStorage` (`kratUser.pbId`).
- **Pas de relations PB natives** : tout est en JSON brut ou filtres sur des champs custom (`cityId`, `buildingId`, `groupeChef`), pas de foreign keys PB.
- **Filtres JSON** : le filtre `location.building="..."` sur un champ JSON peut ne pas être supporté selon la version PB — `fetchBuilding` l'ignore silencieusement en cas d'erreur.
- **groupeChef** : champ texte simple sur `kratNpcs`, **à créer manuellement dans l'interface PocketBase** (type Text, optionnel).
