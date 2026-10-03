// Chaque .json de ce dossier est un niveau, nommé d'après son fichier.
// Pour en ajouter un : déposer le fichier ici, c'est tout.
const files = require.context('./', false, /\.json$/);

export const LEVELS = files
  .keys()
  .filter((k) => k.startsWith('./'))   // webpack liste parfois aussi les chemins absolus
  .map((k) => ({ name: k.slice(2, -5), layout: files(k) }))
  .sort((a, b) => (a.name === 'default' ? -1 : b.name === 'default' ? 1 : a.name.localeCompare(b.name)));

export const getLevel = (name) => LEVELS.find((l) => l.name === name) ?? LEVELS[0];
