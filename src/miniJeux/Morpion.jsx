import { Box,  Button,  Typography } from "@mui/material"
import { makeStyles } from "@mui/styles";
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Recycling, RestartAlt } from '@mui/icons-material';

const PERSONNE=0;
const JOUEUR=1;
const IA=2;
const morpionVide=[  
[0,0,0]
,[0,0,0]
,[0,0,0]
];


export const Morpion=({onFinish})=>{
    const [morpion, setMorpion]=useState(JSON.parse(JSON.stringify(morpionVide)));
const [msg, setMessage] = useState();
const [currentTour, setTour] = useState(JOUEUR);
const reset=()=>{
    setTour(JOUEUR);
    setMessage(null);
    setMorpion(JSON.parse(JSON.stringify(morpionVide)));
}
   const activate=(row,col)=>{
    if(currentTour!==JOUEUR)
        return setMessage('Pas ton tour');
    if(morpion[row][col]!==PERSONNE)
        return setMessage('Case deja occupee');
    const newMorp=JSON.parse(JSON.stringify(morpion))
    newMorp[row][col]=JOUEUR;
    setMorpion(newMorp);
    setTour(IA);
   }
   useEffect(()=>{
    const yaUnGagnant=checkGagnant(morpion);
    if(yaUnGagnant!==PERSONNE){
      if(typeof onFinish==='function')
        onFinish(yaUnGagnant===JOUEUR);
        setMessage(yaUnGagnant===JOUEUR?'Bravo. Vous avez gagné':'Vous avez perdu, trop la honte')
        return;
    }
    if(currentTour===IA){
        setTour(JOUEUR);
        const caseLibres=[];
        // choisis une case libre
        for(let r=0;r<3;r++){
            for(let c=0;c<3;c++){
                if(morpion[r][c]===PERSONNE){
                    caseLibres.push({row:r,col:c});
                }
            }
        }
        if(caseLibres.length>0){   
            const newMorp=JSON.parse(JSON.stringify(morpion))
            const meilleurCoup =  obtenirMeilleurCoup(newMorp);  
            morpion[meilleurCoup.row][meilleurCoup.col]=IA;
            setMorpion(morpion);
            
           
        }
        else{
         setMessage("Match nul...");
        }
    }
   },[currentTour]);
    return <Box sx={{margin:'auto'}}>
       <Button variant="contained" onClick={reset}><RestartAlt/></Button>
        {msg && <Typography variant="h5" textAlign="center" color="error">{msg}</Typography>}
       <Box sx={{ display: 'flex', gap:1, flexDirection:'column', width: '50vh',  height: '50vh'}}>
      {morpion.map((row, rowIndex) => (
        <Box key={'row'+rowIndex}  sx={{display:'flex', gap:1, flex:1,alignItems:'stretch'}}>
          {morpion[rowIndex].map((cell, colIndex) => (
            <Box  key={'col'+colIndex}  sx={{flex:1, border:'1px solid black', cursor:'pointer'}}
             onClick={evt=>{activate(rowIndex,colIndex)}}
            >
              <CaseMorpion contenu={morpion[rowIndex][colIndex]}/>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
    </Box>
}
export default Morpion;

const checkGagnant=(plateau) =>{
    // Vérification des lignes
    for (let ligne = 0; ligne < 3; ligne++) {
      if (plateau[ligne][0] === plateau[ligne][1] && plateau[ligne][1] === plateau[ligne][2] && plateau[ligne][0] !== 0) {
        return plateau[ligne][0]; // Retourne le joueur gagnant
      }
    }
  
    // Vérification des colonnes
    for (let colonne = 0; colonne < 3; colonne++) {
      if (plateau[0][colonne] === plateau[1][colonne] && plateau[1][colonne] === plateau[2][colonne] && plateau[0][colonne] !== 0) {
        return plateau[0][colonne];
      }
    }
  
    // Vérification des diagonales
    if (plateau[0][0] === plateau[1][1] && plateau[1][1] === plateau[2][2] && plateau[0][0] !== 0) {
      return plateau[0][0];
    }
    if (plateau[0][2] === plateau[1][1] && plateau[1][1] === plateau[2][0] && plateau[0][2] !== 0) {
      return plateau[0][2];
    }
  
    // Si aucune victoire n'a été détectée, on retourne 0
    return PERSONNE;
  }


const estTermine = (plateau) => {
    // Vérifier s'il y a un gagnant
    if (checkGagnant(plateau) !== PERSONNE) {
        return true;
    }
    
    // Vérifier s'il reste des cases libres
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (plateau[r][c] === PERSONNE) {
                return false; // Il reste au moins une case libre
            }
        }
    }
    
    return true; // Plateau plein, match nul
};

const obtenirCoupsPossibles = (plateau) => {
    const coups = [];
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            if (plateau[r][c] === PERSONNE) {
                coups.push({ row: r, col: c });
            }
        }
    }
    return coups;
};

const jouerCoup = (plateau, coup, joueur) => {
    // Créer une copie profonde du plateau
    const nouveauPlateau = plateau.map(row => [...row]);
    nouveauPlateau[coup.row][coup.col] = joueur;
    return nouveauPlateau;
};
// algo de choix
// Fonction d'évaluation améliorée
const evaluerPosition = (plateau) => {
    const gagnant = checkGagnant(plateau);
    
    // Si la partie est terminée
    if (gagnant === IA) return 100;
    if (gagnant === JOUEUR) return -100;
    if (gagnant !== PERSONNE) return 0; // Match nul
    
    let score = 0;
    
    // Évaluer chaque ligne, colonne et diagonale
    const lignes = [
        // Lignes
        [plateau[0][0], plateau[0][1], plateau[0][2]],
        [plateau[1][0], plateau[1][1], plateau[1][2]],
        [plateau[2][0], plateau[2][1], plateau[2][2]],
        // Colonnes
        [plateau[0][0], plateau[1][0], plateau[2][0]],
        [plateau[0][1], plateau[1][1], plateau[2][1]],
        [plateau[0][2], plateau[1][2], plateau[2][2]],
        // Diagonales
        [plateau[0][0], plateau[1][1], plateau[2][2]],
        [plateau[0][2], plateau[1][1], plateau[2][0]]
    ];
    
    // Évaluer chaque triplet
    lignes.forEach(ligne => {
        score += evaluerTriplet(ligne);
    });
    
    return score;
};

const evaluerTriplet = (triplet) => {
    let scoreIA = 0;
    let scoreJoueur = 0;
    let vides = 0;
    
    triplet.forEach(case_ => {
        if (case_ === IA) scoreIA++;
        else if (case_ === JOUEUR) scoreJoueur++;
        else vides++;
    });
    
    // Si les deux joueurs ont des pièces sur cette ligne, pas de points
    if (scoreIA > 0 && scoreJoueur > 0) return 0;
    
    // Calcul du score selon le nombre de pièces alignées
    if (scoreIA === 2 && vides === 1) return 50;  // Menace de victoire
    if (scoreIA === 1 && vides === 2) return 10;  // Bon potentiel
    
    if (scoreJoueur === 2 && vides === 1) return -50; // Bloquer menace
    if (scoreJoueur === 1 && vides === 2) return -10; // Mauvais pour nous
    
    return 0;
};
const minimax = (plateau, profondeur, estMaximisant, alpha = -Infinity, beta = Infinity) => {
    // Cas de base
    if (estTermine(plateau) || profondeur === 0) {
        return evaluerPosition(plateau);
    }
    
    const coupsPossibles = obtenirCoupsPossibles(plateau);
    
    if (estMaximisant) {
        let maxEval = -Infinity;
        
        for (const coup of coupsPossibles) {
            const nouveauPlateau = jouerCoup(plateau, coup, IA);
            const eval_ = minimax(nouveauPlateau, profondeur - 1, false, alpha, beta);
            maxEval = Math.max(maxEval, eval_);
            alpha = Math.max(alpha, eval_);
            
            // Élagage Alpha-Beta
            if (beta <= alpha) break;
        }
        
        return maxEval;
    } else {
        let minEval = Infinity;
        
        for (const coup of coupsPossibles) {
            const nouveauPlateau = jouerCoup(plateau, coup, JOUEUR);
            const eval_ = minimax(nouveauPlateau, profondeur - 1, true, alpha, beta);
            minEval = Math.min(minEval, eval_);
            beta = Math.min(beta, eval_);
            
            // Élagage Alpha-Beta
            if (beta <= alpha) break;
        }
        
        return minEval;
    }
};

// Fonction principale pour obtenir le meilleur coup
const obtenirMeilleurCoup = (plateau) => {
    // Stratégies prioritaires
    
    // 1. Si le centre est libre, le prendre
    if (plateau[1][1] === PERSONNE) {
        return { row: 1, col: 1 };
    }
    
    // 2. Vérifier s'on peut gagner immédiatement
    const coupGagnant = chercherCoupGagnant(plateau, IA);
    if (coupGagnant) return coupGagnant;
    
    // 3. Vérifier s'il faut bloquer l'adversaire
    const coupBloquant = chercherCoupGagnant(plateau, JOUEUR);
    if (coupBloquant) return coupBloquant;
    
    // 4. Utiliser minimax pour le reste
    let meilleurCoup = null;
    let meilleurScore = -Infinity;
    
    const coupsPossibles = obtenirCoupsPossibles(plateau);
    
    for (const coup of coupsPossibles) {
        const nouveauPlateau = jouerCoup(plateau, coup, IA);
        const score = minimax(nouveauPlateau, 6, false); // Profondeur 6 suffit pour le morpion
        
        if (score > meilleurScore) {
            meilleurScore = score;
            meilleurCoup = coup;
        }
    }
    
    return meilleurCoup;
};

// Fonction utilitaire pour détecter un coup gagnant/bloquant
const chercherCoupGagnant = (plateau, joueur) => {
    const coupsPossibles = obtenirCoupsPossibles(plateau);
    
    for (const coup of coupsPossibles) {
        const nouveauPlateau = jouerCoup(plateau, coup, joueur);
        if (checkGagnant(nouveauPlateau) === joueur) {
            return coup;
        }
    }
    
    return null;
};


const useStyle=makeStyles(theme=>({
    div1:
{
    
 backgroundColor: theme.palette.primary.main,
 border: '#000 solid 1px',
 height: '80%',
 width: '80%',
 margin:'10%',
 borderRadius: '50%'
}
,div2:{
    backgroundColor: '#eee',
 border: '#000 solid 1px',
 height: '60%',
 margin: '19% 0px 0px 19%',
 width: '60%',
 borderRadius: '50%'
}
, mdiv :{
    width: '100%',
    height: '100%',
    border: '1px solid black'
  }
  ,
  mdiv1 :{
    width: '20%',
    height: '100%',
    marginLeft: '40%',
    borderRadius:'5px',
    backgroundColor: theme.palette.secondary.main,
    transform: 'rotate(45deg)',
    zIndex: 1
  }
  
  ,md :{
    height: '100%',
    width: '100%',
    borderRadius:'5px',
    backgroundColor: theme.palette.secondary.main,
    transform: 'rotate(90deg)',
    zIndex: 2
  }
}));

const CaseMorpion = ({contenu})=>{
    const classes = useStyle();
    if(contenu===PERSONNE)
        return null;
    if(contenu===JOUEUR)
    {
       
    return <Box className={classes.div1}>
            <Box className={classes.div2}>&#160;</Box>
        </Box>
    }
    else
    return <Box className={classes.mdiv}>
    <Box className={classes.mdiv1}>
      <Box className={classes.md}/>
    </Box>
  </Box>
}
