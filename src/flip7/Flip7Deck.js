

  export const specialCards = ['stop', '3cartes', 'joker','x2','+2','+4','+6','+8','+10'];
  const Flip7Deck = () => {
      const colors = ['red', 'green', 'brown', 'blue','olive','teal','navy','fuchsia','orange','aqua','silver','lime','purple'];
    
    
      const generateSpecialCards = () => {
        const specialCardsDeck = [];
        // cartes non-colorees
  
        for (let p=0;p<3;p++) {
          for (let type of specialCards) {
            specialCardsDeck.push({
              color:colors[p],
              val:'none',
              type
            });
          }
        }
        return specialCardsDeck;
      };
    
      const generateDeck = () => {
        const d=[];
        for(let c=0;c<13;c++){
            if(c>1){
                for(let n=0;n<c;n++) 
                    d.push({val:c, color:colors[n], type:'card'});
            }
            else
                d.push({val:c, color:colors[c], type:'card'});
        }
        const specialCardsDeck = generateSpecialCards();
    
        return [...d, ...specialCardsDeck];
      };
    
      const deck = generateDeck();
    
      return deck;
    };
    
    export default Flip7Deck;
    