# Bactérie 15.5 — l'esprit de la gélose

À lire avant de toucher à `src/b15/`. Ce fichier existe pour qu'une autre instance
(ou David dans six mois) reprenne le fil sans refaire toute l'analyse.

## La série et ce qu'elle cherche

- Les « Bactéries » sont des jeux **à zéro joueur** : on regarde, on ne joue pas.
  Dans `gameData.jsx`, ce sont les jeux taggés `zeroJoueur` + `bacterie`
  (Bacterie 2.0, Bactery, Sprouts, Mee, Ecosysteme b8, b9 → b14…). Bact Inc est à part
  (jeu de gestion).
- Le but n'est **pas d'optimiser un trait** : on cherche un **équilibre écosystémique**
  qui émerge de la sélection naturelle. La référence d'esprit, c'est le jeu de la vie
  de Conway : une règle simple qui donne de la complexité.
- **L'ADN est sacré** : `src/genetic/ADNPlante.js` (`ADNHandler.readFloat/readBool`,
  `randomGenome`, `mutationADN`, `recombinaisonGenetique`) s'utilise **tel quel**.
  Les améliorations se proposent à part, sans casser la compatibilité (voir en bas).

## Pourquoi les épisodes 1 à 14 n'ont pas « émergé »

Synthèse de l'audit d'octobre 2026 :

1. **Le génome règle des curseurs, jamais des règles.** Les comportements étaient des
   cascades codées en dur (fuite > faim > accouplement > errance) ; l'ADN n'en réglait
   que les seuils.
2. **Les capacités se choisissaient dans un menu** (b9/b10 : composants hérités par
   `Math.random()`, b11 : organes à seuil). Plus on ajoutait de systèmes
   (19 dans b9), plus la complexité était écrite par l'auteur au lieu d'émerger.
3. **L'hérédité était faible ou cassée** : mutation à 5–15 %, clones au départ (b12),
   recombinaison sans mutation, hérédité écrasée (Aquarium), élitisme inversé (PetriBox).
4. **Le monde n'avait pas de mémoire** : ressources ramenées à un potentiel fixe,
   aucune trace laissée par les organismes (sauf Sprouts).
5. **L'équilibre tenait par la main de l'auteur** : respawns, Thanos, repeuplement
   sous un seuil, bonus sous `minPop`.

Ce qui crée l'émergence ailleurs dans le repo (Bubulle, Fourmiz, Conway) : des règles
locales identiques pour tous, des interactions **agent ↔ trace ↔ agent**, des
rétroactions dans les deux sens, et aucun régulateur externe.

## Le modèle : une gélose, une règle

**Monde** : grille torique de 200×125. **Au plus une bactérie par case.** Cette
exclusion est indispensable : sans elle, rien ne s'organise (voir Impasses).

**Chimie** (champs `Float32Array`, diffusion 4 voisins et évaporation) :

| Champ | Rôle |
|---|---|
| A sucre | repousse vers une capacité locale (fertilité = 3 ondes qui dérivent : le climat) |
| B acide | produit quand on mange A |
| C déchet | produit quand on mange B, et à la mort (nécromasse) |
| T toxine | colicine sécrétée par les tueuses |

**La règle unique**, appliquée à chaque tick et dans un ordre aléatoire :

1. Calculer son humeur : des poids interpolés entre « affamée » et « repue » selon l'énergie.
2. Manger sur sa case ce que ses enzymes digèrent. A donne B, B donne C, C ne donne rien.
   Les déchets des uns sont le repas des autres.
3. Sécréter de la toxine (si la bactérie en produit) et encaisser celle des voisines,
   selon sa protection.
4. Faire le bilan énergétique, et mourir si besoin (en laissant du C).
5. Se diviser dans la **meilleure case voisine libre**, ou ne pas se diviser du tout
   (inhibition de contact).
6. Sinon, se déplacer vers une case voisine qui « sent meilleur ».

Les bactéries **ne se voient jamais entre elles** : tout passe par la chimie (stigmergie).

### Les 18 gènes (`engine/phenotype.js`)

