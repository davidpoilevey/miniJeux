# Bactérie 16 — les marcheurs

À lire avant de toucher à `src/b16/`. Un simulateur zéro joueur : des corps (os, muscles, griffes)
évoluent pour aller le plus loin possible vers la droite en `duree` secondes.

## Le modèle

- **Corps** = jusqu'à 8 nœuds + arêtes (os rigides ou muscles oscillants). Lu **une fois** à la
  naissance par `engine/corps.js`, seul endroit qui lit l'ADN (`ADNPlante.js` tel quel).
- **Gènes** : 169 clés (`rythme`, 7 par nœud, 4 par paire de nœuds). Les clés sont rendues
  **sans collision** au chargement : on sonde l'emplacement `hashString % 400` de chaque clé
  avec deux ADN « règle graduée » et on suffixe `~k` si l'emplacement est pris. Ajouter un
  gène = l'ajouter à `NOMS`, rien d'autre (mais ça décale les suffixes : les sauvegardes
  d'avant se liront différemment).
- **Physique maison** (`engine/Creature.js`) : Verlet + projection de contraintes (PBD),
  3 sous-pas × 4 itérations, dt 1/60. Déterministe : un champion rejoué refait exactement
  sa distance (vérifié). C'est ce qui permet les élites et le replay.
- **Piste** (`engine/terrain.js`) : Plaine → Dunes (8 m) → Glace (16 m) → Cailloux (23 m) →
  Côte (36 m) → Sommets (55 m). Chaque zone a une `adherence` qui multiplie le frottement de
  tous les nœuds, griffes comprises : plaine 1, sable 0.6, glace 0.15, cailloux 1.4, neige 0.5.
  La glace était d'abord à 31 m : jamais atteinte (plateau vers 21–25 m dans les Cailloux).
  Avant les Cailloux, elle est atteinte vers la génération 16–33.
- **Griffe = crampon** : sortie, elle garde μ = 2.5 quelle que soit l'adhérence de la zone
  (rentrée, elle glisse comme le reste). Glace traversée en 10 à 20 générations (contre 25 à 50
  sans crampon), records de 30 à 36 m à la génération 100, champions à 2–3 griffes.
- **Contrôle** : un oscillateur par corps (`rythme` → fréquence), une phase et une amplitude
  par muscle et par griffe. Pas de réseau de neurones.
- **Fitness** = déplacement du centre de masse après l'échauffement, moins un petit coût de
  l'effort (amplitude × force × battements).
- **Espèce** = lignée généalogique de même **plan** (nombre de nœuds et de griffes). Une
  mutation qui change le plan fonde une espèce fille (une seule par mère et par plan).
- **Sélection** : élites (le n°1 + le meilleur d'autres espèces), tournoi sur fitness
  partagée (`f / taille_espèce^partage`), croisement intra-espèce seulement, immigrants.

## Exploits rencontrés (ne pas les réintroduire)

1. **Griffe = épingle** (le nœud fixé au sol, masse infinie) : ver arpenteur parfait dès le
   hasard (1 m/s en génération 1). La griffe est maintenant un frottement très fort
   (μ = 2.5, sortie) / très faible (0.08, rentrée), donc elle doit **porter du poids**.
2. **Frottement sur la vitesse seulement** (on corrigeait `ox/oy`) : les projections des
   muscles déplacent les nœuds sans aucune résistance, le sol est une patinoire. Le
   frottement est appliqué **sur le déplacement du sous-pas**, plafonné par μ × appui
   (appui = correction normale du sol cumulée), à la Müller.
3. **Muscles d'une force infinie** (PBD cinématique) : une jambe qui se tend contre le sol
   catapulte le corps. La correction d'un muscle est plafonnée à `forceMuscle × force × Σw × h²`.
   À 80 N les corps rampent à plat ; à 150 N ils se tiennent debout, sans catapulte.
4. **Muscle contre os** : un muscle dont la longueur est déjà imposée par les os vibrerait.
   Détecté à la naissance (rang de la matrice de rigidité) et atrophié (pointillés gris).
5. **Espèce = morphotype exact** (nœuds·os·muscles·griffes) : chaque muscle gagné fonde une
   espèce, le diagramme des lignées devient du bruit. D'où le plan grossier + la généalogie.

Garde-fous restants : vitesse plafonnée à 8 m/s, disqualification si le centre de masse
dépasse 2,5 m au-dessus du sol (« catapulte ») ou si un nombre devient NaN.

## Ce qu'on observe (pop. 100, réglages par défaut)

- Génération 1 : médiane 0 m (presque tout le monde gigote sur place), quelques chanceux à 3–10 m.
- Génération 10 : 12–20 m, le peloton entier se met en route (la médiane décolle).
- Génération 40–60 : 20–30 m, puis plateau. 10 à 20 espèces coexistent.
- Coût : ~200 ms par génération en Node (100 créatures × 15 s).

## Catalogue et course des champions

Une partie converge vers une seule famille (exclusion compétitive : une piste, un critère,
100 individus). Mais deux parties ne convergent pas vers la même : chaque partie est une île.
Le **catalogue** (localStorage `bacterie16-catalogue`, export/import JSON) garde les champions
d'une partie à l'autre ; la **course des champions** les remet tous en contact.

- Génération 1 = un exemplaire de chaque fiche, chacun fondateur de son espèce (clé
  `fondateur{i}>plan`, nom et teinte de la fiche). Les espèces filles gardent la teinte de
  leur lignée, décalée.
- La population grandit de ×`croissance` par génération jusqu'à `population`.
- **Brassage (essaim hybride)**, tant que les fondateurs vivent (`vieFondateurs`, 5) et au moins
  jusqu'à ce que la population soit pleine : pas de sélection. Tous ceux qui avancent ≥ 1 m ont
  le même nombre d'enfants, tous hybrides (partenaire au hasard, introgression `brassage` 0.2).
  Les fondateurs traversent ces générations tels quels, puis meurent (⚰️) : seuls leurs gènes
  restent. Ensuite, sélection normale, croisements libres entre espèces (`introgression` 0.1).
  Le meilleur hybride du brassage n'est pas protégé : on le retrouve dans la galerie.
- **Pourquoi** : avec une sélection classique dès le départ, le meilleur fondateur fait 85–96 %
  du sang à G100 (1 ou 2 fondateurs survivants). Mesuré sur 8 champions (23–34 m), 3 runs
  par variante : brassage sans tri à 30 % → 7–8 fondateurs présents à G100 mais creux à
  8–13 m et remontée lente ; brassage des actifs à 20 % (retenu) → creux à 20–30 m, records
  36–49 m, 3–6 fondateurs encore ≥ 5 %, vraies mosaïques (« Doplo 57 % · Zimuki 24 % · Torplo 10 % »).
  Environ un run sur trois ne repasse pas le record des fondateurs en 100 générations.
- **Introgression** plutôt que `recombinaisonGenetique` pour croiser deux champions : l'enfant
  garde le corps du premier parent et reçoit une part des gènes du second, entiers. Avec le
  croisement de la bible (moitié-moitié, nucléotides mêlés), aucun hybride F1 n'atteint 90 %
  de son parent (médiane 0 m) et aucun hybride ne prend jamais la tête. La greffe d'un membre
  entier (nœud + ses arêtes) a été essayée : quasi neutre. En partie normale, le croisement
  reste celui de la bible (intra-espèce).
- Le record des fondateurs (mesuré à G1 sur cette piste) est tracé en pointillé sur la courbe
  de progrès ; 🌟 dans la chronique quand un descendant le bat.
- `heritage` : par individu, la part de sang de chaque fondateur (moyenne pondérée au
  croisement). Courbe « Sang des fondateurs », chronique 🪦 quand un sang disparaît, ascendance
  notée dans la fiche d'un champion gardé.
- Une fiche note les réglages physiques de sa partie (⚠ dans le catalogue s'ils diffèrent).

## Architecture

```
b16/
  Bacterie16.jsx       racine : thème, état UI, sauvegarde/chargement
  engine/params.js     DEFAULT_PARAMS + PARAM_GROUPS (sliders du tiroir)
  engine/corps.js      ADN → corps (clés sans collision, greffes, rigidité, plan)
  engine/Creature.js   physique d'un corps (PBD + Coulomb)
  engine/terrain.js    piste pré-échantillonnée, ZONES = paliers
  engine/Evolution.js  course, classement, sélection, espèces, chronique, Replay
  ui/dessin.js         tout le dessin canvas, en fonctions pures
  ui/Piste.jsx         boucle rAF (direct, turbo ou replay)
  ui/Galerie.jsx       portraits des champions (clic = replay)
  ui/Courbes.jsx       progrès (meilleur / médiane) + lignées (Muller simplifié)
  ui/fiches.js         catalogue des champions (localStorage, noms « Bupa II »)
  ui/CatalogueChampions.jsx  la fenêtre du catalogue (replay, suppression, course)
  ui/Panneau.jsx, ui/Reglages.jsx
```

⚠ macOS ne distingue pas la casse : `Catalogue.jsx` + `catalogue.js` dans le même dossier
cassent la résolution webpack (et le cache du serveur de dev s'en souvient).

**Tester sans navigateur** : copier `engine/` et `genetic/ADNPlante.js`, ajouter `.js` aux
imports, `{"type":"module"}`, puis `new Evolution()` et `while (ev.generation <= 40) ev.pas()`.
Juger sur image (chronophotos des champions) et pas seulement sur les distances : les deux
premiers exploits avaient de très beaux chiffres.

## Pistes ouvertes

- Réflexe simple (muscle modulé par le contact d'un pied ou l'inclinaison du corps) pour
  franchir les Cailloux, où les oscillateurs aveugles plafonnent.
- Plateau après ~50 générations : essayer des mutations graduelles (`readFloatGray`, voir
  `b15/bacterie15.5.md`) plutôt que de monter le taux.
