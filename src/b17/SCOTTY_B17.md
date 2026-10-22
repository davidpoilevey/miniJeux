# B17 — Plantes autonomes et greffes réversibles

Document de direction créé et précisé le 9 octobre 2026, après exploration avec David.
À lire avant de commencer une implémentation dans ce dossier.

## Le point de départ pour la prochaine session

David souhaite observer des populations distinctes évoluer dans un environnement
contraint, se débrouiller, se concurrencer et faire apparaître des histoires
surprenantes. Retour vers le végétal et la construction multicellulaire.

**Direction retenue : des plantes autonomes qui peuvent se greffer entre elles,
puis se dégreffer lorsque les conditions de leur association ne sont plus remplies.**

Chaque plante garde son corps, son génome, ses ressources et sa descendance.
L'association crée un réseau d'échanges ; elle ne fusionne pas les individus.
Les lignées restent les personnages que l'on suit au fil du temps.

État actuel : **premier prototype jouable**, accessible dans le catalogue sous
« Les jardins des liens · B17 », ou avec `?game=b17`. Moteur indépendant de React,
rendu canvas et contrôles d'observation. La vision reste une direction de recherche,
pas une promesse d'émergence durable démontrée.

## Ce que David a explicitement choisi

- Des plantes autonomes capables de se greffer et de se dégreffer.
- Une paroi vue en coupe, pour rendre visible la concurrence pour la lumière en hauteur.
- Aucune silhouette de plante prédéfinie : des règles simples et variées doivent
  permettre à la sélection de favoriser les formes adaptées au milieu.
- Le génome est obligatoirement lu et manipulé avec `ADNHandler` et les fonctions
  de mutation et de recombinaison du module partagé `genetic/ADNPlante.js`.
- Une plante qui se désagrège peut conserver une ou deux cellules sous forme de
  spores dormantes, capables de reprendre quand l'eau et la lumière reviennent.
- Des épisodes de pluie alimentent la paroi entière ou une zone, y compris loin
  des fissures. Le milieu doit permettre des reprises après une période défavorable.
- Une compétition permanente entre lignées proches exploitant les mêmes ressources.
- Des interactions et des conséquences visibles : éviter une « soupe de blobs ».
- Une progression par petits prototypes, avec retour de David avant d'élargir.

Le tissu mosaïque où plusieurs lignées colonisent un même corps a été proposé,
puis écarté par David au profit des plantes autonomes. Ne pas revenir à ce modèle
par commodité d'implémentation.

## Le milieu et les formes

Le choix du milieu est arrêté : **paroi en coupe, lumière venant d'en haut**.
La disposition précise des fissures, des sources d'eau et des obstacles reste à
définir pour le petit prototype. « Jardins des ruines » reste un titre provisoire ;
les vestiges des plantes mortes comme supports sont une piste, pas un choix confirmé.

David ne veut pas choisir une forme de plante. Ne pas lui demander de définir
des silhouettes, ni préparer des catégories de plantes avec une morphologie imposée.
La forme doit résulter de règles locales héréditaires, de l'espace disponible, des
ressources et des voisins, puis être soumise à la sélection par la descendance.

Pistes pour des règles simples, sans constituer encore un modèle arrêté : varier
la direction et la ramification de la croissance, l'investissement dans les tissus,
la réaction à la lumière, à l'eau et aux réserves disponibles. Un même génome peut
produire des formes différentes selon les conditions rencontrées.

La hauteur doit avoir des conséquences via la lumière réellement accessible et
l'ombre des tissus. Ne pas donner un bonus direct à la hauteur : monter, s'étaler
ou rester compact doivent garder des avantages et des coûts dépendant du contexte.

## La vision : un corps collectif devient un environnement

Une plante modifie déjà le milieu de ses voisines par sa présence, son ombre et
ses prélèvements. Une greffe ajoute un passage matériel entre deux corps.
Plusieurs plantes reliées peuvent former un ensemble dont chacune exploite une
partie, entretient certaines connexions et dépend de certains apports.

Ce corps collectif reste un réseau de plantes identifiables. Il peut se former,
s'étendre, perdre des partenaires ou se fragmenter sans effacer leurs identités.

Trois rapports se superposent :

1. **Concurrence pour les mêmes ressources.** Deux plantes captatrices se disputent
   la lumière et la place ; deux systèmes absorbants prélèvent dans la même poche.
   La concurrence vient des usages réels, sans pénalité spéciale liée à une étiquette
   d'espèce ou à la proximité généalogique.
