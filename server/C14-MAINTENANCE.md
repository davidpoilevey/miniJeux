# Carbonifère 14 — maintenance du 3 novembre 2026

La réparation `pb_migrations/1793700000_c14_repair.js` est propre à la base Bmax :
elle conserve les trois IDs d'origine, supprime les copies et les anciennes
interactions, crée les champs autodate explicites et un index unique sur worldId,
puis prépare un reset pour chacun des trois mondes. Ne pas l'appliquer à une
nouvelle installation : les IDs d'origine sont vérifiés avant toute modification.

Sauvegarde Bmax : `/opt/homelab/backups/c14-20261103T074701Z/`.
`carbonifere14.json` contient les trois collections avant réparation et leur schéma ;
`c14-server.mjs` est le serveur précédent. `test-data/data.db` est une copie sur
laquelle la migration a été testée, pas une sauvegarde intacte à restaurer.
Pour un retour arrière, arrêter uniquement C14 et restaurer les données ciblées
avec un script adapté à l'index unique. Ne pas remplacer la base partagée complète.

Le bouton public envoie `resetWorld` à la collection de commandes existante.
Le serveur change le relief, remet la mer et le tick à leur valeur initiale,
efface l'historique et crée 80 plantes sans changer l'ID PocketBase du monde.
Il ignore les commandes précédant le dernier reset dans le lot et les anciens likes.
Un monde naturellement éteint reste éteint après redémarrage, jusqu'au reset explicite.

Vérifications locales :
- `node --test server/c14-server.test.mjs`
- `CI=true npm test -- --watchAll=false --runInBand --runTestsByPath src/b14/ui/C14TopBar.test.jsx`
- `npm run build`

Les changements du serveur se déploient indépendamment du frontend, avec
`docker compose build c14-server` puis `docker compose up -d --no-deps c14-server`.
Ne pas recréer Kratland ni nettoyer les conteneurs orphelins dans cette opération.
