// La sauvegarde : l'argent et les viseurs achetés survivent d'une partie à l'autre (et à la fermeture de l'onglet)

export const START_MONEY = 100; // de quoi s'offrir les deux viseurs les moins chers, et pas un de plus
export const SAVE_KEY = 'doomlike-save';
export const loadSave = () => {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s) return s;
  } catch { /* sauvegarde illisible : on repart de zéro */ }
  return { money: START_MONEY, owned: ['classique'], crosshair: 'classique' };
};
export const storeSave = (s) => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch { /* tant pis */ } };
