// Registre des destinations (tenu par F). Chemins relatifs à la racine de www.poilevey.org.
// type : public (une porte, une adresse) · prive (connexion demandée par le service)
//        choix (plusieurs adresses derrière la porte) · gag (on frappe, rien ne s'ouvre)
export const destinations = {
  maison: {
    label: 'La maison', type: 'choix', bubble: 'Bienvenue chez nous !',
    links: [
      { label: 'Le CV de Rodolphe', url: 'https://rodolphe.poilevey.org/' },
      { label: 'Le jardin de Séverine', url: 'https://bdd.poilevey.org/' },
    ],
  },
  pivot: { label: 'Maison Pivot', type: 'public', url: './seuil/?lieu=pivot' },
  biblio: { label: 'La Bibliothèque', type: 'public', url: './nouvelles/' },
  arcade: { label: 'Arcade', type: 'public', url: 'https://davidpoilevey.github.io/miniJeux/' },
  garage: { label: 'Garage', type: 'public', url: './garage/' },
  poste: { label: 'Poste · livre d’or', type: 'public', url: './poste/' },
  usine: { label: 'Usine · bureau d’embauche', type: 'public', url: './assets/cv-david-poilevey.pdf' },
  banque: {
    label: 'Banque', type: 'prive', bubble: 'Vos papiers, s’il vous plaît !',
    links: [
      { label: 'Hub familial', url: 'https://ezio.poilevey.org/' },
      { label: 'Vault', url: 'https://vault.poilevey.org/' },
      { label: 'Paperless', url: 'https://paperless.poilevey.org/' },
    ],
  },
  studio: { label: 'Studio photo', type: 'prive', url: 'https://photos.poilevey.org/' },
  winstub: { label: 'Winstub', type: 'gag', lines: ['Complet ce soir !', 'Toujours complet. Revenez pour la tarte flambée.', 'Même pour vous, c’est complet.'] },
  boulangerie: { label: 'Boulangerie', type: 'gag', lines: ['Fermé. Partie livrer les bretzels.', 'Revenez demain, il y aura du kougelhopf.', 'Toc toc… Personne. Ça sent bon pourtant.'] },
  dojo: { label: 'Dojo', type: 'gag', lines: ['Fermé. Chuck Norris s’entraîne.', 'Chuck Norris n’ouvre pas les portes. Elles s’excusent.', 'Vous insistez ? Bon. Vous l’avez mérité.'], finale: './dojo/' },
};

// Les adresses derrière une porte (une seule pour la plupart).
export function linksOf(id) {
  const d = destinations[id];
  if (d.links) return d.links;
  return d.url ? [{ label: d.label, url: d.url }] : [];
}