2. **Complémentarité possible.** Une plante bien exposée mais pauvre en eau peut
   échanger avec une voisine dans la situation inverse.
3. **Intérêt propre au sein de l'association.** Entretenir une greffe, conserver
   des réserves, pousser ou produire une descendance ont des coûts concurrents.

Une association peut donc être utile à deux plantes qui se gênent aussi ailleurs.
Les catégories « coopératrice » et « parasite » décriraient une situation observée,
pas des rôles attribués à la naissance.

## Principes proposés pour obtenir des conséquences réelles

Ces principes donnent une direction au futur prototype. Les équations, seuils et
mécanismes précis restent à discuter et à éprouver.

### Les flux ont une origine, un trajet et un coût

- La lumière permet de produire de l'énergie ; l'eau vient de sources du milieu.
- Construire et entretenir des tissus consomme des ressources.
- Les échanges passent par les tissus et les greffes, avec des capacités limitées.
- Être relié ne donne pas automatiquement accès à une réserve globale.
- Une greffe ne crée aucune ressource et n'accorde aucun bonus gratuit de symbiose.

Cela donne de l'importance à l'emplacement des plantes et des connexions : près
d'une source, en bout de réseau ou sur un passage entre deux partenaires.

### La greffe est un événement, la rupture en est un autre

David propose comme point de départ une bonne santé des deux plantes, une envie
de partager une ressource en excédent ou d'en obtenir une qui manque. Ces conditions
doivent être traduites en états locaux et en réactions héritables, sans objectif
global ni connaissance de tout le réseau. Les seuils et leur combinaison restent
à choisir : il ne s'agit pas encore d'une équation de formation des greffes.

Une connexion naît d'un contact local. Son maintien dépend de l'état et des règles
des plantes impliquées. Une plante doit pouvoir la fermer ; une destruction de
tissu peut aussi la rompre. La compatibilité éventuelle entre tissus reste à définir,
sans ajouter d'office une interdiction de greffe entre lignées différentes.

David évoque aussi l'association pour mieux se défendre ou mieux attaquer, en
questionnant la pertinence d'une prédation végétale. Garder cette piste ouverte.
Des effets sur l'accès à l'espace, à la lumière ou à l'eau peuvent déjà porter un
conflit ; ne pas convertir cette idée en système de combat, de prédation ou de
toxines sans discussion. Tout avantage collectif devra provenir d'un mécanisme
matériel observable, et non d'un bonus forfaitaire « alliance ».

Une rupture change réellement les flux. Une plante peut se réorienter, ralentir,
perdre une branche, survivre seule ou mourir. Aucun de ces résultats n'est imposé
pour fabriquer une histoire.

Prévoir une mémoire locale ou un délai de réaction est une piste pour éviter que
les greffes clignotent autour d'un seuil. Le choix exact reste ouvert.

### Le génome règle le développement et les réactions

La piste héritée de cellular-blob : le corps se construit par croissance locale.
Les cellules d'une plante partagent son génome ; leur contexte peut produire des
réactions différentes. Une greffe n'échange ni ne fusionne les génomes.

Les règles de croissance, d'allocation et d'ouverture des échanges sont à exprimer
par des gènes lus avec **`ADNHandler`**, selon le choix explicite de David.
La liste des gènes et leur traduction en règles locales restent à définir.
Ne pas créer un génome parallèle de traits tirés indépendamment au hasard.

API existante vérifiée dans [ADNPlante.js](../genetic/ADNPlante.js) :

- `new ADNHandler(adn)` pour lire le génome avec `readFloat(key)`, `readBool(key)`
  et `read10(key)`.
- `handler.mutatedVersion()` ou la fonction exportée `mutationADN(adn, taux)`
  pour produire un génome muté.
- La fonction exportée `recombinaisonGenetique(adn1, adn2)` renvoie deux génomes
  enfants ; ce n'est pas une méthode de la classe.
- `randomGenome()` pour les génomes fondateurs.

Conserver l'implémentation partagée. Vérifier les collisions entre les clés des
gènes retenus, signalées dans la documentation de b15. Discuter séparément de toute
modification de cette base. Les mutations et recombinaisons accompagnent la
reproduction ; la greffe est un échange de ressources, pas un croisement génétique.
Le mode de reproduction et ses conditions restent ouverts.

La sélection vient de la survie et de la descendance dans le monde. Éviter un
classement externe des champions ou une récompense pour « bien coopérer ».

## Ce qu'on veut pouvoir regarder

La lisibilité fait partie de la mécanique à valider dès le premier prototype.

