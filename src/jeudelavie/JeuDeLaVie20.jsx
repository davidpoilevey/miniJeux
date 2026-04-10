import { DirectionsRun, PanTool } from "@mui/icons-material";
import { Box, Button } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import { GrilleDeLaVie20 } from "./Grille";
import MoleculeRadioGroup from "./MoleculeGroup";
import { MOLECULE } from "./CelluleDeLaVie";
import { RandomButton } from "./FormesDeBase";

export const CELL_SIZE = 10;

const GameOfLife2 = () => {
  const grilleRef = useRef();
  const [grille, setGrille] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [resetFlag, doReset] = useState();
  const [moleculeCurrent, setMolecule] = useState('violet');


  useEffect(() => {
    // Initialisation de la grille (par exemple, en remplissant de cellules aléatoires)
    const box = grilleRef.current.getBoundingClientRect();
    const rws = Math.floor(box.height / CELL_SIZE);
    const cls = Math.floor(box.width / CELL_SIZE);
    setRows(rws);
    setCols(cls);
    const newGrille = Array.from({ length: rws }, () =>
      Array.from({ length: cls }, () => ({}))
    )
    setGrille(newGrille);
  }, [resetFlag]);

  const countNeighbors = (row, col) => { // A VOIR

    const mols = Object.keys(MOLECULE);
    const concentrations = {};

    // let count = 0;

    // Coordonnées des voisins possibles autour de la cellule
    const neighborOffsets = [
             [-2, -1], [-2, 0], [-2, 1],
      [-1, -2], [-1, -1], [-1, 0], [-1, 1],[-1, 2],
      [0, -2], [0, -1],           [0, 1],[0,2],
      [1, -2],[1, -1], [1, 0], [1, 1], [1, 2],
            [2, -1], [2, 0], [2, 1]
    ];

    // Parcours des voisins
    for (const [rowOffset, colOffset] of neighborOffsets) {
      const newRow = row + rowOffset;
      const newCol = col + colOffset;

      // Vérifier si le voisin est dans les limites de la grille
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        if (grille[newRow][newCol] != null) {
          const etatActuel = grille[newRow][newCol];
          for (let mol in etatActuel) {
            if (concentrations[mol] == null)
              concentrations[mol] = 0;
            concentrations[mol] += etatActuel[mol];
          }
        }
        //count += grille[newRow][newCol]; // Ajouter la valeur du voisin à la somme
      }
    }

    return concentrations; // {'1':0,'2':2,'3'}
  };

  useEffect(()=>{
    if (isRunning)
      requestAnimationFrame(evolve);
  },[grille,isRunning]);
  const evolve = () => {
    // Copiez l'état actuel de la grille
    const newGrille = [...grille.map(row => [...row])];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const neighbors = countNeighbors(row, col); // Fonction pour compter les voisins vivants
        const cell = grille[row][col];
        newGrille[row][col] = applyRule(cell, neighbors);

      }
    }


    // Mettez à jour l'état de la grille avec la nouvelle grille évoluée
    setGrille(newGrille);
    
  };
  const addMolecule = fromCell => {
    const newCell = { ...fromCell };
    if (moleculeCurrent != null) {
      newCell[moleculeCurrent] = 1;
    }
    return newCell;
  }

  return (
    <div className="game-containerLife">
      <Box display="flex" alignItems={'center'} flexDirection={'row'} justifyContent={'space-between'}>
        <h1>Jeu de la vie</h1>
        <Button onClick={doReset}>
          Reset
        </Button>
        {isRunning ? <Button variant="contained" color={isRunning ? 'error' : 'primary'}
          onClick={() => setIsRunning(false)}>Pause</Button>
          : <Button variant="contained" color={isRunning ? 'error' : 'primary'}
            onClick={() => setIsRunning(true)}>START</Button>}

        {isRunning ? <DirectionsRun /> : <PanTool />}
        <RandomButton setGrille={setGrille} rows={rows} cols={cols} />
        <MoleculeRadioGroup onChange={setMolecule} />

      </Box>
      <GrilleDeLaVie20 ref={grilleRef}
        addMolecule={addMolecule}
        grille={grille} setGrille={setGrille} />
      {/* Ajoutez des boutons pour contrôler le jeu */}
    </div>
  );
};

