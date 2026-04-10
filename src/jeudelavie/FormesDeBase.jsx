import React, { useState } from "react";
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material";
import { MOLECULE } from "./CelluleDeLaVie";

export const FormesDeBase = ({ onFormSelected }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelectRule = (rule) => {
        onFormSelected(rule.schema);
        handleClose();
    };
    const formesOptions = [
        {
            name: 'carre',
            schema: [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1], [0, 1],
                [1, -1], [1, 0], [1, 1]
            ]
        },
        {
            name: 'grand carre',
            schema: [
                [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2],
                [0, -2], [0, -1], [0, 1], [0, 2],
                [1, -2], [1, -1], [1, 0], [1, 1], [1, 2],
            ]
        },
        {
            name: 'croix',
            schema: [
                [-1, 0],
                [0, -1], [0, 0], [0, 1],
                [1, 0]
            ]
        },
        {
            name: 'le X',
            schema: [
                [-1, -1], [-1, 1],
                [0, 0],
                [1, -1], [1, 1]
            ]
        },
    ];

    return (
        <>
            <Button onClick={handleClick} variant="outlined">
                Forme de base
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                {formesOptions.map((option) => (
                    <MenuItem
                        key={option.name}
                        onClick={() => handleSelectRule(option)}
                    >
                        <Box><Typography variant="subtitle1">{option.name}</Typography>
                        </Box>
                    </MenuItem>
                ))}
            </Menu>

        </>
    );
};

export const RandomButton = ({setGrille, rows, cols})=>{

    const doTheJob = ()=>{
       
        
      
        // Mettez à jour l'état de la grille avec la nouvelle grille évoluée
        setGrille(grille=>{
            const newGrille = [...grille.map(row => [...row])];
  
            for (let row = 0; row < rows; row++) {
              for (let col = 0; col < cols; col++) {
                
                const randCell ={};
                for(let molecule in MOLECULE){
                    if((molecule==='vert' || molecule=='rouge')&& Math.random()<0.5)// on remplit qu'une fois sur 4
                        randCell[molecule] = Math.random();
                }
                 newGrille[row][col] = randCell;
        
                }
              }
              return newGrille;
        });
    }

    return <Button onClick={doTheJob} variant="outlined">
        Fais un gros pate de couleur
    </Button>
}