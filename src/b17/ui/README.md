# Interface de b17

Lire d'abord [SCOTTY_B17.md](../SCOTTY_B17.md).

`dessiner.js` dessine les plantes et les flux sur un canvas. Les contrôles et
l'inspection sont dans `../B17.jsx`. Le prototype est enregistré dans le catalogue,
avec un accès direct par `?game=b17`.

Priorité du premier prototype : distinguer les plantes et leurs lignées, voir les
points de greffe, les flux et les ruptures, puis comprendre leurs conséquences.
La vue sera une paroi en coupe permettant de lire la concurrence pour la lumière
en hauteur. Le rendu doit montrer les formes produites par la croissance locale,
sans imposer de silhouettes aux plantes. On peut mettre en pause, accélérer,
inspecter une plante ou une spore, afficher l'eau ou la lumière et assécher la paroi.

Les spores sont des losanges colorés. Un anneau montre leur progression vers la
germination. Les pluies sont visibles sur la paroi et dans la chronique : averses
spontanées désactivables, pluie générale et averse locale déclenchables.

Le bas de la paroi est un sol brun riche en nutriments, avec une vue dédiée. Les
flux orange montrent les échanges minéraux. Les flèches près des identifiants
signalent la chute ; l'inspection distingue chute, contact au sol et soutien.

Une naissance laisse une fleur à pétales sur la mère, avec une graine animée et
un anneau autour du descendant. La fleur s'efface après 180 cycles. L'inspection
affiche les nouveaux traits ADN, leur effet concret et le bilan minéral par cycle.

Les débris morts apparaissent en poussière ocre qui tombe et se décompose. Les
compteurs distinguent matière encore en débris et minéraux déjà recyclés ;
l'inspection affiche le trait de prospection et les prélèvements à distance.
