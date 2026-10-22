# Lemmings — premier prototype

Un écran fixe, un terrain en petites cases, dix lemmings et trois métiers.
Ouvrir le jeu depuis le catalogue (« Work in progress ») ou avec `?game=lemmings`.
Choisir une capacité puis cliquer/toucher un marcheur au sol ; la pause permet
d'attribuer les capacités tranquillement.
Cliquer à nouveau sur un bloqueur rose le remet en marche, même en pause ou
avec une autre capacité sélectionnée. Le déblocage est gratuit ; la capacité
utilisée pour créer le bloqueur reste consommée.

## Ajouter un niveau

Ajouter un objet dans `LEVELS`, dans `levels.js`. Le bouton « Niveau suivant »
apparaît après une victoire si un autre niveau existe. Le moteur n'a pas à changer.

- `width`, `height` : dimensions en cases ; origine en haut à gauche.
- `terrain` : rectangles `{ rect: [x, y, largeur, hauteur], material }`.
  `#` est la terre creusable, `X` la roche indestructible. Le vide est implicite.
  Les rectangles suivants recouvrent les précédents.
- `spawn` : `{ x, y, direction: 1 }` (ou `-1` pour partir vers la gauche).
  `y` désigne la case du bas du personnage, qui occupe deux cases en hauteur.
  Prévoir un espace libre de deux cases à l'entrée.
- `exit` : `{ x, y, width, height }`, zone de sortie sur une surface accessible.
- `total`, `required` : population et nombre à sauver.
- `releaseEvery` : délai entre deux sorties en pas de simulation (120 ms chacun).
- `timeSeconds` : durée maximale à vitesse normale.
- `skills` : stocks `{ blocker, digger, builder }` ; mettre zéro pour interdire un métier.
- `id`, `title`, `hint` : identité, titre et conseil du niveau.

`engine.js` contient les règles et les constantes communes : hauteur de chute
tolérée, longueur des escaliers, cadence. `Lemmings.jsx` affiche le terrain avec
Konva et gère les commandes. Chaque nouvelle partie reconstruit son propre
terrain ; creuser ne modifie jamais la définition du niveau.

## Limites du prototype

Les lemmings avancent case par case et peuvent se superposer. Les bloqueurs
restent en poste jusqu'à un nouveau clic ou jusqu'à la disparition de leur sol.
Les creuseurs travaillent seulement verticalement ; les constructeurs posent
12 marches avant de reprendre leur marche. Pas encore de sons, d'autres métiers,
d'éditeur ni de sauvegarde de progression.

Vérification ciblée : `CI=true npm test -- --watchAll=false --runInBand src/lemmings/engine.test.js`.
La suite vérifie notamment une solution gagnante du premier niveau et le même
moteur sur un autre petit terrain.
