
export const TYPES_ECHEANCE = {
  municipales:    { nom: 'Élections municipales' },
  regionales:     { nom: 'Élections régionales' },
  legislatives:   { nom: 'Élections législatives' },
  senatoriales:   { nom: 'Élections sénatoriales' },
  presidentielle: { nom: 'Élection présidentielle' },
};

// Un exemple de calendrier de partie (tours = semaines, à ajuster librement)
export const CALENDRIER = [
  { tour: 4,  type: 'municipales' },
  { tour: 8,  type: 'regionales' },
  { tour: 14, type: 'legislatives' },
  { tour: 20, type: 'senatoriales' },
  { tour: 30, type: 'presidentielle' },
];