- Reconnaître chaque plante, son contour et sa lignée, même dans un réseau dense.
- Voir où deux plantes sont greffées et dans quel sens passent les ressources.
- Observer une pousse, un contact, une connexion, un manque et une rupture.
- Inspecter une plante pour comprendre ses apports, ses dépenses et ses partenaires.
- Relier une conséquence à une cause locale plutôt qu'à une variation abstraite de score.

Exemple souhaité, **non garanti** : une plante fournit de l'énergie à une voisine
qui lui apporte de l'eau. Une descendante de la première pousse dans la même zone
éclairée et la concurrence. Les apports changent ; une greffe se ferme. Une partie
du réseau dépérit tandis qu'une autre poursuit sa croissance avec un nouveau partenaire.

Pas besoin de déplacement animal pour avoir de l'action : les fronts de croissance,
les trajets de ressources et les changements de partenaires doivent faire spectacle.

## Ce que les expériences précédentes apportent

Le corpus de référence indiqué par David est **b8 à b16 + genetic + Sprouts +
fourmis + godBoard + mee + mondayTheory**, avec cellular-blob comme intuition
multicellulaire à reprendre. La lecture faite ici est exploratoire, pas un audit
exhaustif de tous ces projets.

- [genetic](../genetic/) : hérédité commune et expériences de développement végétal.
- [Sprouts](../Sprouts/sproutUtil.js) : cellules végétales, mycélium, prélèvements,
  rejets et recyclage. La matière morte n'est donc pas une nouveauté de b17.
- [b9, adhérence](../b9/engine/systems/AdhesionSystem.js) : connexions entre agents,
  chaînes et mouvement coordonné. David rapporte que sa tentative d'adhérence
  finissait en soupe de blobs sans véritable action observable.
- [b9, symbiose](../b9/engine/systems/SymbiosisSystem.js) : échanges d'énergie et
  bonus mutuel. Pour b17, chercher des bénéfices issus des flux matériels.
- [b14](../b14/plants/PlantModel.js) : plantes composées de cellules identifiables.
- [b15](../b15/bacterie15.5.md) : interactions locales et traces dans le milieu ;
  documentation des impasses déjà rencontrées.
- [b16](../b16/bacterie16.md) : corps héritables et contraintes physiques, avec un
  objectif externe de distance qui ne correspond pas au but de b17.
- [fourmis](../fourmis/Fourmiz.jsx) : coordination par les traces et modification
  du milieu, notamment par le déplacement des pucerons.
- [mee](../mee/meeUtils.js) : relations entre partenaires, confiance, exploitation
  et rupture ; inspiration pour les dépendances, pas une société humaine à recopier.
- [mondayTheory](../mondayTheory/systems/NeedsSystem.js) : besoins concurrents et
  actions dans le temps ; inspiration pour les arbitrages locaux.
- [godBoard](../godBoard/GodContext.jsx) : interventions sur le monde vivant.
- [cellular-blob](../blob/CellularBlob.jsx) et [Cell](../blob/Cell.js) : croissance
  et voisinage cellulaire. Dans l'état lu, la mort et la spécialisation sont
  désactivées et le métabolisme reçoit un gain sans prélèvement environnemental.

## Premier prototype réalisé

David a demandé de commencer et de laisser l'inspiration venir de Scotty, sans
lui faire dicter tous les détails. Les choix ci-dessous sont donc des propositions
concrètes à observer et à discuter après essai, plutôt que des questions bloquantes.

- Grille de 100 × 64, une cellule par emplacement, 14 plantes fondatrices.
- Deux fissures humides sinueuses alimentent localement l'eau. La roche est pour
  l'instant un substrat visuel, sans obstacles physiques.
- Lumière verticale atténuée par chaque cellule rencontrée. Toutes les cellules
  peuvent capter la lumière et prélever l'eau avec des rendements héritables.
- Croissance dans les cases voisines libres selon lumière, eau, direction,
  voisinage et variation locale. Aucun corps prédessiné.
- Treize gènes via `ADNHandler`, clés vérifiées sans collision : direction verticale,
  ramification, captation solaire, absorption, partage, patience, dispersion, dormance, absorption minérale, résistance à la sécheresse, sobriété minérale, fertilité et prospection.
- Bonne santé des deux partenaires et différence de réserves pour ouvrir une
  greffe de contact. Les deux propensions génétiques au partage interviennent.
- Une greffe par paire de plantes, avec conductance limitée, flux signés d'eau et
  d'énergie et de nutriments et coût énergétique pour les deux partenaires.
