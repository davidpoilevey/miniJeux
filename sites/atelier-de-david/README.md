# L’Atelier de David

Le portail Atelier est désormais l’accueil par défaut du projet React,
accessible en développement avec `/miniJeux/`, sans paramètre supplémentaire.
Les avis fictifs sont visibles directement sur chaque carte.

Le nouveau portail réutilise le catalogue `src/gameData.jsx`, les hooks de
recherche et de filtrage, le tirage pondéré, les six coups de cœur, le classement
PocketBase et le mécanisme d’ouverture/retour des jeux d’AppStitch.

## Sites

Le projet privé est enregistré dans `.openai/hosting.json` mais n’est pas encore
publié. David a autorisé les commits, le push et le déploiement du portail
sur l’hébergement GitHub Pages existant avec `npm run deploy`.

Anciennes sources de prévisualisation : `/private/tmp/david-atelier-sites-source`.
Ancienne archive de prévisualisation : `/private/tmp/david-atelier-sites.tar.gz`.
Ces copies précèdent le passage à l’accueil par défaut et les avis toujours visibles.
La copie de publication contient `src`, `public`, les fichiers npm et le manifeste
Sites ; elle configure le portail Atelier par défaut et des URL à la racine.
Les sources de travail restent dans ce projet React.

## Vérifications du 29 octobre 2026

- Construction de production réussie ; avertissements existants dans les jeux.
- Catalogue de 106 jeux sur ordinateur, 31 adaptés au mobile.
- Recherche, absence de résultats, remise à zéro et filtres mémorisés après rechargement.
- Six coups de cœur et lecture du classement PocketBase existant.
- Ouverture de Morpion, retour au portail et recherche conservée.
- Tirage aléatoire ouvrant Le 421.
- À 375 px, aucun débordement horizontal du portail.
- Les 106 jeux n’ont pas été testés individuellement ; aucune publication de score effectuée.

Les sauvegardes conservées uniquement dans le navigateur restent liées à leur
adresse d’origine ; elles ne sont pas transférées automatiquement vers Sites.
