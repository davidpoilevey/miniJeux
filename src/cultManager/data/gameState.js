
// Données initiales du jeu
const adepteDeBase={
      name: 'John Doe',
      devotion: 10,
      wealth: 1000,
      sanity: 100,
      suspicion: 0,
      trait: 'curieux',
      joinedDay: 1,
    }
export const initialGameState = {
  day: 1,
  treasury: 1000,
  notoriety: 10,
  heat: 5,
  followers: [
    { ...adepteDeBase, id: 1 },
  ],
  revelations: [],
  events: [],
  recruitmentSessionUsed: false, 
};