- Rupture après détresse persistante ou échanges insuffisants. Délai de 180 cycles
  avant de pouvoir reformer la même connexion, et nouvelle différence de réserves
  nécessaire : éviter les reconnexions immédiates sans changement utile.
- Graines locales avec mutation à 0,006 ; filiation conservée. Les réserves d'une
  graine sont prélevées sur sa mère. Reproduction asexuée seulement pour ce proto ;
  la recombinaison partagée reste disponible pour une évolution ultérieure.
- Mort par manque prolongé ou vieillissement ; une ou deux spores peuvent rester.
  Aucun repeuplement par introduction automatique de nouveaux génomes.
- Pause, vitesses ×1/×4/×12, nouvelle paroi, vues eau/lumière/nutriments, inspection par clic,
  chronique, réduction/coupure de l'alimentation des fissures, averses spontanées
  désactivables et pluies générale/locale déclenchables.

**Simplifications à connaître :** les réserves sont communes à chaque plante, pas
distribuées cellule par cellule. La conductance des greffes diminue avec la taille
des corps mais il n'existe pas encore de transport interne calculé le long des
tissus. Les cellules ne se spécialisent pas, les corps morts disparaissent à
l'exception des cellules conservées en spores, il
n'y a ni attaque, ni défense collective, ni vestiges, ni sauvegarde.
Ne pas présenter ce proto comme une validation de ces mécanismes futurs.

Premières mesures après ajustement, cinq mondes aléatoires à 1 500 cycles : 3 à 7
plantes, 2 à 3 lignées, 1 à 3 greffes actives, 2 à 14 naissances et 0 à 4 ruptures.
Ce sont des observations courtes, pas une preuve de coexistence à long terme.
Les premiers réglages éteignaient souvent presque toute la paroi ; l'entretien
a été réduit et la croissance laisse désormais une réserve pour la reproduction.

Onze tests ciblés couvrent conservation des échanges, rupture et libération de
l'espace, ombrage, réserves et filiation des graines, extinction en sécheresse,
et délai de reconnexion, conservation du génome en spores, réveil après libération
de la lumière, blocage par sécheresse/occupation, couverture et durée des pluies,
et reprise d'une lignée existante après pluie. Compilation réussie avec avertissements
dans d'autres jeux, aucun avertissement signalé dans b17.
Vérification navigateur effectuée : croissance, graines, greffes, rupture, pause,
accélération, nouvelle paroi, vue de l'eau et inspection des réserves/partenaires.
Dans un essai, assèchement au cycle 1 236 : dernières plantes mortes au cycle 1 415,
avec ruptures pour détresse et aucun repeuplement. Capture de la paroi avant sécheresse
conservée dans `/tmp/b17-prototype.jpg` (artefact temporaire, pas une sauvegarde).

## Itération 1 : sporulation et averses

Demandée par David après son premier essai. Le milieu devient un espace où une
lignée peut attendre, puis reprendre lorsqu'une plante au-dessus disparaît ou
qu'une averse rend une zone habitable.

### Dormance

- À la disparition du corps, garder la cellule de base et éventuellement une autre
  cellule choisie au hasard. `b17Dormance` règle une ou deux spores lorsque le corps
  le permet, et la consommation très lente des réserves en dormance.
- Les spores restent à leur emplacement, gardent exactement le génome, la couleur,
  la lignée et la génération d'origine. Aucun croisement ou mutation au réveil.
- La réserve vient d'une fraction des tissus construits et des réserves résiduelles.
  Au réveil, elle est transférée à la plante ; les réserves des fondateurs ne sont
  pas réattribuées. Le modèle de matière reste simplifié comme le reste du proto.
- Une spore ne capte pas de lumière, ne prélève pas d'eau et ne fait pas d'ombre.
  Elle peut être recouverte par la croissance d'une autre plante : la germination
  attend alors que la case soit libre.
- Pour germer : lumière d'au moins 45 %, eau locale d'au moins 0,18 à 0,30 selon
  le gène d'absorption, et case libre pendant 15 cycles consécutifs. Le compteur
  repart à zéro si une condition cesse d'être satisfaite.
- Les réserves diminuent lentement ; une spore finit par disparaître si elles
  s'épuisent. La dormance n'est pas une assurance d'immortalité.
- Un réveil relance une plante autonome sans changer sa génération génétique.
  Les réveils sont comptés à part des naissances par reproduction.
- Une disparition au-dessus libère immédiatement la lumière pour les spores en
  dessous. Aucun événement spécial « réveiller le voisin » n'est codé.

### Pluie

