# Le village de Poilevey.org

Prototype de promenade, ambiance « conte cosy du soir », vue de dessus en 3/4. Une rue principale, une ruelle haute et une ruelle basse reliées par des passages. On part de la place de la fontaine, la caméra suit le personnage. Onze portes : neuf destinations (dont deux privées) et trois fausses portes pour rire (Winstub, Boulangerie, Dojo). La version précédente (une seule maison) est conservée dans `src-v1/`.

## Publier dans www (www.poilevey.org)

`npm run www` reconstruit le village directement dans `../../www` : `index.html`, `favicon.svg`, `seuil/` et `village/` (scripts, sons, images) sont remplacés, le reste de `www` n'est pas touché. Les autres pages de `www` :

- `nouvelles/` : la Bibliothèque, générée par `~/Perso/paperasse/litterature/bibliotheque/build.py` puis copiée (`cp -R site/. …/www/nouvelles/`).
- `garage/`, `poste/`, `dojo/` : les utilitaires, le livre d’or et la vidéo, repris de l’ancien accueil.
- `classique/` : l’ancien accueil complet, en version de secours (copie exacte d’origine dans `src-v1/www-index-original.html`).
- `assets/` : CV, vidéo, images de l’ancien accueil.

Les statistiques de visite (Google Analytics + `logVisitor` PocketBase) sont reprises de l’ancien accueil dans `index.html`.

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

- `src/map.js` décrit le terrain en coordonnées logiques : carte 1360 × 880, vue 680 × 408 (`view`), bâtiments (`buildings`), décor bloquant (`props`) et portes générées depuis les bâtiments. `src/camera.js` centre la vue sur le personnage.
- `src/Town.jsx` dessine le décor fixe (sol, rues, façades), rendu une seule fois. `src/Scene.jsx` dessine ce qui bouge : personnage, halos de porte et effets d’approche (π qui pivote, livre qui sort, néon, totem, flash, lettre, engrenage, bulles des fausses portes).
- Ancienne description de la carte : L’origine est en haut à gauche, `x` augmente à droite et `y` vers le bas. La scène se redimensionne sans changer ces coordonnées. Le point du personnage représente ses pieds. Les obstacles sont des rectangles alignés aux axes. Pour chaque porte, `anchor` place le seuil, `hitArea` délimite la zone cliquable par rapport à cet ancrage, `approach` décrit le cercle d’interaction et `resume` fixe la position au retour et à l’arrivée par clic.
- `src/Scene.jsx` dessine les éléments provisoires. L’enseigne est tirée de `Pivot/docs/pivot_logoMinimum.jpeg`. Le personnage reçoit déjà sa position, sa direction et la distance parcourue pour animer sa marche. Un futur sprite pourra s’appuyer sur les mêmes données.
- `src/destinations.js` concentre l’identifiant, le libellé, le type (`public`, `prive`, `gag`) et les URL d’aperçu et de publication. La page locale `seuil/?lieu=<id>` sert de destination d’essai pour chaque porte en attendant les adresses fournies par F. Une porte « gag » ne navigue pas : chaque coup frappé affiche une nouvelle réplique (le Dojo cède au dernier). Les liens ouvrent la destination dans le même onglet.
- Le retour navigateur après la porte reprend devant le seuil. Après un accès direct, il reprend au départ. Une destination peut proposer un lien vers l’adresse du village avec `?retour=pivot` pour déposer le visiteur devant la porte. Un lien « Village » sans paramètre conduit au point de départ.
