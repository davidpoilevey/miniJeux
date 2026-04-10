// utils/savegame.js

const SAVE_KEY = "civ_savegame";

export function saveGame(state, saveKey) {
  try {
    localStorage.setItem(saveKey||SAVE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error("Erreur lors de la sauvegarde :", e);
    return false;
  }
}

export function loadGame(saveKey) {
  try {
    const data = localStorage.getItem(saveKey||SAVE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Erreur lors du chargement :", e);
    return null;
  }
}

export function clearSave(saveKey) {
  localStorage.removeItem(SAVE_KEY);
}