- Averses spontanées activées par défaut, sans lien avec le nombre de plantes.
  Premier épisode après 180 à 639 cycles ; ensuite, attente de 180 à 639 cycles
  après la fin de l'épisode précédent. Durée de 100 à 239 cycles, intensité variable.
- 65 % des épisodes spontanés sont locaux : une zone douce autour d'un centre
  aléatoire. Les autres arrosent toute la paroi. La pluie n'est pas une saison fixe.
- L'eau apportée rejoint le champ existant puis subit les mêmes prélèvements et
  pertes. Elle ne disparaît pas brutalement à la fin de l'averse.
- Les fissures restent une alimentation distincte. « Assécher la paroi » coupe les
  fissures, les averses spontanées et la pluie en cours. Une pluie manuelle reste
  possible ensuite, sans réactiver automatiquement les fissures ou les averses.
- Le bouton des averses spontanées désactive les futurs épisodes ; une averse en
  cours se termine normalement, sauf si on choisit d'assécher.
- Les commandes de pluie déclenchent un épisode qui progresse avec les cycles :
  en pause, la pluie attend aussi. Une nouvelle commande remplace l'épisode en cours.

Les spores apparaissent en losanges de leur couleur de lignée, avec un anneau de
progression pendant les cycles favorables. Elles sont inspectables par clic.
Des traits bleutés matérialisent la pluie ; la chronique et les compteurs distinguent
plantes actives, spores, lignées dormantes, réveils et averses.

Vérification navigateur de cette itération, dans un jardin séparé : extinction des
plantes actives avec 19 spores et 11 lignées dormantes encore présentes après une
longue sécheresse ; une pluie générale a provoqué 23 réveils. La pluie terminée,
les plantes sont retournées en dormance. Ce n'est pas une preuve de coexistence
durable, mais la reprise sans introduction de nouveaux génomes est observable.

L'onglet initial de David n'a pas été rechargé, pour conserver son état non sauvegardé.
Le serveur sur le port 3000 était arrêté lors des vérifications. Un aperçu compilé
local distinct a donc servi sur `http://127.0.0.1:3001/miniJeux/?game=b17`.

## Itération : pesanteur, sol et nutriments

Direction validée par David : les greffes peuvent servir d'ancrage ; un corps dont
le bas disparaît doit retomber. La forme reste issue de la croissance, sans classes
imposées de racines ou de feuilles.

- Chaque cycle, un corps sans appui descend d'une case entière, sans déformation.
  On déplace toutes ses cellules, pas seulement la plus basse. Le sol est la
  dernière ligne ; un autre tissu situé juste dessous peut aussi porter le corps.
- Les plantes reliées par des greffes forment un ensemble solidaire : un seul
  appui retient l'ensemble, même une plante suspendue latéralement. Si l'ensemble
  tombe, les points de greffe suivent. Une rupture peut libérer un partenaire.
- Après plusieurs cycles de manque, une plante perd progressivement ses cellules
  les moins éclairées. Si cela coupe le corps, chaque morceau connexe devient
  autonome et peut tomber. Il conserve génome, lignée, génération et âge ; les
  réserves sont réparties selon la taille restante, la part du tissu perdu disparaît.
  Les greffes suivent le fragment portant leur cellule de contact ou se rompent
  si cette cellule disparaît. Une fragmentation n'est pas une naissance génétique.
- Les spores descendent elles aussi et doivent trouver quinze cycles favorables
  au même emplacement avant de germer.
- Une bande minérale occupe les 16 % inférieurs de la paroi, avec des variations
  horizontales indépendantes des fissures. Les nutriments sont prélevés localement
  et se reconstituent lentement ; ils coûtent à la construction, à l'entretien et
  à la production de graines. Un nouveau gène règle leur absorption.
- Les nutriments peuvent circuler par les greffes. Le contact porteur seul ne
  partage aucune réserve. Un partenaire exposé peut donc profiter d'un partenaire
  nourri par le bas, mais la conductance et les réserves minimales restent limitées.
- Le sol apparaît en brun, les flux minéraux en orange. La vue « Les nutriments »
  permet de lire les poches disponibles ; l'inspection donne réserves, prélèvements
  et état d'appui. Les pertes d'appui et fragments entrent dans la chronique.

Limites de ce premier essai : corps rigides, sans flexion, rotation ni résistance
mécanique calculée. Les contacts suffisent à porter un corps ; aucune structure de
racines prédéfinie. Dans cette première itération, le sol ne recyclait pas encore les tissus morts. Ce sont des
contraintes matérielles à observer, pas une garantie de diversité ou de coexistence.
Les mesures antérieures à cette itération décrivent l'ancien milieu.

