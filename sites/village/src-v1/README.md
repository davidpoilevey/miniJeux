# Le village de Poilevey.org

Premier prototype de promenade. Le trajet part à gauche de la Maison Pivot. Il faut descendre sous la façade, longer le mur vers la droite, puis ouvrir la porte. L’accès direct dans l’en-tête ouvre la même page d’essai.

## Lancer le prototype

Depuis `sites/village`, avec Node.js 22.12 ou plus récent.

```sh
npm ci
npm run dev
```

Ouvrir [l’aperçu local](http://127.0.0.1:3027/). Cliquer ou toucher le sol pour s’y rendre. Un clic sur la porte fait marcher jusqu’au seuil, puis un autre l’ouvre. Les flèches, ZQSD et WASD fonctionnent lorsque la scène a le focus et reprennent la main pendant un trajet. Échap interrompt le déplacement. À portée de la porte, Entrée et le lien « Ouvrir la porte » fonctionnent aussi.

`npm test` vérifie le trajet, les collisions et le point de retour. `npm run build` produit le site statique dans `dist/`. Les fichiers de sortie utilisent des chemins relatifs. Le même dossier peut être servi sous un préfixe d’aperçu ou à la racine du domaine, en servant les fichiers `index.html` pour les URL de répertoire.

Pour essayer sur téléphone, lancer `npm run preview -- --host 0.0.0.0 --port 3028` après la compilation. Ouvrir l’adresse « Network » affichée par Vite depuis un téléphone connecté au même Wi-Fi.

## Carte et destinations

- `src/map.js` décrit le terrain en coordonnées logiques. L’origine est en haut à gauche, `x` augmente à droite et `y` vers le bas. La scène se redimensionne sans changer ces coordonnées. Le point du personnage représente ses pieds. Les obstacles sont des rectangles alignés aux axes. Pour chaque porte, `anchor` place le seuil, `hitArea` délimite la zone cliquable par rapport à cet ancrage, `approach` décrit le cercle d’interaction et `resume` fixe la position au retour et à l’arrivée par clic.
- `src/Scene.jsx` dessine les éléments provisoires. L’enseigne est tirée de `Pivot/docs/pivot_logoMinimum.jpeg`. Le personnage reçoit déjà sa position, sa direction et la distance parcourue pour animer sa marche. Un futur sprite pourra s’appuyer sur les mêmes données.
- `src/destinations.js` concentre l’identifiant, le libellé et les URL d’aperçu et de publication. La cible locale `seuil/` teste la navigation en attendant l’adresse de la démo fournie par F. Les liens ouvrent la destination dans le même onglet.
- Le retour navigateur après la porte reprend devant le seuil. Après un accès direct, il reprend au départ. Une destination peut proposer un lien vers l’adresse du village avec `?retour=pivot` pour déposer le visiteur devant la porte. Un lien « Village » sans paramètre conduit au point de départ.
