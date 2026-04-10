
export const shuffle = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

export const specialCards = ['+2', 'inversion', 'passeTonTour'];
export const specialCardsNoColor = ['joker', '+4'];
const UnoDeck = () => {
    const colors = ['red', 'green', 'yellow', 'blue'];
    const generateNumberedCards = () => {
      const numberedCards = [];
      for (let color of colors) {
        for (let i = 0; i <= 9; i++) {
          const card = {
            color,
            type: 'number',
            value: i,
            id:`cn${color}${i}`
          };
          if (i === 0) {
            numberedCards.push(card);
          } else {
            numberedCards.push(card);
            numberedCards.push({...card, id:`cn${color}${i}bis`}); // Double exemplaire sauf pour le 0
          }
        }
      }
      return numberedCards;
    };
  
    const generateSpecialCards = () => {
      const specialCardsDeck = [];
      // cartes non-colorees

      for (let type of specialCardsNoColor) {
        specialCardsDeck.push({
          type,
          value:50,
          id:`jk${type}`
        });
        specialCardsDeck.push({
          type,
          value:50,
          id:`jk${type}`
        }); // Double exemplaire pour chaque type de carte spéciale
      }
      for (let color of colors) {
        for (let type of specialCards) {
          specialCardsDeck.push({
            color,
            value:20,
            type,
            id:`sp${color}${type}`
          });
          specialCardsDeck.push({
            color,
            value:20,
            type,
            id:`sp2${color}${type}`
          }); // Double exemplaire pour chaque type de carte spéciale
        }
      }
      return specialCardsDeck;
    };
  
    const generateDeck = () => {
      const numberedCards = generateNumberedCards();
      const specialCardsDeck = generateSpecialCards();
  
      const jokerCard = {
        id:'jok2',
        color: 'multicolore',
        type: 'joker',
      };
  
      const plusFourCard = {
        id:'+4bis',
        color: 'multicolore',
        type: '+4',
      };
  
      return [...numberedCards, ...specialCardsDeck, jokerCard, plusFourCard];
    };
  
    const deck = generateDeck();
  
    return deck;
  };
  
  export default UnoDeck;
  