Vérification de cette itération : 16 tests moteur passent, dont trois jardins
sur 2 500 cycles contrôlant occupation, filiation et points de greffe. Compilation
réussie avec les avertissements existants hors b17. Cinq essais supplémentaires
à 5 000 cycles donnent 4 à 12 lignées actives, 471 à 1 131 cellules et 51 à 118
fragments détachés. Ce petit échantillon ne valide pas une coexistence durable.
Dans un aperçu navigateur indépendant, au cycle 2 917 : 32 plantes, 8 lignées
actives, 9 greffes, 25 plantes directement au sol, 91 pertes d'appui cumulées
et 34 fragments. Inspection des nutriments et vue du sol vérifiées. L'onglet
initial n'a pas été rechargé ; l'aperçu compilé distinct est laissé en pause.


## Itération : une branche qui trouve l'eau doit nourrir son corps

Retour de David : les fissures favorisent excessivement les plantes nées dessus ;
une plante majoritairement en zone sèche a atteint une fissure après deux averses
mais est morte malgré ce contact. Son taux de survie estimé visuellement n'a pas
été mesuré ; le scénario exact du jardin n'est pas sauvegardé.

Reproduction contrôlée : corps connexe de dix cellules, neuf sur un fond sec et
une sur une source, sans concurrence, pluie, croissance ni reproduction. Avec
l'ancien débit, après 600 cycles, eau et énergie sont nulles. La réserve était
bien commune au corps ; la fissure se rechargeait seulement à 2,5 % du déficit
par cycle et le prélèvement était plafonné à 0,025–0,080 par cellule. En plus,
la photosynthèse consommait immédiatement l'eau cellule par cellule : une branche
placée en fin de liste ne nourrissait pas les premières dans le même cycle.
Une bonne photosynthèse pouvait vider la dernière goutte puis déclencher la
condition de détresse par manque d'eau, malgré une production d'énergie utile.

Ajustements dans le modèle existant, sans transport interne local nouveau :

- Contraste des réserves du milieu réduit : fond 0,30 au lieu de 0,12 ; fissures
  environ 0,90. Les deux tracés et les pluies restent en place. Pas de diffusion
  ajoutée à cette itération.
- Recharge des cases sous leur réserve cible : 2,5 % du déficit au loin, jusqu'à
  environ 20,5 % dans une fissure. Au-dessus de la cible, perte à 2,5 % : les
  averses ne disparaissent pas plus vite. Assécher ramène toujours la cible à zéro.
- Prélèvement héréditaire de 0,055–0,255 par cellule et cycle, limité par l'eau
  réellement disponible et la capacité du corps. Une cellule dans une fissure
  peut désormais nourrir plusieurs autres ; le débit n'est pas multiplié par la
  taille de la plante, et les voisines restent en concurrence.
- Tous les prélèvements précèdent la consommation. La photosynthèse se réduit
  quand l'eau est rare et conserve une petite réserve (0,06 + 0,006 par cellule).
  L'entretien continue à consommer de l'eau ; une pénurie peut donc encore tuer,
  directement ou par production d'énergie insuffisante.
- L'inspection affiche eau prélevée et eau utilisée par cycle pour lire le bilan.

Le corps d'essai à une branche humide tient maintenant 900 cycles avec ses dix
cellules et sans détresse ; son témoin tout sec disparaît. Après 600 cycles de
métabolisme seul, l'énergie atteint 19 et l'eau reste à 0,12, au lieu de zéro pour
les deux réserves. Cela prouve un sauvetage matériel dans ce cas, pas une survie
garantie pour toute taille, tout génome ou toute concurrence. La croissance peut
encore attendre un surplus d'eau ; survivre et construire ne coûtent pas pareil.

Validation : 20 tests moteur passent ; compilation réussie avec les avertissements
existants hors b17. Trois essais supplémentaires de 3 000 cycles gardent 8 à 10
lignées actives et 981 à 1 416 cellules. Les génomes initiaux restent aléatoires :
ce ne sont pas des statistiques de survie ni une comparaison appariée aux anciens
jardins. Inspection navigateur vérifiée dans un aperçu séparé, en pause au cycle
1 564 : le panneau indique eau prélevée, eau utilisée et échanges par greffes.
Le jardin initial de David n'a pas été rechargé.


## Itération : diversité génétique et floraison (10 octobre 2026)

Retour de David : trop de constantes communes et de schémas similaires ; varier
la résistance au manque d'eau et les besoins minéraux, rendre les naissances
visibles avec de petites fleurs inspirées de carbonifere14 (`b14`).