export default GameOfLife2;

const applyRule = (cell, voisins, seuils) => {
  // TODO trouver les regles : les voisin

  /**
   * cell is now {violet:1, chlore:0.6}
   * voisins est {violet:1.8,chlore:0.1, vert:4}
   * coeff doit etre {violet}
   * 
   * result could be {violet:0.9,vert:1,chlore:0}
   */
  const nouvellesConcentrations = { ...cell };

  for (const molécule in nouvellesConcentrations) {
    if (nouvellesConcentrations.hasOwnProperty(molécule)) {
      let ajustement = coeffGaussien(molécule, voisins[molécule] || 0);
      if(molécule=='rouge')
       ajustement = coeffWave( voisins[molécule] || 0)
      // donne l'ajustement selon la courbe
      nouvellesConcentrations[molécule] += ajustement;

      // Assurer que la concentration reste entre 0 et 1
      nouvellesConcentrations[molécule] = Math.min(1, Math.max(0, nouvellesConcentrations[molécule]));
    }
  }
  /**
* regle foufous: si rouge et violet > 0.5 alors vert = 1
* si vert et violet > 0.5 alors rouge = 1
* si rouge et vert > 0.5 alors violet = 1
 */
for (const molécule in voisins) {
  if (voisins.hasOwnProperty(molécule)) {
    if (!nouvellesConcentrations.hasOwnProperty(molécule)) {
      nouvellesConcentrations[molécule] = 0; // Ajouter la molécule si elle n'existe pas
    }
 const seuilMetamorphose=10;
    
    if (voisins.rouge > seuilMetamorphose && voisins.violet > seuilMetamorphose) {
      nouvellesConcentrations.vert = 1;
      nouvellesConcentrations.rouge -= 1;nouvellesConcentrations.violet -= 1;
    }
    else  if (voisins.rouge > seuilMetamorphose){
      nouvellesConcentrations.violet = 0.5;
      nouvellesConcentrations.rouge -= 1
    }

    if (voisins.vert > seuilMetamorphose && voisins.violet > seuilMetamorphose) {
      nouvellesConcentrations.rouge = 1;
      nouvellesConcentrations.rouge -= 1;nouvellesConcentrations.vert -= 1;
    }
    else  if (voisins.vert > seuilMetamorphose){
      nouvellesConcentrations.violet = 0.5;
      nouvellesConcentrations.vert -= 1
    }
    if (voisins.rouge > seuilMetamorphose && voisins.vert > seuilMetamorphose) {
      nouvellesConcentrations.violet = 1;
      nouvellesConcentrations.rouge -= 1;nouvellesConcentrations.vert -= 1;
    }
    else  if (voisins.violet > seuilMetamorphose){
      nouvellesConcentrations.rouge = 0.5;
      nouvellesConcentrations.violet -= 1
    }
    if (voisins.rouge > seuilMetamorphose && voisins.vert > seuilMetamorphose && voisins.violet > seuilMetamorphose) {
      nouvellesConcentrations.violet = 0;
      nouvellesConcentrations.rouge =0;nouvellesConcentrations.vert =0;
    }
  }
}

  return nouvellesConcentrations;
}
const coeffGaussien = (molecule, c) => {
  // Utilisation d'une courbe gaussienne pour calculer le coefficient
  const moyenne = MOLECULE[molecule].coeff.moyenne; // Concentration optimale au centre de la courbe
  const écartType = MOLECULE[molecule].coeff.ecartType;; // Contrôle de la "largeur" de la courbe
  const seuil = MOLECULE[molecule].seuil;

  let coeff = Math.exp(-0.5 * Math.pow((c - moyenne) / écartType, 2));

  coeff = (coeff - seuil)/2;
  return coeff;
}

const coeffWave = (x)=> {
  // Utilisation de fonctions trigonométriques et tanh pour créer une vague
  const sinWave = Math.sin(x/3); // Sinus pour l'oscillation
  const tanhWave = Math.tanh(x); // Tangente hyperbolique pour la croissance rapide au centre

  // Combinaison des deux vagues avec des coefficients ajustables
  const adjustment = 0.5 * sinWave + 0.5 * tanhWave;

  return adjustment/2;
}