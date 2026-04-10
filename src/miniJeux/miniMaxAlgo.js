
const PERSONNE = 0;
const JOUEUR = 1;
const IA = 2;

// algo de choix
export const joueCoup = ({ plateau, joueur, row, cell, orientation }) => {

    plateau[row][cell] = joueur;
    return testCaseFermee({ plateau, joueur, row, cell, orientation });
}


export const testCaseFermee = ({ plateau, joueur, row, cell, orientation }) => {

   // plateau[row][cell] = joueur;
    // check nouvelle cases fermees
    let caseFermees = 0;
    if (orientation === 'verti') {
        
        //check cells a cote
        if (plateau[row][cell + 1] === PERSONNE) {
            if(plateau[row + 1]!=null && plateau[row + 1][cell + 1]!=null
                && plateau[row + 1][cell + 1] !== PERSONNE
                && plateau[row - 1]!=null && plateau[row - 1][cell + 1] !=null 
                && plateau[row - 1][cell + 1] !== PERSONNE
                && plateau[row][cell + 2] !=null && plateau[row][cell + 2] !== PERSONNE
            ){

            
            caseFermees++;
            plateau[row][cell + 1] = joueur;
            }
        }
        if (plateau[row][cell - 1] === PERSONNE ) {
            if(plateau[row + 1]!=null && plateau[row + 1][cell - 1] !== PERSONNE
                && plateau[row - 1]!=null && plateau[row - 1][cell - 1] !== PERSONNE
                && plateau[row][cell - 2] !=null && plateau[row][cell - 2] !== PERSONNE){

                    caseFermees++;
                    plateau[row][cell - 1] = joueur;
                }
        }
    }
    if (orientation === 'horiz') {
        //check cells a cote
        if (plateau[row + 1]!=null && plateau[row + 1][cell] === PERSONNE) {
            if(plateau[row + 1][cell + 1] !== PERSONNE
                && plateau[row + 1][cell - 1] !== PERSONNE
                && plateau[row + 2]!=null && plateau[row + 2][cell] !== PERSONNE){
                    
            caseFermees++;
            plateau[row + 1][cell] = joueur;        
        }
    }
        if (plateau[row - 1]!=null && plateau[row - 1][cell] === PERSONNE ) {
            if(plateau[row - 1][cell + 1] !== PERSONNE
                && plateau[row - 1][cell - 1] !== PERSONNE
                && plateau[row - 2]!=null && plateau[row - 2][cell] !== PERSONNE){
                    
            caseFermees++;
            plateau[row - 1][cell] = joueur;
        
        }
    }
    }
    return { caseFermees, plateau }


}

const estTermine = plateau => {
    // si plus aucun ligne de libre
    for (let row = 0; row < plateau.length; row++) {
        const rowA = [];
        for (let cell = 0; cell < plateau[row].length; cell++) {
            // si row pair et cell impair : ligne horiz
            if (row % 2 === 0 && cell % 2 !== 0 && plateau[row][cell] === PERSONNE)
                return false;
            if (row % 2 !== 0 && cell % 2 === 0 && plateau[row][cell] === PERSONNE)
                return false;
        }
    }
    return true;
}
export const obtenirCoupsPossibles=plateau=>{
    const coups=[];
    for (let row = 0; row < plateau.length; row++) {
        
        for (let cell = 0; cell < plateau[row].length; cell++) {
            // si row pair et cell impair : ligne horiz
            if (row % 2 === 0 && cell % 2 !== 0 && plateau[row][cell] === PERSONNE)              
                    coups.push({row:row,col:cell, orientation:'horiz'});
            if (row % 2 !== 0 && cell % 2 === 0 && plateau[row][cell] === PERSONNE)
                coups.push({row:row,col:cell, orientation:'verti'});
        }
    }
    return coups;
}
const evaluerPosition = (plateau, isia) => {
    // compter owner de case centrales
    let score = 0;
    for (let row = 0; row < plateau.length; row++) {
        for (let cell = 0; cell < plateau[row].length; cell++) {

            if (row % 2 !== 0 && cell % 2 !== 0) {

                if (plateau[row][cell] === IA && isia)
                    score++;
                if (plateau[row][cell] === JOUEUR && isia)
                    score--;
                if (plateau[row][cell] === JOUEUR && !isia)
                    score++;
                if (plateau[row][cell] === IA && !isia)
                    score--;
            }
        }
    }
    return score;
}
export const fuckMinimax =  (plateau, profondeur) => {

    let joueCa=null;
    let bestMove=0;
    const coupsPossibles = obtenirCoupsPossibles(plateau);
    const tempPlateau = JSON.parse(JSON.stringify(plateau));
    for (const coup of coupsPossibles) {
    const { caseFermees} = testCaseFermee({orientation:coup.orientation, plateau:plateau, row:coup.row, cell:coup.col
        , joueur:IA});
   if(caseFermees>bestMove)
    {
        bestMove=caseFermees;
        joueCa = coup;
    }
}
    if(joueCa==null){
        // random
        joueCa = coupsPossibles[Math.floor(Math.random()*coupsPossibles.length)]
    }
    return joueCa;
}
export const minimax = (plateau, profondeur, joueurMaximisant) => {
    // Cas de base
    if (profondeur === 0 || estTermine(plateau)) {
        return evaluerPosition(plateau, joueurMaximisant);
    }

    // Initialiser le meilleur score
    let meilleurScore = joueurMaximisant ? -Infinity : Infinity;
    let meilleurCoup;

    // Générer tous les coups possibles
    const coupsPossibles = obtenirCoupsPossibles(plateau);

    for (const coup of coupsPossibles) {
        // Jouer le coup
        const {plateau:nouveauPlateau, caseFermees} = joueCoup({orientation:coup.orientation, plateau, row:coup.row, cell:coup.col
            , joueur:joueurMaximisant?JOUEUR:IA});
       if(caseFermees>0 && !joueurMaximisant)
        {
            return coup;
        }
        // Appeler récursivement Minimax
        const score = minimax(nouveauPlateau, profondeur - 1, !joueurMaximisant);

        // Mettre à jour le meilleur score et le meilleur coup
        if (joueurMaximisant) {
            if (score > meilleurScore) {
                meilleurScore = score;
                meilleurCoup = coup;
            }
        } else {
            if (score < meilleurScore) {
                meilleurScore = score;
                meilleurCoup = coup;
            }
        }
    }

    return meilleurCoup;
}