Trois nouveaux gènes indépendants, lus par `ADNHandler`, avec les douze positions
chromosomiques vérifiées sans collision :

- `b17Secheresse` : seuil hydrique de détresse 0,030 → 0,005 ; entretien hydrique
  réduit jusqu'à 60 % et eau par énergie réduite jusqu'à 30 %. Contrepartie :
  photosynthèse maximale réduite jusqu'à 25 %. La résistance n'immunise pas contre
  la pénurie d'énergie, le vieillissement ni le manque de minéraux.
- `b17Sobriete` : entretien minéral par cellule de 0,004 à 0,0015 ; construction
  de 0,34 à 0,12 ; réserve donnée à une graine de 0,45 à 0,20. Contrepartie :
  croissance tous les 4 à 9 cycles, les plus économes étant plus lentes. La
  capacité d'absorber les minéraux reste un autre gène (`b17Mineraux`).
- `b17Fertilite` : tentative tous les 180 à 70 cycles d'âge, avec une probabilité
  de 10 à 60 %. Les réserves restent nécessaires et sont transférées à la graine.
  Les tentatives suivent chaque plante plutôt qu'une horloge commune de 100 cycles.

La recharge minérale du sol passe de 1,2 % à 0,6 % du déficit par cycle. La ressource
reste renouvelable, mais le prélèvement, la construction et l'entretien peuvent
maintenant épuiser les réserves locales et le stock d'un grand corps. L'inspection
montre les trois traits, leurs seuils/coûts/rythmes et les minéraux consommés.

Une naissance réussie laisse une fleur sur une extrémité de la mère pendant
180 cycles (7,2 secondes à vitesse normale). Les pétales elliptiques disposés en
couronne reprennent l'idée graphique de `b14/plants/PlantRenderer.js`, avec une
couleur liée à la lignée ; leur nombre varie avec la fertilité et leur forme avec
la ramification. Une trace courbe et une graine animée relient la mère au descendant,
qui est créé immédiatement comme auparavant. C'est une animation de naissance,
pas un nouveau modèle de graine en vol, de maturation ou de pollinisation.
La fleur suit la gravité et le fragment portant son tissu, puis disparaît si ce
tissu meurt ; une tentative ratée n'affiche rien. Pause et vitesses agissent aussi
sur ces animations. Fleurs et naissances sont distinctes des réveils de spores.

Validation : les 25 tests moteur précédents et nouveaux passent, dont changement
réel du seuil de détresse par ADN, sobriété/coût de construction, fertilité,
transfert des réserves et fleur suivant une chute. Compilation réussie avec les
avertissements existants hors b17. Trois essais aléatoires de 4 000 cycles :
10 à 13 lignées actives, 530 à 875 cellules, 15 à 21 naissances et au maximum
2 à 5 fleurs simultanées. Certaines grandes plantes arrivent à un stock minéral
proche de zéro ; ces essais ne prouvent pas une diversité morphologique durable.
La vérification dans un navigateur n'a pas pu être réalisée dans cette session :
le navigateur intégré est indisponible et les permissions de contrôle de Chrome
ne sont pas accordées. Le serveur d'aperçu compilé local a été relancé sur le port
3001, sans rechargement d'un jardin de David.

## Itération : prospection et recyclage des morts (10 octobre 2026)

David souhaite que certaines plantes prélèvent dans les cases voisines, et que
les tissus morts qui tombent ainsi que les spores épuisées nourrissent le milieu.
Choix explicitement confirmé : **garder une faible recharge du sol et ajouter
le recyclage**, afin que le milieu ne dépende pas uniquement des morts.

- La recharge automatique est dans `stepResources()` : elle passe de 0,6 % à
  0,3 % du déficit par cycle, vers la richesse initiale `soil`. Les apports issus
  des débris peuvent dépasser cette richesse initiale sans disparaître à la
  recharge suivante. `soil` sert de cible à la source de fond, pas de plafond.
- Treizième gène, `b17Prospection`, lu par `ADNHandler` sans collision : à partir
  de 50 %, une cellule explore ses quatre voisines orthogonales. Elle prélève
  d'abord sous elle puis dans les cases voisines les plus riches. Le débit total
  par cellule reste le même (0,012–0,040 selon `b17Mineraux`) et la capacité du
  corps limite toujours l'extraction. Le prélèvement éloigné coûte 0,15 énergie
  par unité minérale. C'est le champ du milieu qui est exploité, y compris les
  poches disputées, sans prélèvement dans les réserves internes d'un voisin.
