

export const applyRule = (rule, cell, voisins) => {

    switch (rule) {
        case 'predator':
            if(cell===1 && (voisins[2]>=2 || voisins[1]>3))
                return 2;
            if(cell===2)
                return 3;
            if(cell===3)
                return 0;
            if(cell===0 && voisins[1]===3)
                return 1;
            return cell;

        case 'incendie':
        
        if(cell===1&&voisins[2]>0)
            return 2;
            if(cell===1&&voisins[1]>3)
                return 2;
        if(cell===2)
            return 3;
        if(cell===3 && voisins[2]>=1)
            return 2;
        return cell;

        case 'majestic':
            if(voisins[1]===2)
            return 3;
        if(voisins[2]===1)
            return 1;
        return cell;
        case 'chemical':
            if(voisins[1]===2)
                return 2;
            if(cell===2 && voisins[2]>=3)
                return 3;
                if(cell===2 && voisins[3]>=1)
                    return 3;
            if(cell===3)
                return 0;
            return cell;
        case 'nonBinaire1':
         //   description: "Une cellule monte en grade si elle a 2voisins  a plus qu'elle ou 3 voisins a 1
         //,elle meurt si elle a plus de 2 voisins a plus de 3 ou plus de 4 voisins 
         //et baisse de grade si elle n'a aucun voisin au-dessus de son niveau",
         // en non binaire voisins = {'1':0,2:2,3:1}
         let compteAudessus=0;
         let compteEndessous=0;
         let compteTotal=0
         for(let gradeVoisin in voisins){
            compteTotal+=voisins[gradeVoisin];
            if(cell<gradeVoisin)
                compteAudessus+=voisins[gradeVoisin];
                if(cell>gradeVoisin)
                compteEndessous+=voisins[gradeVoisin];
                
         }
         if(voisins[3]>2||compteTotal>4)
            return 0;
        
         if(compteAudessus===2||voisins[1]>=3)
            return cell+1;
        if(compteAudessus===0)
         return cell-1;
        return cell;

        case 'diamant':
            //   description: "Si une cellule a exactement 2 voisines vivantes, elle devient vivante.\nSinon, elle devient morte.",
            if (voisins === 2)
                return 1;
            else
                return 0;
        case 'chaos':
            //         description: "Si une cellule a un nombre impair de voisines vivantes, elle devient vivante.\nSinon, elle devient morte.",
            if (voisins % 2 === 1)
                return 1;
            else
                return 0;
        case 'spirale':
            //      description: "Si une cellule a exactement 3 voisines vivantes, elle devient vivante.\nSinon, elle devient morte.",
            if (voisins === 3)
                return 1;
            else
                return 0;
        case 'serpent':
            //   description: "Si une cellule a exactement 1 voisine vivante, elle devient vivante.\nSinon, elle devient morte.",
            if (voisins === 1)
                return 1;
            return 0;
        case 'croix':
            //  description: "Si une cellule a exactement 2 voisines vivantes, elle reste pareille.\nSi elle a exactement 3 voisines vivantes, elle devient vivante.\nSinon, elle devient morte.",
            
            if (voisins === 1||voisins===4)
                return 1;
                if (voisins === 3)
                return cell
            return 0;
        case 'foyer':
            //    description: "Si une cellule a 3 voisines vivantes, elle devient vivante.\n Sinon, elle devient morte.",
            if (voisins === 3)
                return 1;
            return 0;
        case 'parcours':
            //     description: "Si une cellule a exactement 1 ou 3 voisines vivantes, elle devient vivante.\n  Sinon, elle devient morte..",
            if (voisins === 3 || voisins === 1)
                return 1;
            return 0;
        case 'migration':
            //  description: "Si une cellule a exactement 2 ou 3 voisines vivantes, elle devient vivante.\nSinon, elle devient morte.",
            if (voisins === 3 || voisins === 2)
                return 1;
            return 0;
        case 'isolation':
            //    description: "Si une cellule a moins de 2 ou plus de 5 voisines vivantes, elle devient morte.\n Sinon, elle devient vivante.",
            if (voisins < 2 || voisins > 5)
                return 0;
            return 1;
        case 'ventilateur':
            //   description: "Si une cellule a exactement 2 voisines vivantes, elle devient vivante.\n  Sinon, elle devient morte, sauf si elle a exactement 1 voisine vivante, auquel cas elle devient également vivante.",
            if (voisins === 2 || voisins === 1)
                return 1;
            return 0;
        case 'lifeDeath':
            //    description: "Si une cellule a exactement 3 voisines vivantes, elle devient vivante.\n  Sinon, elle reste dans son état actuel.",

            if (voisins === 3)
                return 1;
            return cell;
        case 'maze':
            //   description: "Si une cellule a exactement 1 voisine vivante ou 5 voisines vivantes, elle devient vivante.\n  Sinon, elle devient morte.",

            if (voisins === 1 || voisins === 5)
                return 1;
            return 0;
        case 'nightAndDay':
            //       description: "Si une cellule a 3, 4, 6, ou 7 voisines vivantes, elle devient vivante.\n  Sinon, elle devient morte.",

            if (voisins === 3||voisins === 4||voisins === 6||voisins === 7)
                return 1;
            return 0;

        case 'coral':
            //   description: "Si une cellule a exactement 3 ou 4 voisines vivantes, elle devient vivante.\n Sinon, elle reste dans son état actuel.",
    
            if (voisins === 3||voisins===4)
                return 1;
            if(voisins===2||voisins>5)
                return 0
            return cell;

        case 'gnarl':
            //    description: "Si une cellule a exactement 1 voisine vivante, elle devient vivante.\nSinon, elle devient morte.",
   
            if (voisins === 1)
                return 1;
            return 0;



        default: {// Conway classique
            if (cell && (voisins < 2 || voisins > 3)) {
                return 0; // Cellule meurt si elle a moins de 2 ou plus de 3 voisins
            } else if (!cell && voisins === 3) {
                return 1; // Cellule naît si elle a exactement 3 voisins
            }
            else
                return cell;//sinon ne change pas
        }
    }
}

