import { adnVersTexte } from '../engine/corps';

// Le catalogue des champions : ceux qu'on a décidé de garder, d'une partie à l'autre.
// Une fiche = un génome en texte + de quoi l'afficher sans relancer la partie d'origine.

const CLE = 'bacterie16-catalogue';
const ROMAINS = ['', ' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII', ' IX', ' X'];

// Les réglages qui changent la physique : un champion élevé avec d'autres valeurs peut s'effondrer
export const PARAMS_PHYSIQUES = ['forceMuscle', 'gravite', 'freqMin', 'freqMax', 'ampliMax'];

export const lireCatalogue = () => {
  try { return JSON.parse(localStorage.getItem(CLE)) || []; } catch { return []; }
};

export const ecrireCatalogue = (fiches) => {
  localStorage.setItem(CLE, JSON.stringify(fiches));
  return fiches;
};

// Les noms d'espèce sont tirés de leur numéro : deux parties ont souvent un « Bupa ».
// Au catalogue, le second devient « Bupa II ».
const nomLibre = (base, fiches) => {
  const pris = new Set(fiches.map((f) => f.nom));
  for (let k = 0; k < 100; k++) {
    const nom = base + (ROMAINS[k] ?? ` ${k + 1}`);
    if (!pris.has(nom)) return nom;
  }
  return `${base} ${Date.now()}`;
};

// Renvoie [catalogue, fiche ajoutée | null si ce génome y est déjà]
// ascendance : « Zimuki 80 % · Vimo 11 % » pour un enfant de la course des champions
export const ajouterAuCatalogue = (fiches, champion, espece, params, ascendance = '') => {
  const adn = adnVersTexte(champion.adn);
  if (fiches.some((f) => f.adn === adn)) return [fiches, null];
  const fiche = {
    id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    nom: nomLibre(espece.nom, fiches),
    adn,
    distance: champion.distance,
    generation: champion.generation,
    morphotype: champion.corps.morphotype,
    // Teinte propre à la fiche (angle d'or) : les fondateurs d'une course ne se confondent pas
    teinte: (fiches.length * 137.508 + 40) % 360,
    date: new Date().toISOString(),
    params: Object.fromEntries(PARAMS_PHYSIQUES.map((k) => [k, params[k]])),
  };
  if (ascendance) fiche.ascendance = ascendance;
  return [ecrireCatalogue([...fiches, fiche]), fiche];
};

// Fusion d'un catalogue importé : les génomes déjà présents sont ignorés, les noms dédoublonnés
export const fusionnerCatalogue = (fiches, importees) => {
  let res = [...fiches];
  importees.forEach((f) => {
    if (!f.adn || res.some((g) => g.adn === f.adn)) return;
    res.push({ ...f, nom: nomLibre(f.nom.replace(/ [IVX]+$/, ''), res) });
  });
  return ecrireCatalogue(res);
};

export const physiqueDifferente = (fiche, params) =>
  PARAMS_PHYSIQUES.filter((k) => fiche.params && fiche.params[k] != null && fiche.params[k] !== params[k]);