- Les minéraux investis dans la construction restent enregistrés dans la cellule.
  La perte d'une cellule restitue cette matière plus sa fraction de réserve libre.
  À la mort d'un corps, les réserves des spores sont prélevées dans son budget
  minéral réel ; le reste est réparti en débris sur les anciens emplacements.
  Les plantes fondatrices commencent avec 0,12 de minéraux dans leur tissu initial.
  Les graines et germinations transfèrent leurs réserves sans nouveau bonus minéral.
- `stepDetritus()` fait descendre les débris d'une case par cycle jusqu'au sol ou
  jusqu'à un tissu porteur. Chaque cycle, 0,6 % de leur matière devient nutriment
  disponible à leur emplacement. Les débris ne bloquent pas la croissance.
- Une spore dont l'énergie est épuisée rejoint les débris avec ses minéraux
  restants. Une spore qui germe transfère ces mêmes minéraux au nouveau corps :
  aucun second dépôt. Une longue attente défavorable ne suffit pas à supprimer
  arbitrairement une spore tant que ses réserves permettent la dormance.
- Poussière ocre sur la paroi pour les débris, quantités de débris et minéraux
  recyclés dans les compteurs. L'inspection indique la prospection et le débit
  réellement prélevé à distance. La vue nutriments montre les apports disponibles.

L'entretien minéral reste une consommation et la recharge du substrat une source :
il ne s'agit pas d'un monde strictement fermé. Les tests vérifient la conservation
lors des transformations tissu/spore/débris et lors de la germination, séparément
ces flux d'entretien et d'alimentation. Aucune fonte instantanée de tous les morts
ni fertilisation globale : les apports restent localisés et progressifs.

Validation : 32 tests moteur passent, dont pompage héréditaire, budget d'extraction
non multiplié par les voisines, chute/décomposition et absence de double compte
entre tissu, spores, réserves et débris. Compilation réussie avec les avertissements
existants hors b17. Le contrôle visuel dans un navigateur reste non effectué :
les permissions de contrôle ne sont pas accordées dans cette session. David avait
confirmé apprécier les fleurs et trajectoires de naissance de l'itération précédente.

## Ce qu'il faut juger avec David

Commencer avec quelques plantes sur une paroi en coupe contrastée, pour vérifier une seule
boucle : **croissance → contact → greffe → échange → changement de conditions → rupture**.

Le proto inclut déjà reproduction, mutations et concurrence entre descendants.
Cette présence ne suffit pas à démontrer une évolution intéressante. Vérifier si
les formes se distinguent, si les greffes changent vraiment le destin des plantes,
et si les flux se comprennent visuellement avant d'ajouter de nouvelles capacités.

Critère de réussite : David peut suivre deux plantes, comprendre pourquoi elles
se relient et constater ce que la connexion ou sa rupture change pour chacune.
Un gros amas stable ou une jolie courbe de population ne suffit pas.

## Pistes après retour sur le prototype

- Transport interne local et différenciation des cellules, si les échanges entre
  plantes montrent déjà un intérêt observable.
- Adapter les conditions de greffe et rupture selon ce que raconte la paroi.
- Évaluer la reproduction et la diversité des formes sur des observations plus longues.

La défense et l'attaque collectives sont des pistes ultérieures, pas un préalable
au premier prototype. La paroi, les formes issues des règles et l'usage d'ADNHandler
sont désormais des décisions prises : ne pas redemander ces choix à la reprise.

Ne pas décider silencieusement entre plusieurs voies ayant des conséquences sur
l'expérience. En revanche, suivre les recettes existantes du projet pour les détails
ordinaires d'interface et d'organisation.

## Organisation légère

Le découpage moteur indépendant de React / interface suit b15 et b16 :

- `B17.jsx` : interface, boucle `setInterval`, commandes et inspection.
- `engine/Jardin.js` : milieu, plantes, croissance, greffes, reproduction et chronique.
- `engine/gravite.js` : chute des corps et ensembles greffés, appuis et spores.
- `engine/Jardin.test.js` : vérifications ciblées du moteur.
- `ui/dessiner.js` : rendu du milieu, des plantes et des flux.
- `../gameData.jsx` : entrée dans le catalogue existant.

La prochaine session doit reprendre ce document et le retour de David sur le proto.
Ne pas construire un jeu complet d'un coup.
Ne pas ajouter de régulation démographique, de repeuplement automatique ou de
catastrophes périodiques pour garantir artificiellement l'animation du monde.
L'extinction et la convergence restent des issues possibles, à comprendre.