Le phénotype est lu **une seule fois à la naissance**. Les noms de clés ont été choisis
pour **n'avoir aucune collision** de `hashString % 400`. Si tu ajoutes un gène, vérifie
les collisions : la probabilité d'en avoir une dépasse 30 % dès 18 clés. Deux collisions
ont déjà été évitées : `angleCapteur`/`enzymeC` et `resistance`/`mobilite`.

- `enzymeA/B/C` : le régime. Le coût est en (somme)², ce qui pousse à la spécialisation.
  La guilde affichée est l'enzyme dominante : Brouteurs, Recycleurs ou Fossoyeurs.
- `faimA/B/C/T` et `repuA/B/C/T` : chimiotactisme à deux humeurs, une vraie règle
  condition → action.
- `toxine` (filtré par `readBool`, valeurs dans [0, 1)) et `immunite` (la résistance) :
  la colicine.
- `porteeCapteur`, `mobilite` (au cube : biais sédentaire), `errance`.
- `seuilDivision`, `longevite`.
- `teinte` : **marqueur neutre**, sans aucune pression de sélection. Il dérive et trace
  les lignées. Il sert aussi de reconnaissance sexuelle (`compatibilite`). Une mutation
  du premier nucléotide fait donc naître une espèce isolée d'un coup.

### Ce qui émerge (sans être codé)

- **Guildes et succession** : les Brouteurs sont au front, les Recycleurs les suivent,
  et les Fossoyeurs vivent dans les cœurs morts.
- **Pierre-feuille-ciseaux chimique** (comme les colicines d'*E. coli*, Kerr et al.
  2002). Tueuse > Sensible > Résistante > Tueuse. Le cycle naît **uniquement de l'ordre
  des coûts** (`coutToxine` > `coutResistance` > 0). La dispersion locale (exclusion et
  sédentarité) le transforme en domaines spatiaux qui se poursuivent. La chronique compte
  les tours de manège.
- **Dérive des lignées**, secteurs de couleur et isolement reproductif (mode Lignées).
- **Écotypes** : sédentaires en tapis sur les oasis, nomades dans les déserts.

## Le bouton principal : gaz ↔ cristal

`regenA` règle la densité supportable. Une case doit pouvoir nourrir à peu près une
bactérie, sinon on obtient un gaz.

- À 0.0012–0.003, c'est un **gaz** : bactéries clairsemées, aucune structure.
- Autour de 0.0045–0.006, on est dans la **zone vivante**.
- Au-delà, c'est un **cristal** : tapis saturé qui ne se renouvelle qu'à la mort.

C'est la même idée que la classe IV de Conway : chercher la frontière.

## Milieux prêts à l'emploi (`MILIEUX` dans `params.js`)

David aime chambouler la boîte en cours de route. Un milieu = des écarts à `DEFAULT_PARAMS`,
versés **à chaud** (pas de reset) : on regarde la population s'adapter. Réglés sur image en
Node (7 500 ticks) ; le récit affiché décrit ce qui a été **observé** :

- **Gélose** : le réglage par défaut, le manège en domaines.
- **Pauvre** (regenA 0.005, toxine chère, nécromasse 1) : les tueuses se ruinent, sensibles
  en paix dans les oasis, les trois armes en bandes clairsemées. Écarté : recyclage parfait
  (rendements B/C = 1), qui rend le milieu riche et donne 14 000 bactéries.
- **Riche** (regenA 0.01, dégâts 0.2, toxine et armure plus chères) : mer de résistantes,
  fronts de tueuses qui se déplacent, poches mortes. Écarté : riche avec une toxine bon
  marché, qui fige 80 % de tueuses (cristal).
- **Extrême** : **saisons** (`saisonRigueur`, `saisonPeriode`) = onde carrée sur la repousse
  de A. L'hiver tue environ 99 %, une lignée traverse le goulot et repeuple tout. La chronique
  annonce hivers et printemps.

« Défenses communes » n'émerge pas : le modèle n'a aucun bien public (impasse n° 2). La
mutualisation qui existe, c'est la chaîne A → B → C entre guildes.

## Impasses déjà explorées (ne pas les refaire)

