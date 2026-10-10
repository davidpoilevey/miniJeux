# Moteur de b17

Lire d'abord [SCOTTY_B17.md](../SCOTTY_B17.md).

`Jardin.js` contient le premier moteur indépendant de React et du rendu, suivant
le découpage déjà utilisé dans b15 et b16. `Jardin.test.js` vérifie les échanges,
les ruptures, l'ombrage, la reproduction, la dormance, la germination et la pluie.

La première boucle à explorer est la croissance de plantes autonomes, leur contact,
une greffe, des échanges matériels et une rupture lorsque les conditions changent.
Le milieu sera une paroi en coupe. Les formes se construiront selon des règles
locales héréditaires lues avec `ADNHandler`, sans silhouettes prédéfinies.
La santé, les ressources excédentaires et les manques sont les conditions de greffe
proposées par David ; une première traduction est implémentée, à juger sur la paroi.

Simplification principale : réserves communes à chaque plante et conductance
limitée entre partenaires, sans simulation du transport interne cellule par cellule.

Les corps disparus conservent une ou deux spores avec leur génome d'origine.
Elles attendent 15 cycles consécutifs de lumière/eau suffisantes et une case libre.
Les averses irrégulières apportent de l'eau indépendamment des fissures ; elles
peuvent être générales ou locales, automatiques ou déclenchées depuis l'interface.

`gravite.js` fait descendre les corps entiers et les groupes greffés d'une case par
cycle jusqu'au sol ou à un tissu porteur. Une cellule perdue peut séparer des
fragments conservant la même lignée ; leurs réserves sont réparties sans bonus.
Les nutriments viennent d'une bande de sol, sont consommés et échangés par les
greffes. Les tests couvrent aussi appuis, ruptures de tiges, chute et conservation
des positions et contacts durant plusieurs milliers de cycles.

Les fissures rechargent rapidement les cases exploitées, tandis que le fond humide
est moins contrasté. `stepResources()` fait avancer ces réserves et les nutriments.
Les prélèvements de toutes les cellules alimentent la réserve commune avant la
photosynthèse ; celle-ci ralentit quand l'eau manque, en conservant une petite
réserve. Les tests isolent notamment une seule branche humide nourrissant un corps
majoritairement sec, la conservation de l'eau et l'indépendance de l'ordre cellulaire.
