import React, { useState, useEffect, useRef } from "react";

import { Box, Button, Switch } from "@mui/material";
import GrilleDeLaVie from "./Grille";

import { DirectionsRun, PanTool } from "@mui/icons-material";
import { applyRule } from "./AutomatesCellulaires";
import { FormesDeBase } from "./FormesDeBase";
import { AutomateMenu } from "./AutomateMenu";
import { useIsMobile } from "../hookGame";

export const CELL_SIZE=10;

const GameOfLife = () => {
  const grilleRef = useRef();
  const [grille, setGrille] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [rows, setRows] = useState(0);
  const [cols, setCols] = useState(0);
  const [resetFlag, doReset] = useState();
  const [nonBinaireMode, setNonBinaireMode] = useState(false);
  const [regle, setRegle] = useState('conway');
  const isMobile = useIsMobile();

  useEffect(() => {
    // Initialisation de la grille (par exemple, en remplissant de cellules aléatoires)
    const box = grilleRef.current.getBoundingClientRect();
    const rws = Math.floor(box.height/CELL_SIZE);
    const cls = Math.floor(box.width/CELL_SIZE);
    setRows(rws);
    setCols(cls);
    const newGrille = Array.from({ length: rws }, () =>
    Array.from({ length: cls }, () => 0)
  )
  setGrille(newGrille);
  }, [resetFlag]);

  const onFormSelected = (newSchema) => {
    const row = Math.floor(rows / 2);
    const col = Math.floor(cols / 2);
    const newGrille = grille.map(r => [...r]);
    for (const [rowOffset, colOffset] of newSchema) {
      const newRow = row + rowOffset;
      const newCol = col + colOffset;
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols)
        newGrille[newRow][newCol] = 1;
    }
    setGrille(newGrille);
  };

  const countNeighbors = (row, col) => {
    const countObj={1:0, 2:0,3:0};
   // let count = 0;
  
    // Coordonnées des voisins possibles autour de la cellule
    const neighborOffsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
  
    // Parcours des voisins
    for (const [rowOffset, colOffset] of neighborOffsets) {
      const newRow = row + rowOffset;
      const newCol = col + colOffset;
  
      // Vérifier si le voisin est dans les limites de la grille
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        if(grille[newRow][newCol]>0){
            countObj[grille[newRow][newCol]]+=1;
        }
        //count += grille[newRow][newCol]; // Ajouter la valeur du voisin à la somme
      }
    }
  
    return countObj; // {'1':0,'2':2,'3'}
  };
    const evolve = () => {
    // Copiez l'état actuel de la grille
    const newGrille = [...grille.map(row => [...row])];
  
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const neighbors = countNeighbors(row, col); // Fonction pour compter les voisins vivants
        const cell = grille[row][col];
        if(!nonBinaireMode) 
            newGrille[row][col] = applyRule(regle, cell, neighbors[1]);
        else{
            newGrille[row][col] = applyRule(regle, cell, neighbors);

        }
        // Règles du Jeu de la Vie de Conway
       
      }
    }
  
    // Mettez à jour l'état de la grille avec la nouvelle grille évoluée
    setGrille(newGrille);
  };
  

  useEffect(() => {
    let intervalId;

    if (isRunning) {
      intervalId = setInterval(evolve, 100); // Évolution toutes les 1 seconde
    } else {
      clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [isRunning,grille]);
  return (
    <div className="game-containerLife">

      {/* ── Toolbar mobile : titre + Start/Pause + Reset ── */}
      {isMobile && (
        <Box display="flex" alignItems="center" justifyContent="space-between"
          sx={{ px: 1.5, py: 0.75, flexShrink: 0 }}>
          <span style={{ fontWeight: 'bold', fontSize: 15 }}>🧬 Jeu de la vie</span>
          <Box display="flex" gap={1}>
            <Button variant="contained" size="small"
              color={isRunning ? 'error' : 'success'}
              onClick={() => setIsRunning(r => !r)}
              sx={{ minWidth: 80 }}>
              {isRunning ? '⏸ Pause' : '▶ Start'}
            </Button>
            <Button variant="outlined" size="small" onClick={doReset}>🔄</Button>
          </Box>
        </Box>
      )}

      {/* ── Toolbar desktop : version complète ── */}
      {!isMobile && (
        <Box display="flex" alignItems="center" flexDirection="row" justifyContent="space-between">
          <h1>Jeu de la vie</h1>
          <Button onClick={doReset}>Reset</Button>
          {isRunning
            ? <Button variant="contained" color="error" onClick={() => setIsRunning(false)}>Pause</Button>
            : <Button variant="contained" color="primary" onClick={() => setIsRunning(true)}>START</Button>
          }
          {isRunning ? <DirectionsRun /> : <PanTool />}
          <FormesDeBase onFormSelected={onFormSelected} />
          <Box display="flex" flexDirection="column">Automates non binaires
            <Switch checked={nonBinaireMode} onChange={() => setNonBinaireMode(m => !m)} />
          </Box>
          <AutomateMenu regle={regle} onSelectRule={rule => setRegle(rule)} binaire={!nonBinaireMode} />
        </Box>
      )}

      <GrilleDeLaVie ref={grilleRef} grille={grille} setGrille={setGrille} />
    </div>
  );
};

export default GameOfLife;




