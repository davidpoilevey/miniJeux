import { useEffect, useMemo, useState } from "react";
import { generateGridForLevel, getLevelConfig, handleExplosions } from "./EmpMapGenerator";


export const useEmpileTruc = ({loadSavedGame}) => {
    const [grid, setGrid] = useState(new Map());
    const [score, setScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
    const [gridChecked, setGridChecked] = useState(false);
    const [objective, setObjective] = useState({ type: 'score', target: 150 });
    const [lastPlacedHex, setLastPlacedHex] = useState(null); // Hex où la dernière pile a été ajoutée
    useEffect(() => {
    const g = generateGridForLevel(level);
    setGrid(g);
    setGridChecked(false);
    setMessage("");
    setTotalScore(prev => prev + score);
    setScore(0);    
    // Générer le nouvel objectif basé sur la grille
    const newObjective = generateObjective(level, g);
    setObjective(newObjective);
    if(level>1)
         saveGame();
  }, [level]);
   useEffect(() => {
    const loadGame = async () => {
      if (loadSavedGame) {
        try {
           
          const saved =  localStorage.getItem('empile-savegame');
          if (saved) {
            const data = JSON.parse(saved);
            setLevel(data.level);
            setTotalScore(data.totalScore);
            setScore(data.score);
            // Reconstruire la grille depuis les données sauvegardées
            const loadedGrid = new Map(data.gridData);
            setGrid(loadedGrid);
            setObjective(data.objective);
            console.log('Partie chargée !');
          }
        } catch (error) {
          console.log('Erreur de chargement:', error);
          // Si erreur, démarrer une nouvelle partie
          initNewGame();
        }
      } else {
        initNewGame();
      }
    };
    loadGame();
  }, []);
  const initNewGame = () => {
    setLevel(1);
    setScore(0);
    setTotalScore(0);
  };

   const saveGame =  () => {
      if (level > 1) {
        try {
          const saveData = {
            level,
            totalScore,
            score,
            gridData: Array.from(grid.entries()),
            objective
          };
            const serializedState = JSON.stringify(saveData);
            localStorage.setItem("empile-savegame", serializedState);   
          console.log('Partie sauvegardée !');
        } catch (error) {
          console.error('Erreur de sauvegarde:', error);
        }
      }
    };

  //useEffect qui bouge les dalles
  useEffect(() => {
  let timeout = null;
  
  if (grid.size > 0 && !gridChecked && lastPlacedHex) {
    // Étape 1 : Fusionner depuis l'hex qu'on vient de poser
    const hexKey = `${lastPlacedHex.q},${lastPlacedHex.r},${lastPlacedHex.s}`;
    const hex = grid.get(hexKey);
    
    if (hex && hex.pile.length > 0 && hex.type !== 'frozen') {
      const g = new Map(grid);
      const currentHex = g.get(hexKey);
      const topColor = currentHex.pile[currentHex.pile.length - 1].color;
      
      const neighbors = [
        { q: hex.q + 1, r: hex.r, s: hex.s - 1 },
        { q: hex.q + 1, r: hex.r - 1, s: hex.s },
        { q: hex.q, r: hex.r - 1, s: hex.s + 1 },
        { q: hex.q - 1, r: hex.r, s: hex.s + 1 },
        { q: hex.q - 1, r: hex.r + 1, s: hex.s },
        { q: hex.q, r: hex.r + 1, s: hex.s - 1 },
      ];
      
      let totalMerged = 0;
      let changed = false;
      
      // Collecter TOUTES les piles voisines de même couleur
      neighbors.forEach(n => {
        const nKey = `${n.q},${n.r},${n.s}`;
        const nHex = g.get(nKey);
        
        if (nHex && nHex.pile.length > 0 && nHex.type !== 'frozen') {
          const topNHex = nHex.pile[nHex.pile.length - 1];
          
          if (topNHex.color === topColor) {
            totalMerged += topNHex.nb;
            nHex.pile.pop();
            g.set(nKey, nHex);
            changed = true;
          }
        }
      });
      
      if (totalMerged > 0) {
        // Fusionner tout dans l'hex central
        const newPile = [...currentHex.pile];
        newPile[newPile.length - 1] = {
          color: topColor,
          nb: newPile[newPile.length - 1].nb + totalMerged
        };
        g.set(hexKey, { ...currentHex, pile: newPile });
      }
      
      if (changed) {
        timeout = setTimeout(() => {
          setGrid(g);
          setLastPlacedHex(null); // Réinitialiser pour la prochaine fusion en cascade
        }, 500);
        return () => {
          if (timeout) clearTimeout(timeout);
        };
      }
    }
    
    // Si pas de fusion depuis lastPlacedHex, chercher d'autres fusions possibles
    setLastPlacedHex(null);
  }
  
  // Étape 2 : Chercher d'autres fusions possibles (cascade)
  if (grid.size > 0 && !gridChecked && !lastPlacedHex) {
    const g = new Map(grid);
    let changed = false;
    let firstMergeHex = null;
    
    // Trouver la PREMIÈRE fusion possible
    for (const [hexKey, hex] of g.entries()) {
      if (hex.pile.length === 0 || hex.type === 'frozen') continue;
      
      const topColor = hex.pile[hex.pile.length - 1].color;
      const neighbors = [
        { q: hex.q + 1, r: hex.r, s: hex.s - 1 },
        { q: hex.q + 1, r: hex.r - 1, s: hex.s },
        { q: hex.q, r: hex.r - 1, s: hex.s + 1 },
        { q: hex.q - 1, r: hex.r, s: hex.s + 1 },
        { q: hex.q - 1, r: hex.r + 1, s: hex.s },
        { q: hex.q, r: hex.r + 1, s: hex.s - 1 },
      ];
      
      let totalMerged = 0;
      
      // eslint-disable-next-line no-loop-func
      neighbors.forEach(n => {
        const nKey = `${n.q},${n.r},${n.s}`;
        const nHex = g.get(nKey);
        
        if (nHex && nHex.pile.length > 0 && nHex.type !== 'frozen') {
          const topNHex = nHex.pile[nHex.pile.length - 1];
          
          if (topNHex.color === topColor) {
            totalMerged += topNHex.nb;
            nHex.pile.pop();
            g.set(nKey, nHex);
            changed = true;
          }
        }
      });
      
      if (totalMerged > 0) {
        const newPile = [...hex.pile];
        newPile[newPile.length - 1] = {
          color: topColor,
          nb: newPile[newPile.length - 1].nb + totalMerged
        };
        g.set(hexKey, { ...hex, pile: newPile });
        firstMergeHex = { q: hex.q, r: hex.r, s: hex.s };
        break; // Ne traiter qu'une seule fusion à la fois
      }
    }
    
    if (changed) {
      timeout = setTimeout(() => {
        setGrid(g);
        setLastPlacedHex(firstMergeHex); // Continuer depuis cet hex
      }, 500);
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
    
    // Étape 3 : Gérer les explosions
    const explosionResult = handleExplosions(g);
    
    if (explosionResult.pointsEarned > 0) {
      setScore(prevScore => prevScore + explosionResult.pointsEarned);
    }
    const objectiveComplete = checkObjectiveComplete(objective, score, explosionResult.grid);
  setObjective(prevObj=>{return {...objective}}); // parce que current peut etre changé
  if (objectiveComplete) {
    setMessage("🎉 Objectif atteint ! Niveau terminé !");
    setTimeout(() => {
      setMessage("");
      setLevel(prevLevel => prevLevel + 1);
    }, 1000);
    return setGridChecked(true);
  }
    if (explosionResult.cleanSheet) {
      setMessage("Niveau nettoyé ! Passez au niveau suivant.");
      setTimeout(() => {
        setLevel(prevLevel => prevLevel + 1);
        
      }, 1000);
      return setGridChecked(true);
    }
    
    if (explosionResult.changed) {
      timeout = setTimeout(() => {
        setGrid(explosionResult.grid);
      }, 500);
    } else {
      setGridChecked(true);
      // si aucun hex de la grid n'est libre (counter exclus) , game over
      const anyFreeHex = Array.from(grid.values()).some(h => h.pile.length === 0 && h.type !== 'counter' && h.type !== 'frozen');
      if (!anyFreeHex) {
        setMessage("Game Over ! Cliquez sur Nouveau Jeu pour recommencer.");
        setTotalScore(prev => prev + score);
        setGameOver(true);
      }
    }
  }
  
  return () => {
    if (timeout) clearTimeout(timeout);
  };
}, [grid, gridChecked, lastPlacedHex]);


    const addPile = (hexKey, newPile) => {
        const hex = grid.get(hexKey);

        if (hex && hex.pile.length == 0) {

            const newHex = { ...hex, pile: newPile };
            const newGrid = new Map(grid);
            newGrid.set(hexKey, newHex);
            setGrid(newGrid);
            setLastPlacedHex(hex);
            setGridChecked(false); // recheck grid
        }
    }


    return {
        grid, addPile, totalScore, score, setScore, level, setLevel
        , message, setMessage, objective,gameOver, setGameOver
    };
}


















/**
* Génère des piles aléatoires avec fusion des couleurs identiques
* @param {number} count - Nombre de piles à générer (défaut: 3)
* @param {number} minLayers - Nombre minimum de couches par pile (défaut: 1)
* @param {number} maxLayers - Nombre maximum de couches par pile (défaut: 3)
* @param {number} minTiles - Nombre minimum de dalles par couche (défaut: 1)
* @param {number} maxTiles - Nombre maximum de dalles par couche (défaut: 5)
* @returns {Array} Tableau de piles, chaque pile étant un tableau d'objets {color, nb}
*/
// (En supposant que votre fonction mergeSameColors existe quelque part)
// const mergeSameColors = (pile) => { ... };

export const generateRandomPiles = ({
    count = 3,
    minLayers = 1,
    maxLayers = 3,
    minTiles = 3,
    maxTiles = 7,
    colorLimit = null,
    score=null,
    level = 1 // <-- 1. Ajout du paramètre 'level' avec une valeur par défaut
} = {}) => {
    // On renomme le tableau complet pour plus de clarté
    const allColors = ["#ff4444", "#4444ff", "#44ff44", "#ffff44", "#ff44ff", "#74ecf4", "#ffa500", "#a314a3", "#fffdfa", "#008000"];

    // 2. Déterminer le nombre de couleurs à utiliser (4 score si 50, 5 si sc>80 6 si sc>120.  level.colorCount )
    // On utilise Math.min pour s'assurer de ne jamais dépasser
    // le nombre total de couleurs définies dans allColors.
     const lvlconfig = getLevelConfig(level);
     const cc = (score!=null)?Math.floor(4+(score/40)):lvlconfig.colorCount;
    const numColorsToUse = colorLimit?colorLimit.length:Math.min(cc, allColors.length);

    // 3. Créer le sous-tableau de couleurs autorisées pour ce niveau
    const availableColors = allColors.filter(c=>(colorLimit==null||colorLimit.includes(c))).slice(0, numColorsToUse);

    const newPiles = [];

    for (let i = 0; i < count; i++) {
        const pileSize = Math.floor(Math.random() * (maxLayers - minLayers + 1)) + minLayers;
        const pile = [];

        // Générer les couches
        for (let j = 0; j < pileSize; j++) {
            // 4. Piocher une couleur uniquement parmi les couleurs DISPONIBLES
            const color = availableColors[Math.floor(Math.random() * availableColors.length)];
            pile.push({
                color,
                nb: Math.floor(Math.random() * (maxTiles - minTiles + 1)/pileSize) + minTiles
            });
        }

        // Fusionner les couleurs identiques adjacentes
        const mergedPile = mergeSameColors(pile); // Assurez-vous que cette fonction est importée/définie
        newPiles.push(mergedPile);
    }

    return newPiles;
};

/**
 * Fusionne les couches de même couleur qui se suivent dans une pile
 * @param {Array} pile - Pile à fusionner
 * @returns {Array} Pile avec couleurs fusionnées
 */
export const mergeSameColors = (pile) => {
    // 1. Utiliser un objet pour compter les 'nb' par couleur
    const colorMap = {};

    // 2. Itérer sur la pile pour agréger les comptes
    for (const item of pile) {
        const { color, nb } = item;

        // Si la couleur n'existe pas, (colorMap[color] || 0) sera 0.
        // On ajoute ensuite le 'nb' actuel.
        colorMap[color] = (colorMap[color] || 0) + nb;
    }

    // 3. Transformer l'objet de comptes en tableau
    // À ce stade, colorMap ressemble à : { red: 6, blue: 5 }

    // Object.entries(colorMap) donne : [['red', 6], ['blue', 5]]
    // On utilise .map() pour reformater chaque entrée en objet
    const mergedPile = Object.entries(colorMap).map(([color, nb]) => ({
        color: color,
        nb: nb
    }));

    return mergedPile;
};

/**
 * Génère une seule pile aléatoire
 * @param {Object} options - Options de génération
 * @returns {Array} Une pile (tableau d'objets {color, nb})
 */
export const generateRandomPile = (options = {}) => {
    return generateRandomPiles({ ...options, count: 1 })[0];
};



// Fonction pour générer un objectif basé sur le niveau et la grille
const generateObjective = (currentLevel, currentGrid) => {
  // Compter les counters dans la grille
  let counterCount = 0;
  currentGrid.forEach(hex => {
    if (hex.type === 'counter') counterCount++;
  });
  
  // Si au moins 2 counters, 50% de chance d'avoir un objectif "counter"
  if (counterCount >= 2 && Math.random() < 0.5) {
    return {
      type: 'counter',
      target: counterCount,
      current: 0
    };
  }
  
  // Sinon, objectif de score qui augmente avec le niveau
  const baseScore = 100;
  const scoreIncrement = 20;
  const targetScore = baseScore + (currentLevel - 1) * scoreIncrement;
  
  return {
    type: 'score',
    target: Math.min(targetScore, 300), // Cap à 300 pour pas que ça devienne impossible
    current: 0
  };
};

// Fonction pour vérifier si l'objectif est atteint
const checkObjectiveComplete = (obj, currentScore, currentGrid) => {
  if (obj.type === 'score') {
    return currentScore >= obj.target;
  } else if (obj.type === 'counter') {
    let remainingCounters = 0;
   
    currentGrid.forEach(hex => {
      if (hex.type === 'counter') remainingCounters++;
    });
     obj.current=obj.target-remainingCounters;
    return remainingCounters === 0;
  }
  return false;
};