1. **Continu façon Physarum** (agents sans volume, capteurs angulaires) : un gaz
   homogène quel que soit le réglage. Chacun fuit les zones broutées, ce qui disperse
   tout.
2. **Signal de quorum** (la digestion multipliée par un signal partagé) : bien commun
   pur, les tricheurs gagnent, le signal disparaît toujours. Sa portée de diffusion
   (√(D/évap)) était aussi d'environ 1 case, donc inutilisable par les capteurs.
3. **Grille avec gélose pauvre** : l'exclusion ne joue jamais, on retombe sur un gaz.
4. **Grille riche sans interaction** : le motif ne fait que recopier la carte de
   fertilité (c'est l'environnement qui dessine, pas l'auto-organisation).
5. **Toxine sans immunité couplée** : les tueuses s'empoisonnent elles-mêmes et
   disparaissent. L'immunité vaut maintenant `résistance + 2 × toxine`.
6. **Absorption × facteur > 1** : la bactérie mange plus que ce que contient la case,
   et les champs deviennent négatifs (pixels noirs).

## Architecture

```
b15/
  Bacterie15.jsx        racine : thème sombre, état UI, recrée la Soupe au reset
  engine/params.js      DEFAULT_PARAMS + PARAM_GROUPS (sliders)
  engine/phenotype.js   ADN → phénotype (seul endroit qui lit l'ADN)
  engine/Soupe.js       moteur pur, sans React ni DOM : step(), stats, chronique
  ui/peindre.js         champs + bactéries → buffer RGBA (pur, testable en Node)
  ui/Gelose.jsx         canvas : boucle rAF, step × ticksParFrame, clic → inspection
  ui/Panneau.jsx        contrôles, barres, courbes, inspecteur de génome, chronique
  ui/Courbes.jsx        aires empilées (guildes ou armes) + lignées effectives
  ui/Reglages.jsx       Drawer : sliders appliqués à chaud dans soupe.params
```

- Aucune entité ne transite par le state React. Les stats remontent à 4 Hz.
- Coût mesuré en Node : environ 1,5–2,5 ms par tick pour 10 à 17 000 bactéries.
- **Tester sans navigateur** : copier `engine/` et `ui/peindre.js`, ajouter les
  extensions `.js` aux imports, puis lancer la Soupe en Node et écrire des PNG. C'est
  ainsi que tous les réglages ont été trouvés. Juger **sur image**, pas sur les chiffres :
  « 3 guildes coexistent » peut très bien être un gaz.

## Propositions pour la bible ADN (non appliquées, à valider par David)

- **Perf** : `mutationADN` recopie les 400 chromosomes à chaque naissance. Comme
  personne ne mute un chromosome en place, on pourrait réutiliser la référence des
  chromosomes non mutés (copie à l'écriture), soit environ 95 % d'allocations en moins
  à 1 %. À vérifier d'abord par grep sur tout le repo.
- **Lissage du paysage adaptatif** : `tableauVersDecimal` pondère le premier nucléotide
  à 64/255, donc une mutation peut faire sauter un trait de ±0,75. Un `readFloatGray(key)`
  (code de Gray, ou moyenne des 4 nucléotides) ajouté **à côté** de `readFloat`
  donnerait des mutations graduelles sans rien casser.
- **Collisions** : exposer `keyIndex(key)` pour que chaque jeu puisse vérifier ses
  collisions au démarrage (b13 et b14 en ont de graves : longévité = teinte).
- **Diversité** : `TAUX_MUTATION = 0.05` donne environ 14 % de chance de changement par
  gène et par génération, trop pour accumuler des adaptations. 15.5 passe 0.01 via
  le paramètre `mutationADN(adn, taux)`.

## Pistes ouvertes (non codées)

- Phages : un 5e champ de virus qui lyse les bactéries denses et monoclonales
  (« kill the winner »), comme pression pour la diversité.
- Spirales : chercher des réglages de colicine (dégâts, portée) qui produisent des
  spirales nettes plutôt que des domaines.
- Persistance façon b14 (serveur et PocketBase) pour laisser une gélose vivre des
  semaines.
